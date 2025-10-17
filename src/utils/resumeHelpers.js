/**
 * Resume data transformation utilities
 * Functions for formatting and transforming resume data
 */

/**
 * Format a date range for display
 */
export const formatDateRange = (startMonth, startYear, endMonth, endYear, isPresent = false) => {
  if (!startMonth || !startYear) {
    return '';
  }
  
  const start = `${startMonth} ${startYear}`;
  const end = isPresent ? 'Present' : (endMonth && endYear ? `${endMonth} ${endYear}` : '');
  
  return end ? `${start} - ${end}` : start;
};

/**
 * Sanitize resume data for storage/display
 */
export const sanitizeResumeData = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    // Skip empty values
    if (value === null || value === undefined || value === '') {
      return;
    }
    
    // Trim strings
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

/**
 * Generate resume filename
 */
export const generateResumeFilename = (fullName, timestamp = true) => {
  const name = fullName?.trim() || 'Resume';
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
  
  if (timestamp) {
    const date = new Date().toISOString().split('T')[0];
    return `${safeName}_${date}`;
  }
  
  return safeName;
};

/**
 * Extract work experience entries from flat data structure
 */
export const extractWorkExperiences = (data) => {
  if (!data) return [];
  
  const experiences = [];
  let index = 0;
  
  while (data[`jobTitle_${index}`]) {
    experiences.push({
      jobTitle: data[`jobTitle_${index}`],
      company: data[`company_${index}`],
      startMonth: data[`startMonth_${index}`],
      startYear: data[`startYear_${index}`],
      endMonth: data[`endMonth_${index}`],
      endYear: data[`endYear_${index}`],
      description: data[`jobDescription_${index}`],
      isPresent: data[`endYear_${index}`] === 'Present',
    });
    index++;
  }
  
  return experiences;
};

/**
 * Extract education entries from flat data structure
 */
export const extractEducation = (data) => {
  if (!data) return [];
  
  const education = [];
  let index = 0;
  
  while (data[`degree_${index}`]) {
    education.push({
      degree: data[`degree_${index}`],
      school: data[`school_${index}`],
      location: data[`location_${index}`],
      startMonth: data[`educationStartMonth_${index}`],
      startYear: data[`educationStartYear_${index}`],
      endMonth: data[`educationEndMonth_${index}`],
      endYear: data[`educationEndYear_${index}`],
      description: data[`educationDescription_${index}`],
      isPresent: data[`educationEndYear_${index}`] === 'Present',
    });
    index++;
  }
  
  return education;
};

/**
 * Extract certifications from flat data structure
 */
export const extractCertifications = (data) => {
  if (!data) return [];
  
  const certifications = [];
  let index = 0;
  
  while (data[`certificationName_${index}`]) {
    certifications.push({
      name: data[`certificationName_${index}`],
      issuer: data[`certificationIssuer_${index}`],
      year: data[`certificationYear_${index}`],
    });
    index++;
  }
  
  return certifications;
};

/**
 * Calculate resume completion percentage
 */
export const calculateResumeCompletion = (data) => {
  if (!data) return 0;
  
  const requiredFields = [
    'fullName',
    'email',
    'professionalSummary',
    'skills',
  ];
  
  const workExpComplete = Boolean(data.jobTitle_0 && data.company_0);
  const educationComplete = Boolean(data.degree_0 && data.school_0);
  
  let completed = 0;
  let total = requiredFields.length + 2; // +2 for work exp and education
  
  requiredFields.forEach(field => {
    if (data[field]) completed++;
  });
  
  if (workExpComplete) completed++;
  if (educationComplete) completed++;
  
  return Math.round((completed / total) * 100);
};

/**
 * Check if resume data is valid for export
 */
export const isResumeValid = (data) => {
  if (!data) return false;
  
  // Must have basic info
  if (!data.fullName || !data.email) {
    return false;
  }
  
  // Must have at least work experience or education
  const hasWorkExp = Boolean(data.jobTitle_0 && data.company_0);
  const hasEducation = Boolean(data.degree_0 && data.school_0);
  
  return hasWorkExp || hasEducation;
};

/**
 * Get resume summary statistics
 */
export const getResumeSummary = (data) => {
  if (!data) {
    return {
      workExperiences: 0,
      education: 0,
      certifications: 0,
      hasSkills: false,
      hasSummary: false,
      completion: 0,
    };
  }
  
  return {
    workExperiences: extractWorkExperiences(data).length,
    education: extractEducation(data).length,
    certifications: extractCertifications(data).length,
    hasSkills: Boolean(data.skills),
    hasSummary: Boolean(data.professionalSummary),
    completion: calculateResumeCompletion(data),
  };
};

/**
 * Format resume data for preview display
 */
export const formatResumeForDisplay = (data) => {
  if (!data) return null;
  
  return {
    ...data,
    workExperiences: extractWorkExperiences(data),
    education: extractEducation(data),
    certifications: extractCertifications(data),
    summary: getResumeSummary(data),
  };
};
