/**
 * Shared utility for processing grid data
 * Consolidates common data transformation logic used across all Kendo Grid variants
 */

/**
 * Converts field values to appropriate types for filtering
 * Handles date fields (string/number to Date) and numeric fields (string to number)
 * 
 * @param {Array} data - Array of data items to process
 * @param {Array} columns - Array of column definitions with filter type information
 * @returns {{displayData: Array, filterData: Array}} Processed display and filter data
 */
export const processGridData = (data, columns = []) => {
  if (!data?.length) {
    return { displayData: data, filterData: data };
  }

  const processedDisplayData = (data ?? []).map((item) => ({ ...item }));
  
  const processedFilterData = (data ?? []).map((item) => {
    const newItem = { ...item };
    
    columns?.forEach((column) => {
      const field = column?.field;
      if (!field) return;
      const fieldValue = item?.[field];
      
      if (fieldValue == null || fieldValue === '') return;

      if (column?.filter === 'date') {
        newItem[field] = convertToDate(fieldValue, item?.[field]);
      } else if (column?.filter === 'numeric') {
        newItem[field] = convertToNumeric(fieldValue, item?.[field]);
      }
    });
    
    return newItem;
  });

  return { displayData: processedDisplayData, filterData: processedFilterData };
};

/**
 * Converts a value to a Date object with time set to midnight
 * Handles various input formats: Date objects, ISO strings, and numeric timestamps
 * 
 * @param {*} fieldValue - The value to convert
 * @param {*} originalValue - Original value to return if conversion fails
 * @returns {Date|*} Converted Date or original value if conversion fails
 */
export const convertToDate = (fieldValue, originalValue = null) => {
  let dateObj;

  // Handle numeric strings (timestamps)
  if (typeof fieldValue === 'string' && /^\d+$/.test(fieldValue)) {
    dateObj = new Date(Number(fieldValue));
  } else {
    dateObj = new Date(fieldValue);
  }

  // Return original value if conversion failed, otherwise reset time to midnight
  if (isNaN(dateObj.getTime())) {
    return originalValue ?? fieldValue;
  }

  return new Date(dateObj.setHours(0, 0, 0, 0));
};

/**
 * Converts a value to a numeric type
 * Returns original value if conversion fails
 * 
 * @param {*} fieldValue - The value to convert
 * @param {*} originalValue - Original value to return if conversion fails
 * @returns {number|*} Converted number or original value if conversion fails
 */
export const convertToNumeric = (fieldValue, originalValue = null) => {
  const numericValue = Number(fieldValue);
  
  if (isNaN(numericValue)) {
    return originalValue ?? fieldValue;
  }

  return numericValue;
};

/**
 * Checks if an array or object is empty and safe to process
 * 
 * @param {*} value - Value to check
 * @returns {boolean} True if value is empty or not an array/object
 */
export const isEmpty = (value) => {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object' && value !== null) return Object.keys(value).length === 0;
  return !value;
};

/**
 * Checks if any filters are currently active in the grid
 * 
 * @param {object} filter - Kendo filter object
 * @returns {boolean} True if filters are active
 */
export const hasActiveFilters = (filter) => {
  return filter && Object.keys(filter).length > 0;
};

export { generatePageSizeOptions, getEffectiveTotal } from './PaginationUtils';
