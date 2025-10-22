import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveResume, updateResume } from '../firebase/firestore';
import { ArrowRight, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import TextEditor from '../components/TextEditor';
import './FormPage.css';

const countryList = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

const FormPage = ({ onFormSubmit, existingData, resumeId }) => {
  console.log('🎯 FormPage component is rendering');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  console.log('FormPage received existingData:', existingData);
  console.log('Current user:', currentUser);
  
  // Helper function to extract work experience indices from existing data
  const getWorkExperienceIndices = (data) => {
    if (!data) return [0];
    const indices = [];
    Object.keys(data).forEach(key => {
      if (key.startsWith('jobTitle_')) {
        const index = parseInt(key.split('_')[1]);
        if (!indices.includes(index)) {
          indices.push(index);
        }
      }
    });
    return indices.length > 0 ? indices.sort((a, b) => a - b) : [0];
  };

  // Helper function to extract education indices from existing data
  const getEducationIndices = (data) => {
    if (!data) return [0];
    const indices = [];
    Object.keys(data).forEach(key => {
      if (key.startsWith('degree_')) {
        const index = parseInt(key.split('_')[1]);
        if (!indices.includes(index)) {
          indices.push(index);
        }
      }
    });
    return indices.length > 0 ? indices.sort((a, b) => a - b) : [0];
  };

  // Helper function to extract additional section indices from existing data
  const getAdditionalSectionIndices = (data) => {
    if (!data) return [];
    const indices = [];
    Object.keys(data).forEach(key => {
      if (key.startsWith('additionalSectionTitle_')) {
        const index = parseInt(key.split('_')[1]);
        if (!indices.includes(index)) {
          indices.push(index);
        }
      }
    });
    return indices.sort((a, b) => a - b);
  };

  // Helper function to extract certification indices from existing data
  const getCertificationIndices = (data) => {
    if (!data) return [];
    const indices = [];
    Object.keys(data).forEach(key => {
      if (key.startsWith('certificationName_')) {
        const index = parseInt(key.split('_')[1]);
        if (!indices.includes(index)) {
          indices.push(index);
        }
      }
    });
    return indices.sort((a, b) => a - b);
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: existingData || {}
  });
  
  // Helper function to check if currently working based on existing data
  const getInitialCurrentlyWorking = (data) => {
    if (!data) return {};
    const working = {};
    let index = 0;
    while (data[`jobTitle_${index}`]) {
      if (data[`endMonth_${index}`] === 'Present' || data[`endYear_${index}`] === 'Present') {
        working[index] = true;
      }
      index++;
    }
    return working;
  };

  // Helper function to check if currently studying based on existing data
  const getInitialCurrentlyStudying = (data) => {
    if (!data) return {};
    const studying = {};
    let index = 0;
    while (data[`degree_${index}`]) {
      if (data[`educationEndMonth_${index}`] === 'Present' || data[`educationEndYear_${index}`] === 'Present') {
        studying[index] = true;
      }
      index++;
    }
    return studying;
  };

  const [workExperiences, setWorkExperiences] = useState(getWorkExperienceIndices(existingData));
  const [educations, setEducations] = useState(getEducationIndices(existingData));
  const [certifications, setCertifications] = useState(getCertificationIndices(existingData));
  const [additionalSections, setAdditionalSections] = useState(getAdditionalSectionIndices(existingData));
  const [currentlyWorking, setCurrentlyWorking] = useState(getInitialCurrentlyWorking(existingData));
  const [currentlyStudying, setCurrentlyStudying] = useState(getInitialCurrentlyStudying(existingData));
  
  // New state for improvements
  const [formProgress, setFormProgress] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [formData, setFormData] = useState(existingData || {});

  // Reset form when existingData changes
  useEffect(() => {
    console.log('useEffect triggered with existingData:', existingData);
    if (existingData) {
      console.log('Resetting form with data:', existingData);
      reset(existingData);
      setWorkExperiences(getWorkExperienceIndices(existingData));
      setEducations(getEducationIndices(existingData));
      setCertifications(getCertificationIndices(existingData));
      setAdditionalSections(getAdditionalSectionIndices(existingData));
      setCurrentlyWorking(getInitialCurrentlyWorking(existingData));
      setCurrentlyStudying(getInitialCurrentlyStudying(existingData));
    }
  }, [existingData, reset]);

  // Auto-save functionality (#1) - only for signed-in users
  useEffect(() => {
    if (!currentUser) return;
    const saveToLocalStorage = () => {
      try {
        localStorage.setItem('resumeFormData', JSON.stringify(formData));
        setAutoSaveStatus('Saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        saveToLocalStorage();
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [formData, currentUser]);

  // Load saved data on mount, but only for signed-in users
  useEffect(() => {
    if (!currentUser) {
      // If not signed in, clear any local saved data
      localStorage.removeItem('resumeFormData');
      reset({});
      setFormData({});
      setWorkExperiences([0]);
      setEducations([0]);
      setCertifications([]);
      setAdditionalSections([]);
      return;
    }
    try {
      const saved = localStorage.getItem('resumeFormData');
      if (saved && !existingData) {
        const parsedData = JSON.parse(saved);
        reset(parsedData);
        setFormData(parsedData);
        setWorkExperiences(getWorkExperienceIndices(parsedData));
        setEducations(getEducationIndices(parsedData));
        setCertifications(getCertificationIndices(parsedData));
        setAdditionalSections(getAdditionalSectionIndices(parsedData));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, [currentUser]);

  // Calculate form progress (#4)
  useEffect(() => {
    const calculateProgress = () => {
      const requiredFields = [
        'fullName', 'title', 'email', 'phone', 'location', 'summary', 'skills'
      ];
      
      let filledCount = 0;
      let totalCount = requiredFields.length;
      
      // Check required fields
      requiredFields.forEach(field => {
        if (formData[field] && formData[field].trim() !== '') {
          filledCount++;
        }
      });
      
      // Check work experience (at least one)
      const hasWorkExp = workExperiences.some(exp => 
        formData[`jobTitle_${exp}`] && formData[`company_${exp}`]
      );
      if (hasWorkExp) filledCount++;
      totalCount++;
      
      // Check education (at least one)
      const hasEducation = educations.some(edu => 
        formData[`degree_${edu}`] && formData[`institution_${edu}`]
      );
      if (hasEducation) filledCount++;
      totalCount++;
      
      const progress = Math.round((filledCount / totalCount) * 100);
      setFormProgress(progress);
    };
    
    calculateProgress();
  }, [formData, workExperiences, educations]);

  // Watch form changes for auto-save
  useEffect(() => {
    const subscription = {
      subscribe: (callback) => {
        const form = document.querySelector('form');
        if (form) {
          const handleChange = (e) => {
            const formElements = new FormData(form);
            const data = {};
            for (let [key, value] of formElements.entries()) {
              data[key] = value;
            }
            setFormData(data);
          };
          
          form.addEventListener('input', handleChange);
          form.addEventListener('change', handleChange);
          
          return () => {
            form.removeEventListener('input', handleChange);
            form.removeEventListener('change', handleChange);
          };
        }
      }
    };
    
    return subscription.subscribe();
  }, []);

  // Generate arrays for dropdowns
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const certificationYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const addWorkExperience = () => {
    const newIndex = Math.max(...workExperiences) + 1;
    setWorkExperiences([...workExperiences, newIndex]);
  };

  const removeWorkExperience = (index) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    }
  };

  const addEducation = () => {
    const newIndex = Math.max(...educations) + 1;
    setEducations([...educations, newIndex]);
  };

  const removeEducation = (index) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  };

  const addCertification = () => {
    const newIndex = certifications.length > 0 ? Math.max(...certifications) + 1 : 0;
    setCertifications([...certifications, newIndex]);
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addAdditionalSection = () => {
    const newIndex = additionalSections.length > 0 ? Math.max(...additionalSections) + 1 : 0;
    setAdditionalSections([...additionalSections, newIndex]);
  };

  const removeAdditionalSection = (index) => {
    setAdditionalSections(additionalSections.filter((_, i) => i !== index));
  };

  const addSectionTemplate = (templateType) => {
    const newIndex = additionalSections.length > 0 ? Math.max(...additionalSections) + 1 : 0;
    setAdditionalSections([...additionalSections, newIndex]);
    
    // Set the section type based on template
    setTimeout(() => {
      const form = document.querySelector('form');
      const typeSelect = form.querySelector(`select[name="additionalSectionType_${newIndex}"]`);
      if (typeSelect) {
        const typeMap = {
          'Awards & Achievements': 'awards',
          'Languages': 'languages',
          'Projects': 'projects',
          'Volunteer Experience': 'volunteer',
          'Publications': 'publications',
          'Professional Associations': 'associations'
        };
        typeSelect.value = typeMap[templateType] || 'custom';
        // Use setValue to register with react-hook-form
        setValue(`additionalSectionType_${newIndex}`, typeMap[templateType] || 'custom');
        // Trigger change event to auto-populate title
        typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 100);
  };

  const moveSectionUp = (index) => {
    if (index > 0) {
      const newSections = [...additionalSections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      setAdditionalSections(newSections);
    }
  };

  const moveSectionDown = (index) => {
    if (index < additionalSections.length - 1) {
      const newSections = [...additionalSections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setAdditionalSections(newSections);
    }
  };

  const handleSectionTypeChange = (sectionIndex, sectionType) => {
    // Map section types to their display titles
    const sectionTitles = {
      'awards': 'Awards & Achievements',
      'languages': 'Languages',
      'projects': 'Projects',
      'volunteer': 'Volunteer Experience',
      'publications': 'Publications',
      'associations': 'Professional Associations',
      'hobbies': 'Hobbies & Interests',
      'custom': '' // Empty for custom, user will enter their own
    };

    // Auto-populate the section title based on type (except for custom)
    if (sectionType !== 'custom' && sectionType !== '') {
      setTimeout(() => {
        const form = document.querySelector('form');
        const titleInput = form.querySelector(`input[name="additionalSectionTitle_${sectionIndex}"]`);
        if (titleInput) {
          titleInput.value = sectionTitles[sectionType] || '';
          // Use setValue to register with react-hook-form
          setValue(`additionalSectionTitle_${sectionIndex}`, sectionTitles[sectionType] || '');
          // Trigger the react-hook-form update
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, 100);
    }
    
    // Force a re-render by updating component state
    setAdditionalSections([...additionalSections]);
  };

  const renderSectionFields = (sectionIndex) => {
    const sectionType = document.querySelector(`select[name="additionalSectionType_${sectionIndex}"]`)?.value || 'custom';
    
    switch (sectionType) {
      case 'languages':
        return (
          <div className="section-specific-fields">
            <div className="form-group">
              <label>Languages (one per line with proficiency)</label>
              <textarea
                {...register(`additionalSectionContent_${sectionIndex}`, { required: 'Languages are required' })}
                placeholder="ENGLISH - NATIVE&#10;SPANISH - FLUENT&#10;FRENCH - INTERMEDIATE&#10;GERMAN - BASIC"
                rows="4"
              />
              {errors[`additionalSectionContent_${sectionIndex}`] && (
                <span className="error">{errors[`additionalSectionContent_${sectionIndex}`].message}</span>
              )}
              <small className="form-hint">Format: Language - Proficiency Level</small>
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div className="section-specific-fields">
            <div className="projects-container">
              <h4>Projects</h4>
              <div className="project-item">
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    {...register(`projectName_${sectionIndex}_0`)}
                    placeholder="E-COMMERCE WEBSITE"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    {...register(`projectDescription_${sectionIndex}_0`)}
                    placeholder="BUILT A FULL-STACK E-COMMERCE PLATFORM WITH USER AUTHENTICATION, PAYMENT PROCESSING, AND INVENTORY MANAGEMENT"
                    rows="2"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tech Stack</label>
                  <input
                    type="text"
                    {...register(`projectStack_${sectionIndex}_0`)}
                    placeholder="REACT, NODE.JS, MONGODB, EXPRESS, STRIPE API"
                  />
                </div>
                
                <div className="form-group">
                  <label>Project URL (Optional)</label>
                  <input
                    type="url"
                    {...register(`projectUrl_${sectionIndex}_0`)}
                    placeholder="HTTPS://GITHUB.COM/USERNAME/PROJECT OR HTTPS://PROJECT-DEMO.COM"
                  />
                </div>
              </div>
            </div>
            <small className="form-hint">Add multiple projects by separating them with line breaks in a single section, or create multiple project sections</small>
          </div>
        );
      
      case 'awards':
        return (
          <div className="section-specific-fields">
            <div className="form-group">
              <label>Awards & Achievements</label>
              <textarea
                {...register(`additionalSectionContent_${sectionIndex}`, { required: 'Awards are required' })}
                placeholder="EMPLOYEE OF THE YEAR 2023 - ABC COMPANY&#10;DEAN'S LIST - UNIVERSITY NAME (2022)&#10;BEST INNOVATION AWARD - TECH CONFERENCE 2021"
                rows="4"
              />
              {errors[`additionalSectionContent_${sectionIndex}`] && (
                <span className="error">{errors[`additionalSectionContent_${sectionIndex}`].message}</span>
              )}
              <small className="form-hint">List each award with year and organization</small>
            </div>
          </div>
        );
      
      case 'volunteer':
        return (
          <div className="section-specific-fields">
            <div className="volunteer-container">
              <h4>Volunteer Experience</h4>
              <div className="volunteer-item">
                <div className="form-group">
                  <label>Organization Name</label>
                  <input
                    type="text"
                    {...register(`volunteerOrg_${sectionIndex}`, { required: 'Organization name is required' })}
                    placeholder="COMMUNITY FOOD BANK"
                  />
                  {errors[`volunteerOrg_${sectionIndex}`] && (
                    <span className="error">{errors[`volunteerOrg_${sectionIndex}`].message}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Year (Optional)</label>
                  <select
                    {...register(`volunteerYear_${sectionIndex}`)}
                    className="date-select"
                  >
                    <option value="">Select Year</option>
                    {certificationYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <small className="form-hint">Select a year or leave blank</small>
                </div>
                
              </div>
            </div>
            <small className="form-hint">Add multiple volunteer experiences by creating multiple volunteer sections</small>
          </div>
        );
      
      case 'publications':
        return (
          <div className="section-specific-fields">
            <div className="form-group">
              <label>Publication Title</label>
              <textarea
                {...register(`additionalSectionContent_${sectionIndex}`, { required: 'Publications are required' })}
                placeholder="RESEARCH PAPER TITLE - JOURNAL NAME&#10;CONFERENCE PRESENTATION: TOPIC TITLE - CONFERENCE NAME&#10;BLOG POST: ARTICLE TITLE - PUBLICATION PLATFORM"
                rows="4"
              />
              {errors[`additionalSectionContent_${sectionIndex}`] && (
                <span className="error">{errors[`additionalSectionContent_${sectionIndex}`].message}</span>
              )}
              <small className="form-hint">Include title and publication venue. Year is selected below.</small>
            </div>
            <div className="form-group">
              <label>Year (Optional)</label>
              <select
                {...register(`publicationYear_${sectionIndex}`)}
                className="date-select"
              >
                <option value="">Select Year</option>
                {certificationYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <small className="form-hint">Select a year or leave blank</small>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="form-group">
            <label>Section Content</label>
            <textarea
              {...register(`additionalSectionContent_${sectionIndex}`, { required: 'Section content is required' })}
              placeholder="ENTER THE CONTENT FOR THIS SECTION. YOU CAN USE BULLET POINTS OR PARAGRAPHS..."
              rows="4"
            />
            {errors[`additionalSectionContent_${sectionIndex}`] && (
              <span className="error">{errors[`additionalSectionContent_${sectionIndex}`].message}</span>
            )}
          </div>
        );
    }
  };

  const onSubmit = (data) => {
    console.log('Form onSubmit - raw data:', data);
    
    // Clean the data to only include current indices
    const cleanedData = {};
    
    // Copy basic fields
    Object.keys(data).forEach(key => {
      // Skip indexed fields, we'll add them back selectively
      if (!key.match(/_([\d]+)$/)) {
        cleanedData[key] = data[key];
      }
    });
    
    // Add only current work experiences
    workExperiences.forEach((expIndex, arrayIndex) => {
      const prefix = `jobTitle_${expIndex}`;
      if (data[`jobTitle_${expIndex}`]) {
        // Re-index to sequential numbers
        cleanedData[`jobTitle_${arrayIndex}`] = data[`jobTitle_${expIndex}`];
        cleanedData[`company_${arrayIndex}`] = data[`company_${expIndex}`];
        cleanedData[`startMonth_${arrayIndex}`] = data[`startMonth_${expIndex}`];
        cleanedData[`startYear_${arrayIndex}`] = data[`startYear_${expIndex}`];
        cleanedData[`endMonth_${arrayIndex}`] = data[`endMonth_${expIndex}`];
        cleanedData[`endYear_${arrayIndex}`] = data[`endYear_${expIndex}`];
        cleanedData[`jobDescription_${arrayIndex}`] = data[`jobDescription_${expIndex}`];
      }
    });
    
    // Add only current educations
    educations.forEach((eduIndex, arrayIndex) => {
      if (data[`degree_${eduIndex}`]) {
        cleanedData[`degree_${arrayIndex}`] = data[`degree_${eduIndex}`];
        cleanedData[`course_${arrayIndex}`] = data[`course_${eduIndex}`];
        cleanedData[`institution_${arrayIndex}`] = data[`institution_${eduIndex}`];
        cleanedData[`educationCountry_${arrayIndex}`] = data[`educationCountry_${eduIndex}`];
        cleanedData[`educationCity_${arrayIndex}`] = data[`educationCity_${eduIndex}`];
        cleanedData[`educationStartMonth_${arrayIndex}`] = data[`educationStartMonth_${eduIndex}`];
        cleanedData[`educationStartYear_${arrayIndex}`] = data[`educationStartYear_${eduIndex}`];
        cleanedData[`educationEndMonth_${arrayIndex}`] = data[`educationEndMonth_${eduIndex}`];
        cleanedData[`educationEndYear_${arrayIndex}`] = data[`educationEndYear_${eduIndex}`];
      }
    });
    
    // Add only current certifications
    certifications.forEach((certIndex, arrayIndex) => {
      if (data[`certificationName_${certIndex}`]) {
        cleanedData[`certificationName_${arrayIndex}`] = data[`certificationName_${certIndex}`];
        cleanedData[`certificationYear_${arrayIndex}`] = data[`certificationYear_${certIndex}`];
      }
    });
    
    // Add only current additional sections
    additionalSections.forEach((secIndex, arrayIndex) => {
      if (data[`additionalSectionTitle_${secIndex}`] || data[`additionalSectionType_${secIndex}`]) {
        cleanedData[`additionalSectionType_${arrayIndex}`] = data[`additionalSectionType_${secIndex}`];
        cleanedData[`additionalSectionTitle_${arrayIndex}`] = data[`additionalSectionTitle_${secIndex}`];
        cleanedData[`additionalSectionContent_${arrayIndex}`] = data[`additionalSectionContent_${secIndex}`];
        // Handle project data if it exists
        if (data[`projectName_${secIndex}_0`]) {
          cleanedData[`projectName_${arrayIndex}_0`] = data[`projectName_${secIndex}_0`];
          cleanedData[`projectDescription_${arrayIndex}_0`] = data[`projectDescription_${secIndex}_0`];
          cleanedData[`projectStack_${arrayIndex}_0`] = data[`projectStack_${secIndex}_0`];
          cleanedData[`projectUrl_${arrayIndex}_0`] = data[`projectUrl_${secIndex}_0`];
        }
        // Handle volunteer data if it exists
        if (data[`volunteerOrg_${secIndex}`]) {
          cleanedData[`volunteerOrg_${arrayIndex}`] = data[`volunteerOrg_${secIndex}`];
          cleanedData[`volunteerYear_${arrayIndex}`] = data[`volunteerYear_${secIndex}`];
          cleanedData[`volunteerDescription_${arrayIndex}`] = data[`volunteerDescription_${secIndex}`];
        }
        // Handle publication year if it exists
        if (data[`publicationYear_${secIndex}`]) {
          cleanedData[`publicationYear_${arrayIndex}`] = data[`publicationYear_${secIndex}`];
        }
      }
    });
    
    console.log('Form onSubmit - cleaned data:', cleanedData);
    
    // Clean undefined and non-serializable values for Firestore
    const safeData = {};
    Object.entries(cleanedData).forEach(([key, value]) => {
      if (value === undefined) {
        safeData[key] = null;
      } else if (typeof value === 'function') {
        // skip functions
      } else {
        safeData[key] = value;
      }
    });

    // Always update existing resume if resumeId is present and user is authenticated
    if (currentUser) {
      const resumeName = safeData.fullName 
        ? `${safeData.fullName}'s Resume` 
        : 'My Resume';
      if (resumeId) {
        // Always update existing resume (never create new)
        updateResume(currentUser.uid, resumeId, safeData, resumeName)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating resume in Firestore:', error);
              alert('Failed to update resume in cloud. Your resume will be stored locally.');
            } else {
              console.log('Resume updated in Firestore:', resumeId);
            }
          });
      } else {
        // Create new resume only if not editing
        saveResume(currentUser.uid, safeData, resumeName)
          .then(({ resumeId: newResumeId, error }) => {
            if (error) {
              console.error('Error saving resume to Firestore:', error);
              alert('Failed to save resume to cloud. Your resume will be stored locally.');
            } else {
              console.log('Resume saved to Firestore:', newResumeId);
            }
          });
      }
    }
    
    onFormSubmit(cleanedData);
    navigate('/preview');
  };

  return (
    <div className="form-page">
      {!currentUser && (
        <div className="guest-warning" style={{background:'#fffbe6',border:'1px solid #ffe58f',padding:'1rem',marginBottom:'1rem',borderRadius:'6px',color:'#ad6800',fontWeight:'bold',textAlign:'center'}}>
          You are creating a resume as a guest. <br />
          <span style={{fontWeight:'normal'}}>Sign in to save your resume and access it later. Guest users cannot save data to the cloud.</span>
        </div>
      )}
      {/* Progress Bar */}
      <div className="form-progress">
        <div className="form-progress-bar" style={{ width: `${formProgress}%` }}></div>
      </div>
      
      <div className="form-container">
        <div className="form-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>Tell Us About Yourself</h1>
          <p>Fill in your details to create your professional resume</p>
          
          {/* Progress and Auto-save indicators */}
          <div className="header-indicators">
            <div className="progress-indicator">
              <div className="progress-circle" style={{ 
                background: `conic-gradient(#16a34a ${formProgress * 3.6}deg, #e5e7eb ${formProgress * 3.6}deg)` 
              }}>
                <div className="progress-circle-inner">
                  <span className="progress-percent">{formProgress}%</span>
                </div>
              </div>
              <span className="progress-label">Complete</span>
            </div>
            
            {autoSaveStatus && (
              <div className="autosave-indicator">
                <CheckCircle size={16} />
                <span>{autoSaveStatus}</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="resume-form">
          {/* Personal Information */}
          <div className="form-section">
            <h2><User size={20} /> Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  placeholder="YOUR FULL NAME"
                />
                {errors.fullName && <span className="error">{errors.fullName.message}</span>}
              </div>

              <div className="form-group">
                <label>Professional Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Professional title is required' })}
                  placeholder="YOUR PROFESSIONAL TITLE"
                />
                {errors.title && <span className="error">{errors.title.message}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-with-validation">
                  <input
                    type="email"
                    className={errors.email ? 'input-error' : (formData.email?.trim() ? 'input-valid' : '')}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    placeholder="YOUR EMAIL ADDRESS"
                  />
                  {!errors.email && formData.email?.trim() && (
                    <CheckCircle className="field-valid-icon" size={18} />
                  )}
                  {errors.email && (
                    <AlertCircle className="field-error-icon" size={18} />
                  )}
                </div>
                {errors.email && (
                  <span className="error">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone number is required' })}
                  placeholder="YOUR PHONE NUMBER"
                />
                {errors.phone && <span className="error">{errors.phone.message}</span>}
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  {...register('location', { required: 'Location is required' })}
                  placeholder="YOUR LOCATION"
                />
                {errors.location && <span className="error">{errors.location.message}</span>}
              </div>

              <div className="form-group">
                <label>LinkedIn Profile</label>
                <input
                  type="url"
                  {...register('linkedin', )}
                  placeholder="YOUR LINKEDIN URL"
                />
              </div>

              <div className="form-group">
                <label>Portfolio Website</label>
                <input
                  type="url"
                  {...register('portfolio', )}
                  placeholder="YOUR PORTFOLIO URL"
                />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input
                  type="url"
                  {...register('github')}
                  placeholder="YOUR GITHUB PROFILE URL"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="form-section">
            <h2><Briefcase size={20} /> Professional Summary</h2>
            <div className="form-group">
              <label>About You</label>
              <TextEditor
                value={formData.summary || ''}
                onChange={value => {
                  setValue('summary', value);
                  setFormData(prev => ({ ...prev, summary: value }));
                }}
                placeholder="BRIEF DESCRIPTION OF YOUR PROFESSIONAL BACKGROUND, SKILLS, AND CAREER OBJECTIVES..."
                placeholderStyle={{ fontSize: '0.8em' }}
              />
              {errors.summary && <span className="error">{errors.summary.message}</span>}
            </div>
          </div>

          {/* Work Experience */}
          <div className="form-section">
            <h2><Briefcase size={20} /> Work Experience</h2>
            
            {workExperiences.map((expIndex, index) => (
              <div key={expIndex} className="work-experience-item">
                {workExperiences.length > 1 && (
                  <div className="experience-header">
                    <h3>Work Experience {index + 1}</h3>
                    <button 
                      type="button" 
                      className="remove-experience-btn"
                      onClick={() => removeWorkExperience(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      {...register(`jobTitle_${expIndex}`, { required: 'Job title is required' })}
                      placeholder="YOUR JOB TITLE"
                    />
                    {errors[`jobTitle_${expIndex}`] && <span className="error">{errors[`jobTitle_${expIndex}`].message}</span>}
                  </div>

                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      {...register(`company_${expIndex}`, { required: 'Company is required' })}
                      placeholder="YOUR COMPANY NAME"
                    />
                    {errors[`company_${expIndex}`] && <span className="error">{errors[`company_${expIndex}`].message}</span>}
                  </div>

                  <div className="form-group">
                    <label>Start Date</label>
                    <div className="date-dropdown-container">
                      <select
                        {...register(`startMonth_${expIndex}`, { required: 'Start month is required' })}
                        className="date-select"
                      >
                        <option value="">Month</option>
                        {months.map((month, monthIndex) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        {...register(`startYear_${expIndex}`, { required: 'Start year is required' })}
                        className="date-select"
                      >
                        <option value="">Year</option>
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(errors[`startMonth_${expIndex}`] || errors[`startYear_${expIndex}`]) && (
                      <span className="error">
                        {errors[`startMonth_${expIndex}`]?.message || errors[`startYear_${expIndex}`]?.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <div className="date-dropdown-container">
                      <select
                        {...register(`endMonth_${expIndex}`)}
                        className="date-select"
                        disabled={currentlyWorking[expIndex]}
                      >
                        <option value="">Month</option>
                        <option value="Present">Present</option>
                        {months.map((month, monthIndex) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        {...register(`endYear_${expIndex}`)}
                        className="date-select"
                        disabled={currentlyWorking[expIndex]}
                      >
                        <option value="">Year</option>
                        <option value="Present">Present</option>
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentlyWorking[expIndex] || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setCurrentlyWorking(prev => ({ ...prev, [expIndex]: isChecked }));
                            if (isChecked) {
                              // Set both endMonth and endYear to 'Present' using setValue
                              setValue(`endMonth_${expIndex}`, 'Present');
                              setValue(`endYear_${expIndex}`, 'Present');
                            } else {
                              // Clear the values when unchecked
                              setValue(`endMonth_${expIndex}`, '');
                              setValue(`endYear_${expIndex}`, '');
                            }
                          }}
                          style={{ width: 'auto', cursor: 'pointer' }}
                        />
                        <span>I currently work here</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Job Description</label>
                  <TextEditor
                    value={formData[`jobDescription_${expIndex}`] || ''}
                    onChange={value => {
                      setValue(`jobDescription_${expIndex}`, value);
                      setFormData(prev => ({ ...prev, [`jobDescription_${expIndex}`]: value }));
                    }}
                    placeholder="YOUR KEY RESPONSIBILITIES AND ACHIEVEMENTS IN THIS ROLE..."
                    placeholderStyle={{ fontSize: '0.8em' }}
                  />
                  {errors[`jobDescription_${expIndex}`] && <span className="error">{errors[`jobDescription_${expIndex}`].message}</span>}
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-experience-btn"
              onClick={addWorkExperience}
            >
              <Plus size={16} />
              Add More Work Experience
            </button>
          </div>

          {/* Education */}
          <div className="form-section">
            <h2><GraduationCap size={20} /> Education</h2>
            
            {educations.map((eduIndex, index) => (
              <div key={eduIndex} className="education-item">
                {educations.length > 1 && (
                  <div className="education-header">
                    <h3>Education {index + 1}</h3>
                    <button 
                      type="button" 
                      className="remove-education-btn"
                      onClick={() => removeEducation(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      {...register(`degree_${eduIndex}`, { required: 'Degree is required' })}
                      placeholder="YOUR DEGREE (E.G. BACHELOR OF SCIENCE/ARTS/ENGINEERING)"
                    />
                    {errors[`degree_${eduIndex}`] && <span className="error">{errors[`degree_${eduIndex}`].message}</span>}
                  </div>

                  <div className="form-group">
                    <label>Course/Major</label>
                    <input
                      type="text"
                      {...register(`course_${eduIndex}`, { required: 'Course is required' })}
                      placeholder="YOUR COURSE OR MAJOR (E.G. COMPUTER SCIENCE, BUSINESS ADMINISTRATION)"
                    />
                    {errors[`course_${eduIndex}`] && <span className="error">{errors[`course_${eduIndex}`].message}</span>}
                  </div>

                  <div className="form-group">
                    <label>Institution</label>
                    <input
                      type="text"
                      {...register(`institution_${eduIndex}`, { required: 'Institution is required' })}
                      placeholder="YOUR INSTITUTION NAME"
                    />
                    {errors[`institution_${eduIndex}`] && <span className="error">{errors[`institution_${eduIndex}`].message}</span>}
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        {...register(`educationCity_${eduIndex}`, { required: 'City is required' })}
                        placeholder="ENTER CITY"
                        style={{ minWidth: '120px' }}
                      />
                      <select
                        {...register(`educationCountry_${eduIndex}`, { required: 'Country is required' })}
                        className="date-select"
                        style={{ minWidth: '120px' }}
                      >
                        <option value="">Select Country</option>
                        {countryList.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    {errors[`educationCity_${eduIndex}`] && <span className="error">{errors[`educationCity_${eduIndex}`].message}</span>}
                    {errors[`educationCountry_${eduIndex}`] && <span className="error">{errors[`educationCountry_${eduIndex}`].message}</span>}
                  </div>

                  <div className="form-group">
                    <label>Start Date</label>
                    <div className="date-dropdown-container">
                      <select
                        {...register(`educationStartMonth_${eduIndex}`, { required: 'Start month is required' })}
                        className="date-select"
                      >
                        <option value="">Month</option>
                        {months.map((month, monthIndex) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        {...register(`educationStartYear_${eduIndex}`, { required: 'Start year is required' })}
                        className="date-select"
                      >
                        <option value="">Year</option>
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(errors[`educationStartMonth_${eduIndex}`] || errors[`educationStartYear_${eduIndex}`]) && (
                      <span className="error">
                        {errors[`educationStartMonth_${eduIndex}`]?.message || errors[`educationStartYear_${eduIndex}`]?.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <div className="date-dropdown-container">
                      <select
                        {...register(`educationEndMonth_${eduIndex}`, { required: 'End month is required' })}
                        className="date-select"
                        disabled={currentlyStudying[eduIndex]}
                      >
                        <option value="">Month</option>
                        <option value="Present">Present</option>
                        {months.map((month, monthIndex) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        {...register(`educationEndYear_${eduIndex}`, { required: 'End year is required' })}
                        className="date-select"
                        disabled={currentlyStudying[eduIndex]}
                      >
                        <option value="">Year</option>
                        <option value="Present">Present</option>
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentlyStudying[eduIndex] || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setCurrentlyStudying(prev => ({ ...prev, [eduIndex]: isChecked }));
                            if (isChecked) {
                              // Set both educationEndMonth and educationEndYear to 'Present' using setValue
                              setValue(`educationEndMonth_${eduIndex}`, 'Present');
                              setValue(`educationEndYear_${eduIndex}`, 'Present');
                            } else {
                              // Clear the values when unchecked
                              setValue(`educationEndMonth_${eduIndex}`, '');
                              setValue(`educationEndYear_${eduIndex}`, '');
                            }
                          }}
                          style={{ width: 'auto', cursor: 'pointer' }}
                        />
                        <span>I currently study here</span>
                      </label>
                    </div>
                    {(errors[`educationEndMonth_${eduIndex}`] || errors[`educationEndYear_${eduIndex}`]) && (
                      <span className="error">
                        {errors[`educationEndMonth_${eduIndex}`]?.message || errors[`educationEndYear_${eduIndex}`]?.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-education-btn"
              onClick={addEducation}
            >
              <Plus size={16} />
              Add More Education
            </button>
          </div>

          {/* Skills */}
          <div className="form-section">
            <h2><Award size={20} /> Skills</h2>
            <div className="form-group">
              <label>Technical Skills</label>
              <TextEditor
                value={formData.skills || ''}
                onChange={(value) => {
                  setValue('skills', value);
                  setFormData(prev => ({ ...prev, skills: value }));
                }}
                placeholder="JavaScript, React, Node.js, Python, SQL, Git, AWS..."
              />
              {errors.skills && <span className="error">{errors.skills.message}</span>}
            </div>
          </div>

          {/* Certifications */}
          <div className="form-section">
            <h2><Award size={20} /> Certifications</h2>
            
            {certifications.map((certIndex, index) => (
              <div key={certIndex} className="certification-item">
                <div className="section-header">
                  <h3>Certification {index + 1}</h3>
                  {certifications.length > 0 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeCertification(index)}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Certification Name</label>
                    <input
                      type="text"
                      {...register(`certificationName_${certIndex}`, { required: 'Certification name is required' })}
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                    {errors[`certificationName_${certIndex}`] && (
                      <span className="error">{errors[`certificationName_${certIndex}`].message}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Year Obtained</label>
                    <select
                      {...register(`certificationYear_${certIndex}`, { required: 'Year is required' })}
                      className="date-select"
                    >
                      <option value="">Select Year</option>
                      {certificationYears.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    {errors[`certificationYear_${certIndex}`] && (
                      <span className="error">{errors[`certificationYear_${certIndex}`].message}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-certification-btn"
              onClick={addCertification}
            >
              <Plus size={16} />
              Add Certification
            </button>
          </div>

          {/* Additional Sections */}
          <div className="form-section">
            <h2><Plus size={20} /> Additional Sections</h2>
            <p className="section-description">
              Add custom sections to showcase your achievements, projects, languages, and more.
            </p>
            
            {/* Pre-defined Section Templates */}
            <div className="section-templates">
              <h3>Quick Add Templates:</h3>
              <div className="template-buttons">
                <button type="button" className="template-btn" onClick={() => addSectionTemplate('Awards & Achievements')}>
                  Awards
                </button>
                <button type="button" className="template-btn" onClick={() => addSectionTemplate('Languages')}>
                  Languages
                </button>
                <button type="button" className="template-btn" onClick={() => addSectionTemplate('Projects')}>
                  Projects
                </button>
                <button type="button" className="template-btn" onClick={() => addSectionTemplate('Volunteer Experience')}>
                  Volunteering
                </button>
                <button type="button" className="template-btn" onClick={() => addSectionTemplate('Publications')}>
                  Publications
                </button>
                <button type="button" className="template-btn" onClick={() => addSectionTemplate('Professional Associations')}>
                  Associations
                </button>
              </div>
            </div>
            
            {additionalSections.map((sectionIndex, index) => (
              <div key={sectionIndex} className="additional-section-item">
                <div className="section-header">
                  <h3>Section {index + 1}</h3>
                  <div className="section-controls">
                    {index > 0 && (
                      <button
                        type="button"
                        className="move-btn"
                        onClick={() => moveSectionUp(index)}
                        title="Move Up"
                      >
                        ↑
                      </button>
                    )}
                    {index < additionalSections.length - 1 && (
                      <button
                        type="button"
                        className="move-btn"
                        onClick={() => moveSectionDown(index)}
                        title="Move Down"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeAdditionalSection(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Section Type</label>
                  <select
                    {...register(`additionalSectionType_${sectionIndex}`, { 
                      required: 'Section type is required',
                      onChange: (e) => handleSectionTypeChange(sectionIndex, e.target.value)
                    })}
                    className="section-type-select"
                    onChange={(e) => handleSectionTypeChange(sectionIndex, e.target.value)}
                  >
                    <option value="">Select Section Type</option>
                    <option value="awards">Awards & Achievements</option>
                    <option value="languages">Languages</option>
                    <option value="projects">Projects</option>
                    <option value="volunteer">Volunteer Experience</option>
                    <option value="publications">Publications</option>
                    <option value="associations">Professional Associations</option>
                    <option value="hobbies">Hobbies & Interests</option>
                    <option value="custom">Custom Section</option>
                  </select>
                  {errors[`additionalSectionType_${sectionIndex}`] && (
                    <span className="error">{errors[`additionalSectionType_${sectionIndex}`].message}</span>
                  )}
                </div>

                {/* Only show custom title input if custom section is selected */}
                {document.querySelector(`select[name="additionalSectionType_${sectionIndex}"]`)?.value === 'custom' && (
                  <div className="form-group">
                    <label>Custom Section Title</label>
                    <input
                      type="text"
                      {...register(`additionalSectionTitle_${sectionIndex}`, { required: 'Section title is required' })}
                      placeholder="Enter custom section title..."
                    />
                    {errors[`additionalSectionTitle_${sectionIndex}`] && (
                      <span className="error">{errors[`additionalSectionTitle_${sectionIndex}`].message}</span>
                    )}
                  </div>
                )}

                {renderSectionFields(sectionIndex)}
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-section-btn"
              onClick={addAdditionalSection}
            >
              <Plus size={16} />
              Add Custom Section
            </button>
          </div>

          <button type="submit" className="submit-button">
            Create My Resume
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormPage;