import { CheckCircle, Shield, Eye, Zap, Award, Upload, FileText, Download, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import './LandingPage.css';
import previewTemplate from '../assets/preview-template.jpeg';

const LandingPage = ({ onUploadResume, onCreateNew }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo === 'how-it-works') {
      // Small delay to ensure the page is fully rendered
      setTimeout(() => {
        const section = document.getElementById('how-it-works');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [searchParams]);
  
  const handleCreateResume = () => {
    if (onCreateNew) {
      onCreateNew(); // Clear any existing data
    }
    navigate('/form');
  };
  
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="social-proof">
              <span className="proof-text">Used by professionals</span>
              <div className="rating">
                <span className="stars">★★★★★</span>
                <span className="rating-score">4.8/5</span>
              </div>
            </div>
            
            <h1 className="hero-title">
              Professional Resumes That <span className="title-accent">Get You Hired</span>
            </h1>
            <p className="hero-subtitle">
              ATS-optimized template used by professionals at <strong>top companies</strong>. Build yours in <strong>10 minutes</strong>.
            </p>
            
            <div className="hero-cta">
              <button className="cta-button primary" onClick={handleCreateResume}>
                Create Resume Now
              </button>
              
              <label className="upload-link">
                or upload existing resume (.docx)
                <input
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => onUploadResume(e, navigate)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            
            <div className="trust-indicators">
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>Free To Use</span>
              </div>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>SignUp Optional</span>
              </div>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>ATS-Ready</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="resume-screenshot">
              <div className="preview-badge">
                <Eye size={14} />
                <span>Live Preview</span>
              </div>
              <div className="screenshot-wrapper">
                <img 
                  src={previewTemplate} 
                  alt="Professional Resume Preview" 
                  className="resume-preview-image"
                />
              </div>
              <div className="floating-shape shape-1"></div>
              <div className="floating-shape shape-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title-simple">How it Works</h2>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon-wrapper">
              </div>
              <div className="step-number">1</div>
              <h3>Add Your Details</h3>
              <p>Type in your info or upload your existing resume. We'll format everything perfectly</p>
            </div>
            
            <div className="step-arrow">
              <ArrowRight size={24} />
            </div>
            
            <div className="step-card">
              <div className="step-icon-wrapper">
              </div>
              <div className="step-number">2</div>
              <h3>Preview Your Resume</h3>
              <p>See your resume take shape in real-time. Edit on the fly with live preview</p>
            </div>
            
            <div className="step-arrow">
              <ArrowRight size={24} />
            </div>
            
            <div className="step-card">
              <div className="step-icon-wrapper">
              </div>
              <div className="step-number">3</div>
              <h3>Download in PDF</h3>
              <p>Hit download and get a professional PDF ready to send to employers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section">
        <div className="section-container">
          <div className="why-header">
            <h2 className="section-title-simple">Why <span className="title-accent">myRESUMEnow</span>?</h2>
          </div>
          
          <div className="features-list-section">
            <div className="feature-item">
              <div className="feature-icon-large">
                <CheckCircle size={28} />
              </div>
              <div className="feature-content">
                <h4>Clickable Links</h4>
                <p>Add working links to your portfolio, LinkedIn, and email recruiters can click right in the PDF</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-large">
                <Zap size={28} />
              </div>
              <div className="feature-content">
                <h4>Super Simple</h4>
                <p>No complicated editors or confusing templates. Just fill in your info and you're done</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-large">
                <Shield size={28} />
              </div>
              <div className="feature-content">
                <h4>ATS-Ready</h4>
                <p>This format passes automated screening systems that most of companies use</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-large">
                <Eye size={28} />
              </div>
              <div className="feature-content">
                <h4>Clean Design</h4>
                <p>Professional layout optimized for the 6-second recruiter scan</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-large">
                <Award size={28} />
              </div>
              <div className="feature-content">
                <h4>Instant PDF Download</h4>
                <p>Get your polished resume in seconds. No waiting, no hassle</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-large">
                <CheckCircle size={28} />
              </div>
              <div className="feature-content">
                <h4>Completely Free</h4>
                <p>No hidden costs, no premium tiers. Everything is free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="cta-background-shapes">
          <div className="shape-blob shape-1"></div>
          <div className="shape-blob shape-2"></div>
          <div className="shape-blob shape-3"></div>
        </div>
        <div className="section-container">
          <div className="cta-content">
            <h2>Your Perfect Resume is 10 Minutes Away</h2>
            <p>Join 10,000+ professionals who landed their dream jobs with our resume builder</p>
            
            <div className="cta-buttons">
              <button className="cta-button-primary" onClick={handleCreateResume}>
                <Zap size={20} />
                Create Resume Now
              </button>
              
              <label className="cta-button-secondary">
                <Award size={20} />
                Or Upload Existing (.docx)
                <input
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => onUploadResume(e, navigate)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-text">my<span className="logo-highlight">RESUME</span>now</span>
              <p>Professional Resume Builder</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 myRESUMEnow. All rights reserved. · Built by Tobiloba</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;