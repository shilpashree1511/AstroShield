/**
 * Helper Functions - Common utility functions
 */

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};

/**
 * Format distance in kilometers
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance
 */
export const formatDistance = (km) => {
  if (km === null || km === undefined) return 'N/A';
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  if (km < 1000) return `${km.toFixed(2)} km`;
  return `${(km / 1000).toFixed(2)}k km`;
};

/**
 * Format time duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString();
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const past = new Date(date);
  const diff = now - past;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) return formatDate(date);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Format velocity in km/s
 * @param {number} velocity - Velocity in km/s
 * @returns {string} Formatted velocity
 */
export const formatVelocity = (velocity) => {
  if (velocity === null || velocity === undefined) return 'N/A';
  return `${velocity.toFixed(2)} km/s`;
};

/**
 * Format altitude in kilometers
 * @param {number} altitude - Altitude in km
 * @returns {string} Formatted altitude
 */
export const formatAltitude = (altitude) => {
  if (altitude === null || altitude === undefined) return 'N/A';
  if (altitude < 1000) return `${altitude.toFixed(0)} km`;
  return `${(altitude / 1000).toFixed(2)}k km`;
};

/**
 * Format percentage
 * @param {number} value - Value between 0 and 1
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Generate random ID
 * @param {number} length - ID length
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  return obj === null || obj === undefined || Object.keys(obj).length === 0;
};

/**
 * Get color for risk level
 * @param {string} risk - Risk level (HIGH, MEDIUM, LOW)
 * @returns {string} Color code
 */
export const getRiskColor = (risk) => {
  switch (risk?.toUpperCase()) {
    case 'HIGH':
      return '#ff3333';
    case 'MEDIUM':
      return '#ffaa00';
    case 'LOW':
      return '#00ff88';
    default:
      return '#666666';
  }
};

/**
 * Get icon for risk level
 * @param {string} risk - Risk level
 * @returns {string} Icon name
 */
export const getRiskIcon = (risk) => {
  switch (risk?.toUpperCase()) {
    case 'HIGH':
      return 'alert-triangle';
    case 'MEDIUM':
      return 'alert-circle';
    case 'LOW':
      return 'shield';
    default:
      return 'info';
  }
};