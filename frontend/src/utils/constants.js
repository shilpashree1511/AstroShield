/**
 * Constants - Application-wide constants
 */

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  SATELLITES: {
    BASE: '/satellites',
    ANALYTICS: '/satellites/analytics',
    TRAJECTORY: '/satellites/:id/trajectory',
  },
  DEBRIS: {
    BASE: '/debris',
    STATISTICS: '/debris/statistics',
    RISKY: '/debris/risky',
  },
  ALERTS: {
    BASE: '/alerts',
    ACTIVE: '/alerts/active',
    STATISTICS: '/alerts/statistics',
  },
  SIMULATION: {
    START: '/simulation/start',
    STOP: '/simulation/stop',
    STATE: '/simulation/state',
  },
  AI: {
    PREDICTIONS: '/ai/predictions',
    METRICS: '/ai/metrics',
    RETRAIN: '/ai/retrain',
  },
};

// Risk levels
export const RISK_LEVELS = {
  HIGH: { value: 'HIGH', color: '#ff3333', priority: 3 },
  MEDIUM: { value: 'MEDIUM', color: '#ffaa00', priority: 2 },
  LOW: { value: 'LOW', color: '#00ff88', priority: 1 },
};

// Satellite orbit types
export const ORBIT_TYPES = {
  LEO: { name: 'Low Earth Orbit', altitude: '200-2,000 km', color: '#00ff88' },
  MEO: { name: 'Medium Earth Orbit', altitude: '2,000-35,786 km', color: '#00ccff' },
  GEO: { name: 'Geostationary Orbit', altitude: '35,786 km', color: '#ff00ff' },
  HEO: { name: 'High Earth Orbit', altitude: '>35,786 km', color: '#ffaa00' },
};

// Debris sizes
export const DEBRIS_SIZES = {
  SMALL: { name: 'Small', mass: '<1 kg', risk: 1, color: '#00ff88' },
  MEDIUM: { name: 'Medium', mass: '1-100 kg', risk: 2, color: '#ffaa00' },
  LARGE: { name: 'Large', mass: '>100 kg', risk: 3, color: '#ff3333' },
};

// Alert types
export const ALERT_TYPES = {
  COLLISION: { name: 'Collision Alert', icon: 'alert-triangle', color: '#ff3333' },
  APPROACH: { name: 'Close Approach', icon: 'alert-circle', color: '#ffaa00' },
  INFO: { name: 'Information', icon: 'info', color: '#00ccff' },
  SUCCESS: { name: 'Success', icon: 'check-circle', color: '#00ff88' },
};

// Simulation speeds
export const SIMULATION_SPEEDS = {
  SLOW: { multiplier: 0.5, label: '0.5x' },
  NORMAL: { multiplier: 1.0, label: '1x' },
  FAST: { multiplier: 2.0, label: '2x' },
  VERY_FAST: { multiplier: 5.0, label: '5x' },
};

// Chart colors
export const CHART_COLORS = {
  primary: '#00ff88',
  secondary: '#00ccff',
  tertiary: '#ff00ff',
  warning: '#ffaa00',
  danger: '#ff3333',
  success: '#00ff88',
  info: '#00ccff',
};

// Default map settings
export const DEFAULT_MAP_SETTINGS = {
  center: [0, 0],
  zoom: 2,
  pitch: 30,
  bearing: 0,
};

// Default simulation settings
export const DEFAULT_SIMULATION_SETTINGS = {
  fps: 60,
  deltaTime: 0.016,
  maxSatellites: 100,
  maxDebris: 50,
  collisionThreshold: 10, // km
  warningThreshold: 50, // km
};

// Time ranges for analytics
export const TIME_RANGES = {
  HOUR: { label: '1 Hour', seconds: 3600 },
  DAY: { label: '24 Hours', seconds: 86400 },
  WEEK: { label: '7 Days', seconds: 604800 },
  MONTH: { label: '30 Days', seconds: 2592000 },
  YEAR: { label: '1 Year', seconds: 31536000 },
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  PREFERENCES: 'user_preferences',
  VIEW_SETTINGS: 'view_settings',
  CACHE_PREFIX: 'cache_',
};

// WebSocket events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  SATELLITE_UPDATE: 'satellite_update',
  DEBRIS_UPDATE: 'debris_update',
  ALERT: 'alert',
  COLLISION_RISK: 'collision_risk',
  SIMULATION_STATE: 'simulation_state',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized access. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};