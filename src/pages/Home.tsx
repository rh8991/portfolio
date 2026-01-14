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

interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  nav: {
    projects: string;
    blog: string;
    about: string;
    contact: string;
  };
  projectsTitle: string;
  projectsSubtitle: string;
  blogTitle: string;
  blogSubtitle: string;
  aboutTitle: string;
  aboutText: string[];
  contactTitle?: string;
  ctaProjects: string;
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

  if (!content) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <main id="home">
        <section className="section">
          <div className="max-container grid-2">
            <div>
              <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: content.heroTitle }} />
              <p className="hero-subtitle">{content.heroSubtitle}</p>
              <div className="hero-actions">
                <a 
                  href="#projects" 
                  className="btn"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {content.ctaProjects}
                </a>
                <a 
                  href="#blog" 
                  className="btn-outline"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Blog
                </a>
                <a href="https://github.com/rh8991" className="btn-outline" target="_blank" rel="noopener">
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/ronel-herzass"
                  className="btn-outline"
                  target="_blank"
                  rel="noopener"
                >
                  LinkedIn
                </a>
              </div>
            </div>
            <div>
              <div className="card">
                <img
                  alt="Electronics lab desk with instruments"
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section border-t">
          <div className="max-container">
            <div className="section-header">
              <div>
                <h2 className="section-header-title">{content.projectsTitle}</h2>
                <p className="section-header-subtitle">{content.projectsSubtitle}</p>
              </div>
              <div className="hero-actions">
                {getUniqueTags().map((filter) => (
                  <button
                    key={filter}
                    className={`btn-outline text-sm ${selectedFilter === filter ? 'active-filter' : ''}`}
                    onClick={() => setSelectedFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-grid mt-8">
              {filteredProjects.map((project, idx) => (
                <article key={idx} className="card group" data-tags={(project.tags || []).join(' ')}>
                  <a
                    href={project.links?.github ?? '#'}
                    target="_blank"
                    rel="noopener"
                    className="card-link"
                  >
                    <img src={project.image} alt={project.title} loading="lazy" className="card-img" />
                    <div className="card-body">
                      <h3 className="card-title">{project.title}</h3>
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
              More on{' '}
              <a className="footer-link" href="https://github.com/rh8991" target="_blank" rel="noopener">
                GitHub
              </a>
              .
            </div>
          </div>
        </section>

        <section id="blog" className="section border-t">
          <div className="max-container">
            <div className="section-header">
              <div>
                <h2 className="section-header-title">{content.blogTitle}</h2>
                <p className="section-header-subtitle">{content.blogSubtitle}</p>
              </div>
              <input
                type="search"
                placeholder="Search posts…"
                className="input w-60 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search posts"
              />
            </div>
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
                        <img className="card-img" src={post.image} alt={post.title || ''} loading="lazy" />
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

        <section id="about" className="section border-t">
          <div className="max-container">
            <div className="section-header">
              <h2 className="section-header-title">{content.aboutTitle}</h2>
            </div>
            <div className="mt-4 space-y-4">
              {content.aboutText.map((text, idx) => (
                <p key={idx}>{text}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section border-t">
          <div
            className="max-container text-center"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <h2 className="section-header-title mb-4">Connect With Me</h2>
            <p className="mb-6 text-gray-600 padding-x-4">
              I'm always open to new projects, collaborations, and ideas.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a href="mailto:ronelherzass@gmail.com" className="btn">
                Email
              </a>
              <a href="https://www.linkedin.com/in/ronel-herzass" className="btn" target="_blank" rel="noopener">
                LinkedIn
              </a>
              <a href="https://github.com/rh8991" className="btn" target="_blank" rel="noopener">
                GitHub
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
