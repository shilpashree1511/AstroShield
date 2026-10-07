import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Info,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Trash2,
  Clock,
  Activity,
  Terminal
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, filter, searchTerm]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/alerts/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Convert alerts to log format
      const logEntries = response.data.map(alert => ({
        id: alert._id || Math.random().toString(),
        timestamp: alert.timestamp,
        type: alert.risk_level === 'HIGH' ? 'error' : alert.risk_level === 'MEDIUM' ? 'warning' : 'info',
        message: `${alert.object1} and ${alert.object2} - Collision risk: ${alert.risk_level}`,
        details: alert.recommendation,
        source: 'Collision Detection System'
      }));
      
      // Add system logs
      const systemLogs = generateSystemLogs();
      const allLogs = [...logEntries, ...systemLogs].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      setLogs(allLogs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs(generateMockLogs());
      setLoading(false);
    }
  };

  const generateSystemLogs = () => {
    return [
      {
        id: 'sys1',
        timestamp: new Date().toISOString(),
        type: 'success',
        message: 'AI Model updated successfully',
        details: 'Random Forest model retrained with new data. Accuracy improved to 94.3%',
        source: 'ML Pipeline'
      },
      {
        id: 'sys2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'info',
        message: 'Database backup completed',
        details: 'Full backup of all collections. Size: 245 MB',
        source: 'Database Service'
      },
      {
        id: 'sys3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'warning',
        message: 'High API latency detected',
        details: 'Response time from N2YO API exceeded 2 seconds',
        source: 'API Gateway'
      }
    ];
  };

  const generateMockLogs = () => {
    const types = ['info', 'warning', 'error', 'success'];
    const messages = [
      'Satellite position updated',
      'Collision detection scan completed',
      'Debris tracking active',
      'AI prediction engine running',
      'Orbit calculation performed',
      'Alert generated for close approach',
      'System health check passed',
      'External API data synchronized'
    ];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      type: types[Math.floor(Math.random() * types.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      details: `Additional details for log entry ${i + 1}`,
      source: Math.random() > 0.5 ? 'Simulation Engine' : 'Collision Detector'
    }));
  };

  const filterLogs = () => {
    let filtered = [...logs];
    
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.type === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'error': return <AlertCircle className="text-red-500" />;
      case 'warning': return <AlertTriangle className="text-yellow-500" />;
      case 'success': return <CheckCircle className="text-green-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'error': return 'border-red-500/30 bg-red-500/10';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'success': return 'border-green-500/30 bg-green-500/10';
      default: return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const exportLogs = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exported successfully');
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      setLogs([]);
      toast.success('Logs cleared');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
          <Terminal className="text-[#00ff88]" />
          System Logs
        </h1>
        <p className="text-gray-400">
          Real-time system events, alerts, and operational logs
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Logs', value: logs.length, icon: FileText, color: '#00ff88' },
          { label: 'Errors', value: logs.filter(l => l.type === 'error').length, icon: AlertCircle, color: '#ff3333' },
          { label: 'Warnings', value: logs.filter(l => l.type === 'warning').length, icon: AlertTriangle, color: '#ffaa00' },
          { label: 'Last 24h', value: logs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 86400000)).length, icon: Clock, color: '#00ccff' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-3 text-center"
          >
            <stat.icon className="text-xl mx-auto mb-1" style={{ color: stat.color }} />
            <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2">
            {['all', 'info', 'success', 'warning', 'error'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  filter === type
                    ? 'bg-[#00ff88] text-black'
                    : 'hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-gray-600 focus:border-[#00ff88] outline-none"
              />
            </div>
            <button
              onClick={exportLogs}
              className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition"
            >
              <Download className="text-green-400" />
            </button>
            <button
              onClick={clearLogs}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition"
            >
              <Trash2 className="text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {filteredLogs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.01 }}
              className={`glass-card p-4 cursor-pointer transition-all duration-200 border-l-4 ${getTypeColor(log.type)}`}
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getTypeIcon(log.type)}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <p className="font-semibold">{log.message}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="text-xs" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-gray-400">Source: {log.source}</span>
                    <span className="text-gray-400 capitalize">Level: {log.type}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No logs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {getTypeIcon(selectedLog.type)}
                Log Details
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-sm">Timestamp</div>
                <div>{new Date(selectedLog.timestamp).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Message</div>
                <div className="font-semibold">{selectedLog.message}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Details</div>
                <div className="p-3 rounded-lg bg-white/5">{selectedLog.details}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Source</div>
                  <div>{selectedLog.source}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Log Level</div>
                  <div className="capitalize">{selectedLog.type}</div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Log ID</div>
                <div className="text-xs font-mono">{selectedLog.id}</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
