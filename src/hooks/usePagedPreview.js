import { useState, useEffect, useRef } from 'react';
import { Previewer } from 'pagedjs';

/**
 * Custom hook for managing Paged.js preview rendering
 * @param {Object} resumeData - Resume data to render
 * @returns {Object} - Preview state and refs
 */
export const usePagedPreview = (resumeData) => {
  const documentRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const renderPreview = async () => {
      console.log('Starting Paged.js rendering');
      
      if (!documentRef.current || !previewContainerRef.current) {
        console.error('Required refs not available');
        return;
      }

      // Clear any existing preview
      previewContainerRef.current.innerHTML = '';
      setIsRendered(false);

      try {
        const paged = new Previewer();
        
        await paged.preview(
          documentRef.current.innerHTML,
          ['/preview-styles.css'],
          previewContainerRef.current
        );

        setIsRendered(true);
        console.log('Preview rendering complete');
      } catch (error) {
        console.error('Paged.js rendering error:', error);
      }
    };

    // Render when component mounts or resumeData changes
    if (resumeData) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(renderPreview, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [resumeData]);

  return {
    documentRef,
    previewContainerRef,
    isRendered,
  };
};
