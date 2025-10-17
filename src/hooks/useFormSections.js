import { useState, useCallback } from 'react';

/**
 * Custom hook for managing dynamic form sections (work experience, education, etc.)
 */
export const useFormSections = () => {
  const [workExperiences, setWorkExperiences] = useState([0]);
  const [educations, setEducations] = useState([0]);
  const [certifications, setCertifications] = useState([]);
  const [additionalSections, setAdditionalSections] = useState([]);

  const addWorkExperience = useCallback(() => {
    const newIndex = Math.max(...workExperiences) + 1;
    setWorkExperiences([...workExperiences, newIndex]);
  }, [workExperiences]);

  const removeWorkExperience = useCallback((index) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    }
  }, [workExperiences]);

  const addEducation = useCallback(() => {
    const newIndex = Math.max(...educations) + 1;
    setEducations([...educations, newIndex]);
  }, [educations]);

  const removeEducation = useCallback((index) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  }, [educations]);

  const addCertification = useCallback(() => {
    const newIndex = certifications.length > 0 ? Math.max(...certifications) + 1 : 0;
    setCertifications([...certifications, newIndex]);
  }, [certifications]);

  const removeCertification = useCallback((index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  }, [certifications]);

  const addAdditionalSection = useCallback(() => {
    const newIndex = additionalSections.length > 0 ? Math.max(...additionalSections) + 1 : 0;
    setAdditionalSections([...additionalSections, newIndex]);
  }, [additionalSections]);

  const removeAdditionalSection = useCallback((index) => {
    setAdditionalSections(additionalSections.filter((_, i) => i !== index));
  }, [additionalSections]);

  const moveSectionUp = useCallback((index) => {
    if (index > 0) {
      const newSections = [...additionalSections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      setAdditionalSections(newSections);
    }
  }, [additionalSections]);

  const moveSectionDown = useCallback((index) => {
    if (index < additionalSections.length - 1) {
      const newSections = [...additionalSections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setAdditionalSections(newSections);
    }
  }, [additionalSections]);

  return {
    workExperiences,
    educations,
    certifications,
    additionalSections,
    setWorkExperiences,
    setEducations,
    setCertifications,
    setAdditionalSections,
    addWorkExperience,
    removeWorkExperience,
    addEducation,
    removeEducation,
    addCertification,
    removeCertification,
    addAdditionalSection,
    removeAdditionalSection,
    moveSectionUp,
    moveSectionDown,
  };
};
