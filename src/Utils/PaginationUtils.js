/**
 * Shared utility for pagination configuration across Kendo Grid components
 * Reduces duplication in pagination logic and provides consistent configuration
 */

/**
 * Generates pagination configuration for Kendo Grid
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.total - Total number of items
 * @param {number} options.pageSize - Current page size
 * @param {boolean} options.hidePaginationInfo - Hide info text
 * @param {boolean} options.hideFirstLastNav - Hide first/last navigation
 * @param {boolean} options.autoResize - Auto-resize based on viewport
 * @param {boolean} options.isServerMode - Server-side pagination enabled
 * @returns {Object|boolean} Pagination config or false if pagination not needed
 */
export const generatePaginationConfig = ({
  total = 0,
  pageSize = 5,
  hidePaginationInfo = false,
  hideFirstLastNav = false,
  autoResize = false,
  isServerMode = false,
} = {}) => {
  // Don't show pagination if total is small
  if (total <= pageSize) {
    return false;
  }

  const sizes = [pageSize];

  // Generate page size options based on total
  if (pageSize * 2 <= total) {
    sizes.push(pageSize * 2);
  }

  if (pageSize * 3 <= total) {
    sizes.push(pageSize * 3);
  }

  return {
    info: !hidePaginationInfo,
    pageSizes: sizes,
    previousNext: !hideFirstLastNav,
    buttonCount: 4,
    className: 'rs-kendo-pager',
  };
};

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

/**
 * Calculates grid height based on viewport and content
 * 
 * @param {Object} options
 * @param {number} options.viewportHeight - Available viewport height
 * @param {number} options.headerOffset - Height of grid header
 * @param {number} options.paginationHeight - Height of pagination control
 * @param {number} options.minHeight - Minimum grid height
 * @returns {number} Calculated grid height
 */
export const calculateGridHeight = ({
  viewportHeight = 0,
  headerOffset = 40,
  paginationHeight = 50,
  minHeight = 200,
} = {}) => {
  const available = viewportHeight - headerOffset - paginationHeight;
  return Math.max(available, minHeight);
};

/**
 * Determines if pagination should be shown
 * 
 * @param {Object} options
 * @param {number} options.total - Total items
 * @param {number} options.pageSize - Page size
 * @param {boolean} options.disabled - Explicitly disabled
 * @returns {boolean} True if pagination should be shown
 */
export const shouldShowPagination = ({
  total = 0,
  pageSize = 5,
  disabled = false,
} = {}) => {
  if (disabled) return false;
  return total > pageSize;
};

/**
 * Validates pagination state
 * Ensures skip/take values are within valid ranges
 * 
 * @param {Object} state - Current pagination state
 * @param {number} state.skip - Current skip value
 * @param {number} state.take - Current take value
 * @param {number} total - Total items
 * @returns {Object} Validated pagination state
 */
export const validatePaginationState = (
  { skip = 0, take = 5 } = {},
  total = 0
) => {
  // Validate take value
  const validatedTake = Math.max(1, Math.min(take, total));

  // Validate skip value
  const maxSkip = Math.max(0, total - validatedTake);
  const validatedSkip = Math.max(0, Math.min(skip, maxSkip));

  return {
    skip: validatedSkip,
    take: validatedTake,
  };
};

/**
 * Calculates pagination metadata
 * 
 * @param {Object} options
 * @param {number} options.skip - Current page offset
 * @param {number} options.take - Page size
 * @param {number} options.total - Total items
 * @returns {Object} Pagination metadata
 */
export const getPaginationMetadata = ({
  skip = 0,
  take = 5,
  total = 0,
} = {}) => {
  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.ceil(total / take) || 1;
  const itemsStart = Math.min(skip + 1, total);
  const itemsEnd = Math.min(skip + take, total);

  return {
    currentPage,
    totalPages,
    itemsStart,
    itemsEnd,
    total,
    pageSize: take,
  };
};

/**
 * Generates initial pagination state
 * 
 * @param {Object} options
 * @param {number} options.pageSize - Initial page size
 * @param {number} options.skip - Initial skip offset
 * @param {boolean} options.autoResize - Auto-resize mode
 * @returns {Object} Initial pagination state
 */
export const getInitialPaginationState = ({
  pageSize = 5,
  skip = 0,
  autoResize = false,
} = {}) => {
  return {
    skip: skip,
    take: pageSize,
    ...(autoResize && { group: [], sort: [] }),
  };
};
