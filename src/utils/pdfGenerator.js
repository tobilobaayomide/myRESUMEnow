import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF Generation Utilities
 * Handles conversion of HTML pages to PDF with clickable links
 */

const PDF_CONFIG = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
  format: 'a4',
  orientation: 'portrait',
  scale: 2,
  imageQuality: 0.95,
};

/**
 * Captures a page element as canvas
 */
const capturePageAsCanvas = async (pageElement) => {
  // Temporarily remove transform for accurate capture
  const originalTransform = pageElement.style.transform;
  const originalMargin = pageElement.style.margin;
  pageElement.style.transform = 'none';
  pageElement.style.margin = '0';

  try {
    const canvas = await html2canvas(pageElement, {
      scale: PDF_CONFIG.scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: pageElement.offsetWidth,
      height: pageElement.offsetHeight,
    });

    return canvas;
  } finally {
    // Restore original styles
    pageElement.style.transform = originalTransform;
    pageElement.style.margin = originalMargin;
  }
};

/**
 * Extracts link data from a page element
 */
const extractLinkData = (pageElement) => {
  const links = pageElement.querySelectorAll('a');
  const pageRect = pageElement.getBoundingClientRect();

  return Array.from(links).map(link => {
    const rect = link.getBoundingClientRect();
    return {
      x: rect.left - pageRect.left,
      y: rect.top - pageRect.top,
      width: rect.width,
      height: rect.height,
      url: link.href,
    };
  });
};

/**
 * Adds a page with image and links to PDF
 */
const addPageToPDF = (pdf, canvas, linkData, isFirstPage = false) => {
  const { width, height } = PDF_CONFIG;
  const imgData = canvas.toDataURL('image/jpeg', PDF_CONFIG.imageQuality);

  // Add new page if not the first
  if (!isFirstPage) {
    pdf.addPage();
  }

  // Add image to PDF
  pdf.addImage(imgData, 'JPEG', 0, 0, width, height);

  // Calculate scale factors for links
  const scaleX = (width / canvas.width) * PDF_CONFIG.scale;
  const scaleY = (height / canvas.height) * PDF_CONFIG.scale;

  // Add clickable links
  linkData.forEach(link => {
    const linkX = link.x * scaleX;
    const linkY = link.y * scaleY;
    const linkWidth = link.width * scaleX;
    const linkHeight = link.height * scaleY;

    pdf.link(linkX, linkY, linkWidth, linkHeight, { url: link.url });
  });

  return linkData.length;
};

/**
 * Detects device type
 */
const detectDevice = () => {
  const userAgent = navigator.userAgent;
  return {
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/i.test(userAgent),
    isMobile: /iPhone|iPad|iPod|Android/i.test(userAgent),
  };
};

/**
 * Fallback download method for browsers without Web Share API
 */
const fallbackDownload = (blob, filename) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up blob URL
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};

/**
 * Downloads PDF using Web Share API (iOS)
 */
const downloadViaWebShare = async (blob, filename) => {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  const file = new File([blob], filename, { type: 'application/pdf' });

  if (navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
        text: 'Your resume PDF',
      });
      console.log('PDF shared successfully via Web Share API');
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  }

  return false;
};

/**
 * Downloads PDF using standard download (Desktop/Android)
 */
const downloadViaBlob = (pdf, filename) => {
  const pdfBlob = pdf.output('blob');
  fallbackDownload(pdfBlob, filename);
};

/**
 * Main function to convert HTML pages to PDF
 * @param {HTMLElement} containerElement - Container with paged.js pages
 * @param {string} filename - Output PDF filename
 * @param {Function} onProgress - Optional progress callback
 */
export const generatePDFFromPages = async (containerElement, filename, onProgress) => {
  if (!containerElement) {
    throw new Error('Container element not found');
  }

  // Get all paged.js pages
  const pages = containerElement.querySelectorAll('.pagedjs_page');

  if (pages.length === 0) {
    throw new Error('No pages found in container');
  }

  console.log(`Found ${pages.length} pages to convert`);

  // Initialize PDF
  const pdf = new jsPDF(
    PDF_CONFIG.orientation,
    'mm',
    PDF_CONFIG.format
  );

  // Process each page
  for (let i = 0; i < pages.length; i++) {
    console.log(`Processing page ${i + 1}/${pages.length}`);

    if (onProgress) {
      onProgress(i + 1, pages.length);
    }

    const pageElement = pages[i];

    // Extract link data before capturing
    const linkData = extractLinkData(pageElement);

    // Capture page as canvas
    const canvas = await capturePageAsCanvas(pageElement);

    // Add page to PDF
    const linkCount = addPageToPDF(pdf, canvas, linkData, i === 0);

    console.log(`Page ${i + 1} complete with ${linkCount} links`);
  }

  return pdf;
};

/**
 * Downloads the generated PDF with device-specific handling
 * @param {jsPDF} pdf - The generated PDF object
 * @param {string} filename - Output filename
 */
export const downloadPDF = async (pdf, filename) => {
  const device = detectDevice();
  const pdfBlob = pdf.output('blob');

  if (device.isIOS) {
    // Try Web Share API first
    const shared = await downloadViaWebShare(pdfBlob, filename);
    if (!shared) {
      // Fallback to direct download
      fallbackDownload(pdfBlob, filename);
    }
  } else if (device.isAndroid) {
    // Android: use blob download
    fallbackDownload(pdfBlob, filename);
  } else {
    // Desktop: use jsPDF's save method
    pdf.save(filename);
  }
};

/**
 * Complete PDF generation and download workflow
 * @param {HTMLElement} containerElement - Container with pages
 * @param {string} resumeName - Name for the PDF file
 * @param {Function} onProgress - Optional progress callback
 */
export const generateAndDownloadPDF = async (containerElement, resumeName, onProgress) => {
  const filename = `${resumeName.replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`;

  try {
    const pdf = await generatePDFFromPages(containerElement, filename, onProgress);
    await downloadPDF(pdf, filename);
    return { success: true, filename };
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};
