import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveResume, updateResume } from '../firebase/firestore';

/**
 * Custom hook for auto-saving resume data
 * Handles both authenticated users (Firebase) and guests (localStorage)
 */
export const useAutoSave = (formData, currentResumeId, workExperiences, educations) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    const saveToLocalStorage = () => {
      if (!currentUser) {
        try {
          localStorage.setItem('guestResumeData', JSON.stringify(formData));
          console.log('💾 Guest resume saved to localStorage');
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      if (currentUser) {
        const saveData = async () => {
          try {
            if (currentResumeId) {
              await updateResume(currentUser.uid, currentResumeId, formData);
              console.log('💾 Resume updated in Firebase');
            } else {
              const resumeId = await saveResume(currentUser.uid, formData);
              console.log('💾 New resume saved to Firebase with ID:', resumeId);
            }
          } catch (error) {
            console.error('Error saving resume to Firebase:', error);
          }
        };
        saveData();
      } else {
        saveToLocalStorage();
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(debounceTimer);
  }, [formData, currentUser, currentResumeId, workExperiences, educations]);
};
