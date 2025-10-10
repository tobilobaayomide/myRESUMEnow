import { ArrowRight, FileText, CheckCircle, Star, Users, Zap, Shield, Award, Eye, Upload } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onStartCreating, onUploadResume }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Build Your Professional Resume
              <span className="highlight"> In Minutes</span>
            </h1>
            <p className="hero-subtitle">
              Create a standout resume that gets you noticed by employers. 
              Professional templates, easy customization, and instant download.
            </p>
            
            <div className="hero-visual">
              <div className="resume-preview">
                <div className="resume-card">
                  <div className="resume-header"></div>
                  <div className="resume-content">
                    <div className="content-line long"></div>
                    <div className="content-line medium"></div>
                    <div className="content-line short"></div>
                    <div className="content-line medium"></div>
                    <div className="content-line long"></div>
                    <div className="content-line short"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hero-cta">
              <button className="cta-button primary" onClick={onStartCreating}>
                <FileText size={20} />
                Create Resume Now
              </button>
              
              <div className="upload-option">
                <label className="upload-button">
                  <Upload size={18} />
                  Upload Existing Resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={onUploadResume}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
            
            <div className="trust-indicators">
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>Free to use</span>
              </div>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>No registration required</span>
              </div>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>Instant download</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual-desktop">
            <div className="resume-preview">
              <div className="resume-card">
                <div className="resume-header"></div>
                <div className="resume-content">
                  <div className="content-line long"></div>
                  <div className="content-line medium"></div>
                  <div className="content-line short"></div>
                  <div className="content-line medium"></div>
                  <div className="content-line long"></div>
                  <div className="content-line short"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why You Need a Resume Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Why Do You Need a Professional Resume?</h2>
            <p>A well-crafted resume is your gateway to career opportunities and professional success</p>
          </div>
          
          <div className="features-list">
            <div className="list-item">
              <div className="list-icon">
                <Eye />
              </div>
              <div className="list-content">
                <h3>First Impression Matters</h3>
                <p>Recruiters spend only 6 seconds scanning your resume. Make those seconds count with a professional layout that highlights your best qualities.</p>
              </div>
            </div>
            
            <div className="list-item">
              <div className="list-icon">
                <Users />
              </div>
              <div className="list-content">
                <h3>Stand Out from Competition</h3>
                <p>Professional resumes get 2.5x more interview calls. Differentiate yourself from other candidates with clear formatting and strategic content.</p>
              </div>
            </div>
            
            <div className="list-item">
              <div className="list-icon">
                <Shield />
              </div>
              <div className="list-content">
                <h3>Beat ATS Systems</h3>
                <p>90% of companies use Applicant Tracking Systems. Our format ensures your resume passes through these filters successfully.</p>
              </div>
            </div>
            
            <div className="list-item">
              <div className="list-icon">
                <Award />
              </div>
              <div className="list-content">
                <h3>Showcase Your Value</h3>
                <p>Properly structured resumes help you present your achievements and skills in a way that demonstrates your true professional worth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Impact Section */}
      <section className="benefits-section">
        <div className="section-container">
          <div className="section-header">
            <h2>The Power of a Professional Resume</h2>
            <p>Your resume is more than a document - it's your career catalyst</p>
          </div>
          
          <div className="benefits-list">
            <div className="list-item">
              <div className="list-icon">
                <Zap />
              </div>
              <div className="list-content">
                <h3>Opens Career Doors</h3>
                <p>A professional resume is your ticket to job interviews. It's often the first thing employers see and determines whether you get called for an interview or passed over.</p>
              </div>
            </div>
            
            <div className="list-item">
              <div className="list-icon">
                <Star />
              </div>
              <div className="list-content">
                <h3>Increases Earning Potential</h3>
                <p>Well-presented resumes lead to better job opportunities and higher salary negotiations. Your resume directly impacts your career trajectory and earning potential.</p>
              </div>
            </div>
            
            <div className="list-item">
              <div className="list-icon">
                <Users />
              </div>
              <div className="list-content">
                <h3>Builds Professional Credibility</h3>
                <p>A polished resume reflects your attention to detail and professionalism. It establishes credibility before you even meet potential employers face-to-face.</p>
              </div>
            </div>
            
            <div className="list-item">
              <div className="list-icon">
                <FileText />
              </div>
              <div className="list-content">
                <h3>Organizes Your Career Story</h3>
                <p>Creating a resume helps you reflect on your achievements and articulate your value proposition. It's a powerful tool for self-assessment and career planning.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Build Your Resume?</h2>
            <p>Join thousands of job seekers who have successfully created their professional resumes</p>
            <button className="cta-button large" onClick={onStartCreating}>
              <FileText size={24} />
              Start Building Now
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;