import { Link, NavLink } from "react-router";
import './Footer.css';

export default function Footer() {
  return (
    <footer id="footer">
      <div className="footer-main">
        <div className="footer-logo-main">
          <NavLink to="/" className="footer-logo" id="footer-logo">Torilla</NavLink>
          <p>Torilla is a digital marketplace platform to easily sell virtual products.</p>
        </div>
        <div className="footer-link-list">
          <h3>Main</h3>
          <Link to="/" className="link-secondary">Home</Link>
          <Link to="/market" className="link-secondary">Market</Link>
          <Link to="/about" className="link-secondary">About</Link>
          <Link to="/dashboard" className="link-secondary">Dashboard</Link>
        </div>
        <div className="footer-link-list">
          <h3>Legal</h3>
          <Link to="/legal/privacy" className="link-secondary">Privacy Policy</Link>
          <Link to="/legal/terms" className="link-secondary">Terms of Service</Link>
        </div>
      </div>

      <p className="copyright">© {new Date().getFullYear()} Torilla. All rights reserved.</p>
    </footer>
  )
}
