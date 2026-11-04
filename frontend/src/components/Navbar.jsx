import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import "./Navbar.css";

function Navbar({ onLoginClick, onRegisterClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLoginClick = (event) => {
    event.preventDefault();
    closeMenu();
    onLoginClick?.();
  };

  const handleRegisterClick = (event) => {
    event.preventDefault();
    closeMenu();
    onRegisterClick?.();
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <a
          className="brand"
          href="#home"
          onClick={closeMenu}
        >
          <span className="brand-mark">e</span>

          <span>
            ethio<span className="brand-accent">lance</span>
          </span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={
            menuOpen ? "Close navigation" : "Open navigation"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#find-work" onClick={closeMenu}>
            Find Work
          </a>

          <a href="#hire-talent" onClick={closeMenu}>
            Hire Talent
          </a>

          <a href="#categories" onClick={closeMenu}>
            Explore Skills
          </a>

          <a href="#how-it-works" onClick={closeMenu}>
            How It Works
          </a>

          <div className="mobile-nav-actions">
            <a
              href="/login"
              onClick={handleLoginClick}
            >
              Log in
            </a>

            <a
              className="button button-primary"
              href="/register"
              onClick={handleRegisterClick}
            >
              Sign up <ArrowRight size={16} />
            </a>
          </div>
        </nav>

        <div className="nav-actions">
          <a
            className="login-link"
            href="/login"
            onClick={handleLoginClick}
          >
            Log in
          </a>

          <a
            className="button button-primary nav-signup"
            href="/register"
            onClick={handleRegisterClick}
          >
            Get started <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;