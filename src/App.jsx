import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import FormPage from './pages/FormPage'
import PreviewPage from './pages/PreviewPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import { parseResumeFile } from './utils/resumeParser'
import './App.css'


function App() {
  // Handler to clear resume state and localStorage before creating a new resume
  const handleCreateNewResume = () => {
    setResumeData(null);
    setResumeId(null);
    localStorage.removeItem('resumeFormData');
  };
  console.log('🚀 App component rendering');
  const [resumeData, setResumeData] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadResume = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type);
    setIsLoading(true);
    try {
      const extractedData = await parseResumeFile(file);
      console.log('Extracted data:', extractedData);
      setResumeData(extractedData);
      setResumeId(null); // New upload, not editing
    } catch (error) {
      console.error('Error parsing resume:', error);
      alert('Failed to parse resume. Please try a different format or create a new resume.');
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleFormSubmit = (data) => {
    const newData = { ...data, _timestamp: Date.now() };
    setResumeData(newData);
  };

  // Accepts both data and id for editing
  const handleLoadResume = (data, id) => {
    setResumeData(data);
    setResumeId(id || null);
  };

  // Cleanup function to clear resume data on logout
  const handleLogoutCleanup = () => {
    setResumeData(null);
    setResumeId(null);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar onLogoutCleanup={handleLogoutCleanup} />
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Processing your resume...</p>
              </div>
            </div>
          )}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage onUploadResume={handleUploadResume} />} />
              <Route path="/form" element={<FormPage onFormSubmit={handleFormSubmit} existingData={resumeData} resumeId={resumeId} />} />
              <Route path="/preview" element={<PreviewPage key={resumeData?._timestamp} resumeData={resumeData} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<DashboardPage onUploadResume={handleUploadResume} onLoadResume={handleLoadResume} onCreateNewResume={handleCreateNewResume} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
