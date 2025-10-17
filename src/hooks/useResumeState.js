import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for managing resume state in App component
 */
export const useResumeState = () => {
  const { currentUser } = useAuth();
  const [resumeData, setResumeData] = useState(null);
  const [currentResumeId, setCurrentResumeId] = useState(null);

  // Clear all resume data when user logs out
  useEffect(() => {
    if (!currentUser) {
      console.log('User logged out, clearing resume data');
      setResumeData(null);
      setCurrentResumeId(null);
    }
  }, [currentUser]);

  const handleEditResume = (resumeId, resumeDataToEdit) => {
    setCurrentResumeId(resumeId);
    setResumeData(resumeDataToEdit);
  };

  const handleCreateNew = () => {
    console.log('Creating new resume - clearing all data');
    setCurrentResumeId(null);
    setResumeData(null);
  };

  const handleDeleteResume = (resumeId) => {
    // If the deleted resume is currently loaded, clear it
    if (currentResumeId === resumeId) {
      setCurrentResumeId(null);
      setResumeData(null);
    }
  };

  const handleFormSubmit = (data) => {
    const newData = { ...data, _timestamp: Date.now() };
    setResumeData(newData);
  };

  return {
    resumeData,
    currentResumeId,
    setResumeData,
    setCurrentResumeId,
    handleEditResume,
    handleCreateNew,
    handleDeleteResume,
    handleFormSubmit,
  };
};
