import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../firebase/auth';
import { User, LogIn, FileText, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleAboutClick = () => {
    // If not on home page, navigate to home first
    if (window.location.pathname !== '/') {
      navigate('/?scrollTo=how-it-works');
    } else {
      // Already on home page, just scroll
      const section = document.getElementById('how-it-works');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await logOut();
    if (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout. Please try again.');
    } else {
      navigate('/');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-text">my<span className="logo-highlight">RESUME</span>now</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="nav-link">Home</button>
          <button onClick={handleAboutClick} className="nav-link">About</button>
          <button onClick={() => navigate('/templates')} className="nav-link">Templates</button>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="nav-auth desktop-auth">
          {currentUser ? (
            <>
              <div 
                className="user-info-badge"
                onClick={() => navigate('/dashboard')}
                style={{ cursor: 'pointer' }}
                title="Go to Dashboard"
              >
                <User size={16} />
                <span className="user-email">{currentUser.email}</span>
              </div>
              <button className="auth-btn logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="auth-btn login-btn" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="auth-btn signup-btn" onClick={() => navigate('/signup')}>
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-links">
              <button onClick={() => { navigate('/'); toggleMobileMenu(); }} className="mobile-nav-link">Home</button>
              <button onClick={handleAboutClick} className="mobile-nav-link">About</button>
              <button onClick={() => { navigate('/contact'); toggleMobileMenu(); }} className="mobile-nav-link">Contact</button>
            </div>
            <div className="mobile-auth">
              {currentUser ? (
                <>
                  <div 
                    className="mobile-user-info"
                    onClick={() => { navigate('/dashboard'); toggleMobileMenu(); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <User size={16} />
                    <span>{currentUser.email}</span>
                  </div>
                  <button 
                    className="auth-btn logout-btn mobile-auth-btn" 
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="auth-btn login-btn mobile-auth-btn" 
                    onClick={() => { navigate('/login'); toggleMobileMenu(); }}
                  >
                    Login
                  </button>
                  <button 
                    className="auth-btn signup-btn mobile-auth-btn" 
                    onClick={() => { navigate('/signup'); toggleMobileMenu(); }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;