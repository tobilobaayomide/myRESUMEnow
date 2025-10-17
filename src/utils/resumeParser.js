// Resume Parser - Client-side text extraction from DOCX files
import * as mammoth from 'mammoth';

export const parseResumeFile = async (file) => {
  try {
    console.log('Starting resume parsing...', file.name, file.type);
    
    let extractedText = '';
    
    // Handle different file types
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.endsWith('.docx')) {
      extractedText = await extractTextFromDOCX(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      throw new Error('PDF parsing is not yet supported. Please upload a DOCX file instead.');
    } else if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
      throw new Error('Legacy .doc format is not supported. Please save as .docx and try again.');
    } else if (file.type === 'text/plain') {
      extractedText = await file.text();
    } else {
      throw new Error('Unsupported file format. Please upload DOCX or TXT files.');
    }
    
    console.log('Extracted text length:', extractedText.length);
    console.log('First 500 characters:', extractedText.substring(0, 500));
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the file.');
    }
    
    // Parse the extracted text into structured data
    const parsedData = parseResumeText(extractedText);
    console.log('Parsed data:', parsedData);
    
    return parsedData;
    
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw error;
  }
};

// Extract text from DOCX using mammoth.js
const extractTextFromDOCX = async (file) => {
  try {
    console.log('📄 Extracting text from DOCX file...');
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('✓ File converted to ArrayBuffer:', arrayBuffer.byteLength, 'bytes');
    
    // Use mammoth to extract text
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    console.log('✓ Text extracted successfully');
    console.log('  - Text length:', result.value.length, 'characters');
    console.log('  - First 300 chars:', result.value.substring(0, 300));
    
    if (result.messages && result.messages.length > 0) {
      console.log('  - Mammoth messages:', result.messages);
    }
    
    return result.value;
  } catch (error) {
    console.error('❌ DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
};

// Parse extracted text into structured resume data
const parseResumeText = (text) => {
  console.log('=== Starting Resume Text Parsing ===');
  console.log('Total text length:', text.length);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('Total lines:', lines.length);
  console.log('First 10 lines:', lines.slice(0, 10));
  
  const parsed = {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    title: '',
    summary: '',
    skills: ''
  };
  
  // Extract email
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch.length > 0) {
    parsed.email = emailMatch[0];
  }
  
  // Extract phone (various formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch && phoneMatch.length > 0) {
    parsed.phone = phoneMatch[0];
  }
  
  // Extract LinkedIn
  const linkedinRegex = /(linkedin\.com\/in\/[\w-]+)/gi;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch && linkedinMatch.length > 0) {
    parsed.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : 'https://' + linkedinMatch[0];
  }
  
  // Extract portfolio/website
  const websiteRegex = /(https?:\/\/(?!linkedin)[^\s]+|(?:www\.)(?!linkedin)[^\s]+)/gi;
  const websiteMatch = text.match(websiteRegex);
  if (websiteMatch && websiteMatch.length > 0) {
    parsed.portfolio = websiteMatch[0].startsWith('http') ? websiteMatch[0] : 'https://' + websiteMatch[0];
  }
  
  // Try to extract name (usually first line or first significant text)
  if (lines.length > 0) {
    // Look for the name in first 5 lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Skip if it looks like a header or section title
      if (line && 
          !line.toLowerCase().includes('resume') && 
          !line.toLowerCase().includes('curriculum') &&
          !line.toLowerCase().includes('vitae') &&
          !emailRegex.test(line) &&
          !phoneRegex.test(line) &&
          !line.includes('|') && // Often separator between info
          line.length < 50 &&
          line.length > 3) {
        parsed.fullName = line;
        console.log('Found name at line', i, ':', line);
        break;
      }
    }
  }
  
  // Try to detect job title (second or third line, usually)
  if (lines.length > 1) {
    // Look for title in lines 1-4
    for (let i = 1; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Check if it's not contact info and looks like a title
      if (line && 
          !emailRegex.test(line) && 
          !phoneRegex.test(line) && 
          !line.includes('@') &&
          !line.includes('http') &&
          line.length < 60 && 
          line.length > 5 &&
          line !== parsed.fullName) {
        parsed.title = line;
        console.log('Found title at line', i, ':', line);
        break;
      }
    }
  }
  
  // Try to extract summary/objective (IMPROVED with fallback for headerless summaries)
  const summaryKeywords = ['summary', 'professional summary', 'objective', 'profile', 'about me', 'about'];
  const summaryIndex = lines.findIndex(line => 
    summaryKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );
  
  if (summaryIndex !== -1 && summaryIndex < lines.length - 1) {
    console.log('✓ Found summary section with header at line:', summaryIndex, lines[summaryIndex]);
    
    // Get lines until we hit another section or run out of text
    const summaryLines = [];
    let currentIndex = summaryIndex + 1;
    const stopKeywords = ['experience', 'education', 'skills', 'work history', 'employment', 'certifications', 'projects'];
    
    while (currentIndex < lines.length) {
      const currentLine = lines[currentIndex];
      
      // Stop if we hit another section header
      if (stopKeywords.some(keyword => 
        currentLine.toLowerCase().trim() === keyword || 
        currentLine.toLowerCase().startsWith(keyword + ':')
      )) {
        break;
      }
      
      // Add the line if it has substantial content
      if (currentLine.length > 10) {
        summaryLines.push(currentLine);
      }
      
      currentIndex++;
      
      // Safety limit: max 10 lines for summary
      if (summaryLines.length >= 10) {
        break;
      }
    }
    
    const summary = summaryLines.join(' ').trim();
    console.log('Extracted summary:', summary);
    
    if (summary.length > 20) {
      parsed.summary = summary;
    }
  } else {
    // FALLBACK: Look for long paragraph near the top (likely a summary without header)
    console.log('⚠️ No summary header found, looking for long paragraph...');
    
    // Start looking after name/title (typically lines 0-5)
    let startSearchIndex = Math.min(6, Math.floor(lines.length * 0.1)); // Start after first 10% or line 6
    const stopKeywords = ['experience', 'education', 'skills', 'work history', 'employment', 'certifications', 'projects'];
    
    // Look for first long paragraph (100+ chars) that's not a section header
    for (let i = startSearchIndex; i < Math.min(startSearchIndex + 20, lines.length); i++) {
      const line = lines[i];
      
      // Count commas and bullet-like characters (skills lists have many)
      const commaCount = (line.match(/,/g) || []).length;
      const bulletCount = (line.match(/[•·▪▫]/g) || []).length;
      const pipeCount = (line.match(/\|/g) || []).length;
      
      // Skills indicators: many commas, bullets, pipes, or common skill keywords
      const skillsIndicators = [
        'javascript', 'python', 'java', 'react', 'node', 'html', 'css', 
        'sql', 'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile',
        'excel', 'powerpoint', 'word', 'office', 'leadership', 'communication'
      ];
      const hasMultipleSkillKeywords = skillsIndicators.filter(skill => 
        line.toLowerCase().includes(skill)
      ).length >= 3;
      
      // If line has many separators or multiple skill keywords, skip it (likely skills, not summary)
      const looksLikeSkills = commaCount >= 4 || bulletCount >= 2 || pipeCount >= 2 || hasMultipleSkillKeywords;
      
      // Check if it's a long paragraph (likely summary)
      if (line.length >= 100 && 
          !emailRegex.test(line) && 
          !phoneRegex.test(line) &&
          !looksLikeSkills &&
          !stopKeywords.some(keyword => 
            line.toLowerCase().trim() === keyword || 
            line.toLowerCase().startsWith(keyword + ':') ||
            line.toLowerCase().includes('copyright') ||
            line.toLowerCase().includes('page ')
          )) {
        
        console.log('📝 Analyzing line', i, '- commas:', commaCount, 'bullets:', bulletCount, 'pipes:', pipeCount);
        
        // Found potential summary - collect this and subsequent long lines
        const summaryLines = [line];
        let nextIndex = i + 1;
        
        while (nextIndex < lines.length && summaryLines.length < 10) {
          const nextLine = lines[nextIndex];
          
          // Stop if we hit a section header
          if (stopKeywords.some(keyword => 
            nextLine.toLowerCase().trim() === keyword || 
            nextLine.toLowerCase().startsWith(keyword + ':')
          )) {
            break;
          }
          
          // Add if it's part of the paragraph
          if (nextLine.length > 50) {
            summaryLines.push(nextLine);
          } else if (nextLine.length < 10) {
            // Empty line might signal end of paragraph
            break;
          }
          
          nextIndex++;
        }
        
        const summary = summaryLines.join(' ').trim();
        console.log('✓ Found long paragraph summary at line', i, '(length:', summary.length, 'chars)');
        console.log('Summary preview:', summary.substring(0, 150) + '...');
        
        if (summary.length > 50) {
          parsed.summary = summary;
        }
        break;
      } else if (looksLikeSkills) {
        console.log('⚠️ Skipping line', i, '- looks like skills list (commas:', commaCount, 'bullets:', bulletCount, 'skill keywords detected)');
      }
    }
  }
  
  // Try to extract work experience (IMPROVED with better structure detection)
  const experienceKeywords = ['experience', 'work experience', 'professional experience', 'employment', 'work history', 'career history', 'industrial experience'];
  const experienceIndex = lines.findIndex(line => 
    experienceKeywords.some(keyword => 
      line.toLowerCase().trim() === keyword || 
      line.toLowerCase() === keyword + ':' ||
      line.toLowerCase().includes('work experience') ||
      line.toLowerCase().includes('professional experience') ||
      line.toLowerCase().includes('employment history')
    )
  );
  
  if (experienceIndex !== -1 && experienceIndex < lines.length - 1) {
    console.log('💼 Found experience section at line:', experienceIndex, '- "' + lines[experienceIndex] + '"');
    
    let currentIndex = experienceIndex + 1;
    const stopKeywords = ['education', 'skills', 'certifications', 'projects', 'references', 'volunteer', 'awards', 'publications'];
    const experienceEntries = [];
    
    // Skip empty lines after section header
    while (currentIndex < lines.length && lines[currentIndex].trim().length === 0) {
      currentIndex++;
    }
    
    // Extract all experience entries
    while (currentIndex < lines.length) {
      const currentLine = lines[currentIndex].trim();
      
      // Stop if we hit another major section
      if (stopKeywords.some(keyword => 
        currentLine.toLowerCase().trim() === keyword || 
        currentLine.toLowerCase() === keyword + ':'
      )) {
        console.log('⛔ Stopping at section:', currentLine);
        break;
      }
      
      // Skip empty lines
      if (currentLine.length === 0) {
        currentIndex++;
        continue;
      }
      
      // Look for job title (typically first non-empty line of a job entry)
      // Job titles are usually 10-80 characters
      if (currentLine.length >= 5 && currentLine.length <= 100) {
        console.log('🔍 Examining potential job title at line', currentIndex, ':', currentLine);
        
        // Look ahead for company and dates
        let companyLine = '';
        let datesLine = '';
        let descriptionStartIndex = currentIndex + 1;
        
        // Next line after job title should be company or dates
        let nextIdx = currentIndex + 1;
        while (nextIdx < lines.length && lines[nextIdx].trim().length === 0) nextIdx++;
        
        if (nextIdx < lines.length) {
          const nextLine = lines[nextIdx].trim();
          console.log('  → Next line:', nextLine);
          
          // Check if next line contains a year (likely company + dates or just dates)
          if (nextLine.match(/\d{4}/)) {
            // Could be "Company Name | 2020 - 2023" or just "2020 - 2023"
            if (nextLine.includes('|')) {
              const parts = nextLine.split('|');
              companyLine = parts[0].trim();
              datesLine = parts[1].trim();
            } else if (nextLine.match(/^[A-Za-z].*\d{4}/)) {
              // "Company Name  2020 - 2023" or "Company Name, 2020 - 2023"
              const match = nextLine.match(/^(.+?)\s*[,\s]+(\d{4}\s*[-–]\s*(?:\d{4}|present))/i);
              if (match) {
                companyLine = match[1].trim();
                datesLine = match[2].trim();
              } else {
                // Line has dates, might be just dates or company with dates
                if (nextLine.match(/^\d{4}|^[A-Z][a-z]+\s+\d{4}/)) {
                  // Starts with date or "Month Year"
                  datesLine = nextLine;
                  // Company might be on next line or not present
                  let companyIdx = nextIdx + 1;
                  while (companyIdx < lines.length && lines[companyIdx].trim().length === 0) companyIdx++;
                  if (companyIdx < lines.length && !lines[companyIdx].match(/\d{4}/) && lines[companyIdx].length < 60) {
                    companyLine = lines[companyIdx].trim();
                    descriptionStartIndex = companyIdx + 1;
                  } else {
                    descriptionStartIndex = nextIdx + 1;
                  }
                } else {
                  companyLine = nextLine;
                  // Dates on next line
                  let dateIdx = nextIdx + 1;
                  while (dateIdx < lines.length && lines[dateIdx].trim().length === 0) dateIdx++;
                  if (dateIdx < lines.length && lines[dateIdx].match(/\d{4}/)) {
                    datesLine = lines[dateIdx].trim();
                    descriptionStartIndex = dateIdx + 1;
                  }
                }
              }
            } else {
              datesLine = nextLine;
              descriptionStartIndex = nextIdx + 1;
            }
          } else {
            // Next line doesn't have dates, might be company name
            companyLine = nextLine;
            // Look for dates on line after
            let dateIdx = nextIdx + 1;
            while (dateIdx < lines.length && lines[dateIdx].trim().length === 0) dateIdx++;
            if (dateIdx < lines.length && lines[dateIdx].match(/\d{4}/)) {
              datesLine = lines[dateIdx].trim();
              descriptionStartIndex = dateIdx + 1;
            } else {
              descriptionStartIndex = nextIdx + 1;
            }
          }
        }
        
        // Only proceed if we have at least a company or dates (confirms this is a job entry)
        if (companyLine || datesLine) {
          console.log('  ✓ Confirmed job entry:');
          console.log('    Job Title:', currentLine);
          console.log('    Company:', companyLine || '(not found)');
          console.log('    Dates:', datesLine || '(not found)');
          
          // Collect job description lines (bullet points or paragraphs)
          const descriptionLines = [];
          let descIndex = descriptionStartIndex;
          
          while (descIndex < lines.length) {
            const descLine = lines[descIndex].trim();
            
            // Empty line might signal end, but allow 1-2 empty lines within description
            if (descLine.length === 0) {
              descIndex++;
              if (descIndex < lines.length && lines[descIndex].trim().length === 0) {
                // Two empty lines = end of job description
                break;
              }
              continue;
            }
            
            // Stop if we hit another job title (short line followed by dates/company)
            if (descLine.length < 80 && descIndex + 1 < lines.length) {
              const lineAfterDesc = lines[descIndex + 1].trim();
              if (lineAfterDesc.match(/\d{4}/) || lineAfterDesc.length < 60) {
                // Might be next job title
                break;
              }
            }
            
            // Stop if we hit a section header
            if (stopKeywords.some(kw => descLine.toLowerCase() === kw || descLine.toLowerCase() === kw + ':')) {
              break;
            }
            
            // Add description line
            if (descLine.length > 5) {
              // Remove bullet characters
              const cleanedLine = descLine.replace(/^[•·▪▫\-\*]\s*/, '');
              descriptionLines.push(cleanedLine);
            }
            
            descIndex++;
            
            // Safety: max 20 lines per job
            if (descriptionLines.length >= 20) {
              break;
            }
          }
          
          // Parse dates into structured format
          let startMonth = '', startYear = '', endMonth = '', endYear = '';
          const isCurrentJob = datesLine.toLowerCase().includes('present');
          
          if (datesLine) {
            // Try multiple date formats
            // Format: "Jan 2020 - Dec 2023" or "January 2020 - Present"
            const dateMatch1 = datesLine.match(/([A-Za-z]+)\s+(\d{4})\s*[-–]\s*([A-Za-z]+)?\s*(\d{4}|present)/i);
            // Format: "2020 - 2023"
            const dateMatch2 = datesLine.match(/(\d{4})\s*[-–]\s*(\d{4}|present)/i);
            // Format: "01/2020 - 12/2023"
            const dateMatch3 = datesLine.match(/(\d{1,2})\/(\d{4})\s*[-–]\s*(\d{1,2})?\/(\d{4}|present)/i);
            
            if (dateMatch1) {
              startMonth = dateMatch1[1];
              startYear = dateMatch1[2];
              endMonth = dateMatch1[3] || '';
              endYear = dateMatch1[4];
            } else if (dateMatch2) {
              startYear = dateMatch2[1];
              endYear = dateMatch2[2];
            } else if (dateMatch3) {
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              startMonth = monthNames[parseInt(dateMatch3[1]) - 1] || '';
              startYear = dateMatch3[2];
              if (dateMatch3[3]) {
                endMonth = monthNames[parseInt(dateMatch3[3]) - 1] || '';
              }
              endYear = dateMatch3[4];
            }
          }
          
          // Capitalize "Present" properly
          if (endYear && endYear.toLowerCase() === 'present') {
            endYear = 'Present';
          }
          
          experienceEntries.push({
            jobTitle: currentLine,
            company: companyLine,
            startMonth,
            startYear,
            endMonth,
            endYear,
            description: descriptionLines.join('\n')
          });
          
          console.log('    Description lines:', descriptionLines.length);
          console.log('✅ Added job entry');
          
          // Move to after this job's description
          currentIndex = descIndex;
          continue;
        }
      }
      
      currentIndex++;
      
      // Safety: don't process more than 150 lines
      if (currentIndex > experienceIndex + 150) {
        break;
      }
    }
    
    // Add to parsed data (format for form: jobTitle_0, company_0, etc.)
    experienceEntries.forEach((entry, index) => {
      parsed[`jobTitle_${index}`] = entry.jobTitle;
      parsed[`company_${index}`] = entry.company;
      parsed[`jobDescription_${index}`] = entry.description;
      parsed[`startMonth_${index}`] = entry.startMonth;
      parsed[`startYear_${index}`] = entry.startYear;
      parsed[`endMonth_${index}`] = entry.endMonth;
      parsed[`endYear_${index}`] = entry.endYear;
      
      console.log(`\n📋 Job ${index}:`);
      console.log(`  Title: ${entry.jobTitle}`);
      console.log(`  Company: ${entry.company}`);
      console.log(`  Period: ${entry.startMonth} ${entry.startYear} - ${entry.endMonth} ${entry.endYear}`);
      console.log(`  Description: ${entry.description.substring(0, 100)}...`);
    });
    
    console.log('\n📝 Total extracted:', experienceEntries.length, 'work experience entries');
  } else {
    console.log('⚠️ No experience section found in resume');
  }
  
  // Try to extract skills (IMPROVED)
  const skillsKeywords = ['skills', 'technical skills', 'core competencies', 'expertise', 'technologies', 'tools'];
  const skillsIndex = lines.findIndex(line => 
    skillsKeywords.some(keyword => 
      line.toLowerCase().includes(keyword) && line.length < 40
    )
  );
  
  if (skillsIndex !== -1 && skillsIndex < lines.length - 1) {
    console.log('Found skills section at line:', skillsIndex, lines[skillsIndex]);
    
    // Get lines until we hit another section
    const skillsLines = [];
    let currentIndex = skillsIndex + 1;
    const stopKeywords = ['experience', 'education', 'work history', 'employment', 'certifications', 'projects', 'summary'];
    
    while (currentIndex < lines.length) {
      const currentLine = lines[currentIndex];
      
      // Stop if we hit another section header
      if (stopKeywords.some(keyword => 
        currentLine.toLowerCase().trim() === keyword || 
        currentLine.toLowerCase().startsWith(keyword + ':')
      )) {
        break;
      }
      
      // Add the line if it has content
      if (currentLine.length > 2) {
        skillsLines.push(currentLine);
      }
      
      currentIndex++;
      
      // Safety limit: max 15 lines for skills
      if (skillsLines.length >= 15) {
        break;
      }
    }
    
    // Join with commas or keep line breaks depending on format
    const skills = skillsLines.join(', ').trim();
    console.log('Extracted skills:', skills);
    
    if (skills.length > 3) {
      parsed.skills = skills;
    }
  }
  
  console.log('Parsed resume data:', parsed);
  
  return parsed;
};
