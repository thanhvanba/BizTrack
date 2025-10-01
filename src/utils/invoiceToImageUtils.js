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
    
    // Detect iOS and mobile devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
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
    
    if (isIOS) {
      // For iOS, use a different approach due to iframe limitations
      console.log('📱 iOS detected, using alternative method');
      return await copyImageForIOS(invoiceHTML);
    } else if (isMobile) {
      // For Android and other mobile devices, use iframe but with mobile-optimized settings
      console.log('📱 Mobile detected, using mobile-optimized method');
      return await copyImageForMobile(invoiceHTML);
    } else {
      // For desktop, use the original iframe method
      console.log('🖥️ Desktop detected, using iframe method');
      return await copyImageForDesktop(invoiceHTML);
    }
  } catch (error) {
    console.error('❌ Error converting invoice to image:', error);
    throw error;
  }
};

/**
 * Copy image for iOS devices
 */
const copyImageForIOS = async (invoiceHTML) => {
  return new Promise((resolve, reject) => {
    // Create a temporary div to render the invoice
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '794px';
    tempDiv.style.height = '1123px';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.innerHTML = invoiceHTML;
    document.body.appendChild(tempDiv);

    const cleanup = () => {
      try {
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
      } catch (e) {
        console.warn('Cleanup warning:', e);
      }
    };

    // Wait for images to load
    setTimeout(async () => {
      try {
        console.log('🎨 Capturing canvas for iOS...');
        
        const canvas = await html2canvas(tempDiv, {
          scale: 1.5, // Lower scale for mobile
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
          logging: false,
        });

        console.log('📋 Copying to clipboard for iOS...');
        
        // For iOS, try multiple methods
        const imageDataUrl = canvas.toDataURL('image/png', 0.8);
        
        try {
          // Method 1: Try modern clipboard API
          const response = await fetch(imageDataUrl);
          const blob = await response.blob();
          
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          
          console.log('✅ Successfully copied to clipboard (iOS)');
          cleanup();
          resolve(true);
        } catch (clipboardError) {
          console.warn('Modern clipboard API failed, trying fallback...', clipboardError);
          
          // Method 2: Fallback - create download link
          const link = document.createElement('a');
          link.download = 'invoice.png';
          link.href = imageDataUrl;
          link.click();
          
          console.log('📥 Image saved as download (iOS fallback)');
          cleanup();
          resolve(true);
        }
      } catch (error) {
        console.error('❌ Error during iOS capture/copy:', error);
        cleanup();
        reject(error);
      }
    }, 3000); // Longer wait for iOS
  });
};

/**
 * Copy image for mobile devices (Android, etc.)
 */
const copyImageForMobile = async (invoiceHTML) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
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
      console.log('📄 Iframe loaded for mobile, waiting for images...');
      
      timeoutId = setTimeout(async () => {
        try {
          console.log('🎨 Capturing canvas for mobile...');
          
          const canvas = await html2canvas(iframe.contentDocument.body, {
            scale: 1.5, // Lower scale for mobile
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            logging: false,
          });

          console.log('📋 Copying to clipboard for mobile...');
          
          const imageDataUrl = canvas.toDataURL('image/png', 0.8);
          
          try {
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);

            console.log('✅ Successfully copied to clipboard (mobile)');
            cleanup();
            resolve(true);
          } catch (clipboardError) {
            console.warn('Clipboard API failed, trying fallback...', clipboardError);
            
            // Fallback: create download link
            const link = document.createElement('a');
            link.download = 'invoice.png';
            link.href = imageDataUrl;
            link.click();
            
            console.log('📥 Image saved as download (mobile fallback)');
            cleanup();
            resolve(true);
          }
        } catch (error) {
          console.error('❌ Error during mobile capture/copy:', error);
          cleanup();
          reject(error);
        }
      }, 2500);
    };

    iframe.onerror = (error) => {
      console.error('❌ Iframe load error:', error);
      cleanup();
      reject(new Error('Failed to load iframe'));
    };

    try {
      iframe.contentDocument.write(invoiceHTML);
      iframe.contentDocument.close();
    } catch (error) {
      console.error('❌ Error writing to iframe:', error);
      cleanup();
      reject(error);
    }
  });
};

/**
 * Copy image for desktop devices
 */
const copyImageForDesktop = async (invoiceHTML) => {
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
      console.log('📄 Iframe loaded for desktop, waiting for images...');
      
      timeoutId = setTimeout(async () => {
        try {
          console.log('🎨 Capturing canvas for desktop...');
          
          const canvas = await html2canvas(iframe.contentDocument.body, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            logging: false,
          });

          console.log('📋 Copying to clipboard for desktop...');
          
          const imageDataUrl = canvas.toDataURL('image/png', 0.9);
          const response = await fetch(imageDataUrl);
          const blob = await response.blob();
          
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);

          console.log('✅ Successfully copied to clipboard (desktop)');
          cleanup();
          resolve(true);
        } catch (error) {
          console.error('❌ Error during desktop capture/copy:', error);
          cleanup();
          reject(error);
        }
      }, 2000);
    };

    iframe.onerror = (error) => {
      console.error('❌ Iframe load error:', error);
      cleanup();
      reject(new Error('Failed to load iframe'));
    };

    try {
      iframe.contentDocument.write(invoiceHTML);
      iframe.contentDocument.close();
    } catch (error) {
      console.error('❌ Error writing to iframe:', error);
      cleanup();
      reject(error);
    }
  });
};
