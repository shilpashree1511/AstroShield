/**
 * Formatters - Data formatting utilities for display
 */

import {
  formatAltitude,
  formatDate,
  formatDistance,
  formatPercentage,
  formatRelativeTime,
  formatVelocity,
} from './helpers';
import { CHART_COLORS } from './constants';

/**
 * Format satellite data for display
 * @param {Object} satellite - Raw satellite data
 * @returns {Object} Formatted satellite data
 */
export const formatSatelliteData = (satellite) => {
  return {
    id: satellite.satellite_id || satellite.id,
    name: satellite.name,
    altitude: formatAltitude(satellite.altitude),
    speed: formatVelocity(satellite.speed),
    orbitRadius: formatDistance(satellite.orbit_radius),
    inclination: `${satellite.inclination?.toFixed(1)}°`,
    position: satellite.position ? {
      x: satellite.position.x?.toFixed(2),
      y: satellite.position.y?.toFixed(2),
      z: satellite.position.z?.toFixed(2),
      latitude: satellite.position.latitude?.toFixed(2),
      longitude: satellite.position.longitude?.toFixed(2),
    } : null,
    riskLevel: satellite.collision_risk ? {
      level: getRiskLevel(satellite.collision_risk),
      percentage: formatPercentage(satellite.collision_risk),
    } : null,
    color: satellite.color,
  };
};

/**
 * Format debris data for display
 * @param {Object} debris - Raw debris data
 * @returns {Object} Formatted debris data
 */
export const formatDebrisData = (debris) => {
  return {
    id: debris.debris_id,
    size: debris.size,
    mass: debris.mass ? `${debris.mass.toFixed(1)} kg` : 'N/A',
    velocity: formatVelocity(debris.velocity),
    orbitRadius: formatDistance(debris.orbit_radius),
    riskLevel: debris.risk_level,
    position: debris.position ? {
      latitude: debris.position.latitude?.toFixed(2),
      longitude: debris.position.longitude?.toFixed(2),
    } : null,
  };
};

/**
 * Format alert data for display
 * @param {Object} alert - Raw alert data
 * @returns {Object} Formatted alert data
 */
export const formatAlertData = (alert) => {
  return {
    id: alert.id,
    objects: `${alert.object1} ↔ ${alert.object2}`,
    riskLevel: alert.risk_level,
    probability: formatPercentage(alert.risk_probability || alert.probability),
    distance: formatDistance(alert.distance),
    recommendation: alert.recommendation,
    timestamp: formatRelativeTime(alert.timestamp),
    fullTimestamp: formatDate(alert.timestamp),
  };
};

/**
 * Format analytics data for charts
 * @param {Object} analytics - Raw analytics data
 * @returns {Object} Formatted analytics data
 */
export const formatAnalyticsData = (analytics) => {
  return {
    total: analytics.total_satellites || 0,
    byOrbit: {
      leo: analytics.low_earth_orbit || 0,
      meo: analytics.medium_earth_orbit || 0,
      geo: analytics.geostationary || 0,
    },
    averageSpeed: analytics.average_speed?.toFixed(2) || 0,
    atRisk: analytics.satellites_at_risk || 0,
    riskPercentage: analytics.satellites_at_risk 
      ? ((analytics.satellites_at_risk / analytics.total_satellites) * 100).toFixed(1)
      : 0,
  };
};

/**
 * Format chart data for Plotly
 * @param {Array} data - Raw data
 * @param {string} type - Chart type
 * @returns {Object} Formatted chart data
 */
export const formatChartData = (data, type = 'line') => {
  const commonConfig = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e0e0ff', family: 'Space Mono' },
    xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
    yaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
  };

  switch (type) {
    case 'line':
      return {
        data: [{
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: CHART_COLORS.primary, size: 6 },
          line: { color: CHART_COLORS.primary, width: 2 },
          fill: 'tozeroy',
          fillcolor: 'rgba(0, 255, 136, 0.1)',
        }],
        layout: commonConfig,
      };
    case 'bar':
      return {
        data: [{
          type: 'bar',
          marker: { color: CHART_COLORS.primary, opacity: 0.8 },
        }],
        layout: commonConfig,
      };
    case 'pie':
      return {
        data: [{
          type: 'pie',
          marker: { colors: Object.values(CHART_COLORS) },
          textinfo: 'label+percent',
          textposition: 'auto',
        }],
        layout: commonConfig,
      };
    default:
      return { data: [], layout: commonConfig };
  }
};

// Helper function to get risk level
const getRiskLevel = (probability) => {
  if (probability > 0.7) return 'HIGH';
  if (probability > 0.3) return 'MEDIUM';
  return 'LOW';
};

// Re-export formatters from helpers
export { formatNumber, formatDistance, formatDuration, formatDate, formatRelativeTime, formatVelocity, formatAltitude, formatPercentage } from './helpers';
