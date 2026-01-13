export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>© {currentYear} Ronel Herzass</p>
        <div className="footer-links">
          <a href="/privacy" className="footer-link">
            Privacy
          </a>
          <a href="/imprint" className="footer-link">
            Imprint
          </a>
        </div>
      </div>
    </footer>
  );
}
