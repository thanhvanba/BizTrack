import React from 'react';
import { validateInvoiceData, formatCurrency, numberToWords } from '../utils/printUtils';
import logo from '../assets/logo-biztrack.png';

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

  const getInvoiceTitle = (type) => {
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

  const getCustomerLabel = (type) => {
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

  const getLocationLabel = (type) => {
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

  const getThankYouMessage = (type) => {
    switch (type) {
      case 'sale':
        return 'Cảm ơn và hẹn gặp lại!';
      case 'sale_return':
        return 'Cảm ơn đã tin tưởng!';
      case 'purchase':
        return 'Cảm ơn sự hợp tác!';
      case 'purchase_return':
        return 'Cảm ơn sự hợp tác!';
      default:
        return 'Cảm ơn và hẹn gặp lại!';
    }
  };

  const shouldShowPaymentInfo = (type) => {
    return type === 'sale' || type === 'sale_return';
  };

  const printInvoice = (invoiceData, type) => {
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

    // Tạo HTML cho hóa đơn - sử dụng HTML thuần, không có CSS framework
    const invoiceHTML = `
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
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
          }
          .header-left, .header-center, .header-right {
            flex: 1;
          }
          .header-center {
            text-align: center;
          }
          .header-right {
            text-align: right;
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
            <img src="${logo}" alt="BizTrack" class="logo" />
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
            <div class="info"><strong>${getLocationLabel(type)}:</strong> ${customer?.address || ''}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th class="text-right">Đơn giá</th>
              <th class="text-right">SL</th>
              <th class="text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${items?.map(item => `
              <tr>
                <td>${item.name || ''}</td>
                <td class="text-right">${formatCurrency(item.unitPrice || 0)}</td>
                <td class="text-right">${item.quantity || 0}</td>
                <td class="text-right">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Tổng tiền hàng:</span>
            <span>${formatCurrency(total || 0)}</span>
          </div>
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
        </div>
      </body>
      </html>
    `;

    // Tạo iframe ẩn thay vì mở cửa sổ mới
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);

    // Ghi HTML vào iframe
    iframe.contentDocument.write(invoiceHTML);
    iframe.contentDocument.close();

    // Đợi iframe load xong rồi in
    iframe.onload = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Xóa iframe sau khi in
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (error) {
        console.error('Print error:', error);
        // Fallback: mở cửa sổ mới nếu iframe không hoạt động
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
  };

  // Không render gì cả
  return null;
};

export default PrintInvoice; 