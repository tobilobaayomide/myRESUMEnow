/**
 * Form validation utilities
 * Reusable validation functions for common form fields
 */

/**
 * Email validation
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Password validation
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  
  return null;
};

/**
 * Confirm password validation
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

/**
 * Name validation
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) {
    return `${fieldName} is required`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  
  return null;
};

/**
 * Required field validation
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  
  return null;
};

/**
 * Phone number validation
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return null; // Optional field
  }
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};

/**
 * URL validation
 */
export const validateURL = (url, fieldName = 'URL') => {
  if (!url) {
    return null; // Optional field
  }
  
  try {
    new URL(url);
    return null;
  } catch {
    return `Please enter a valid ${fieldName}`;
  }
};

/**
 * Date validation (checks if end date is after start date)
 */
export const validateDateRange = (startMonth, startYear, endMonth, endYear, isPresent = false) => {
  if (!startMonth || !startYear) {
    return 'Start date is required';
  }
  
  if (!isPresent && (!endMonth || !endYear)) {
    return 'End date is required';
  }
  
  if (!isPresent && endYear && startYear) {
    const start = new Date(parseInt(startYear), getMonthNumber(startMonth));
    const end = new Date(parseInt(endYear), getMonthNumber(endMonth));
    
    if (end < start) {
      return 'End date must be after start date';
    }
  }
  
  return null;
};

/**
 * Helper: Convert month name to number
 */
const getMonthNumber = (monthName) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.indexOf(monthName);
};

/**
 * Validate multiple fields at once
 * @param {Object} fields - Object with field values
 * @param {Object} rules - Object with validation rules
 * @returns {Object} - Object with field errors
 */
export const validateFields = (fields, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(fieldName => {
    const rule = rules[fieldName];
    const value = fields[fieldName];
    
    if (typeof rule === 'function') {
      const error = rule(value);
      if (error) {
        errors[fieldName] = error;
      }
    }
  });
  
  return errors;
};

/**
 * Check if object has any errors
 */
export const hasErrors = (errors) => {
  return Object.values(errors).some(error => error !== null && error !== undefined && error !== '');
};

/**
 * Format validation for resume form fields
 */
export const validateResumeField = (fieldName, value) => {
  switch (fieldName) {
    case 'fullName':
      return validateName(value, 'Full name');
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'linkedin':
    case 'portfolio':
      return validateURL(value, fieldName);
    case 'jobTitle':
      return validateRequired(value, 'Job title');
    case 'company':
      return validateRequired(value, 'Company name');
    case 'degree':
      return validateRequired(value, 'Degree');
    case 'school':
      return validateRequired(value, 'School name');
    default:
      return null;
  }
};
