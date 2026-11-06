
import { useState } from "react";
import {
  Home,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

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
      <div className="nav-container">

        {/* Logo */}
        <a className="brand" href="#home" onClick={closeMenu}>
  <img
    src="/ethiolance-emblem.png"
    alt="EthioLance emblem"
    className="brand-emblem"
  />

  <img
    src="/ethiolance-wordmark.png"
    alt="EthioLance"
    className="brand-wordmark"
  />
</a>

        {/* Desktop Navigation */}
        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>

          <a href="#home" className="nav-link active" onClick={closeMenu}>
            <Home size={17} />
            Home
          </a>

          <a href="#find-jobs" className="nav-link" onClick={closeMenu}>
            Find Jobs
          </a>

          <a href="#find-freelancers" className="nav-link" onClick={closeMenu}>
            Find Freelancers
          </a>

          <a href="#categories" className="nav-link" onClick={closeMenu}>
            Categories
            <ChevronDown size={15} />
          </a>

          <a href="#about" className="nav-link" onClick={closeMenu}>
            About
          </a>

          <a href="#contact" className="nav-link" onClick={closeMenu}>
            Contact
          </a>

          {/* Mobile buttons */}
          <div className="mobile-nav-actions">
            <a href="/login" onClick={handleLoginClick}>
              Sign In
            </a>

            <a href="/register" onClick={handleRegisterClick}>
              Sign Up
            </a>
          </div>
        </nav>

        {/* Right side */}
        <div className="nav-actions">

          {/* Search */}
          <div className="nav-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search jobs or freelancers..."
            />
          </div>

          {/* Notifications */}
          <button className="nav-notification" aria-label="Notifications">
            <Bell size={21} />
            <span className="notification-count">3</span>
          </button>

          {/* Authentication */}
          <a
            href="/login"
            className="nav-login"
            onClick={handleLoginClick}
          >
            Sign In
          </a>

          <a
            href="/register"
            className="nav-register"
            onClick={handleRegisterClick}
          >
            Sign Up
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="nav-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>
    </header>
  );
}

export default Navbar;
