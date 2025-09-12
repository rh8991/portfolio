// post.js — parse front-matter, render header + body, highlight code, TOC, progress, RTL
// Runs ONLY on post.html

(() => {
  // Bail if not on the post page
  if (!document.getElementById('post')) return;

  // --- Add improved param handling ---
  const params = new URL(location.href).searchParams;
  const lang = params.get('lang') || localStorage.getItem('lang') || 'en';
  const slug = params.get('slug');

  if (!slug) {
    document.getElementById('post').innerHTML =
      '<p class="text-red-600">Missing <code>?slug=</code> in the URL.</p>';
    console.error('Missing slug param');
    return;
  }

  function updateDarkToggleIcon() {
    const icon = document.getElementById('darkToggleIcon');
    if (!icon) return;
    if (document.documentElement.classList.contains('dark')) {
      icon.textContent = 'light_mode'; // Show sun in dark mode
    } else {
      icon.textContent = 'dark_mode'; // Show moon in light mode
    }
  }

  // Dark toggle
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
  updateDarkToggleIcon();
  document.getElementById('darkToggle')?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    updateDarkToggleIcon();
  });

  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Language select
  document.getElementById('langToggle')?.addEventListener('click', () => {
    const current = localStorage.getItem('lang') || 'en';
    const next = current === 'en' ? 'he' : 'en';
    localStorage.setItem('lang', next);
    const u = new URL(location.href);
    u.searchParams.set('lang', next);
    location.href = u.toString();
  });

  // --- Tiny front-matter parser ---
  function parseFrontMatter(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\s*/);
    if (!m) return { meta: {}, body: text };
    const raw = m[1];
    const meta = {};
    raw.split('\n').forEach(line => {
      if (!line.trim() || line.trim().startsWith('#')) return;
      const idx = line.indexOf(':');
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      // strip wrapping quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // simple JSON array support
      if (val.startsWith('[') && val.endsWith(']')) {
        try { val = JSON.parse(val); } catch {}
      }
      meta[key] = val;
    });
    const body = text.slice(m[0].length);
    return { meta, body };
  }

  function formatDate(s) {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function estimateMinutes(text, fallback) {
    if (fallback) return Number(fallback);
    const words = (text.replace(/```[\s\S]*?```/g, '').match(/\b\w+\b/g) || []).length;
    return Math.max(1, Math.round(words / 200));
  }

  function renderHeader(meta, minutes) {
    const title = meta.title || 'Untitled';
    const subtitle = meta.subtitle || '';
    const date = formatDate(meta.date);
    const tags = Array.isArray(meta.tags) ? meta.tags : [];
    document.title = `${title} – Ronel Herzass`;
    const chips = tags.map(t => `<span class="tag-pill">${t}</span>`).join(' ');
    return `
      <h1 class="post-title">${title}</h1>
      ${subtitle ? `<p class="post-subtitle">${subtitle}</p>` : ''}
      <div class="post-meta">
        ${date ? `<span>${date}</span><span>•</span>` : ''}
        <span>${minutes} min read</span>
        ${tags.length ? `<span>•</span><span class="flex flex-wrap gap-2">${chips}</span>` : ''}
      </div>
      <hr class="mt-6 border-slate-200 dark:border-slate-800" />
    `;
  }

  // Main loader
  (async function loadPost() {
    const postEl = document.getElementById('post');
    const headerEl = document.getElementById('postHeader');
    if (!postEl || !slug) {
      if (postEl) postEl.innerHTML = '<p>Missing slug.</p>';
      return;
    }

    try {
      // fetch the markdown itself
      const res = await fetch(`/content/${lang}/posts/${slug}.md`, { cache: 'no-store' });
      if (!res.ok) {
        document.getElementById('post').innerHTML =
          `<p class="text-red-600">Post not found (HTTP ${res.status}).<br>
           Looked for: <code>content/${lang}/posts/${slug}.md</code></p>`;
        console.error('Fetch failed:', res.status, res.statusText);
        return;
      }

      const raw = await res.text();
      const { meta, body } = parseFrontMatter(raw);

      // Direction/Language
      if (lang === 'he') {
        document.documentElement.lang = 'he';
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.documentElement.lang = 'en';
        document.documentElement.setAttribute('dir', 'ltr');
      }

      // Render header + body
      const minutes = estimateMinutes(body, meta.minutes);
      headerEl.innerHTML = renderHeader(meta, minutes);

      // Configure marked (optional tweaks)
      if (window.marked) {
        marked.setOptions({ gfm: true, breaks: false });
      }
      postEl.innerHTML = marked.parse(body);

      // Lazy-load images inside posts
      postEl.querySelectorAll('img').forEach(img => img.loading = 'lazy');

      // Syntax highlighting
      if (window.hljs) hljs.highlightAll();

      // Copy buttons
      document.querySelectorAll('pre').forEach(pre => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';
        btn.addEventListener('click', async () => {
          const code = pre.querySelector('code')?.innerText || '';
          try { await navigator.clipboard.writeText(code); btn.textContent = 'Copied!'; setTimeout(()=>btn.textContent='Copy',1200); }
          catch { btn.textContent = 'Error'; }
        });
        pre.appendChild(btn);
      });

      // TOC
      const headings = postEl.querySelectorAll('h2, h3');
      const toc = document.getElementById('toc');
      const tocItems = document.getElementById('tocItems');
      if (headings.length && toc && tocItems) {
        tocItems.innerHTML = '';
        headings.forEach(h => {
          if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^a-z\u0590-\u05FF0-9]+/gi,'-');
          const a = document.createElement('a');
          a.href = `#${h.id}`;
          a.textContent = h.textContent;
          a.style.paddingInlineStart = h.tagName === 'H3' ? '12px' : '0';
          tocItems.appendChild(a);
        });
        // Active heading highlight
        const tocLinks = Array.from(tocItems.querySelectorAll('a'));
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            const id = e.target.id;
            const link = tocLinks.find(a => a.getAttribute('href') === `#${id}`);
            if (link) link.style.fontWeight = e.isIntersecting ? '700' : '400';
          });
        }, { rootMargin: '0px 0px -70% 0px', threshold: 0.01 });
        headings.forEach(h => obs.observe(h));
      }

      // Reading progress
      const bar = document.getElementById('progressbar');
      function updateProgress() {
        const total = Math.max(1, postEl.scrollHeight - window.innerHeight);
        const scrolled = Math.min(Math.max(window.scrollY - postEl.offsetTop, 0), total);
        const pct = (scrolled / total) * 100;
        bar.style.width = pct + '%';
      }
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
      updateProgress();

    } catch (e) {
      document.getElementById('post').innerHTML = '<p>Failed to load post.</p>';
      console.error(e);
    }
  })();
})();
