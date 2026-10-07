/**
 * API Service - Centralized API communication layer
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION SERVICES ====================

export const authService = {
  /**
   * User login
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} Login response with token
   */
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * User registration
   * @param {Object} userData - User registration data
   * @returns {Promise} Registration response
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * User logout
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Update response
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Password change response
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Refresh access token
   * @returns {Promise} New access token
   */
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Get current user
   * @returns {Object|null} Current user or null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// ==================== SATELLITE SERVICES ====================

export const satelliteService = {
  /**
   * Get all satellites
   * @returns {Promise} List of satellites
   */
  getAllSatellites: async () => {
    const response = await apiClient.get('/satellites');
    return response.data;
  },

  /**
   * Get satellite by ID
   * @param {string} satelliteId - Satellite ID
   * @returns {Promise} Satellite data
   */
  getSatelliteById: async (satelliteId) => {
    const response = await apiClient.get(`/satellites/${satelliteId}`);
    return response.data;
  },

  /**
   * Get satellite analytics
   * @returns {Promise} Analytics data
   */
  getAnalytics: async () => {
    const response = await apiClient.get('/satellites/analytics');
    return response.data;
  },

  /**
   * Create new satellite (admin only)
   * @param {Object} satelliteData - Satellite data
   * @returns {Promise} Creation response
   */
  createSatellite: async (satelliteData) => {
    const response = await apiClient.post('/satellites', satelliteData);
    return response.data;
  },

  /**
   * Update satellite (admin only)
   * @param {string} satelliteId - Satellite ID
   * @param {Object} satelliteData - Updated data
   * @returns {Promise} Update response
   */
  updateSatellite: async (satelliteId, satelliteData) => {
    const response = await apiClient.put(`/satellites/${satelliteId}`, satelliteData);
    return response.data;
  },

  /**
   * Delete satellite (admin only)
   * @param {string} satelliteId - Satellite ID
   * @returns {Promise} Deletion response
   */
  deleteSatellite: async (satelliteId) => {
    const response = await apiClient.delete(`/satellites/${satelliteId}`);
    return response.data;
  },

  /**
   * Get satellite trajectory
   * @param {string} satelliteId - Satellite ID
   * @param {number} duration - Duration in seconds
   * @returns {Promise} Trajectory data
   */
  getTrajectory: async (satelliteId, duration = 3600) => {
    const response = await apiClient.get(`/satellites/${satelliteId}/trajectory`, {
      params: { duration },
    });
    return response.data;
  },
};

// ==================== DEBRIS SERVICES ====================

export const debrisService = {
  /**
   * Get all debris
   * @returns {Promise} List of debris
   */
  getAllDebris: async () => {
    const response = await apiClient.get('/debris');
    return response.data;
  },

  /**
   * Get debris statistics
   * @returns {Promise} Statistics data
   */
  getStatistics: async () => {
    const response = await apiClient.get('/debris/statistics');
    return response.data;
  },

  /**
   * Get risky debris (HIGH risk)
   * @returns {Promise} List of risky debris
   */
  getRiskyDebris: async () => {
    const response = await apiClient.get('/debris/risky');
    return response.data;
  },

  /**
   * Add new debris (admin only)
   * @param {Object} debrisData - Debris data
   * @returns {Promise} Creation response
   */
  addDebris: async (debrisData) => {
    const response = await apiClient.post('/debris', debrisData);
    return response.data;
  },

  /**
   * Simulate debris generation
   * @param {Object} simulationData - Simulation parameters
   * @returns {Promise} Simulation response
   */
  simulateDebrisGeneration: async (simulationData) => {
    const response = await apiClient.post('/debris/simulate', simulationData);
    return response.data;
  },
};

// ==================== ALERT SERVICES ====================

export const alertService = {
  /**
   * Get all alerts
   * @param {number} limit - Maximum number of alerts
   * @returns {Promise} List of alerts
   */
  getAllAlerts: async (limit = 50) => {
    const response = await apiClient.get('/alerts', { params: { limit } });
    return response.data;
  },

  /**
   * Get active alerts (last hour)
   * @returns {Promise} List of active alerts
   */
  getActiveAlerts: async () => {
    const response = await apiClient.get('/alerts/active');
    return response.data;
  },

  /**
   * Get alert statistics
   * @returns {Promise} Statistics data
   */
  getStatistics: async () => {
    const response = await apiClient.get('/alerts/statistics');
    return response.data;
  },

  /**
   * Clear old alerts
   * @param {number} olderThanHours - Clear alerts older than this many hours
   * @returns {Promise} Clear response
   */
  clearAlerts: async (olderThanHours = 24) => {
    const response = await apiClient.post('/alerts/clear', { older_than_hours: olderThanHours });
    return response.data;
  },
};

