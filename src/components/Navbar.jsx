import React, { useState } from 'react';
import { User, LogIn, FileText, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <span className="logo-text">my<span className="logo-highlight">RESUME</span>now</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <a href="#home" className="nav-link">Home</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="nav-auth desktop-auth">
          <button className="auth-btn login-btn">
            Login
          </button>
          <button className="auth-btn signup-btn">
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-links">
              <a href="#home" className="mobile-nav-link" onClick={toggleMobileMenu}>Home</a>
              <a href="#about" className="mobile-nav-link" onClick={toggleMobileMenu}>About</a>
              <a href="#contact" className="mobile-nav-link" onClick={toggleMobileMenu}>Contact</a>
            </div>
            <div className="mobile-auth">
              <button className="auth-btn login-btn mobile-auth-btn">
                Login
              </button>
              <button className="auth-btn signup-btn mobile-auth-btn">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;