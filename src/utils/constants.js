/**
 * Constants for form fields
 */

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CURRENT_YEAR = new Date().getFullYear();

export const generateYears = (count = 10, startYear = CURRENT_YEAR) => {
  return Array.from({ length: count }, (_, i) => startYear - i);
};

export const SECTION_TEMPLATES = {
  projects: {
    title: 'Projects',
    type: 'projects'
  },
  volunteer: {
    title: 'Volunteer Experience',
    type: 'volunteer'
  },
  awards: {
    title: 'Awards & Honors',
    type: 'awards'
  },
  publications: {
    title: 'Publications',
    type: 'publications'
  },
  languages: {
    title: 'Languages',
    type: 'languages'
  },
  interests: {
    title: 'Interests',
    type: 'interests'
  },
  custom: {
    title: '',
    type: 'custom'
  }
};
