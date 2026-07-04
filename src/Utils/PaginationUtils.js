/**
 * Shared utility for pagination configuration across Kendo Grid components
 * Reduces duplication in pagination logic and provides consistent configuration
 */

/**
 * Generates page size options for pagination controls
 *
 * @param {number} total - Total number of items
 * @param {number} pageSize - Current page size
 * @returns {number[]} Available page size options
 */
export const generatePageSizeOptions = (total = 0, pageSize = 5) => {
  const sizes = [pageSize];

  if (pageSize * 2 <= total) {
    sizes.push(pageSize * 2);
  }

  if (pageSize * 3 <= total) {
    sizes.push(pageSize * 3);
  }

  return sizes;
};

/**
 * Determines effective total for pagination
 * Considers filtered total vs full total
 *
 * @param {number} total - Full total count
 * @param {(number|null|undefined)} filteredTotal - Filtered total count
 * @param {number} dataLength - Current data array length
 * @returns {number} Effective total to use for pagination
 */
export const getEffectiveTotal = (total = 0, filteredTotal, dataLength = 0) => {
  if (filteredTotal !== null && filteredTotal !== undefined) {
    return filteredTotal;
  }

  if (total > 0) {
    return Math.min(total, dataLength);
  }

  return dataLength || 0;
};
