/**
 * Excel Export Utility
 * Converts order data to Excel format for reporting and exports
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const moment = require('moment-jalaali');

/**
 * Export orders to Excel
 * @param {Array} orders - Array of order objects to export
 * @returns {Buffer} Excel file as buffer
 */
const exportToExcel = async (orders) => {
  // Create a new Excel workbook
  const workbook = new ExcelJS.Workbook();
  
  // Set workbook properties
  workbook.creator = 'Kaban Cabinet System';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Add a worksheet
  const worksheet = workbook.addWorksheet('سفارش‌ها', {
    properties: {
      tabColor: { argb: 'FFC78143' },
      defaultRowHeight: 25
    },
    views: [{ rightToLeft: true }] // RTL for Persian language
  });
  
  // Define columns
  worksheet.columns = [
    { header: 'شماره سفارش', key: 'orderNumber', width: 15 },
    { header: 'تاریخ ثبت', key: 'createdAt', width: 15 },
    { header: 'نام مشتری', key: 'customerName', width: 20 },
    { header: 'شماره تماس', key: 'customerPhone', width: 15 },
    { header: 'مجموع اقلام', key: 'totalItems', width: 12 },
    { header: 'جمع کل (تومان)', key: 'totalPrice', width: 15 },
    { header: 'تخفیف (تومان)', key: 'discount', width: 15 },
    { header: 'مبلغ نهایی (تومان)', key: 'finalPrice', width: 15 },
    { header: 'روش پرداخت', key: 'paymentMethod', width: 15 },
    { header: 'وضعیت پرداخت', key: 'paymentStatus', width: 15 },
    { header: 'وضعیت سفارش', key: 'status', width: 15 },
    { header: 'آدرس', key: 'address', width: 30 }
  ];
  
  // Style the header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1C68E' } // light orange color
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add data rows
  orders.forEach(order => {
    // Format address
    const addressParts = [];
    if (order.customer.address) {
      const addr = order.customer.address;
      if (addr.province) addressParts.push(addr.province);
      if (addr.city) addressParts.push(addr.city);
      if (addr.street) addressParts.push(addr.street);
      if (addr.details) addressParts.push(addr.details);
    }
    const formattedAddress = addressParts.join('، ');
    
    // Calculate total items
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Format date to Jalali (Persian) calendar
    const formattedDate = moment(order.createdAt).format('jYYYY/jMM/jDD');
    
    // Translate payment method to Persian
    const paymentMethodMap = {
      'cash': 'نقدی',
      'card': 'کارت بانکی',
      'online': 'پرداخت آنلاین',
      'installment': 'اقساطی'
    };
    
    // Translate payment status to Persian
    const paymentStatusMap = {
      'pending': 'در انتظار پرداخت',
      'paid': 'پرداخت شده',
      'failed': 'ناموفق',
      'refunded': 'برگشت داده شده',
      'partially_paid': 'پرداخت جزئی'
    };
    
    // Translate order status to Persian
    const orderStatusMap = {
      'pending': 'در انتظار تایید',
      'confirmed': 'تایید شده',
      'processing': 'در حال پردازش',
      'shipped': 'ارسال شده',
      'delivered': 'تحویل شده',
      'cancelled': 'لغو شده'
    };
    
    // Add row to worksheet
    worksheet.addRow({
      orderNumber: order.orderNumber,
      createdAt: formattedDate,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      totalItems: totalItems,
      totalPrice: order.totalPrice.toLocaleString('fa-IR'),
      discount: order.discount.toLocaleString('fa-IR'),
      finalPrice: order.finalPrice.toLocaleString('fa-IR'),
      paymentMethod: paymentMethodMap[order.paymentMethod] || order.paymentMethod,
      paymentStatus: paymentStatusMap[order.paymentStatus] || order.paymentStatus,
      status: orderStatusMap[order.status] || order.status,
      address: formattedAddress
    });
  });
  
  // Add conditional formatting
  // Highlight unpaid orders
  worksheet.addConditionalFormatting({
    ref: `J2:J${orders.length + 1}`,
    rules: [
      {
        type: 'containsText',
        operator: 'containsText',
        text: 'انتظار',
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFD9D9' } }
        }
      }
    ]
  });
  
  // Add total row
  const totalRow = worksheet.addRow({
    orderNumber: 'جمع کل',
    totalItems: orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0),
    totalPrice: orders.reduce((sum, order) => sum + order.totalPrice, 0).toLocaleString('fa-IR'),
    discount: orders.reduce((sum, order) => sum + order.discount, 0).toLocaleString('fa-IR'),
    finalPrice: orders.reduce((sum, order) => sum + order.finalPrice, 0).toLocaleString('fa-IR')
  });
  
  // Style total row
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F1F1' }
  };
  
  // Add borders to all cells
  for (let i = 1; i <= orders.length + 2; i++) {
    worksheet.getRow(i).eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  }
  
  // Save to buffer and return
  return await workbook.xlsx.writeBuffer();
};

module.exports = exportToExcel; 