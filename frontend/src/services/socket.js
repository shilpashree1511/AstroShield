/**
 * WebSocket Service for Real-time Communication
 * Handles live data streaming for satellite positions and alerts
 */

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
    this.reconnectTimer = null;
    this.heartbeatInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  /**
   * Initialize WebSocket connection
   */
  init() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, skipping WebSocket connection');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_HOST || window.location.host;
    const wsUrl = `${protocol}//${host}/ws?token=${token}`;

    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  /**
   * Setup WebSocket event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connection_status', { connected: true });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('connection_status', { connected: false });
      this.handleReconnect();
    };
  }

  /**
   * Handle incoming messages
   * @param {Object} message - Message object
   */
  handleMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case 'satellite_update':
        this.emit('satellite_update', data);
        break;
      case 'debris_update':
        this.emit('debris_update', data);
        break;
      case 'alert':
        this.emit('new_alert', data);
        break;
      case 'collision_risk':
        this.emit('collision_risk', data);
        break;
      case 'simulation_state':
        this.emit('simulation_state', data);
        break;
      case 'pong':
        this.emit('pong', data);
        break;
      default:
        this.emit(type, data);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle reconnection
   */
  handleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++;
        this.init();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts', { attempts: this.reconnectAttempts });
    }
  }

  /**
   * Send message through WebSocket
   * @param {string} type - Message type
   * @param {any} data - Message data
   */
  send(type, data) {
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, unable to send message');
    }
  }

  /**
   * Subscribe to event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
    
    // Return unsubscribe function
    return () => this.unsubscribe(event, handler);
  }

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler to remove
   */
  unsubscribe(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  /**
   * Emit event to subscribers
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Request satellite positions update
   */
  requestSatelliteUpdate() {
    this.send('request_satellites', {});
  }

  /**
   * Request debris update
   */
  requestDebrisUpdate() {
    this.send('request_debris', {});
  }

  /**
   * Request alerts
   */
  requestAlerts() {
    this.send('request_alerts', {});
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;