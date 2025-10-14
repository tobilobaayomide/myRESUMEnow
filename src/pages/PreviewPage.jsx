import { Download, ArrowLeft, Edit } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Previewer } from 'pagedjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './PreviewPage.css';

const PreviewPage = ({ resumeData, onBack, onEdit }) => {
  console.log('PreviewPage component mounted/re-rendered');
  console.log('Received resumeData:', resumeData);
  
  const documentRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  
  const handleDownload = async (e) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!previewContainerRef.current) {
      console.error('Preview container not found');
      return;
    }

    console.log('=== STARTING PDF DOWNLOAD ===');

    try {
      // Get all pages from paged.js
      const pagedPages = previewContainerRef.current.querySelectorAll('.pagedjs_page');
      
      if (pagedPages.length === 0) {
        console.error('No pages found');
        alert('Please wait for the preview to load before downloading.');
        return;
      }

      console.log(`Found ${pagedPages.length} pages to convert`);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Process each page individually
      for (let i = 0; i < pagedPages.length; i++) {
        console.log(`Processing page ${i + 1}/${pagedPages.length}`);
        
        const pageElement = pagedPages[i];
        
        // Temporarily remove transform for accurate capture
        const originalTransform = pageElement.style.transform;
        const originalMargin = pageElement.style.margin;
        pageElement.style.transform = 'none';
        pageElement.style.margin = '0';
        
        // Get all links in this page BEFORE capturing
        const links = pageElement.querySelectorAll('a');
        const linkData = Array.from(links).map(link => {
          const rect = link.getBoundingClientRect();
          const pageRect = pageElement.getBoundingClientRect();
          return {
            x: rect.left - pageRect.left,
            y: rect.top - pageRect.top,
            width: rect.width,
            height: rect.height,
            url: link.href
          };
        });
        
        // Capture the page as canvas
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: pageElement.offsetWidth,
          height: pageElement.offsetHeight
        });
        
        // Restore transform after capture
        pageElement.style.transform = originalTransform;
        pageElement.style.margin = originalMargin;
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Add new page ONLY if not the first page
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add image to PDF
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        // Add clickable links on top of the image
        const scaleX = pdfWidth / canvas.width * 2;
        const scaleY = pdfHeight / canvas.height * 2;
        
        linkData.forEach(link => {
          const linkX = link.x * scaleX;
          const linkY = link.y * scaleY;
          const linkWidth = link.width * scaleX;
          const linkHeight = link.height * scaleY;
          
          pdf.link(linkX, linkY, linkWidth, linkHeight, { url: link.url });
        });
        
        console.log(`Page ${i + 1} complete with ${linkData.length} links`);
      }
      
      // Save the PDF with mobile-friendly approach
      const filename = `${resumeData.fullName?.replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`;
      
      // Detect if iOS device
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS: Use Web Share API (most reliable for iOS Safari)
        const pdfBlob = pdf.output('blob');
        
        // Check if Web Share API is available
        if (navigator.share && navigator.canShare) {
          const file = new File([pdfBlob], filename, { type: 'application/pdf' });
          
          // Check if can share files
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: filename,
                text: 'Your resume PDF'
              });
              console.log('PDF shared successfully via Web Share API');
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                // Fallback to download link
                fallbackDownload(pdfBlob, filename);
              }
            }
          } else {
            // Can't share files, fallback to download
            fallbackDownload(pdfBlob, filename);
          }
        } else {
          // No Web Share API, fallback to download
          fallbackDownload(pdfBlob, filename);
        }
      } else if (isAndroid) {
        // Android: use blob with download attribute
        const pdfBlob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL after download
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } else {
        // Desktop: use normal save method
        pdf.save(filename);
      }
      
      // Fallback function for iOS when Web Share API is not available
      function fallbackDownload(blob, filename) {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 100);
        
        // Show instruction for iOS users
        alert('PDF generated! If download didn\'t start, tap and hold the PDF to save it.');
      }
      
      console.log('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    }
  };

  // Use Paged.js to automatically handle pagination
  const renderWithPagedJS = async () => {
    console.log('renderWithPagedJS called');
    if (!documentRef.current || !resumeData || !previewContainerRef.current) {
      console.log('Missing refs or data:', {
        documentRef: !!documentRef.current,
        resumeData: !!resumeData,
        previewContainerRef: !!previewContainerRef.current
      });
      return;
    }
    
    try {
      setIsRendered(false);
      
      // Clear previous render
      previewContainerRef.current.innerHTML = '';
      console.log('Cleared previous render, starting Paged.js preview...');
      console.log('Full name from resumeData:', resumeData.fullName);
      console.log('Title from resumeData:', resumeData.title);
      
      const paged = new Previewer();
      await paged.preview(documentRef.current.innerHTML, [], previewContainerRef.current);
      setIsRendered(true);
      console.log('Paged.js rendered successfully');
    } catch (error) {
      console.error('Paged.js rendering error:', error);
      setIsRendered(true); // Show content anyway
    }
  };

  // Function to calculate content height and create pages (legacy)
  const calculatePagination = () => {
    if (!resumeData) return;
    
    // Create a temporary div to measure content height
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '180mm'; // Content width (210mm - 30mm margins)
    tempDiv.style.fontFamily = 'Times New Roman, Times, serif';
    tempDiv.style.fontSize = '10pt';
    tempDiv.style.lineHeight = '1.3';
    tempDiv.style.visibility = 'hidden';
    document.body.appendChild(tempDiv);
    
    const newPages = [];
    let currentPageSections = [];
    let currentPageHeight = 0;
    const maxPageHeight = 950; // Approximate pixel height for 267mm at screen resolution
    
    // Define all sections in order
    const allSections = [
      { type: 'header', component: 'header' },
      { type: 'summary', component: 'summary' },
      { type: 'skills', component: 'skills' },
      { type: 'experience', component: 'experience' },
      { type: 'education', component: 'education' },
      { type: 'certifications', component: 'certifications' },
      ...getAdditionalSectionsList()
    ];
    
    // Measure each section and distribute across pages
    allSections.forEach((section, index) => {
      // Create section content for measurement
      const sectionHTML = generateSectionHTML(section);
      if (!sectionHTML.trim()) return; // Skip empty sections
      
      tempDiv.innerHTML = sectionHTML;
      const sectionHeight = tempDiv.offsetHeight;
      
      // Check if section fits on current page
      if (currentPageHeight + sectionHeight > maxPageHeight && currentPageSections.length > 0) {
        // Start new page
        newPages.push([...currentPageSections]);
        currentPageSections = [section];
        currentPageHeight = sectionHeight;
      } else {
        currentPageSections.push(section);
        currentPageHeight += sectionHeight;
      }
    });
    
    // Add the last page if it has content
    if (currentPageSections.length > 0) {
      newPages.push(currentPageSections);
    }
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    // Ensure we have at least one page
    setPages(newPages.length > 0 ? newPages : [allSections]);
  };

  // Generate HTML for section measurement
  const generateSectionHTML = (section) => {
    switch (section.type) {
      case 'header':
        return `
          <div style="text-align: center; margin-bottom: 1.2rem;">
            <h1 style="font-size: 20pt; margin: 0 0 0.2rem 0;">${resumeData.fullName || ''}</h1>
            <h2 style="font-size: 12pt; margin: 0;">${resumeData.title || ''}</h2>
            <div style="font-size: 9pt; margin-top: 0.2rem;">Contact Info</div>
          </div>
        `;
      case 'summary':
        return resumeData.summary ? `
          <div style="margin-bottom: 1rem; margin-top: 2rem;">
            <h3 style="font-size: 12pt; margin: 0 0 0.8rem 0;">Professional Summary</h3>
            <p style="margin: 0;">${resumeData.summary}</p>
          </div>
        ` : '';
      case 'skills':
        return resumeData.skills ? `
          <div style="margin-bottom: 1rem; margin-top: 2rem;">
            <h3 style="font-size: 12pt; margin: 0 0 0.8rem 0;">Technical Skills</h3>
            <div>${resumeData.skills}</div>
          </div>
        ` : '';
      case 'experience':
        const experiences = getWorkExperiences();
        return experiences.length > 0 ? `
          <div style="margin-bottom: 1rem; margin-top: 2rem;">
            <h3 style="font-size: 12pt; margin: 0 0 0.8rem 0;">Work Experience</h3>
            ${experiences.map(exp => `
              <div style="margin-bottom: 0.8rem;">
                <div style="margin-bottom: 0.4rem;">
                  <h4 style="font-size: 11pt; margin: 0;">${exp.jobTitle}: ${exp.company}</h4>
                  <span style="font-size: 9pt;">${exp.startMonth} ${exp.startYear} - ${exp.endMonth || 'Present'}</span>
                </div>
                <div style="margin-left: 1.2rem;">${exp.description || ''}</div>
              </div>
            `).join('')}
          </div>
        ` : '';
      case 'education':
        const educations = getEducations();
        return educations.length > 0 ? `
          <div style="margin-bottom: 1rem; margin-top: 2rem;">
            <h3 style="font-size: 12pt; margin: 0 0 0.8rem 0;">Education</h3>
            ${educations.map(edu => `
              <div style="margin-bottom: 0.6rem;">
                <h4 style="font-size: 11pt; margin: 0;">${edu.degree}${edu.course ? ` in ${edu.course}` : ''}</h4>
                <span style="font-size: 10pt;">${edu.institution}</span>
              </div>
            `).join('')}
          </div>
        ` : '';
      case 'certifications':
        const certifications = getCertifications();
        return certifications.length > 0 ? `
          <div style="margin-bottom: 1rem; margin-top: 2rem;">
            <h3 style="font-size: 12pt; margin: 0 0 0.8rem 0;">Certifications</h3>
            ${certifications.map(cert => `
              <div style="margin-bottom: 0.6rem;">
                <h4 style="font-size: 10pt; margin: 0;">${cert.name}</h4>
              </div>
            `).join('')}
          </div>
        ` : '';
      default:
        return section.content || '';
    }
  };

  // Get additional sections as a list
  const getAdditionalSectionsList = () => {
    const additionalSections = getAdditionalSections();
    return additionalSections.map(section => ({
      type: 'additional',
      component: 'additional',
      data: section,
      content: `
        <div style="margin-bottom: 1rem; margin-top: 2rem;">
          <h3 style="font-size: 12pt; margin: 0 0 0.8rem 0;">${section.title}</h3>
          <div>Additional content</div>
        </div>
      `
    }));
  };

  // Effect to render with Paged.js when resume data changes
  useEffect(() => {
    if (resumeData) {
      console.log('PreviewPage: resumeData changed, rendering with Paged.js', resumeData);
      console.log('Timestamp:', resumeData._timestamp);
      // Small delay to ensure DOM is ready
      setTimeout(() => renderWithPagedJS(), 100);
    }
  }, [resumeData, resumeData?._timestamp]);

  // Render individual sections
  const renderSection = (section) => {
    switch (section.type) {
      case 'header':
        return (
          <div key="header" className="resume-header">
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
        );
      
      case 'summary':
        return resumeData.summary ? (
          <div key="summary" className="resume-section">
            <h3 className="section-title">Professional Summary</h3>
            <p className="summary-text">{resumeData.summary}</p>
          </div>
        ) : null;
      
      case 'skills':
        if (!resumeData.skills) return null;
        
        // Check if skills contain line breaks (listed format)
        const hasLineBreaks = resumeData.skills.includes('\n');
        
        if (hasLineBreaks) {
          // Display as bulleted list
          const skillLines = resumeData.skills.split('\n').filter(line => line.trim());
          return (
            <div key="skills" className="resume-section">
              <h3 className="section-title">Technical Skills</h3>
              <ul className="skills-list-bulleted">
                {skillLines.map((skill, index) => (
                  <li key={index}>{skill.trim()}</li>
                ))}
              </ul>
            </div>
          );
        } else {
          // Display inline with commas
          return (
            <div key="skills" className="resume-section">
              <h3 className="section-title">Technical Skills</h3>
              <div className="skills-list">
                {resumeData.skills?.split(',').map((skill, index) => (
                  <span key={index} className="skill-item">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          );
        }
      
      case 'experience':
        const workExperiences = getWorkExperiences();
        return workExperiences.length > 0 ? (
          <div key="experience" className="resume-section">
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
        ) : null;
      
      case 'education':
        const educations = getEducations();
        return educations.length > 0 ? (
          <div key="education" className="resume-section">
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
        ) : null;
      
      case 'certifications':
        const certifications = getCertifications();
        return certifications.length > 0 ? (
          <div key="certifications" className="resume-section">
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
        ) : null;
      
      case 'additional':
        const { data: groupedSection } = section;
        return (
          <div key={`additional-${groupedSection.title}`} className="resume-section">
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
        );
      
      default:
        return null;
    }
  };

  // Helper function to convert month names to short form
  const getShortMonth = (month) => {
    if (!month || month === 'Present') return month;
    
    const monthMap = {
      'January': 'Jan.',
      'February': 'Feb.',
      'March': 'Mar.',
      'April': 'Apr.',
      'May': 'May',
      'June': 'Jun.',
      'July': 'Jul.',
      'August': 'Aug.',
      'September': 'Sep.',
      'October': 'Oct.',
      'November': 'Nov.',
      'December': 'Dec.'
    };
    
    return monthMap[month] || month;
  };

  // Helper function to get work experiences
  const getWorkExperiences = () => {
    const experiences = [];
    let index = 0;
    while (resumeData[`jobTitle_${index}`]) {
      experiences.push({
        jobTitle: resumeData[`jobTitle_${index}`],
        company: resumeData[`company_${index}`],
        startMonth: getShortMonth(resumeData[`startMonth_${index}`]),
        startYear: resumeData[`startYear_${index}`],
        endMonth: getShortMonth(resumeData[`endMonth_${index}`]),
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
        startMonth: getShortMonth(resumeData[`educationStartMonth_${index}`]),
        startYear: resumeData[`educationStartYear_${index}`],
        endMonth: getShortMonth(resumeData[`educationEndMonth_${index}`]),
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
      } else if (section.type === 'volunteer') {
        // Handle structured volunteer data
        const volunteerData = {
          organization: resumeData[`volunteerOrg_${index}`],
          year: resumeData[`volunteerYear_${index}`]
        };
        // Only add if there's actual volunteer data
        if (volunteerData.organization || section.content) {
          section.volunteerData = volunteerData;
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
                <div className="project-title-row">
                  <div className="project-name-description">
                    <strong className="project-name">{section.projectData.name}:</strong>
                    {section.projectData.description && (
                      <span className="project-description-inline"> {section.projectData.description}</span>
                    )}
                  </div>
                </div>
                {section.projectData.stack && (
                  <div className="project-stack-row">
                    <div className="project-stack">
                      <span className="stack-label">Tech Stack:</span> {section.projectData.stack}
                    </div>
                    {section.projectData.url && (
                      <a href={section.projectData.url} target="_blank" rel="noopener noreferrer" className="project-link">
                        View Project
                      </a>
                    )}
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
          // Check if we have structured volunteer data
          items.forEach(section => {
            if (section.volunteerData && section.volunteerData.organization) {
              const contentKey = `${section.index}-structured`;
              if (!addedContent.has(contentKey)) {
                addedContent.add(contentKey);
                allContent.push(
                  <div key={contentKey} className="volunteer-item-inline">
                    <strong className="volunteer-org-inline">{section.volunteerData.organization}</strong>
                    {section.volunteerData.year && (
                      <span className="volunteer-year-inline">{section.volunteerData.year}</span>
                    )}
                  </div>
                );
              }
            } else if (section.content) {
              // Fallback to text-based content parsing
              const lines = section.content.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                const contentKey = `${section.index}-${line}`;
                if (!addedContent.has(contentKey)) {
                  addedContent.add(contentKey);
                  allContent.push(line.trim());
                }
              });
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
      {/* Source content for Paged.js - completely hidden */}
      <div ref={documentRef} style={{ position: 'absolute', visibility: 'hidden', width: '210mm' }}>
        {/* Header */}
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
              <a href={`mailto:${resumeData.email}`}>{resumeData.email}</a>
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
        {resumeData.summary && (
          <div className="resume-section">
            <h3 className="section-title">Professional Summary</h3>
            <p className="summary-text">{resumeData.summary}</p>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills && (() => {
          const hasLineBreaks = resumeData.skills.includes('\n');
          
          if (hasLineBreaks) {
            const skillLines = resumeData.skills.split('\n').filter(line => line.trim());
            return (
              <div className="resume-section">
                <h3 className="section-title">Technical Skills</h3>
                <ul className="skills-list-bulleted">
                  {skillLines.map((skill, index) => (
                    <li key={index}>{skill.trim()}</li>
                  ))}
                </ul>
              </div>
            );
          } else {
            return (
              <div className="resume-section">
                <h3 className="section-title">Technical Skills</h3>
                <div className="skills-list">
                  {resumeData.skills?.split(',').map((skill, index) => (
                    <span key={index} className="skill-item">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            );
          }
        })()}

        {/* Work Experience - ALL experiences */}
        {workExperiences.length > 0 && (
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
        )}

        {/* Education */}
        {educations.length > 0 && (
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
                  {(education.endMonth === 'Present' || education.endYear === 'Present')
                    ? 'Present'
                    : (education.endMonth && education.endYear 
                        ? `${education.endMonth} ${education.endYear}` 
                        : 'Present')}
                </span>
              </div>
            ))}
          </div>
        )}

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

      {/* Paged.js will render pages here */}
      <div ref={previewContainerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', paddingTop: '3rem' }}></div>

      <div className="preview-actions">
        <button type="button" className="edit-button" onClick={onEdit}>
          <Edit size={18} />
          Edit Resume
        </button>
        <button type="button" className="download-button" onClick={handleDownload}>
          <Download size={18} />
          Download PDF 
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;