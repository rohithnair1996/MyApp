/**
 * Utility functions for converting between absolute and percentage-based coordinates
 * Used for API integration to handle different screen sizes
 */

/**
 * Convert absolute coordinates to percentage values
 * @param {number} x - Absolute x coordinate
 * @param {number} y - Absolute y coordinate
 * @param {number} containerWidth - Width of the container
 * @param {number} containerHeight - Height of the container
 * @returns {{xPercent: number, yPercent: number}} Percentage values (0-100)
 */
export const absoluteToPercentage = (x, y, containerWidth, containerHeight) => {
  if (containerWidth === 0 || containerHeight === 0) {
    return { xPercent: 0, yPercent: 0 };
  }

  const xPercent = (x / containerWidth) * 100;
  const yPercent = (y / containerHeight) * 100;

  return {
    xPercent: Math.max(0, Math.min(100, xPercent)), // Clamp between 0-100
    yPercent: Math.max(0, Math.min(100, yPercent)), // Clamp between 0-100
  };
};

/**
 * Convert percentage values to absolute coordinates
 * @param {number} xPercent - X percentage (0-100)
 * @param {number} yPercent - Y percentage (0-100)
 * @param {number} containerWidth - Width of the container
 * @param {number} containerHeight - Height of the container
 * @returns {{x: number, y: number}} Absolute coordinates
 */
export const percentageToAbsolute = (xPercent, yPercent, containerWidth, containerHeight) => {
  const x = (xPercent / 100) * containerWidth;
  const y = (yPercent / 100) * containerHeight;

  return { x, y };
};

/**
 * Format position data for API call
 * @param {number} x - Absolute x coordinate
 * @param {number} y - Absolute y coordinate
 * @param {number} containerWidth - Width of the container
 * @param {number} containerHeight - Height of the container
 * @returns {{x: number, y: number}} Position object with percentage values
 */
export const formatPositionForAPI = (x, y, containerWidth, containerHeight) => {
  const { xPercent, yPercent } = absoluteToPercentage(x, y, containerWidth, containerHeight);

  return {
    x: parseFloat(xPercent.toFixed(2)), // Round to 2 decimal places
    y: parseFloat(yPercent.toFixed(2)),
  };
};

/**
 * Parse position data from API response
 * @param {Object} apiPosition - Position object from API with percentage values
 * @param {number} apiPosition.x - X percentage (0-100)
 * @param {number} apiPosition.y - Y percentage (0-100)
 * @param {number} containerWidth - Width of the container
 * @param {number} containerHeight - Height of the container
 * @returns {{x: number, y: number}} Absolute coordinates
 */
export const parsePositionFromAPI = (apiPosition, containerWidth, containerHeight) => {
  return percentageToAbsolute(apiPosition.x, apiPosition.y, containerWidth, containerHeight);
};
