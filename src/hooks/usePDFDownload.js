import { useState } from 'react';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';

/**
 * Custom hook for handling PDF download with progress tracking
 * @returns {Object} - Download state and handler
 */
export const usePDFDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleDownload = async (containerRef, resumeName) => {
    if (!containerRef.current) {
      console.error('Preview container not found');
      throw new Error('Preview container not ready');
    }

    if (isDownloading) {
      console.warn('Download already in progress');
      return;
    }

    setIsDownloading(true);
    console.log('=== STARTING PDF DOWNLOAD ===');

    try {
      const result = await generateAndDownloadPDF(
        containerRef.current,
        resumeName,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      console.log('PDF download complete:', result.filename);
      return result;
    } catch (error) {
      console.error('PDF download failed:', error);
      
      if (error.message.includes('No pages found')) {
        alert('Please wait for the preview to load before downloading.');
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
      
      throw error;
    } finally {
      setIsDownloading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return {
    isDownloading,
    progress,
    handleDownload,
  };
};
