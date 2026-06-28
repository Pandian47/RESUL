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
 * Safely converts a value to a number
 * Returns original value or fallback if conversion fails
 * 
 * @param {*} value - Value to convert
 * @param {*} fallback - Value to return if conversion fails (default: null)
 * @returns {number|*} Converted number or fallback
 */
export const safeToNumber = (value, fallback = null) => {
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }

  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
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

/**
 * Gets the start of a day (midnight)
 * 
 * @param {Date} date - Input date
 * @returns {Date} Date set to midnight
 */
export const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Gets the end of a day (23:59:59.999)
 * 
 * @param {Date} date - Input date
 * @returns {Date} Date set to end of day
 */
export const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Calculates difference between two dates in days
 * 
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
export const daysBetween = (date1, date2) => {
  if (!isValidDate(date1) || !isValidDate(date2)) return 0;

  const d1 = getStartOfDay(date1);
  const d2 = getStartOfDay(date2);
  const diffMs = Math.abs(d2 - d1);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Checks if date is within range
 * 
 * @param {Date} date - Date to check
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end
 * @returns {boolean} True if date is within range
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!isValidDate(date) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return date >= startDate && date <= endDate;
};

/**
 * Gets today's date at midnight
 * 
 * @returns {Date} Today's date at midnight
 */
export const getTodayAtMidnight = () => {
  return getStartOfDay(new Date());
};

/**
 * Safely parses a date string using provided format hint
 * 
 * @param {string} dateString - Date string to parse
 * @param {string} format - Expected format hint
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDateString = (dateString, format = 'MM-DD-YYYY') => {
  if (!dateString) return null;
  return safeToDate(dateString, { resetTime: false, fallback: null });
};
