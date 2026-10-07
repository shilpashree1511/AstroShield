import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  AlertTriangle, 
  BarChart3, 
  Activity,
  Radar,
  Target,
  Clock,
  Globe,
  Zap,
  Shield
} from 'lucide-react';
import axios from 'axios';
import Plot from '../components/Common/Plot';
import toast from 'react-hot-toast';

const DebrisMonitoring = () => {
  const [debris, setDebris] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [riskyDebris, setRiskyDebris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebris, setSelectedDebris] = useState(null);
  const [debrisTrend, setDebrisTrend] = useState([]);

  useEffect(() => {
    fetchDebrisData();
    const interval = setInterval(fetchDebrisData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDebrisData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [debrisRes, statsRes, riskyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/debris', { headers }),
        axios.get('http://localhost:5000/api/debris/statistics', { headers }),
        axios.get('http://localhost:5000/api/debris/risky', { headers })
      ]);
      
      setDebris(debrisRes.data);
      setStatistics(statsRes.data);
      setRiskyDebris(riskyRes.data);
      setDebrisTrend(generateDebrisTrend());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching debris data:', error);
      // Set demo data
      setDebris(generateDemoDebris());
      setStatistics({
        total_debris: 25,
        by_size: { small: 15, medium: 7, large: 3 },
        by_risk: { HIGH: 3, MEDIUM: 8, LOW: 14 },
        average_velocity: 7.6,
        total_mass: 1520.5
      });
      setRiskyDebris([]);
      setDebrisTrend(generateDebrisTrend());
      setLoading(false);
    }
  };

  const generateDemoDebris = () => {
    return [
      { debris_id: 'DEBRIS-001', size: 'large', mass: 500, velocity: 7.8, risk_level: 'HIGH', orbit_radius: 6900 },
      { debris_id: 'DEBRIS-002', size: 'medium', mass: 10, velocity: 7.5, risk_level: 'MEDIUM', orbit_radius: 7100 },
      { debris_id: 'DEBRIS-003', size: 'small', mass: 0.1, velocity: 7.6, risk_level: 'LOW', orbit_radius: 7000 }
    ];
  };

  const generateDebrisTrend = () => {
    const dates = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
    const counts = dates.map(() => Math.floor(Math.random() * 50) + 50);
    return { dates, counts };
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'HIGH': return '#ff3333';
      case 'MEDIUM': return '#ffaa00';
      default: return '#00ff88';
    }
  };

  const getSizeIcon = (size) => {
    switch(size) {
      case 'large': return <Trash2 className="text-red-500" />;
      case 'medium': return <Trash2 className="text-yellow-500" />;
      default: return <Trash2 className="text-green-500" />;
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
          <Radar className="text-[#ff6600]" />
          Space Debris Monitoring
        </h1>
        <p className="text-gray-400">
          Real-time tracking of orbital debris and collision risk assessment
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Debris', value: statistics.total_debris || 0, icon: Trash2, color: '#ff6600' },
          { title: 'High Risk', value: statistics.by_risk?.HIGH || 0, icon: AlertTriangle, color: '#ff3333' },
          { title: 'Total Mass', value: `${(statistics.total_mass || 0).toFixed(1)} kg`, icon: Activity, color: '#00ff88' },
          { title: 'Avg Velocity', value: `${statistics.average_velocity || 0} km/s`, icon: Zap, color: '#00ccff' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="text-3xl" style={{ color: stat.color }} />
              <span className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="text-[#ff6600]" />
            Debris Size Distribution
          </h3>
          <Plot
            data={[{
              values: [
                statistics.by_size?.small || 0,
                statistics.by_size?.medium || 0,
                statistics.by_size?.large || 0
              ],
              labels: ['Small (<1kg)', 'Medium (1-100kg)', 'Large (>100kg)'],
              type: 'pie',
              marker: {
                colors: ['#00ff88', '#ffaa00', '#ff3333']
              },
              textinfo: 'label+percent',
              textposition: 'auto'
            }]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#e0e0ff', family: 'Space Mono' },
              height: 400,
              showlegend: true
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-[#00ff88]" />
            Debris Growth Trend
          </h3>
          <Plot
            data={[{
              x: debrisTrend.dates,
              y: debrisTrend.counts,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: '#ff6600', size: 6 },
              line: { color: '#ff6600', width: 2 },
              fill: 'tozeroy',
              fillcolor: 'rgba(255, 102, 0, 0.1)'
            }]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#e0e0ff', family: 'Space Mono' },
              xaxis: { title: 'Time', gridcolor: 'rgba(255,255,255,0.1)' },
              yaxis: { title: 'Number of Debris', gridcolor: 'rgba(255,255,255,0.1)' },
              height: 400,
              margin: { t: 20, r: 20, b: 40, l: 50 }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
      </div>

      {/* Debris List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="text-[#ff6600]" />
          Tracked Debris Objects
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Size</th>
                <th className="text-left py-3 px-4">Mass (kg)</th>
                <th className="text-left py-3 px-4">Velocity (km/s)</th>
                <th className="text-left py-3 px-4">Orbit (km)</th>
                <th className="text-left py-3 px-4">Risk Level</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {debris.map((item, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-gray-700/50 hover:bg-white/5 transition cursor-pointer"
                  onClick={() => setSelectedDebris(item)}
                >
                  <td className="py-3 px-4 font-mono text-sm">{item.debris_id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getSizeIcon(item.size)}
                      <span className="capitalize">{item.size}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{item.mass || 'N/A'}</td>
                  <td className="py-3 px-4">{item.velocity}</td>
                  <td className="py-3 px-4">{item.orbit_radius?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${getRiskColor(item.risk_level)}20`,
                        color: getRiskColor(item.risk_level)
                      }}
                    >
                      {item.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        item.risk_level === 'HIGH' ? 'bg-red-500' : 
                        item.risk_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm">Active</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Debris Details Modal */}
      {selectedDebris && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDebris(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#ff6600]">Debris Details</h3>
              <button onClick={() => setSelectedDebris(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="font-mono">{selectedDebris.debris_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Size:</span>
                <span className="capitalize">{selectedDebris.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mass:</span>
                <span>{selectedDebris.mass || 'N/A'} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Velocity:</span>
                <span>{selectedDebris.velocity} km/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Orbit Radius:</span>
                <span>{selectedDebris.orbit_radius?.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Level:</span>
                <span style={{ color: getRiskColor(selectedDebris.risk_level) }}>{selectedDebris.risk_level}</span>
              </div>
              
              {selectedDebris.risk_level === 'HIGH' && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle />
                    <span className="font-semibold">Warning: High Risk Debris</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    This debris poses significant collision risk. Recommended action: Adjust satellite trajectories to avoid this orbit.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DebrisMonitoring;
