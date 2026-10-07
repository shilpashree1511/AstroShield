/**
 * Storage Service - Local storage management
 * Handles persistent data storage for user preferences and cache
 */

class StorageService {
  constructor() {
    this.prefix = 'space_traffic_';
    this.cacheExpiry = 3600000; // 1 hour default cache expiry
  }

  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @param {boolean} checkExpiry - Check if item has expired
   * @returns {any} Stored value or null
   */
  get(key, checkExpiry = true) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) return null;
      
      const data = JSON.parse(item);
      
      if (checkExpiry && data.expiry && Date.now() > data.expiry) {
        this.remove(key);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = null) {
    try {
      const fullKey = this.prefix + key;
      const data = {
        value,
        timestamp: Date.now(),
      };
      
      if (ttl) {
        data.expiry = Date.now() + ttl;
      }
      
      localStorage.setItem(fullKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   */
  remove(key) {
    const fullKey = this.prefix + key;
    localStorage.removeItem(fullKey);
  }

  /**
   * Clear all items with prefix
   */
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Check if key exists
   * @param {string} key - Storage key
   * @returns {boolean} True if exists
   */
  has(key) {
    const fullKey = this.prefix + key;
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * Get all keys
   * @returns {Array} List of keys
   */
  keys() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.substring(this.prefix.length));
  }

  /**
   * Get storage size
   * @returns {number} Size in bytes
   */
  getSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * Cache API response
   * @param {string} endpoint - API endpoint
   * @param {any} data - Response data
   * @param {number} ttl - Cache duration
   */
  cacheAPIResponse(endpoint, data, ttl = this.cacheExpiry) {
    this.set(`api_${endpoint}`, data, ttl);
  }

  /**
   * Get cached API response
   * @param {string} endpoint - API endpoint
   * @returns {any} Cached data or null
   */
  getCachedAPIResponse(endpoint) {
    return this.get(`api_${endpoint}`);
  }

  /**
   * Clear API cache
   */
  clearAPICache() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix + 'api_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Save user preferences
   * @param {Object} preferences - User preferences
   */
  saveUserPreferences(preferences) {
    this.set('user_preferences', preferences);
  }

  /**
   * Get user preferences
   * @returns {Object} User preferences
   */
  getUserPreferences() {
    return this.get('user_preferences') || {};
  }

  /**
   * Save theme preference
   * @param {string} theme - Theme name
   */
  saveTheme(theme) {
    this.set('theme', theme);
  }

  /**
   * Get theme preference
   * @returns {string} Theme name
   */
  getTheme() {
    return this.get('theme') || 'dark';
  }

  /**
   * Save view settings
   * @param {string} page - Page name
   * @param {Object} settings - View settings
   */
  saveViewSettings(page, settings) {
    const allSettings = this.get('view_settings') || {};
    allSettings[page] = settings;
    this.set('view_settings', allSettings);
  }

  /**
   * Get view settings
   * @param {string} page - Page name
   * @returns {Object} View settings
   */
  getViewSettings(page) {
    const allSettings = this.get('view_settings') || {};
    return allSettings[page] || {};
  }
}

export const storageService = new StorageService();
export default storageService;