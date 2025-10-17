/**
 * Utility functions for extracting indices from resume data
 */

export const getWorkExperienceIndices = (data) => {
  if (!data) return [0];
  const indices = [];
  Object.keys(data).forEach(key => {
    if (key.startsWith('jobTitle_')) {
      const index = parseInt(key.split('_')[1]);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
  });
  return indices.length > 0 ? indices.sort((a, b) => a - b) : [0];
};

export const getEducationIndices = (data) => {
  if (!data) return [0];
  const indices = [];
  Object.keys(data).forEach(key => {
    if (key.startsWith('degree_')) {
      const index = parseInt(key.split('_')[1]);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
  });
  return indices.length > 0 ? indices.sort((a, b) => a - b) : [0];
};

export const getAdditionalSectionIndices = (data) => {
  if (!data) return [];
  const indices = [];
  Object.keys(data).forEach(key => {
    if (key.startsWith('additionalSectionTitle_')) {
      const index = parseInt(key.split('_')[1]);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
  });
  return indices.sort((a, b) => a - b);
};

export const getCertificationIndices = (data) => {
  if (!data) return [];
  const indices = [];
  Object.keys(data).forEach(key => {
    if (key.startsWith('certificationName_')) {
      const index = parseInt(key.split('_')[1]);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
  });
  return indices.sort((a, b) => a - b);
};

export const getInitialCurrentlyWorking = (data) => {
  if (!data) return {};
  const working = {};
  let index = 0;
  while (data[`jobTitle_${index}`]) {
    if (data[`endMonth_${index}`] === 'Present' || data[`endYear_${index}`] === 'Present') {
      working[index] = true;
    }
    index++;
  }
  return working;
};

export const getInitialCurrentlyStudying = (data) => {
  if (!data) return {};
  const studying = {};
  let index = 0;
  while (data[`degree_${index}`]) {
    if (data[`educationEndMonth_${index}`] === 'Present' || data[`educationEndYear_${index}`] === 'Present') {
      studying[index] = true;
    }
    index++;
  }
  return studying;
};
