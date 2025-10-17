import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import LoadingOverlay from './components/LoadingOverlay'
import LandingPage from './pages/LandingPage'
import FormPage from './pages/FormPage'
import PreviewPage from './pages/PreviewPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import { parseResumeFile } from './utils/resumeParser'
import { useResumeState } from './hooks/useResumeState'
import './App.css'

function AppContent() {
  console.log('🚀 App component rendering');
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    resumeData,
    currentResumeId,
    setResumeData,
    handleEditResume,
    handleCreateNew,
    handleDeleteResume,
    handleFormSubmit,
  } = useResumeState();

  const handleUploadResume = async (event, navigate) => {
    const file = event.target.files[0]
    if (!file) return

    console.log('File selected:', file.name, file.type)
    setIsLoading(true)
    try {
      const extractedData = await parseResumeFile(file)
      console.log('Extracted data:', extractedData)
      setResumeData(extractedData)
      // Navigate to form after successful parsing
      if (navigate) {
        navigate('/form')
      }
    } catch (error) {
      console.error('Error parsing resume:', error)
      console.error('Error details:', error.message, error.stack)
      alert(`Failed to parse resume: ${error.message}\n\nPlease try again or create a new resume.`)
    } finally {
      setIsLoading(false)
      event.target.value = ''
    }
  }

  return (
    <>
      <Navbar />
      {isLoading && <LoadingOverlay message="Processing your resume..." />}
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                onUploadResume={handleUploadResume} 
                onCreateNew={handleCreateNew} 
              />
            } 
          />
          <Route 
            path="/form" 
            element={
              <FormPage 
                onFormSubmit={handleFormSubmit} 
                existingData={resumeData}
                currentResumeId={currentResumeId}
              />
            } 
          />
          <Route 
            path="/preview" 
            element={
              <PreviewPage 
                key={resumeData?._timestamp} 
                resumeData={resumeData} 
              />
            } 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route 
            path="/dashboard" 
            element={
              <DashboardPage 
                onUploadResume={handleUploadResume}
                onEditResume={handleEditResume}
                onCreateNew={handleCreateNew}
                onDeleteResume={handleDeleteResume}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
