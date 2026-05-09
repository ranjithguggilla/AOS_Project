import logoWhite from '../assets/logo/bitforge-white-tight.png';

export default function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        <img
          src={logoWhite}
          alt="BitForge"
          className="footer-logo-img"
        />
      </div>
      <p className="mb-0">&copy; {new Date().getFullYear()} BitForge</p>
    </footer>
  );
}