// ==================== SIMULATION SERVICES ====================

export const simulationService = {
  /**
   * Start simulation
   * @returns {Promise} Start response
   */
  startSimulation: async () => {
    const response = await apiClient.post('/simulation/start');
    return response.data;
  },

  /**
   * Stop simulation
   * @returns {Promise} Stop response
   */
  stopSimulation: async () => {
    const response = await apiClient.post('/simulation/stop');
    return response.data;
  },

  /**
   * Get simulation state
   * @returns {Promise} Current simulation state
   */
  getState: async () => {
    const response = await apiClient.get('/simulation/state');
    return response.data;
  },

  /**
   * Set simulation speed
   * @param {number} speed - Simulation speed multiplier
   * @returns {Promise} Speed update response
   */
  setSpeed: async (speed) => {
    const response = await apiClient.post('/simulation/speed', { speed });
    return response.data;
  },
};

// ==================== AI PREDICTION SERVICES ====================

export const aiService = {
  /**
   * Get collision predictions
   * @returns {Promise} Prediction results
   */
  getPredictions: async () => {
    const response = await apiClient.get('/ai/predictions');
    return response.data;
  },

  /**
   * Get model performance metrics
   * @returns {Promise} Performance metrics
   */
  getModelMetrics: async () => {
    const response = await apiClient.get('/ai/metrics');
    return response.data;
  },

  /**
   * Retrain AI models
   * @returns {Promise} Training response
   */
  retrainModels: async () => {
    const response = await apiClient.post('/ai/retrain');
    return response.data;
  },

  /**
   * Get feature importance
   * @returns {Promise} Feature importance data
   */
  getFeatureImportance: async () => {
    const response = await apiClient.get('/ai/features');
    return response.data;
  },
};

// ==================== EXTERNAL API SERVICES ====================

export const externalApiService = {
  /**
   * Get TLE data from CelesTrak
   * @param {string} satelliteId - NORAD satellite ID
   * @returns {Promise} TLE data
   */
  getTLEData: async (satelliteId) => {
    const response = await apiClient.get(`/external/tle/${satelliteId}`);
    return response.data;
  },

  /**
   * Get satellite positions from N2YO
   * @param {string} satelliteId - NORAD satellite ID
   * @param {Object} observer - Observer coordinates
   * @returns {Promise} Position data
   */
  getSatellitePositions: async (satelliteId, observer = { lat: 0, lng: 0, alt: 0 }) => {
    const response = await apiClient.get(`/external/positions/${satelliteId}`, { params: observer });
    return response.data;
  },

  /**
   * Get Near Earth Objects from NASA
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} NEO data
   */
  getNearEarthObjects: async (startDate, endDate) => {
    const response = await apiClient.get('/external/neo', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  /**
   * Get constellation data
   * @param {string} constellationName - Constellation name
   * @returns {Promise} Constellation data
   */
  getConstellationData: async (constellationName) => {
    const response = await apiClient.get(`/external/constellation/${constellationName}`);
    return response.data;
  },
};

// ==================== REPORT SERVICES ====================

export const reportService = {
  /**
   * Generate collision report
   * @param {Object} params - Report parameters
   * @returns {Promise} Report data
   */
  generateCollisionReport: async (params) => {
    const response = await apiClient.post('/reports/collision', params);
    return response.data;
  },

  /**
   * Generate system health report
   * @returns {Promise} Health report
   */
  generateHealthReport: async () => {
    const response = await apiClient.get('/reports/health');
    return response.data;
  },

  /**
   * Export report as PDF
   * @param {string} reportId - Report ID
   * @returns {Promise} PDF blob
   */
  exportPDF: async (reportId) => {
    const response = await apiClient.get(`/reports/${reportId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ==================== WEBSOCKET SERVICE (for real-time updates) ====================

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    const token = localStorage.getItem('token');
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
    
    this.socket = new WebSocket(`${wsUrl}?token=${token}`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: new Date().toISOString() });
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { event: eventName, payload } = data;
      this.emit(eventName, payload);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };
  }

  /**
   * Reconnect WebSocket
   */
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectDelay);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send message through WebSocket
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  send(event, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }

  /**
   * Subscribe to event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to subscribers
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

export const wsService = new WebSocketService();

// Default export
export default apiClient;