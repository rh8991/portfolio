# Ronel Herzass — Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-2ea44f?logo=github)](https://rh8991.github.io/portfolio/)

This is my personal portfolio site, built with **Vite + React + TypeScript**.  
It showcases my projects, blog posts, and CV with bilingual support (English/Hebrew).

🔗 Live site: [http://ronelherzass.com/](http://ronelherzass.com/)

---

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Marked** - Markdown parsing
- **Highlight.js** - Syntax highlighting for code blocks

---

## Project Structure

```├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Root component with routing
│   ├── pages/                # Page components
│   │   ├── Home.tsx          # Homepage with projects, blog, about
│   │   ├── Post.tsx          # Blog post viewer
│   │   ├── Imprint.tsx       # Imprint page
│   │   └── Privacy.tsx       # Privacy policy page
│   ├── components/           # Reusable components
│   │   ├── Header.tsx        # Navigation header
│   │   └── Footer.tsx        # Site footer
│   ├── context/              # React context providers
│   │   ├── LanguageContext.tsx  # Bilingual support (en/he)
│   │   └── ThemeContext.tsx     # Dark/light theme
│   └── assets/
│       └── css/              # Stylesheets
├── public/
│   ├── content/              # Blog posts and content (JSON + Markdown)
│   │   ├── en/               # English content
│   │   └── he/               # Hebrew content
│   ├── CV_Ronel_Herzass.pdf  # Resume
│   └── CNAME                 # Custom domain config
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start dev server
npm run dev
```

The site will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

---

## Deployment

This site is deployed to **GitHub Pages**.

### Build and Deploy

```bash
# Build the project
npm run build

# The dist/ folder contains the static site
# Deploy dist/ to GitHub Pages
```

Make sure to include a `.nojekyll` file in the `dist/` directory before deploying to prevent GitHub from running Jekyll.

---

## Features

- ✅ **Bilingual Support** - Switch between English and Hebrew
- ✅ **Dark Mode** - Automatic theme detection with manual toggle
- ✅ **Blog System** - Markdown-based blog posts with syntax highlighting
- ✅ **Project Showcase** - Filterable project portfolio
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **SEO Friendly** - Meta tags and proper structure

---

## License

This project is licensed under the [MIT License](LICENSE).
