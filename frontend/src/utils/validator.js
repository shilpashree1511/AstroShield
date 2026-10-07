/**
 * Validation Functions - Input validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: [],
    strength: 'weak',
  };

  if (password.length < 8) {
    result.isValid = false;
    result.errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    result.errors.push('Password should contain at least one special character');
  }

  // Calculate strength
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  if (strength >= 5) result.strength = 'strong';
  else if (strength >= 3) result.strength = 'medium';
  else result.strength = 'weak';

  return result;
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} Validation result
 */
export const validateUsername = (username) => {
  const result = {
    isValid: true,
    errors: [],
  };

  if (!username || username.length < 3) {
    result.isValid = false;
    result.errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 30) {
    result.isValid = false;
    result.errors.push('Username must be less than 30 characters');
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    result.isValid = false;
    result.errors.push('Username can only contain letters, numbers, and underscores');
  }

  return result;
};

/**
 * Validate satellite data
 * @param {Object} satellite - Satellite data
 * @returns {Object} Validation result
 */
export const validateSatellite = (satellite) => {
  const result = {
    isValid: true,
    errors: [],
  };

  if (!satellite.name || satellite.name.trim() === '') {
    result.isValid = false;
    result.errors.push('Satellite name is required');
  }

  if (!satellite.orbit_radius || satellite.orbit_radius < 6371) {
    result.isValid = false;
    result.errors.push('Orbit radius must be greater than Earth radius (6371 km)');
  }

  if (satellite.orbit_radius > 100000) {
    result.isValid = false;
    result.errors.push('Orbit radius cannot exceed 100,000 km');
  }

  if (!satellite.speed || satellite.speed < 0 || satellite.speed > 15) {
    result.isValid = false;
    result.errors.push('Speed must be between 0 and 15 km/s');
  }

  if (satellite.inclination !== undefined && (satellite.inclination < 0 || satellite.inclination > 180)) {
    result.isValid = false;
    result.errors.push('Inclination must be between 0 and 180 degrees');
  }

  return result;
};

/**
 * Validate debris data
 * @param {Object} debris - Debris data
 * @returns {Object} Validation result
 */
export const validateDebris = (debris) => {
  const result = {
    isValid: true,
    errors: [],
  };

  const validSizes = ['small', 'medium', 'large'];
  if (!debris.size || !validSizes.includes(debris.size)) {
    result.isValid = false;
    result.errors.push('Debris size must be small, medium, or large');
  }

  if (debris.orbit_radius && debris.orbit_radius < 6371) {
    result.isValid = false;
    result.errors.push('Orbit radius must be greater than Earth radius (6371 km)');
  }

  if (debris.velocity && (debris.velocity < 0 || debris.velocity > 15)) {
    result.isValid = false;
    result.errors.push('Velocity must be between 0 and 15 km/s');
  }

  return result;
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if valid
 */
export const isValidCoordinates = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Validate orbit parameters
 * @param {Object} params - Orbit parameters
 * @returns {Object} Validation result
 */
export const validateOrbitParams = (params) => {
  const result = {
    isValid: true,
    errors: [],
  };

  if (params.radius && (params.radius < 6371 || params.radius > 100000)) {
    result.isValid = false;
    result.errors.push('Orbit radius must be between 6,371 km and 100,000 km');
  }

  if (params.speed && (params.speed < 0 || params.speed > 15)) {
    result.isValid = false;
    result.errors.push('Orbital speed must be between 0 and 15 km/s');
  }

  if (params.inclination && (params.inclination < 0 || params.inclination > 180)) {
    result.isValid = false;
    result.errors.push('Inclination must be between 0 and 180 degrees');
  }

  return result;
};

/**
 * Sanitize input string
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if within range
 */
export const isInRange = (value, min, max) => {
  return value >= min && value <= max;
};