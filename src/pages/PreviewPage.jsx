import { Download, ArrowLeft, Edit } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PreviewPage.css';

const PreviewPage = ({ resumeData, onBack, onEdit }) => {
  const handleDownload = async () => {
    const element = document.getElementById('resume-preview');
    
    // Get the positions of contact items before capturing
    const contactItems = element.querySelectorAll('.contact-item');
    const contactPositions = Array.from(contactItems).map(item => {
      const rect = item.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      return {
        x: rect.left - elementRect.left,
        y: rect.top - elementRect.top,
        width: rect.width,
        height: rect.height,
        text: item.textContent.trim()
      };
    });
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    // Calculate dimensions to fit on one page
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let yOffset = 0;
    let scaleFactor = 1;
    let xOffset = 0;
    
    // If the image is taller than the page, scale it down to fit
    if (imgHeight > pdfHeight) {
      scaleFactor = pdfHeight / imgHeight;
      const scaledWidth = imgWidth * scaleFactor;
      const scaledHeight = pdfHeight;
      
      // Center the content horizontally if it's scaled down
      xOffset = (pdfWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
    } else {
      // If it fits normally, center it vertically
      yOffset = (pdfHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
    }
    
    // Convert pixel positions to PDF coordinates
    const pixelToPdfScale = (pdfWidth / canvas.width) * 2; // Account for canvas scale
    
    // Add clickable links based on actual positions
    contactPositions.forEach(position => {
      let url = null;
      
      if (position.text === resumeData.email) {
        url = `mailto:${resumeData.email}`;
      } else if (position.text === 'LinkedIn' && resumeData.linkedin) {
        url = resumeData.linkedin.startsWith('http') ? resumeData.linkedin : `https://${resumeData.linkedin}`;
      } else if (position.text === 'Portfolio' && resumeData.portfolio) {
        url = resumeData.portfolio.startsWith('http') ? resumeData.portfolio : `https://${resumeData.portfolio}`;
      }
      
      if (url) {
        const linkX = (position.x * pixelToPdfScale * scaleFactor) + xOffset;
        const linkY = (position.y * pixelToPdfScale * scaleFactor) + yOffset;
        const linkWidth = position.width * pixelToPdfScale * scaleFactor;
        const linkHeight = position.height * pixelToPdfScale * scaleFactor;
        
        pdf.link(linkX, linkY, linkWidth, linkHeight, { url: url });
      }
    });
    
    pdf.save(`${resumeData.fullName?.replace(' ', '_') || 'Resume'}_Resume.pdf`);
  };

  // Helper function to get work experiences
  const getWorkExperiences = () => {
    const experiences = [];
    let index = 0;
    while (resumeData[`jobTitle_${index}`]) {
      experiences.push({
        jobTitle: resumeData[`jobTitle_${index}`],
        company: resumeData[`company_${index}`],
        startMonth: resumeData[`startMonth_${index}`],
        startYear: resumeData[`startYear_${index}`],
        endMonth: resumeData[`endMonth_${index}`],
        endYear: resumeData[`endYear_${index}`],
        description: resumeData[`jobDescription_${index}`]
      });
      index++;
    }
    return experiences;
  };

  // Helper function to get educations
  const getEducations = () => {
    const educations = [];
    let index = 0;
    while (resumeData[`degree_${index}`]) {
      educations.push({
        degree: resumeData[`degree_${index}`],
        course: resumeData[`course_${index}`],
        institution: resumeData[`institution_${index}`],
        location: resumeData[`educationLocation_${index}`],
        startMonth: resumeData[`educationStartMonth_${index}`],
        startYear: resumeData[`educationStartYear_${index}`],
        endMonth: resumeData[`educationEndMonth_${index}`],
        endYear: resumeData[`educationEndYear_${index}`]
      });
      index++;
    }
    return educations;
  };

  // Helper function to get additional sections
  const getAdditionalSections = () => {
    const allSections = [];
    let index = 0;
    
    // Collect all sections first
    while (resumeData[`additionalSectionType_${index}`] || resumeData[`additionalSectionTitle_${index}`]) {
      const sectionType = resumeData[`additionalSectionType_${index}`] || 'custom';
      
      // Skip if no valid data
      if (!sectionType && !resumeData[`additionalSectionTitle_${index}`]) {
        index++;
        continue;
      }
      
      // Map section types to their display titles
      const sectionTitles = {
        'awards': 'Awards & Achievements',
        'languages': 'Languages',
        'projects': 'Projects',
        'volunteer': 'Volunteer Experience',
        'publications': 'Publications',
        'associations': 'Professional Associations',
        'hobbies': 'Hobbies & Interests'
      };
      
      const section = {
        title: sectionType === 'custom' ? 
          resumeData[`additionalSectionTitle_${index}`] : 
          sectionTitles[sectionType] || resumeData[`additionalSectionTitle_${index}`],
        type: sectionType,
        content: resumeData[`additionalSectionContent_${index}`],
        index: index
      };
      
      // Handle structured project data
      if (section.type === 'projects') {
        const projectData = {
          name: resumeData[`projectName_${index}_0`],
          description: resumeData[`projectDescription_${index}_0`],
          stack: resumeData[`projectStack_${index}_0`],
          url: resumeData[`projectUrl_${index}_0`]
        };
        // Only add if there's actual project data
        if (projectData.name || section.content) {
          section.projectData = projectData;
          allSections.push(section);
        }
      } else if (section.content || section.title) {
        // Only add if there's content or title
        allSections.push(section);
      }
      
      index++;
    }
    
    // Group sections by type and title
    const groupedSections = {};
    allSections.forEach(section => {
      const key = `${section.type}_${section.title}`;
      if (!groupedSections[key]) {
        groupedSections[key] = {
          title: section.title,
          type: section.type,
          items: []
        };
      }
      groupedSections[key].items.push(section);
    });
    
    return Object.values(groupedSections);
  };

  // Helper function to format section content based on type
  const formatSectionContent = (groupedSection) => {
    const { type, items } = groupedSection;
    
    if (type === 'projects') {
      // Combine all project items, avoiding duplicates
      const allProjects = [];
      const addedProjects = new Set(); // Track added projects to avoid duplicates
      
      items.forEach((section, sectionIndex) => {
        if (section.projectData && section.projectData.name) {
          const projectKey = `${section.projectData.name}_${section.index}`;
          if (!addedProjects.has(projectKey)) {
            addedProjects.add(projectKey);
            allProjects.push(
              <div key={`project-${section.index}`} className="project-entry">
                <div className="project-header">
                  <strong>{section.projectData.name}</strong>
                  {section.projectData.url && (
                    <a href={section.projectData.url} target="_blank" rel="noopener noreferrer" className="project-link">
                      View Project
                    </a>
                  )}
                </div>
                {section.projectData.description && (
                  <div className="project-description">{section.projectData.description}</div>
                )}
                {section.projectData.stack && (
                  <div className="project-stack">
                    <strong>Tech Stack:</strong> {section.projectData.stack}
                  </div>
                )}
              </div>
            );
          }
        } else if (section.content) {
          // Handle text-based project content
          const lines = section.content.split('\n').filter(line => line.trim());
          lines.forEach((line, lineIndex) => {
            const lineKey = `text-${section.index}-${lineIndex}`;
            if (!addedProjects.has(lineKey)) {
              addedProjects.add(lineKey);
              const colonIndex = line.indexOf(':');
              if (colonIndex > 0) {
                const projectName = line.substring(0, colonIndex);
                const description = line.substring(colonIndex + 1);
                allProjects.push(
                  <div key={lineKey} className="project-entry">
                    <div className="project-header">
                      <strong>{projectName.trim()}</strong>
                    </div>
                    <div className="project-description">{description.trim()}</div>
                  </div>
                );
              } else {
                allProjects.push(
                  <div key={lineKey} className="project-entry">
                    <div className="project-description">{line.trim()}</div>
                  </div>
                );
              }
            }
          });
        }
      });
      return allProjects;
    }
    
    // For other section types, combine all content
    const allContent = [];
    const addedContent = new Set(); // Track added content to avoid duplicates
    
    items.forEach(section => {
      if (!section.content) return;
      
      const lines = section.content.split('\n').filter(line => line.trim());
      
      switch (type) {
        case 'languages':
          lines.forEach(line => {
            const contentKey = `${section.index}-${line}`;
            if (!addedContent.has(contentKey)) {
              addedContent.add(contentKey);
              const [language, proficiency] = line.split(' - ');
              allContent.push(language && proficiency ? 
                <span key={contentKey}><strong>{language.trim()}</strong> - {proficiency.trim()}</span> : 
                line.trim()
              );
            }
          });
          break;
        
        case 'awards':
          lines.forEach(line => {
            const contentKey = `${section.index}-${line}`;
            if (!addedContent.has(contentKey)) {
              addedContent.add(contentKey);
              const parts = line.split(' - ');
              if (parts.length >= 2) {
                allContent.push(<span key={contentKey}><strong>{parts[0].trim()}</strong> - {parts.slice(1).join(' - ')}</span>);
              } else {
                allContent.push(line.trim());
              }
            }
          });
          break;
        
        case 'volunteer':
          lines.forEach(line => {
            const contentKey = `${section.index}-${line}`;
            if (!addedContent.has(contentKey)) {
              addedContent.add(contentKey);
              const colonIndex = line.indexOf(':');
              if (colonIndex > 0) {
                const orgAndDuration = line.substring(0, colonIndex);
                const description = line.substring(colonIndex + 1);
                allContent.push(<span key={contentKey}><strong>{orgAndDuration.trim()}</strong>: {description.trim()}</span>);
              } else {
                allContent.push(line.trim());
              }
            }
          });
          break;
        
        case 'publications':
          lines.forEach(line => {
            const contentKey = `${section.index}-${line}`;
            if (!addedContent.has(contentKey)) {
              addedContent.add(contentKey);
              const parts = line.split(' - ');
              if (parts.length >= 2) {
                allContent.push(<span key={contentKey}><strong>{parts[0].trim()}</strong> - <em>{parts.slice(1).join(' - ')}</em></span>);
              } else {
                allContent.push(line.trim());
              }
            }
          });
          break;
        
        default:
          lines.forEach(line => {
            const contentKey = `${section.index}-${line}`;
            if (!addedContent.has(contentKey)) {
              addedContent.add(contentKey);
              allContent.push(line.trim());
            }
          });
          break;
      }
    });
    
    return allContent;
  };

  // Helper function to get certifications
  const getCertifications = () => {
    const certifications = [];
    let index = 0;
    while (resumeData[`certificationName_${index}`]) {
      certifications.push({
        name: resumeData[`certificationName_${index}`],
        year: resumeData[`certificationYear_${index}`]
      });
      index++;
    }
    return certifications;
  };

  if (!resumeData) {
    return <div>No resume data available</div>;
  }

  const workExperiences = getWorkExperiences();
  const educations = getEducations();
  const certifications = getCertifications();
  const additionalSections = getAdditionalSections();

  return (
    <div className="preview-page">
      <div className="preview-container">
        <div id="resume-preview" className="resume-document">
          {/* Header Section */}
          <div className="resume-header">
            <div className="header-main">
              <h1 className="name">{resumeData.fullName}</h1>
              <h2 className="title">{resumeData.title}</h2>
            </div>
            
            <div className="contact-info">
              <div className="contact-item">
                <span>{resumeData.location}</span>
              </div>
              <div className="contact-item">
                <span>{resumeData.phone}</span>
              </div>
              <div className="contact-item">
                <a href={`mailto:${resumeData.email}`}>
                  {resumeData.email}
                </a>
              </div>
              {resumeData.linkedin && (
                <div className="contact-item">
                  <a href={resumeData.linkedin.startsWith('http') ? resumeData.linkedin : `https://${resumeData.linkedin}`} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </div>
              )}
              {resumeData.portfolio && (
                <div className="contact-item">
                  <a href={resumeData.portfolio.startsWith('http') ? resumeData.portfolio : `https://${resumeData.portfolio}`} target="_blank" rel="noopener noreferrer">
                    Portfolio
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          <div className="resume-section">
            <h3 className="section-title">Professional Summary</h3>
            <p className="summary-text">{resumeData.summary}</p>
          </div>

          {/* Skills */}
          <div className="resume-section">
            <h3 className="section-title">Technical Skills</h3>
            <div className="skills-list">
              {resumeData.skills?.split(',').map((skill, index) => (
                <span key={index} className="skill-item">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="resume-section">
            <h3 className="section-title">Work Experience</h3>
            {workExperiences.map((experience, index) => (
              <div key={index} className="experience-item">
                <div className="experience-header">
                  <div className="position-details">
                    <h4 className="job-title">
                      {experience.jobTitle}: <span className="company-name">{experience.company}.</span>
                    </h4>
                  </div>
                  <span className="date-range">
                    {experience.startMonth} {experience.startYear} - {' '}
                    {(experience.endMonth === 'Present' || experience.endYear === 'Present' || 
                      (!experience.endMonth && !experience.endYear))
                      ? 'Present' 
                      : `${experience.endMonth} ${experience.endYear}`}
                  </span>
                </div>
                <ul className="job-responsibilities">
                  {experience.description?.split('\n').map((line, lineIndex) => (
                    line.trim() && <li key={lineIndex}>{line.trim()}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="resume-section">
            <h3 className="section-title">Education</h3>
            {educations.map((education, index) => (
              <div key={index} className="education-header">
                <div className="degree-details">
                  <h4 className="degree">
                    {education.degree}
                    {education.course && ` in ${education.course}`}
                  </h4>
                  <span className="institution">
                    {education.institution}
                    {education.location && `, ${education.location}, Nigeria.`}
                  </span>
                </div>
                <span className="graduation-year">
                  {education.startMonth} {education.startYear} - {' '}
                  {education.endMonth && education.endYear 
                    ? `${education.endMonth} ${education.endYear}` 
                    : 'Present'}
                </span>
              </div>
            ))}
          </div>

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="resume-section">
              <h3 className="section-title">Certifications</h3>
              {certifications.map((cert, index) => (
                <div key={index} className="certification-item">
                  <div className="certification-header">
                    <h4 className="certification-name">{cert.name}</h4>
                    <span className="certification-year">{cert.year}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additional Sections */}
          {additionalSections.length > 0 && additionalSections.map((groupedSection, index) => (
            <div key={index} className="resume-section">
              <h3 className="section-title">{groupedSection.title}</h3>
              {groupedSection.type === 'projects' ? (
                <div className="projects-section">
                  {formatSectionContent(groupedSection).map((item, itemIndex) => (
                    <div key={itemIndex}>{item}</div>
                  ))}
                </div>
              ) : (
                <ul className="additional-section-list">
                  {formatSectionContent(groupedSection).map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="preview-actions">
          <button className="edit-button" onClick={onEdit}>
            <Edit size={18} />
            Edit Resume
          </button>
          <button className="download-button" onClick={handleDownload}>
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;