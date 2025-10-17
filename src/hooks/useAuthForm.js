import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for authentication form handling
 * Manages loading, error states, and navigation
 * @param {Function} authAction - Authentication function to execute
 * @param {string} redirectPath - Path to redirect after success
 * @returns {Object} - Auth form state and handlers
 */
export const useAuthForm = (authAction, redirectPath = '/dashboard') => {
  const navigate = useNavigate();
  const { googleSignIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles form submission
   */
  const handleSubmit = async (formData, onSuccess) => {
    setError('');
    setLoading(true);

    try {
      await authAction(formData);
      
      if (onSuccess) {
        await onSuccess();
      }
      
      navigate(redirectPath);
    } catch (err) {
      console.error('Auth error:', err);
      
      // User-friendly error messages
      const errorMessages = {
        'auth/invalid-credential': 'Invalid email or password',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
      };

      setError(errorMessages[err.code] || err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google sign-in
   */
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await googleSignIn();
      navigate(redirectPath);
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    handleSubmit,
    handleGoogleSignIn,
  };
};
