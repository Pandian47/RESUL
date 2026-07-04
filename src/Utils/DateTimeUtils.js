/**
 * Shared utility for date/time operations
 * Consolidates date conversion and formatting logic used across components
 */

/**
 * Safely converts a value to a Date object
 * Handles various input formats: Date objects, ISO strings, numeric timestamps
 * 
 * @param {*} value - Value to convert to Date
 * @param {Object} options - Conversion options
 * @param {boolean} options.resetTime - Set time to midnight (default: true)
 * @param {*} options.fallback - Value to return if conversion fails (default: null)
 * @returns {Date|*} Converted Date or fallback value
 */
export const safeToDate = (
  value,
  { resetTime = true, fallback = null } = {}
) => {
  // Already a valid Date
  if (value instanceof Date && !isNaN(value.getTime())) {
    return resetTime
      ? new Date(value.setHours(0, 0, 0, 0))
      : value;
  }

  // Handle numeric timestamps (milliseconds or seconds)
  if (typeof value === 'number') {
    const dateObj = new Date(value);
    if (!isNaN(dateObj.getTime())) {
      return resetTime
        ? new Date(dateObj.setHours(0, 0, 0, 0))
        : dateObj;
    }
  }

  // Handle numeric strings (timestamps)
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const dateObj = new Date(Number(value));
    if (!isNaN(dateObj.getTime())) {
      return resetTime
        ? new Date(dateObj.setHours(0, 0, 0, 0))
        : dateObj;
    }
  }

  // Handle ISO date strings or other date formats
  if (typeof value === 'string') {
    const dateObj = new Date(value);
    if (!isNaN(dateObj.getTime())) {
      return resetTime
        ? new Date(dateObj.setHours(0, 0, 0, 0))
        : dateObj;
    }
  }

  // Conversion failed, return fallback
  return fallback;
};

/**
 * Checks if value is a valid Date
 * 
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a valid Date
 */
export const isValidDate = (value) => {
  return value instanceof Date && !isNaN(value.getTime());
};
/**
 * Formats a Date to a specific format string
 * Basic implementation - can be extended with format library
 * 
 * @param {Date} date - Date to format
 * @param {string} format - Format string (e.g., 'MM-DD-YYYY', 'YYYY-MM-DD')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'MM-DD-YYYY') => {
  if (!isValidDate(date)) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

