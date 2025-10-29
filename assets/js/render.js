// render.js — homepage logic (language, projects, posts, about, filters)
// Runs ONLY on index.html

(() => {
  // Bail if not on the homepage
  if (!document.getElementById("projectGrid")) return;

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Dark mode
  function updateDarkToggleIcon() {
    const icon = document.getElementById("darkToggleIcon");
    if (!icon) return;
    if (document.documentElement.classList.contains("dark")) {
      icon.textContent = "light_mode"; // Show sun in dark mode
    } else {
      icon.textContent = "dark_mode"; // Show moon in light mode
    }
  }

  function toggleDark() {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateDarkToggleIcon();
  }
  const savedTheme = localStorage.getItem("theme");
  if (
    savedTheme === "dark" ||
    (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }
  updateDarkToggleIcon();
  document.getElementById("darkToggle")?.addEventListener("click", toggleDark);

  // Language
  const langSelect = document.getElementById("langSelect");
  let lang =
    new URL(location.href).searchParams.get("lang") ||
    localStorage.getItem("lang") ||
    "en";

  document.getElementById("langToggle")?.addEventListener("click", () => {
    const current = localStorage.getItem("lang") || "en";
    const next = current === "en" ? "he" : "en";
    localStorage.setItem("lang", next);
    const u = new URL(location.href);
    u.searchParams.set("lang", next);
    location.href = u.toString();
  });

  async function setLang(newLang) {
    lang = newLang;
    localStorage.setItem("lang", lang);
    document.body.dataset.lang = lang;
    document.documentElement.setAttribute("dir", lang === "he" ? "rtl" : "ltr");
    if (langSelect) langSelect.value = lang;

    // Fetch all UI text from index.json
    const res = await fetch(`content/${lang}/index.json`, {
      cache: "no-store",
    });
    const t = await res.json();

    // Set UI text
    const H = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };
    const T = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    H("heroTitle", t.heroTitle);
    T("heroSubtitle", t.heroSubtitle);
    T("projectsTitle", t.projectsTitle);
    T("projectsSubtitle", t.projectsSubtitle);
    T("blogTitle", t.blogTitle);
    T("blogSubtitle", t.blogSubtitle);
    T("aboutTitle", t.aboutTitle);
    T("contactTitle", t.contactTitle);
    T("labelName", t.labelName);
    T("labelEmail", t.labelEmail);
    T("labelMessage", t.labelMessage);
    T("sendBtn", t.sendBtn);
    T("ctaProjects", t.ctaProjects);

    // Navigation
    T("navProjects", t.nav.projects);
    T("navBlog", t.nav.blog);
    T("navAbout", t.nav.about);
    T("navContact", t.nav.contact);

    // About section (array of paragraphs)
    const aboutEl = document.getElementById("aboutText");
    if (aboutEl && Array.isArray(t.aboutText)) {
      aboutEl.innerHTML = t.aboutText.map((p) => `<p>${p}</p>`).join("");
    }

    loadProjects();
    loadPosts();
  }

  langSelect?.addEventListener("change", (e) => setLang(e.target.value));
  setLang(lang);

  // Filters (by data-filter, to match your HTML buttons)
  // Only toggle the 'active-filter' class, not direct styles
  const filterButtons = document.querySelectorAll("[data-filter]");
  filterButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const key = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.remove("active-filter"));
      btn.classList.add("active-filter");
      document.querySelectorAll("#projectGrid .card").forEach((card) => {
        const show = key === "all" || (card.dataset.tags || "").includes(key);
        card.style.display = show ? "" : "none";
      });
    })
  );

  async function loadProjects() {
    try {
      const res = await fetch(`content/${lang}/projects.json`, {
        cache: "no-store",
      });
      const data = await res.json();
      const grid = document.getElementById("projectGrid");
      grid.innerHTML = data
        .map(
          (p) => `
        <article class="card group" data-tags="${(p.tags || []).join(" ")}">
          <a href="${
            p.links?.github ?? "#"
          }" target="_blank" rel="noopener" class="card-link">
            <img src="${p.image}" alt="${
            p.title
          }" loading="lazy" class="card-img"/>
            <div class="card-body">
              <h3 class="card-title">${p.title}</h3>
              <p class="card-summary">${p.summary}</p>
              <div class="card-tags">
                ${(p.tags || [])
                  .map((t) => `<span class="tag-pill">${t}</span>`)
                  .join("")}
              </div>
            </div>
          </a>
        </article>
      `
        )
        .join("");
    } catch (e) {
      console.error(e);
    }
  }

  // ===== POSTS FROM MARKDOWN (no post.json) =====

  // 0) Where to render
  const blogGrid = document.getElementById("postList");

  // 1) Tiny front-matter parser
  function parseFrontMatter(text) {
    const m = text.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    if (!m) return [{}, text];
    const yaml = m[1],
      body = m[2];
    const meta = {};
    yaml.split("\n").forEach((line) => {
      const s = line.trim();
      if (!s || s.startsWith("#")) return;

      // arrays: tags: ["a","b"]
      const arr = s.match(/^([A-Za-z0-9_-]+):\s*\[(.*)\]\s*$/);
      if (arr) {
        meta[arr[1]] = arr[2]
          .split(",")
          .map((x) => x.replace(/^["'\s]+|["'\s]+$/g, ""))
          .filter(Boolean);
        return;
      }
      // key: value
      const kv = s.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (kv) {
        let v = kv[2].trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        )
          v = v.slice(1, -1);
        meta[kv[1]] = v;
      }
    });
    return [meta, body];
  }

  // 2) Slugs list (root-anchored paths)
  async function loadPostSlugs(lang) {
    const res = await fetch(`/content/${lang}/posts/_index.json`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  }

  // 3) Fetch each index.md and collect meta
  async function loadPostsFromMarkdown(lang) {
    const slugs = await loadPostSlugs(lang);
    const out = [];
    for (const slug of slugs) {
      try {
        const url = `/content/${lang}/posts/${slug}/index.md`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          console.warn("[render] missing md:", url, res.status);
          continue;
        }
        const raw = await res.text();
        const [meta] = parseFrontMatter(raw);
        out.push({ ...meta, slug });
      } catch (e) {
        console.warn("[render] failed to load post", slug, e);
      }
    }
    // newest first
    out.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return out;
  }

  // 4) Card HTML (uses your #postList grid)
  function cardHTML(p, lang) {
    const dt = p.date ? new Date(p.date) : null;
    const dateStr = dt
      ? dt.toLocaleDateString(lang === "he" ? "he" : "en", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";
    const minutes = p.minutes
      ? ` · ${p.minutes} ${lang === "he" ? "דק'" : "min"}`
      : "";

    // Render all tags as pills
    const tagsHtml = Array.isArray(p.tags) && p.tags.length
      ? p.tags.map(t => `<span class="tag-pill">${t}</span>`).join(" ")
      : "";

    return `
  <article class="card group" data-tags="${(p.tags || []).join(" ")}">
    <a class="card-link" href="post.html?lang=${lang}&slug=${encodeURIComponent(
      p.slug
    )}">
      ${
        p.image
          ? `<img class="card-img" src="${p.image}" alt="${p.title || ""}" loading="lazy"/>`
          : ""
      }
      <div class="card-body">
        <div class="text-sm opacity-70">${dateStr}${minutes}</div>
        <h3 class="card-title">${p.title || "Untitled"}</h3>
        ${
          p.excerpt
            ? `<p class="card-summary opacity-80 mt-1">${p.excerpt}</p>`
            : ""
        }
        <div class="mt-3 flex items-center justify-between">
          <div class="flex gap-2">${tagsHtml}</div>
        </div>
      </div>
    </a>
  </article>
  `;
  }

  // 5) Glue it into your existing render flow
  async function renderPostsFromMarkdown(lang) {
    if (!blogGrid) return;
    blogGrid.innerHTML = `<p class="opacity-70">Loading…</p>`;
    const posts = await loadPostsFromMarkdown(lang);
    if (!posts.length) {
      blogGrid.innerHTML = `<p class="opacity-70">No posts found.</p>`;
      return;
    }
    blogGrid.innerHTML = posts.map((p) => cardHTML(p, lang)).join("");
  }

  // Call it — reuse your current lang selection
  const currentLang =
    new URL(location.href).searchParams.get("lang") ||
    localStorage.getItem("lang") ||
    "en";
  renderPostsFromMarkdown(currentLang);

  // Hamburger menu toggle
  document.getElementById("navHamburger")?.addEventListener("click", () => {
    document.getElementById("navMenu")?.classList.toggle("open");
  });

  const navMenu = document.getElementById("navMenu");
  const navHamburger = document.getElementById("navHamburger");

  // Close menu when any link or button inside navMenu is clicked
  navMenu?.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navMenu.setAttribute("aria-hidden", "true");
      navHamburger.setAttribute("aria-expanded", "false");
    });
  });

  // Also close menu automatically after 3 seconds if open
  setInterval(() => {
    if (navMenu?.classList.contains("open")) {
      navMenu.classList.remove("open");
      navMenu.setAttribute("aria-hidden", "true");
      navHamburger.setAttribute("aria-expanded", "false");
    }
  }, 3000);

  // Header scroll fix
  const header = document.querySelector(".header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
      // adjust 80 to when you want it to become fixed
      header.classList.add("fixed");
    } else {
      header.classList.remove("fixed");
    }
  });

  document.getElementById("copyEmail")?.addEventListener("click", function () {
    navigator.clipboard.writeText("ronelherzass@gmail.com");
    this.title = "Copied!";
    setTimeout(() => {
      this.title = "Copy email";
    }, 1200);
  });
})();
