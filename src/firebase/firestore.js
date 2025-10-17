import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Save a resume to Firestore
export const saveResume = async (userId, resumeData, resumeName = 'Untitled Resume') => {
  try {
    const resumeId = `resume_${Date.now()}`;
    const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
    
    await setDoc(resumeRef, {
      name: resumeName,
      data: resumeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, resumeId, error: null };
  } catch (error) {
    console.error('Error saving resume:', error);
    return { success: false, resumeId: null, error: error.message };
  }
};

// Update an existing resume
export const updateResume = async (userId, resumeId, resumeData, resumeName) => {
  try {
    const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
    
    const updateData = {
      updatedAt: serverTimestamp()
    };
    
    if (resumeData) updateData.data = resumeData;
    if (resumeName) updateData.name = resumeName;
    
    await updateDoc(resumeRef, updateData);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating resume:', error);
    return { success: false, error: error.message };
  }
};

// Get a single resume
export const getResume = async (userId, resumeId) => {
  try {
    const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    
    if (resumeSnap.exists()) {
      return { 
        success: true, 
        resume: { id: resumeSnap.id, ...resumeSnap.data() },
        error: null 
      };
    } else {
      return { success: false, resume: null, error: 'Resume not found' };
    }
  } catch (error) {
    console.error('Error getting resume:', error);
    return { success: false, resume: null, error: error.message };
  }
};

// Get all resumes for a user
export const getAllResumes = async (userId) => {
  try {
    const resumesRef = collection(db, 'users', userId, 'resumes');
    const q = query(resumesRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const resumes = [];
    querySnapshot.forEach((doc) => {
      resumes.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, resumes, error: null };
  } catch (error) {
    console.error('Error getting resumes:', error);
    return { success: false, resumes: [], error: error.message };
  }
};

// Delete a resume
export const deleteResume = async (userId, resumeId) => {
  try {
    const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
    await deleteDoc(resumeRef);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting resume:', error);
    return { success: false, error: error.message };
  }
};

// Duplicate a resume
export const duplicateResume = async (userId, resumeId) => {
  try {
    // Get the original resume
    const { success, resume, error } = await getResume(userId, resumeId);
    
    if (!success) {
      return { success: false, newResumeId: null, error };
    }
    
    // Create a new resume with the same data
    const newResumeId = `resume_${Date.now()}`;
    const newResumeName = `${resume.name} (Copy)`;
    
    const result = await saveResume(userId, resume.data, newResumeName);
    
    return result;
  } catch (error) {
    console.error('Error duplicating resume:', error);
    return { success: false, newResumeId: null, error: error.message };
  }
};
