
{/*todo: deside if should add language toggle - need content in hebrew*/}

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
{/*import { useLanguage } from '../context/LanguageContext';*/}
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  {/*const { language, setLanguage } = useLanguage();*/}
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  {/*const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };*/}

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    closeMenu();

    // If on homepage, scroll to section
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If on other page, navigate to home then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="logo-link">
          <span className="logo-icon material-symbols-outlined" aria-hidden="true">
            electric_bolt
          </span>
          <span>Ronel Herzass</span>
        </a>
        <nav className="header-controls">
          <button
            className="hamburger-btn"
            aria-label="Menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              menu
            </span>
          </button>

          <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
            <a href="#projects" className="nav-link" onClick={(e) => handleNavClick(e, 'projects')}>
              Projects
            </a>
            <a href="#blog" className="nav-link" onClick={(e) => handleNavClick(e, 'blog')}>
              Blog
            </a>
            <a href="#about" className="nav-link" onClick={(e) => handleNavClick(e, 'about')}>
              About
            </a>
            <a href="#contact" className="nav-link" onClick={(e) => handleNavClick(e, 'contact')}>
              Contact
            </a>
          </div>
          <a
            href="../public/CV_Ronel_Herzass.pdf"
            className="btn cv-btn"
            aria-label="CV"
            target="_blank"
            rel="noopener"
            onClick={closeMenu}
          >
            CV
          </a>
          {/* <button className="btn-outline" aria-label="Toggle language" onClick={toggleLanguage}>
            <span className="material-symbols-outlined" aria-hidden="true">
              language
            </span>
          </button> */}
          <button className="btn-outline" aria-label="Toggle dark mode" onClick={toggleTheme}>
            <span className="material-symbols-outlined" aria-hidden="true">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
