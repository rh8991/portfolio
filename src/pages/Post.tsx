import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/css/post.css';

interface PostMeta {
  title?: string;
  subtitle?: string;
  date?: string;
  minutes?: number;
  tags?: string[];
}

export default function Post() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const slug = searchParams.get('slug');
  
  const [meta, setMeta] = useState<PostMeta>({});
  const [html, setHtml] = useState('');
  const [minutes, setMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const postRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) {
      setError('Missing slug parameter in URL');
      setLoading(false);
      return;
    }

    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, language]);

  useEffect(() => {
    if (!loading && html) {
      // Syntax highlighting
      if (postRef.current) {
        postRef.current.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });

        // Add copy buttons to code blocks
        postRef.current.querySelectorAll('pre').forEach((pre) => {
          const btn = document.createElement('button');
          btn.className = 'copy-btn';
          btn.textContent = 'Copy';
          btn.addEventListener('click', async () => {
            const code = pre.querySelector('code')?.innerText || '';
            try {
              await navigator.clipboard.writeText(code);
              btn.textContent = 'Copied!';
              setTimeout(() => (btn.textContent = 'Copy'), 1200);
            } catch {
              btn.textContent = 'Error';
            }
          });
          pre.appendChild(btn);
        });

        // Fix relative image paths
        postRef.current.querySelectorAll('img').forEach((img) => {
          const src = img.getAttribute('src') || '';
          if (!/^(https?:|data:|\/)/i.test(src)) {
            img.src = `/content/${language}/posts/${slug}/${src}`;
          }
          img.loading = 'lazy';
        });

        // Add IDs to headings
        postRef.current.querySelectorAll('h2, h3').forEach((h) => {
          if (!h.id) {
            h.id = h.textContent
              ?.trim()
              .toLowerCase()
              .replace(/[^a-z\u0590-\u05FF0-9]+/gi, '-') || '';
          }
        });
      }

      // Progress bar
      const updateProgress = () => {
        if (!postRef.current || !progressBarRef.current) return;
        const total = Math.max(1, postRef.current.scrollHeight - window.innerHeight);
        const scrolled = Math.min(
          Math.max(window.scrollY - postRef.current.offsetTop, 0),
          total
        );
        const pct = (scrolled / total) * 100;
        progressBarRef.current.style.width = pct + '%';
      };

      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
      updateProgress();

      return () => {
        window.removeEventListener('scroll', updateProgress);
        window.removeEventListener('resize', updateProgress);
      };
    }
  }, [loading, html, slug, language]);

  const parseFrontMatter = (text: string): { meta: PostMeta; body: string } => {
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\s*/);
    if (!match) return { meta: {}, body: text };

    const raw = match[1];
    const meta: Record<string, string | number | string[]> = {};

    raw.split('\n').forEach((line) => {
      if (!line.trim() || line.trim().startsWith('#')) return;
      const idx = line.indexOf(':');
      if (idx === -1) return;

      const key = line.slice(0, idx).trim();
      let val: string | string[] = line.slice(idx + 1).trim();

      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }

      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val);
        } catch {
          // Ignore JSON parse errors and keep as string
        }
      }

      meta[key] = val;
    });

    const body = text.slice(match[0].length);
    return { meta, body };
  };

  const estimateMinutes = (text: string, fallback?: number): number => {
    if (fallback) return Number(fallback);
    const words = (text.replace(/```[\s\S]*?```/g, '').match(/\b\w+\b/g) || []).length;
    return Math.max(1, Math.round(words / 200));
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const loadPost = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/content/${language}/posts/${slug}/index.md`);
      if (!res.ok) {
        setError(`Post not found (HTTP ${res.status})`);
        setLoading(false);
        return;
      }

      const raw = await res.text();
      const { meta, body } = parseFrontMatter(raw);

      // Configure marked
      marked.setOptions({ gfm: true, breaks: false });

      const htmlContent = marked.parse(body) as string;
      const calculatedMinutes = estimateMinutes(body, meta.minutes);

      setMeta(meta);
      setHtml(htmlContent);
      setMinutes(calculatedMinutes);
      document.title = `${meta.title || 'Untitled'} – Ronel Herzass`;
    } catch (e) {
      setError('Failed to load post');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="main-container mx-auto px-4 py-8 ">
          <p className="text-red-600">{error}</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div id="progressbar" ref={progressBarRef} className="progress-bar"></div>
      <Header />
      <main className="post-layout mx-auto px-4 py-8 max-w-4xl">
        <div id="postHeader" className="mb-8">
          <h1 className="post-title">{meta.title || 'Untitled'}</h1>
          {meta.subtitle && <p className="post-subtitle">{meta.subtitle}</p>}
          <div className="post-meta">
            {meta.date && (
              <>
                <span>{formatDate(meta.date)}</span>
                <span> | </span>
              </>
            )}
            <span>{minutes} min read</span>
            {meta.tags && meta.tags.length > 0 && (
              <>
                <span> | </span>
                <span className="flex flex-wrap gap-2">
                  {meta.tags.map((tag, i) => (
                    <span key={i} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </span>
              </>
            )}
          </div>
          <hr className="mt-7 border-slate-200 dark:border-slate-800" />
        </div>

        <div
          id="post"
          ref={postRef}
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <Footer />
    </>
  );
}
