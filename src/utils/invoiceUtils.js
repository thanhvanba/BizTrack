/**
 * Common invoice utilities for printing and image conversion
 */

import { COMPANY } from "../config/companyConfig";

/**
 * Format currency to Vietnamese format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0);
};

/**
 * Convert number to Vietnamese words
 * @param {number} num - Number to convert
 * @returns {string} Vietnamese words representation
 */
export const numberToWords = (num) => {
  if (num === 0) return 'không đồng';

  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  const scales = ['', 'nghìn', 'triệu', 'tỷ'];

  let result = '';
  let scaleIndex = 0;

  while (num > 0) {
    const group = num % 1000;
    if (group !== 0) {
      let groupText = '';

      const hundred = Math.floor(group / 100);
      const ten = Math.floor((group % 100) / 10);
      const one = group % 10;

      if (hundred > 0) {
        groupText += ones[hundred] + ' trăm ';
      }

      if (ten > 1) {
        groupText += tens[ten] + ' ';
        if (one > 0) {
          groupText += ones[one] + ' ';
        }
      } else if (ten === 1) {
        groupText += 'mười ';
        if (one > 0) {
          groupText += ones[one] + ' ';
        }
      } else if (one > 0) {
        groupText += ones[one] + ' ';
      }

      result = groupText + scales[scaleIndex] + ' ' + result;
    }

    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return result + ' đồng';
};

/**
 * Get invoice title based on type
 * @param {string} type - Invoice type
 * @returns {string} Invoice title
 */
export const getInvoiceTitle = (type) => {
  switch (type) {
    case 'sale':
      return 'HÓA ĐƠN BÁN HÀNG';
    case 'sale_return':
      return 'HÓA ĐƠN TRẢ HÀNG BÁN';
    case 'purchase':
      return 'PHIẾU NHẬP HÀNG';
    case 'purchase_return':
      return 'PHIẾU TRẢ HÀNG NHẬP';
    default:
      return 'HÓA ĐƠN';
  }
};

/**
 * Get customer label based on type
 * @param {string} type - Invoice type
 * @returns {string} Customer label
 */
export const getCustomerLabel = (type) => {
  switch (type) {
    case 'sale':
    case 'sale_return':
      return 'Khách hàng';
    case 'purchase':
    case 'purchase_return':
      return 'Nhà cung cấp';
    default:
      return 'Khách hàng';
  }
};

/**
 * Get location label based on type
 * @param {string} type - Invoice type
 * @returns {string} Location label
 */
export const getLocationLabel = (type) => {
  switch (type) {
    case 'sale':
    case 'sale_return':
      return 'Địa chỉ';
    case 'purchase':
    case 'purchase_return':
      return 'Kho nhập';
    default:
      return 'Địa chỉ';
  }
};

/**
 * Get thank you message based on type
 * @param {string} type - Invoice type
 * @returns {string} Thank you message
 */
export const getThankYouMessage = (type) => {
  switch (type) {
    case 'sale':
      return `${COMPANY.name} - Hân hạnh phục vụ Quý Khách!`;
    case 'sale_return':
      return `${COMPANY.name} - Hân hạnh phục vụ Quý Khách!`;
    case 'purchase':
      return `${COMPANY.name} - Hân hạnh phục vụ Quý Khách!`;
    case 'purchase_return':
      return `${COMPANY.name} - Hân hạnh phục vụ Quý Khách!`;
    default:
      return `${COMPANY.name} - Hân hạnh phục vụ Quý Khách!`;
  }
};

/**
 * Check if should show payment info based on type
 * @param {string} type - Invoice type
 * @returns {boolean} Should show payment info
 */
export const shouldShowPaymentInfo = (type) => {
  return type === 'sale' || type === 'sale_return';
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

/**
 * Generate invoice HTML
 * @param {Object} invoiceData - Invoice data
 * @param {string} type - Invoice type
 * @param {string} logoBase64 - Logo in base64 format
 * @param {string} qrBase64 - QR code in base64 format
 * @returns {string} HTML string
 */
export const generateInvoiceHTML = (invoiceData, type, logoBase64, qrBase64) => {
  const {
    invoiceNumber,
    date,
    customer,
    company,
    items,
    total,
    discount,
    shippingFee,
    amountPaid,
    note,
    finalTotal
  } = invoiceData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${getInvoiceTitle(type)} ${invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          line-height: 1.4;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #000;
        }
        .header-left {
          flex: 0 0 25%;
        }
        .header-center {
          flex: 0 0 50%;
          text-align: center;
        }
        .header-right {
          flex: 0 0 25%;
          text-align: left;
        }
        .logo {
          height: 80px;
          margin-bottom: 15px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        .info {
          font-size: 14px;
          margin-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #000;
          padding: 10px;
          text-align: left;
          font-size: 14px;
        }
        th {
          background: #f0f0f0;
          font-weight: bold;
        }
        .text-right {
          text-align: right;
        }
        .summary {
          border: 1px solid #000;
          padding: 15px;
          margin: 20px 0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 16px;
          border-top: 1px solid #000;
          padding-top: 10px;
          margin-top: 10px;
        }
        .summary-words {
          text-align: center;
          font-style: italic;
          margin-top: 15px;
          font-size: 12px;
        }
        .note {
          border: 1px solid #000;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #000;
        }
        @media print {
          body { margin: 0; padding: 10px; }
          @page { margin: 0.5in; }
          th { background: #f0f0f0 !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <img src="${logoBase64}" style="width: 100%;" alt="Logo" class="logo" />
          <div class="info">Điện thoại: ${company?.phone || ''}</div>
          <div class="info">Địa chỉ: ${company?.address || ''}</div>
        </div>
        
        <div class="header-center">
          <div class="title">${getInvoiceTitle(type)}</div>
          <div class="info">SỐ: ${invoiceNumber}</div>
          <div class="info">Ngày: ${date}</div>
        </div>
        
        <div class="header-right">
          <div class="info"><strong>${getCustomerLabel(type)}:</strong> ${customer?.name || ''}</div>
          <div class="info"><strong>SĐT:</strong> ${customer?.phone || ''}</div>
          <div class="info"><strong>${getLocationLabel(type)}:</strong> ${(type === 'purchase' || type === 'purchase_return') ? (company?.address || '') : (customer?.address || '')}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tên sản phẩm</th>
            <th class="text-right">Đơn giá</th>
            <th class="text-right">SL</th>
            ${(type === 'purchase' || type === 'purchase_return') ? '<th class="text-right">VAT (%)</th><th class="text-right">Tiền VAT</th>' : ''}
            <th class="text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${items?.map(item => `
            <tr>
              <td>${item.name || ''}</td>
              <td class="text-right">${formatCurrency(item.unitPrice || 0)}</td>
              <td class="text-right">${item.quantity || 0}</td>
              ${(type === 'purchase' || type === 'purchase_return') ? `
                <td class="text-right">${item.vatRate || 0}%</td>
                <td class="text-right">${formatCurrency(item.vatAmount || 0)}</td>
              ` : ''}
              <td class="text-right">${formatCurrency(item.amount || 0)}</td>
            </tr>
          `).join('') || ''}
        </tbody>
      </table>

      <div class="summary">
        ${(type === 'purchase' || type === 'purchase_return') ? `
        <div class="summary-row">
          <span>Tạm tính:</span>
          <span>${formatCurrency(invoiceData.subtotal || 0)}</span>
        </div>
        <div class="summary-row">
          <span>VAT:</span>
          <span>${formatCurrency(invoiceData.totalVat || 0)}</span>
        </div>
        ` : `
        <div class="summary-row">
          <span>Tổng tiền hàng:</span>
          <span>${formatCurrency(total || 0)}</span>
        </div>
        `}
        ${shouldShowPaymentInfo(type) ? `
        <div class="summary-row">
          <span>Chiết khấu:</span>
          <span>${formatCurrency(discount || 0)}</span>
        </div>
        <div class="summary-row">
          <span>Phí vận chuyển:</span>
          <span>${formatCurrency(shippingFee || 0)}</span>
        </div>
        ` : ''}
        <div class="summary-total">
          <span>Tổng thanh toán:</span>
          <span>${formatCurrency(finalTotal || 0)}</span>
        </div>
        ${shouldShowPaymentInfo(type) && (amountPaid || 0) > 0 ? `
        <div class="summary-row">
          <span>Khách đã trả:</span>
          <span>${formatCurrency(amountPaid || 0)}</span>
        </div>
        <div class="summary-total">
          <span>Còn lại:</span>
          <span>${formatCurrency((finalTotal || 0) - (amountPaid || 0))}</span>
        </div>
        ` : ''}
        <div class="summary-words">
          (${numberToWords((finalTotal || 0) - (amountPaid || 0))})
        </div>
      </div>

      ${note ? `
      <div class="note">
        <h4 style="margin: 0 0 10px 0; font-size: 14px;">Ghi chú:</h4>
        <p style="margin: 0; font-size: 14px;">${note}</p>
      </div>
      ` : ''}

      <div class="footer">
        <div class="info">${getThankYouMessage(type)}</div>
        <div class="info">Powered by BIZTRACK</div>
        <div style="margin-top: 20px; text-align: center;">
          <img src="${qrBase64}" style="width: 120px; height: 120px;" alt="QR Code" />
        </div>
      </div>
    </body>
    </html>
  `;
};
