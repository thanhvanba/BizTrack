import React from 'react';
import { 
  validateInvoiceData, 
  generateInvoiceHTML,
} from '../utils/invoiceUtils';
import { ASSETS } from '../config/companyConfig';
console.log("🚀 ~ ASSETS:", ASSETS)

const PrintInvoice = ({ visible, onClose, invoiceData, type = 'sale' }) => {
  // Component này chỉ để trigger print, không cần hiển thị UI
  React.useEffect(() => {
    if (visible && invoiceData) {
      // Validate invoice data before printing
      const validation = validateInvoiceData(invoiceData);
      if (!validation.isValid) {
        console.error('Invoice validation failed:', validation.errors);
        onClose();
        return;
      }

      // Print invoice directly
      printInvoice(invoiceData, type);
      onClose();
    }
  }, [visible, invoiceData, onClose, type]);


  const printInvoice = async (invoiceData, type) => {
    try {
      // Convert images to base64 for printing
      const logoBase64 = await convertImageToBase64(ASSETS.logo);
      console.log("🚀 ~ printInvoice ~ logoBase64:", logoBase64)
      const qrBase64 = await convertImageToBase64(ASSETS.qr);
      console.log("🚀 ~ printInvoice ~ qrBase64:", qrBase64)
      
      // Generate HTML using common utility
      const invoiceHTML = generateInvoiceHTML(invoiceData, type, logoBase64, qrBase64);
      
      // Create hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      document.body.appendChild(iframe);

      // Write HTML to iframe
      iframe.contentDocument.write(invoiceHTML);
      iframe.contentDocument.close();

      // Wait for iframe to load then print
      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();

          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        } catch (error) {
          console.error('Print error:', error);
          // Fallback: open new window if iframe doesn't work
          const printWindow = window.open('', '_blank');
          printWindow.document.write(invoiceHTML);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
          };
          document.body.removeChild(iframe);
        }
      };
    } catch (error) {
      console.error('Error preparing print:', error);
      throw error;
    }
  };

  // Helper function to convert image to base64
  const convertImageToBase64 = (imagePath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading image:', imagePath, error);
        reject(new Error(`Failed to load image: ${imagePath}`));
      };
      
      img.src = imagePath;
    });
  };

  // Không render gì cả
  return null;
};

export default PrintInvoice; 