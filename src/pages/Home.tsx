import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/css/home.css';

interface Project {
  title: string;
  summary: string;
  image: string;
  tags: string[];
  links?: { github?: string };
}

interface Post {
  title?: string;
  slug: string;
  date?: string;
  minutes?: number;
  excerpt?: string;
  image?: string;
  tags?: string[];
}

interface FrontMatter {
  [key: string]: string | string[];
}

interface FocusItem {
  icon: string;
  title: string;
  text: string;
}

interface ExperienceItem {
  role: string;
  org: string;
  period?: string;
  text: string;
}

interface HomeContent {
  heroEyebrow?: string;
  heroTitle: string;
  heroSubtitle: string;
  nav: {
    projects: string;
    blog: string;
    about: string;
    contact: string;
  };
  focusTitle: string;
  focusSubtitle: string;
  focus: FocusItem[];
  experienceTitle: string;
  experienceSubtitle: string;
  experience: ExperienceItem[];
  projectsTitle: string;
  projectsSubtitle: string;
  filterLabel: string;
  filterAll: string;
  moreOnGithub: string;
  blogTitle: string;
  blogSubtitle: string;
  searchPlaceholder: string;
  noPosts: string;
  aboutTitle: string;
  aboutText: string[];
  currentlyLearningTitle: string;
  currentlyLearning: string[];
  contactTitle: string;
  contactText: string;
  ctaProjects: string;
  ctaCv: string;
  newTab: string;
}

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth' });
  // Move keyboard / screen-reader focus to the section we jumped to
  el?.focus({ preventScroll: true });
};

