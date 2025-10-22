import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp, signInWithGoogle } from '../firebase/auth';
import { UserPlus, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import './AuthPages.css';


import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { user, error: signUpError, verificationSent } = await signUp(email, password, name);

    if (signUpError) {
      setError(signUpError);
      setLoading(false);
    } else {
      setShowSuccess(true);
      setLoading(false);
      setTimeout(() => {
        import('../firebase/auth').then(({ logOut }) => {
          logOut().then(() => {
            navigate('/login');
          });
        });
      }, 2000);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const { user, error: signInError } = await signInWithGoogle();

    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };


  // Block rendering if auth is loading or user is still authenticated (prevents dashboard flash)
  if (authLoading || currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="success-overlay">
            <div className="success-checkmark">
              <CheckCircle size={60} />
            </div>
            <p>
              Account created! Please verify your email to activate your account.<br />
              <span style={{ fontSize: '0.95em', color: '#666' }}>
                If you don&apos;t see the email, check your spam or junk folder.
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className={`auth-container ${showSuccess ? 'success-animation' : ''}`}>
        {showSuccess && (
          <div className="success-overlay">
            <div className="success-checkmark">
              <CheckCircle size={60} />
            </div>
            <p>Account created! A verification email has been sent. Please check your email and verify your account. Redirecting to login...</p>
          </div>
        )}
        
        <div className="auth-header">
          <h1>Create Account</h1>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="at least 6 characters"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button 
          type="button" 
          className="auth-button google" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
