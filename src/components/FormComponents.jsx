import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable input field with label and error display
 */
export const FormInput = ({ 
  label, 
  error, 
  icon: Icon, 
  ...props 
}) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="input-with-icon">
        {Icon && <Icon className="input-icon" size={20} />}
        <input {...props} />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

/**
 * Password input with visibility toggle
 */
export const PasswordInput = ({ 
  label, 
  error, 
  icon: Icon, 
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="input-with-icon">
        {Icon && <Icon className="input-icon" size={20} />}
        <input 
          {...props} 
          type={showPassword ? 'text' : 'password'} 
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

/**
 * Checkbox input with label
 */
export const CheckboxInput = ({ 
  label, 
  error, 
  ...props 
}) => {
  return (
    <div className="checkbox-group">
      <label className="checkbox-label">
        <input type="checkbox" {...props} />
        <span>{label}</span>
      </label>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

/**
 * Submit button with loading state
 */
export const SubmitButton = ({ 
  children, 
  isLoading, 
  loadingText = 'Processing...', 
  ...props 
}) => {
  return (
    <button 
      type="submit" 
      className="submit-btn" 
      disabled={isLoading}
      {...props}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};

/**
 * Error message display
 */
export const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="error-banner">
      {message}
    </div>
  );
};

/**
 * Success message display
 */
export const SuccessMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="success-banner">
      {message}
    </div>
  );
};

/**
 * Divider with text (e.g., "OR")
 */
export const Divider = ({ text = 'OR' }) => {
  return (
    <div className="divider">
      <span className="divider-line"></span>
      <span className="divider-text">{text}</span>
      <span className="divider-line"></span>
    </div>
  );
};
