import html2canvas from 'html2canvas';
// import logo from '../assets/logo-biztrack.png';
// import qrVbtt from '../assets/QR.png';

import { ASSETS } from '../config/companyConfig';
import { generateInvoiceHTML } from './invoiceUtils';

/**
 * Convert image to base64
 */
const imageToBase64 = (imagePath) => {
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
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', imagePath, error);
      reject(new Error(`Failed to load image: ${imagePath}`));
    };
    
    // Set src after setting up event handlers
    img.src = imagePath;
  });
};

/**
 * Chuyển đổi hóa đơn thành hình ảnh và copy vào clipboard
 * @param {Object} invoiceData - Dữ liệu hóa đơn
 * @param {string} type - Loại hóa đơn ('sale', 'sale_return', 'purchase', 'purchase_return')
 * @returns {Promise<boolean>} - True nếu copy thành công
 */
export const convertInvoiceToImageAndCopy = async (invoiceData, type = 'sale') => {
  try {
    console.log('🔄 Starting image conversion...');
    
    // Convert images to base64 with better error handling
    console.log('📷 Converting logo to base64...');
    const logoBase64 = await imageToBase64(ASSETS.logo);
    console.log('✅ Logo converted successfully');
    
    console.log('📷 Converting QR code to base64...');
    const qrBase64 = await imageToBase64(ASSETS.qr);
    console.log('✅ QR code converted successfully');
    
    // Tạo HTML cho hóa đơn
    console.log('📝 Generating HTML...');
    const invoiceHTML = generateInvoiceHTML(invoiceData, type, logoBase64, qrBase64);
    
    // Tạo iframe ẩn để render hóa đơn
    console.log('🖼️ Creating iframe...');
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    return new Promise((resolve, reject) => {
      let timeoutId;
      
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        try {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
      };

      iframe.onload = () => {
        console.log('📄 Iframe loaded, waiting for images...');
        
        timeoutId = setTimeout(async () => {
          try {
            console.log('🎨 Capturing canvas...');
            
            // Capture iframe content thành canvas
            const canvas = await html2canvas(iframe.contentDocument.body, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              width: 794, // A4 width in pixels at 96 DPI
              height: 1123, // A4 height in pixels at 96 DPI
              logging: false, // Disable html2canvas logging
            });

            console.log('📋 Copying to clipboard...');
            
            // Chuyển canvas thành blob
            const imageDataUrl = canvas.toDataURL('image/png', 0.9);
            
            // Copy vào clipboard
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);

            console.log('✅ Successfully copied to clipboard');
            cleanup();
            resolve(true);
          } catch (error) {
            console.error('❌ Error during capture/copy:', error);
            cleanup();
            reject(error);
          }
        }, 2000); // Giảm thời gian chờ xuống 2 giây
      };

      iframe.onerror = (error) => {
        console.error('❌ Iframe load error:', error);
        cleanup();
        reject(new Error('Failed to load iframe'));
      };

      // Ghi HTML vào iframe
      try {
        iframe.contentDocument.write(invoiceHTML);
        iframe.contentDocument.close();
      } catch (error) {
        console.error('❌ Error writing to iframe:', error);
        cleanup();
        reject(error);
      }
    });
  } catch (error) {
    console.error('❌ Error converting invoice to image:', error);
    throw error;
  }
};
