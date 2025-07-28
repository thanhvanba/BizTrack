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

    // Tạo HTML cho hóa đơn
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${getInvoiceTitle(type)} ${invoiceNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { margin: 0; padding: 10px; }
            @page { margin: 0.5in; }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 10px; 
            background: white !important;
            color: black !important;
          }
          .invoice-container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
            background: white !important;
          }
          * {
            background: white !important;
            color: black !important;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
            <div class="flex-1">
              <img src="${logo}" alt="BizTrack" class="h-20 mb-3" />
              <p class="text-sm text-gray-600 mb-1">Điện thoại: ${company?.phone}</p>
              <p class="text-sm text-gray-600">Địa chỉ: ${company?.address}</p>
            </div>
            
            <div class="flex-1 text-center">
              <h1 class="text-2xl font-bold text-gray-800 uppercase mb-3">${getInvoiceTitle(type)}</h1>
              <p class="text-base text-gray-800 mb-1">SỐ: ${invoiceNumber}</p>
              <p class="text-base text-gray-800">Ngày ${date}</p>
            </div>
            
            <div class="flex-1 text-right">
              <p class="text-sm text-gray-800 mb-1"><strong>${getCustomerLabel(type)}:</strong> ${customer?.name}</p>
              <p class="text-sm text-gray-800 mb-1"><strong>SĐT:</strong> ${customer?.phone}</p>
              <p class="text-sm text-gray-800"><strong>${getLocationLabel(type)}:</strong> ${customer?.address}</p>
            </div>
          </div>

          <!-- Products Table -->
          <div class="my-6">
            <table class="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th class="bg-gray-50 p-3 text-left font-semibold border border-gray-300 text-sm">Tên sản phẩm</th>
                  <th class="bg-gray-50 p-3 text-right font-semibold border border-gray-300 text-sm">Đơn giá</th>
                  <th class="bg-gray-50 p-3 text-right font-semibold border border-gray-300 text-sm">SL</th>
                  <th class="bg-gray-50 p-3 text-right font-semibold border border-gray-300 text-sm">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${items?.map(item => `
                  <tr>
                    <td class="p-3 border border-gray-300 text-sm">${item.name}</td>
                    <td class="p-3 border border-gray-300 text-sm text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="p-3 border border-gray-300 text-sm text-right">${item.quantity}</td>
                    <td class="p-3 border border-gray-300 text-sm text-right">${formatCurrency(item.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Summary -->
          <div class="p-3 bg-gray-50 rounded-lg my-4">
            <div class="flex justify-between mb-2 text-sm">
              <span>Tổng tiền hàng:</span>
              <span>${formatCurrency(total)}</span>
            </div>
            ${shouldShowPaymentInfo(type) ? `
            <div class="flex justify-between mb-2 text-sm">
              <span>Chiết khấu:</span>
              <span>${formatCurrency(discount)}</span>
            </div>
            <div class="flex justify-between mb-2 text-sm">
              <span>Phí vận chuyển:</span>
              <span>${formatCurrency(shippingFee)}</span>
            </div>
            ` : ''}
            <div class="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
              <span>Tổng thanh toán:</span>
              <span>${formatCurrency(finalTotal)}</span>
            </div>
            ${shouldShowPaymentInfo(type) && amountPaid > 0 ? `
            <div class="flex justify-between mb-2 text-sm mt-2">
              <span>Khách đã trả:</span>
              <span class="text-green-600">${formatCurrency(amountPaid)}</span>
            </div>
            <div class="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
              <span>Còn lại:</span>
              <span class="text-red-600">${formatCurrency(finalTotal - amountPaid)}</span>
            </div>
            ` : ''}
            <div class="text-center italic text-gray-600 mt-3 text-xs">
              (${numberToWords(finalTotal - (amountPaid || 0))})
            </div>
          </div>

          <!-- Note -->
          ${note ? `
          <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 class="text-sm font-semibold text-gray-800 mb-2">Ghi chú:</h4>
            <p class="text-sm text-gray-700">${note}</p>
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="text-center mt-10 pt-5 border-t border-gray-300">
            <p class="text-sm text-gray-600 mb-1">${getThankYouMessage(type)}</p>
            <p class="text-sm text-gray-600 mb-1">Powered by BIZTRACK.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mở cửa sổ mới và in
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Tự động in và đóng
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Không render gì cả
  return null;
};

export default PrintInvoice; 