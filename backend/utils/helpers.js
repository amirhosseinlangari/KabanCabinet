/**
 * Helper utility functions for the backend
 */

/**
 * Generate a unique order ID
 * Format: KBN-{YEAR}{MONTH}{DAY}-{RANDOM_NUMBER}
 * @returns {string} - Unique order ID
 */
const generateOrderId = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2); // Get last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate a random 4-digit number
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `KBN-${dateStr}-${random}`;
};

/**
 * Format price with commas as thousands separators
 * @param {number} price - The price to format
 * @returns {string} - Formatted price
 */
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Generate pagination details
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination details
 */
const getPagination = (total, page, limit) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  
  return {
    total,
    page: currentPage,
    limit: itemsPerPage,
    pages: totalPages,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    prev: currentPage > 1 ? currentPage - 1 : null,
    next: currentPage < totalPages ? currentPage + 1 : null
  };
};

/**
 * Validate Iranian mobile number
 * @param {string} mobile - The mobile number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidMobile = (mobile) => {
  const mobileRegex = /^(\+98|0)?9\d{9}$/;
  return mobileRegex.test(mobile);
};

/**
 * Validate email address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Convert Persian numbers to English numbers
 * @param {string} str - The string containing Persian numbers
 * @returns {string} - String with English numbers
 */
const toPersianDigits = (str) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  return str.toString().replace(/[0-9]/g, (match) => {
    return persianDigits[englishDigits.indexOf(match)];
  });
};

/**
 * Convert English numbers to Persian numbers
 * @param {string} str - The string containing English numbers
 * @returns {string} - String with Persian numbers
 */
const toEnglishDigits = (str) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  return str.toString().replace(/[۰-۹]/g, (match) => {
    return englishDigits[persianDigits.indexOf(match)];
  });
};

module.exports = {
  generateOrderId,
  formatPrice,
  getPagination,
  isValidMobile,
  isValidEmail,
  toPersianDigits,
  toEnglishDigits
}; 