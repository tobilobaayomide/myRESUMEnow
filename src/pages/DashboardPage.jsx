import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllResumes, deleteResume, duplicateResume } from '../firebase/firestore';
import { parseResumeFile } from '../utils/resumeParser';
import { FileText, Plus, Edit, Trash2, Copy, Loader, Upload } from 'lucide-react';
import './DashboardPage.css';

const DashboardPage = ({ onUploadResume }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      loadResumes();
    }
  }, [currentUser]);

  const loadResumes = async () => {
    setLoading(true);
    setError('');
    const { resumes: fetchedResumes, error: fetchError } = await getAllResumes(currentUser.uid);
    
    if (fetchError) {
      setError('Failed to load resumes');
      console.error('Error loading resumes:', fetchError);
    } else {
      setResumes(fetchedResumes || []);
    }
    setLoading(false);
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    const { error: deleteError } = await deleteResume(currentUser.uid, resumeId);
    
    if (deleteError) {
      setError('Failed to delete resume');
      console.error('Error deleting resume:', deleteError);
    } else {
      setResumes(resumes.filter(r => r.id !== resumeId));
    }
  };

  const handleDuplicate = async (resumeId) => {
    const { resume: duplicatedResume, error: dupError } = await duplicateResume(currentUser.uid, resumeId);
    
    if (dupError) {
      setError('Failed to duplicate resume');
      console.error('Error duplicating resume:', dupError);
    } else {
      setResumes([duplicatedResume, ...resumes]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type);
    setIsUploading(true);
    setError('');
    
    try {
      const extractedData = await parseResumeFile(file);
      console.log('Extracted data:', extractedData);
      
      if (onUploadResume) {
        onUploadResume(event);
      }
      
      navigate('/form');
    } catch (error) {
      console.error('Error parsing resume:', error);
      setError('Failed to parse resume. Please try a different format or create a new resume.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!currentUser) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <p>Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-user-info">
            <h1>My Resumes</h1>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {error && (
          <div className="dashboard-error">
            <p>{error}</p>
            <button onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="dashboard-loading">
            <Loader className="spinner" size={32} />
            <p>Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="dashboard-empty">
            <FileText size={64} strokeWidth={1} />
            <h2>No resumes yet</h2>
            <p>Create your first professional resume</p>
            <div className="empty-state-actions">
              <button 
                className="create-first-button" 
                onClick={() => {
                  console.log('Create Resume (empty state) button clicked, navigating to /form');
                  navigate('/form');
                }}
              >
                <Plus size={20} />
                Create Resume
              </button>
              <button className="upload-first-button" onClick={handleUploadClick} disabled={isUploading}>
                <Upload size={20} />
                {isUploading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <>
            <div className="dashboard-actions">
              <button 
                className="create-new-button" 
                onClick={() => {
                  console.log('Create Resume button clicked, navigating to /form');
                  navigate('/form');
                }}
              >
                <Plus size={20} />
                Create Resume
              </button>
              <button className="upload-resume-button" onClick={handleUploadClick} disabled={isUploading}>
                <Upload size={20} />
                {isUploading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <div className="resumes-grid">
              {resumes.map((resume) => (
                <div key={resume.id} className="resume-card">
                  <div className="resume-card-header">
                    <FileText size={24} strokeWidth={1.5} />
                    <h3>{resume.name || 'Untitled Resume'}</h3>
                  </div>
                  <div className="resume-card-meta">
                    <p className="resume-date">
                      Last updated: {formatDate(resume.updatedAt)}
                    </p>
                  </div>
                  <div className="resume-card-actions">
                    <button 
                      className="resume-action-btn view-btn"
                      onClick={() => {
                        console.log('View resume:', resume.id);
                      }}
                      title="View Resume"
                    >
                      <FileText size={16} />
                      View
                    </button>
                    <button 
                      className="resume-action-btn edit-btn"
                      onClick={() => {
                        console.log('Edit resume:', resume.id);
                      }}
                      title="Edit Resume"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      className="resume-action-btn duplicate-btn"
                      onClick={() => handleDuplicate(resume.id)}
                      title="Duplicate Resume"
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                    <button 
                      className="resume-action-btn delete-btn"
                      onClick={() => handleDelete(resume.id)}
                      title="Delete Resume"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
