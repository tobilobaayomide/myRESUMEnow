// APILayer Resume Parser Integration
const API_KEY = 'XpQPPggdfcg0bif0HiiOO2YUwTKakPAc';
const BASE_URL = 'https://api.apilayer.com/resume_parser/upload';

export const parseResumeFile = async (file) => {
  try {
    console.log('Starting resume parsing with APILayer...');
    alert('Starting to parse your resume...');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'apikey': API_KEY
      },
      body: formData
    });
    
    console.log('APILayer Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('APILayer Error:', errorText);
      throw new Error(`APILayer request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('APILayer Raw Response:', data);
    alert('Resume parsed successfully! Processing data...');
    
    // Transform the APILayer response to our form structure
    const transformedData = transformAPILayerResponse(data);
    console.log('Transformed data for form:', transformedData);
    
    return transformedData;
    
  } catch (error) {
    console.error('Resume parsing error:', error);
    alert(`Failed to parse resume: ${error.message}`);
    throw error;
  }
};

const transformAPILayerResponse = (apiResponse) => {
  console.log('Transforming APILayer response:', apiResponse);
  
  try {
    const transformed = {
      // Personal Information
      firstName: apiResponse.first_name || '',
      lastName: apiResponse.last_name || '',
      email: apiResponse.email || '',
      phone: apiResponse.phone || '',
      address: apiResponse.location || '',
      
      // Professional Summary
      summary: apiResponse.summary || '',
      
      // Work Experience
      workExperience: [],
      
      // Education
      education: [],
      
      // Skills
      skills: apiResponse.skills ? apiResponse.skills.join(', ') : ''
    };
    
    // Transform work experience
    if (apiResponse.experience && Array.isArray(apiResponse.experience)) {
      transformed.workExperience = apiResponse.experience.map(exp => ({
        jobTitle: exp.title || exp.position || '',
        company: exp.company || '',
        startMonth: '',
        startYear: exp.start_date ? new Date(exp.start_date).getFullYear().toString() : '',
        endMonth: '',
        endYear: exp.end_date ? new Date(exp.end_date).getFullYear().toString() : '',
        isCurrentJob: exp.is_current || false,
        responsibilities: exp.description || exp.responsibilities || ''
      }));
    }
    
    // Transform education
    if (apiResponse.education && Array.isArray(apiResponse.education)) {
      transformed.education = apiResponse.education.map(edu => ({
        degree: edu.degree || '',
        school: edu.institution || edu.school || '',
        graduationMonth: '',
        graduationYear: edu.graduation_date ? new Date(edu.graduation_date).getFullYear().toString() : ''
      }));
    }
    
    console.log('Available keys in API response:', Object.keys(apiResponse));
    console.log('Experience data:', apiResponse.experience);
    console.log('Education data:', apiResponse.education);
    console.log('Skills data:', apiResponse.skills);
    
    alert(`Transformation complete! Found: ${transformed.workExperience.length} jobs, ${transformed.education.length} education entries`);
    
    return transformed;
    
  } catch (error) {
    console.error('Error transforming API response:', error);
    alert(`Error processing parsed data: ${error.message}`);
    throw error;
  }
};
