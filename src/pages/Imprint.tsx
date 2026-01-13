import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Imprint() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Header />
      <main>
        <section className="max-container text-center" style={{ padding: '60px 0' }}>
          <h2 className="section-header-title mb-4">Imprint</h2>
          <p>This website is operated by:</p>
          <p>
            <strong>Ronel Herzass</strong>
          </p>
          <p>
            Contact:
            <br />
            <a href="mailto:ronelherzass@gmail.com">ronelherzass@gmail.com</a>
            <br />
            <a href="https://www.linkedin.com/in/ronel-herzass" target="_blank" rel="noopener">
              LinkedIn Profile
            </a>
            <br />
          </p>
          <p className="text-gray-600" style={{ marginTop: '30px' }}>
            All content on this website — including text, images, and code — is the property of Ronel
            Herzass, unless otherwise noted. Unauthorized use or reproduction is prohibited.
          </p>
          <p className="text-gray-600">
            © {currentYear} Ronel Herzass. All rights reserved.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
