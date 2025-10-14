import { useState } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import FormPage from './pages/FormPage'
import PreviewPage from './pages/PreviewPage'
import { parseResumeFile } from './utils/resumeParser'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [resumeData, setResumeData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartCreating = () => {
    setResumeData(null)
    setCurrentPage('form')
  }

  const handleUploadResume = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    console.log('File selected:', file.name, file.type)
    setIsLoading(true)
    try {
      const extractedData = await parseResumeFile(file)
      console.log('Extracted data:', extractedData)
      setResumeData(extractedData)
      setCurrentPage('form')
    } catch (error) {
      console.error('Error parsing resume:', error)
      alert('Failed to parse resume. Please try a different format or create a new resume.')
    } finally {
      setIsLoading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleFormSubmit = (data) => {
    // Create a new object reference with timestamp to ensure React detects the change
    console.log('Form submitted with data:', data)
    const newData = { ...data, _timestamp: Date.now() }
    console.log('Setting resume data to:', newData)
    setResumeData(newData)
    setCurrentPage('preview')
  }

  const handleBackToLanding = () => {
    setCurrentPage('landing')
    setResumeData(null)
  }

  const handleBackToForm = () => {
    setCurrentPage('form')
  }

  const handleEditResume = () => {
    setCurrentPage('form')
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage 
            onStartCreating={handleStartCreating}
            onUploadResume={handleUploadResume}
          />
        )
      case 'form':
        return (
          <FormPage 
            onFormSubmit={handleFormSubmit}
            onBack={handleBackToLanding}
            existingData={resumeData}
          />
        )
      case 'preview':
        return (
          <PreviewPage 
            key={resumeData?._timestamp || Date.now()}
            resumeData={resumeData}
            onBack={handleBackToForm}
            onEdit={handleEditResume}
          />
        )
      default:
        return (
          <LandingPage 
            onStartCreating={handleStartCreating}
            onUploadResume={handleUploadResume}
          />
        )
    }
  }

  return (
    <div className="app">
      <Navbar />
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing your resume...</p>
          </div>
        </div>
      )}
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default App
