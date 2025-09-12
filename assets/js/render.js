// render.js — homepage logic (language, projects, posts, about, filters)
// Runs ONLY on index.html

(() => {
  // Bail if not on the homepage
  if (!document.getElementById('projectGrid')) return;

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Dark mode
  function updateDarkToggleIcon() {
    const icon = document.getElementById('darkToggleIcon');
    if (!icon) return;
    if (document.documentElement.classList.contains('dark')) {
      icon.textContent = 'light_mode'; // Show sun in dark mode
    } else {
      icon.textContent = 'dark_mode'; // Show moon in light mode
    }
  }

  function toggleDark() {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateDarkToggleIcon();
  }
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
  updateDarkToggleIcon();
  document.getElementById('darkToggle')?.addEventListener('click', toggleDark);

  // Language
  const langSelect = document.getElementById('langSelect');
  let lang = new URL(location.href).searchParams.get('lang') || localStorage.getItem('lang') || 'en';

  document.getElementById('langToggle')?.addEventListener('click', () => {
    const current = localStorage.getItem('lang') || 'en';
    const next = current === 'en' ? 'he' : 'en';
    localStorage.setItem('lang', next);
    const u = new URL(location.href);
    u.searchParams.set('lang', next);
    location.href = u.toString();
  });

  async function setLang(newLang) {
    lang = newLang;
    localStorage.setItem('lang', lang);
    document.body.dataset.lang = lang;
    document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    if (langSelect) langSelect.value = lang;

    // Fetch all UI text from index.json
    const res = await fetch(`content/${lang}/index.json`, { cache: 'no-store' });
    const t = await res.json();

    // Set UI text
    const H = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const T = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

    H('heroTitle', t.heroTitle);
    T('heroSubtitle', t.heroSubtitle);
    T('projectsTitle', t.projectsTitle);
    T('projectsSubtitle', t.projectsSubtitle);
    T('blogTitle', t.blogTitle);
    T('blogSubtitle', t.blogSubtitle);
    T('aboutTitle', t.aboutTitle);
    T('contactTitle', t.contactTitle);
    T('labelName', t.labelName);
    T('labelEmail', t.labelEmail);
    T('labelMessage', t.labelMessage);
    T('sendBtn', t.sendBtn);
    T('ctaProjects', t.ctaProjects);

    // Navigation
    T('navProjects', t.nav.projects);
    T('navBlog', t.nav.blog);
    T('navAbout', t.nav.about);
    T('navContact', t.nav.contact);

    // About section (array of paragraphs)
    const aboutEl = document.getElementById('aboutText');
    if (aboutEl && Array.isArray(t.aboutText)) {
      aboutEl.innerHTML = t.aboutText.map(p => `<p>${p}</p>`).join('');
    }

    loadProjects();
    loadPosts();
  }

  langSelect?.addEventListener('change', (e) => setLang(e.target.value));
  setLang(lang);

  // Filters (by data-filter, to match your HTML buttons)
  // Only toggle the 'active-filter' class, not direct styles
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.remove('active-filter'));
    btn.classList.add('active-filter');
    document.querySelectorAll('#projectGrid .card').forEach(card => {
      const show = key === 'all' || (card.dataset.tags || '').includes(key);
      card.style.display = show ? '' : 'none';
    });
  }));

  async function loadProjects() {
    try {
      const res = await fetch(`content/${lang}/projects.json`, { cache: 'no-store' });
      const data = await res.json();
      const grid = document.getElementById('projectGrid');
      grid.innerHTML = data.map(p => `
        <article class="card group" data-tags="${(p.tags || []).join(' ')}">
          <a href="${p.links?.github ?? '#'}" target="_blank" rel="noopener" class="card-link">
            <img src="${p.image}" alt="${p.title}" loading="lazy" class="card-img"/>
            <div class="card-body">
              <h3 class="card-title">${p.title}</h3>
              <p class="card-summary">${p.summary}</p>
              <div class="card-tags">
                ${(p.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('')}
              </div>
            </div>
          </a>
        </article>
      `).join('');
    } catch (e) { console.error(e); }
  }

  async function loadPosts() {
    try {
      const res = await fetch(`content/${lang}/posts/post.json`, { cache: 'no-store' });
      const posts = await res.json();
      const list = document.getElementById('postList');
      list.innerHTML = posts.map(p => `
        <article class="card group">
          <a href="post.html?lang=${lang}&slug=${p.slug}" class="card-link">
            <img src="${p.image}" alt="${p.title}" loading="lazy" class="card-img"/>
            <div class="card-body">
              <h3 class="card-title">${p.title}</h3>
              <p class="card-summary">${p.excerpt}</p>
              <div class="card-tags">
              ${(p.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('')}
              </div>
              <p class="card-meta">${p.minutes} min</p>
            </div>
          </a>
        </article>
      `).join('');

      const search = document.getElementById('blogSearch');
      if (search) {
        search.oninput = (e) => {
          const q = e.target.value.toLowerCase();
          Array.from(list.children).forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(q) ? '' : 'none';
          });
        };
      }
    } catch (e) { console.error(e); }
  }

  // Post rendering logic (for individual post pages)
  const postEl = document.getElementById('post');
  if (postEl) {
    const meta = postEl.dataset;
    const minutes = Math.ceil((meta.words || 0) / 200);

    postEl.innerHTML = `
      <section id="postHeader">
        <div class="mb-2 text-sm">
          <a href="/#blog" class="hover:underline">Blog</a> / <span>${meta.title}</span>
        </div>
        <h1 class="post-title">${meta.title}</h1>
        ${meta.subtitle ? `<p class="post-subtitle">${meta.subtitle}</p>` : ''}
        <div class="post-meta">
          ${meta.date ? `<span>${meta.date}</span><span>•</span>` : ''}
          <span>${minutes} min read</span>
          ${meta.tags?.length ? `<span>•</span><span class="flex flex-wrap gap-2">${meta.tags.map(t => `<span class="tag-pill">${t}</span>`).join(' ')}</span>` : ''}
        </div>
        <hr />
      </section>
      <article class="prose" id="postBody">
        ${marked.parse(body)}
      </article>
    `;
  }
})();
