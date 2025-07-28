/**
 * Utility functions for printing functionality
 */

/**
 * Format currency to Vietnamese format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

/**
 * Convert number to Vietnamese words
 * @param {number} num - Number to convert
 * @returns {string} Vietnamese words representation
 */
export const numberToWords = (num) => {
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  const scales = ['', 'nghìn', 'triệu', 'tỷ'];

  if (num === 0) return 'không';

  const convertGroup = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return 'mười ' + ones[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' trăm ' + convertGroup(n % 100);
  };

  let result = '';
  let scaleIndex = 0;
  
  while (num > 0) {
    const group = num % 1000;
    if (group !== 0) {
      const groupText = convertGroup(group);
      result = groupText + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + (result ? ' ' + result : '');
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return result + ' đồng';
};


/**
 * Export invoice as PDF (requires external library like jsPDF)
 * @param {Object} invoiceData - Invoice data
 * @param {string} filename - Output filename
 */
export const exportAsPDF = async (invoiceData, filename = 'invoice.pdf') => {
  try {
    // This would require jsPDF or similar library
    // For now, we'll use the browser's print to PDF functionality
    printInvoice(invoiceData);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

/**
 * Validate invoice data
 * @param {Object} invoiceData - Invoice data to validate
 * @returns {Object} Validation result
 */
export const validateInvoiceData = (invoiceData) => {
  const errors = [];
  
  if (!invoiceData.invoiceNumber) {
    errors.push('Số hóa đơn là bắt buộc');
  }
  
  if (!invoiceData.date) {
    errors.push('Ngày hóa đơn là bắt buộc');
  }
  
  if (!invoiceData.customer?.name) {
    errors.push('Tên khách hàng là bắt buộc');
  }
  
  if (!invoiceData.items || invoiceData.items.length === 0) {
    errors.push('Danh sách sản phẩm không được để trống');
  }
  
  if (invoiceData.finalTotal <= 0) {
    errors.push('Tổng tiền phải lớn hơn 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 