// Three-phase waveform illustration: power systems meets signal processing
function WaveformArt() {
  const width = 480;
  const height = 300;
  const mid = height / 2;
  const amp = 90;
  const phase = (offset: number) => {
    const pts: string[] = [];
    for (let x = 0; x <= width; x += 4) {
      const y = mid - amp * Math.sin((x / width) * 4 * Math.PI + offset);
      pts.push(`${x},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };
  return (
    <svg
      className="hero-art"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Three-phase AC voltage waveforms, offset by 120 degrees"
    >
      <defs>
        <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 30" fill="none" className="hero-art-grid" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#grid)" />
      <line x1="0" y1={mid} x2={width} y2={mid} className="hero-art-axis" />
      <polyline points={phase(0)} className="hero-art-phase phase-a" />
      <polyline points={phase((2 * Math.PI) / 3)} className="hero-art-phase phase-b" />
      <polyline points={phase((4 * Math.PI) / 3)} className="hero-art-phase phase-c" />
    </svg>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const [content, setContent] = useState<HomeContent | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContent();
    loadProjects();
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const loadContent = async () => {
    try {
      const res = await fetch(`/content/${language}/index.json`);
      const data = await res.json();
      setContent(data);
    } catch (e) {
      console.error('Failed to load content:', e);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch(`/content/${language}/projects.json`);
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await fetch(`/content/${language}/posts/_index.json`);
      const slugs = await res.json();
      const postData: Post[] = [];

      for (const slug of slugs) {
        try {
          const mdRes = await fetch(`/content/${language}/posts/${slug}/index.md`);
          const mdText = await mdRes.text();
          const meta = parseFrontMatter(mdText);
          postData.push({ ...meta, slug });
        } catch (e) {
          console.warn(`Failed to load post ${slug}:`, e);
        }
      }

      postData.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      setPosts(postData);
    } catch (e) {
      console.error('Failed to load posts:', e);
    }
  };

  const parseFrontMatter = (text: string): FrontMatter => {
    const match = text.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    if (!match) return {};

    const yaml = match[1];
    const meta: FrontMatter = {};

    yaml.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const arrayMatch = trimmed.match(/^([A-Za-z0-9_-]+):\s*\[(.*)\]\s*$/);
      if (arrayMatch) {
        meta[arrayMatch[1]] = arrayMatch[2]
          .split(',')
          .map((x) => x.replace(/^["'\s]+|["'\s]+$/g, ''))
          .filter(Boolean);
        return;
      }

      const kvMatch = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (kvMatch) {
        let value = kvMatch[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        meta[kvMatch[1]] = value;
      }
    });

    return meta;
  };

  // Get unique tags from all projects
  const getUniqueTags = (): string[] => {
    const allTags = projects.flatMap((p) => p.tags || []);
    const uniqueTags = Array.from(new Set(allTags)).sort();
    return ['all', ...uniqueTags];
  };

  const filteredProjects = projects.filter((p) =>
    selectedFilter === 'all' ? true : (p.tags || []).includes(selectedFilter)
  );

  const filteredPosts = posts.filter((p) =>
    searchQuery
      ? p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (!content)
    return (
      <div className="loading" role="status" aria-live="polite">
        Loading…
      </div>
    );

  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
  const newTabHint = <span className="sr-only"> {content.newTab}</span>;

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <section className="section" aria-labelledby="hero-title">
          <div className="max-container grid-2">
            <div>
              {content.heroEyebrow && <p className="hero-eyebrow">{content.heroEyebrow}</p>}
              <h1
                id="hero-title"
                className="hero-title"
                dangerouslySetInnerHTML={{ __html: content.heroTitle }}
              />
              <p className="hero-subtitle">{content.heroSubtitle}</p>
              <div className="hero-actions">
                <a href="#projects" className="btn" onClick={(e) => scrollToSection(e, 'projects')}>
                  {content.ctaProjects}
                </a>
                <a href="/CV_Ronel_Herzass.pdf" className="btn-outline" {...ext}>
                  {content.ctaCv}
                  {newTabHint}
                </a>
                <a href="https://github.com/rh8991" className="btn-outline" {...ext}>
                  GitHub
                  {newTabHint}
                </a>
                <a href="https://www.linkedin.com/in/ronel-herzass" className="btn-outline" {...ext}>
                  LinkedIn
                  {newTabHint}
                </a>
              </div>
            </div>
            <div className="card hero-art-card">
              <WaveformArt />
            </div>
          </div>
        </section>

        <section id="focus" className="section border-t" tabIndex={-1} aria-labelledby="focus-title">
          <div className="max-container">
            <div className="section-header">
              <div>
                <h2 id="focus-title" className="section-header-title">{content.focusTitle}</h2>
                <p className="section-header-subtitle">{content.focusSubtitle}</p>
              </div>
            </div>
            <ul className="card-grid focus-grid" role="list">
              {content.focus.map((item) => (
                <li key={item.title} className="card focus-card">
                  <span className="focus-icon material-symbols-outlined" aria-hidden="true">
                    {item.icon}
                  </span>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-summary">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="experience" className="section border-t" tabIndex={-1} aria-labelledby="experience-title">
          <div className="max-container">
            <div className="section-header">
              <div>
                <h2 id="experience-title" className="section-header-title">{content.experienceTitle}</h2>
                <p className="section-header-subtitle">{content.experienceSubtitle}</p>
              </div>
            </div>
            <ol className="timeline">
              {content.experience.map((item) => (
                <li key={`${item.role}-${item.org}`} className="timeline-item">
                  <h3 className="card-title">
                    {item.role} <span className="timeline-org">· {item.org}</span>
                  </h3>
                  {item.period && <p className="card-meta">{item.period}</p>}
                  <p className="card-summary">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="projects" className="section border-t" tabIndex={-1} aria-labelledby="projects-title">
          <div className="max-container">
            <div className="section-header">
              <div>
                <h2 id="projects-title" className="section-header-title">{content.projectsTitle}</h2>
                <p className="section-header-subtitle">{content.projectsSubtitle}</p>
              </div>
              <div className="hero-actions" role="group" aria-label={content.filterLabel}>
                {getUniqueTags().map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`btn-outline text-sm ${selectedFilter === filter ? 'active-filter' : ''}`}
                    aria-pressed={selectedFilter === filter}
                    onClick={() => setSelectedFilter(filter)}
                  >
                    {filter === 'all' ? content.filterAll : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-grid mt-8">
              {filteredProjects.map((project, idx) => (
                <article key={idx} className="card group" data-tags={(project.tags || []).join(' ')}>
                  <a href={project.links?.github ?? '#'} {...ext} className="card-link">
                    <img src={project.image} alt="" loading="lazy" className="card-img" />
                    <div className="card-body">
                      <h3 className="card-title">
                        {project.title}
                        {newTabHint}
                      </h3>
                      <p className="card-summary">{project.summary}</p>
                      <div className="card-tags">
                        {(project.tags || []).map((tag, i) => (
                          <span key={i} className="tag-pill">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
            <div className="mt-8 text-sm section-header-subtitle">
              {content.moreOnGithub}{' '}
              <a className="footer-link" href="https://github.com/rh8991" {...ext}>
                GitHub
                {newTabHint}
              </a>
              .
            </div>
          </div>
        </section>

        <section id="blog" className="section border-t" tabIndex={-1} aria-labelledby="blog-title">
          <div className="max-container">
            <div className="section-header">
              <div>
                <h2 id="blog-title" className="section-header-title">{content.blogTitle}</h2>
                <p className="section-header-subtitle">{content.blogSubtitle}</p>
              </div>
              <input
                type="search"
                placeholder={content.searchPlaceholder}
                className="input w-60 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={content.searchPlaceholder}
              />
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {searchQuery && filteredPosts.length === 0 ? content.noPosts : ''}
            </p>
            {searchQuery && filteredPosts.length === 0 && (
              <p className="section-header-subtitle mt-8" aria-hidden="true">{content.noPosts}</p>
            )}
            <div className="card-grid mt-8">
              {filteredPosts.map((post) => {
                const date = post.date ? new Date(post.date) : null;
                const dateStr = date
                  ? date.toLocaleDateString(language === 'he' ? 'he' : 'en', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';
                const minutes = post.minutes
                  ? ` · ${post.minutes} ${language === 'he' ? "דק'" : 'min'}`
                  : '';

                return (
                  <article key={post.slug} className="card group" data-tags={(post.tags || []).join(' ')}>
                    <a className="card-link" href={`#/post?slug=${encodeURIComponent(post.slug)}`}>
                      {post.image && (
                        <img className="card-img" src={post.image} alt="" loading="lazy" />
                      )}
                      <div className="card-body">
                        <div className="text-sm opacity-70">
                          {dateStr}
                          {minutes}
                        </div>
                        <h3 className="card-title">{post.title || 'Untitled'}</h3>
                        {post.excerpt && <p className="card-summary opacity-80 mt-1">{post.excerpt}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-2">
                            {(post.tags || []).map((tag, i) => (
                              <span key={i} className="tag-pill">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="section border-t" tabIndex={-1} aria-labelledby="about-title">
          <div className="max-container">
            <div className="section-header">
              <h2 id="about-title" className="section-header-title">{content.aboutTitle}</h2>
            </div>
            <div className="mt-4 space-y-4">
              {content.aboutText.map((text, idx) => (
                <p key={idx}>{text}</p>
              ))}
            </div>
            <h3 className="card-title mt-8">{content.currentlyLearningTitle}</h3>
            <ul className="card-tags learning-list" role="list">
              {content.currentlyLearning.map((item) => (
                <li key={item} className="tag-pill">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="section border-t" tabIndex={-1} aria-labelledby="contact-title">
          <div className="max-container contact-inner">
            <h2 id="contact-title" className="section-header-title">{content.contactTitle}</h2>
            <p className="section-header-subtitle contact-text">{content.contactText}</p>
            <div className="hero-actions contact-actions">
              <a href="mailto:ronelhrzas98@gmail.com" className="btn">
                Email
              </a>
              <a href="https://www.linkedin.com/in/ronel-herzass" className="btn" {...ext}>
                LinkedIn
                {newTabHint}
              </a>
              <a href="https://github.com/rh8991" className="btn" {...ext}>
                GitHub
                {newTabHint}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
