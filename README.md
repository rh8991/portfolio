# Ronel Herzass — Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-2ea44f?logo=github)](https://rh8991.github.io/portfolio/)

This is my personal portfolio site, built with plain **HTML, CSS, and JavaScript**.  
It showcases my projects, blog posts, and CV.

🔗 Live site: [http://ronelherzass.com/](http://ronelherzass.com/)

---

## Structure

- `index.html` — Homepage (projects, blog preview, about, contact)  
- `post.html` — Blog post template  
- `assets/css/` — Shared styles (`base.css`, `home.css`, `post.css`)  
- `assets/js/` — Logic for homepage (`render.js`) and posts (`post.js`)  
- `content/en/` & `content/he/` — Localized JSON + Markdown content  
- `public/` — Static assets like my CV PDF  

---

## Deployment

This repo uses **GitHub Pages**.  
By default, Pages tries to run Jekyll, but this is a **static JavaScript site**.  
That’s why the repo includes a `.nojekyll` file at the root:

```bash
touch .nojekyll
git add .nojekyll
git commit -m "Disable Jekyll for GitHub Pages"
git push
```

---

## License

This project is licensed under the [MIT License](LICENSE).
