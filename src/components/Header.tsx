import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { id: 'focus', label: 'Focus' },
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const focusSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    element?.focus({ preventScroll: true });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    closeMenu();

    // If on homepage, scroll to section
    const isHomePage = location.pathname === '/' || location.pathname === '';
    if (isHomePage) {
      focusSection(sectionId);
    } else {
      // If on other page, navigate to home then scroll
      navigate('/');
      setTimeout(() => focusSection(sectionId), 100);
    }
  };

  const skipToMain = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.querySelector<HTMLElement>('main');
    main?.focus();
    main?.scrollIntoView();
  };

  return (
    <header className="header">
      <a href="#main" className="skip-link" onClick={skipToMain}>
        Skip to main content
      </a>
      <div className="header-inner">
        <a href="#/" className="logo-link" aria-label="Ronel Herzass – home">
          <span className="logo-icon material-symbols-outlined" aria-hidden="true">
            electric_bolt
          </span>
          <span>Ronel Herzass</span>
        </a>
        <nav className="header-controls" aria-label="Main">
          <button
            type="button"
            className="hamburger-btn"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="nav-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <div id="nav-menu" className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="nav-link"
                onClick={(e) => handleNavClick(e, item.id)}
              >
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="/CV_Ronel_Herzass.pdf"
            className="btn cv-btn"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            CV<span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>
          <button
            type="button"
            className="btn-outline"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
