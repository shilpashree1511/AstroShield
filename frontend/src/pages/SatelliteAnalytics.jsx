import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartLine, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Globe,
  Clock,
  BarChart4,
  PieChart,
  Map,
  Calendar,
  Zap,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import Plot from '../components/Common/Plot';
import toast from 'react-hot-toast';

const SatelliteAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    total_satellites: 0,
    low_earth_orbit: 0,
    medium_earth_orbit: 0,
    geostationary: 0,
    average_speed: 0,
    satellites_at_risk: 0
  });
  const [orbitalData, setOrbitalData] = useState([]);
  const [speedDistribution, setSpeedDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/satellites/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAnalytics(response.data);
      generateCharts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set demo data
      setAnalytics({
        total_satellites: 1247,
        low_earth_orbit: 892,
        medium_earth_orbit: 245,
        geostationary: 110,
        average_speed: 7.42,
        satellites_at_risk: 23
      });
      generateCharts({
        total_satellites: 1247,
        low_earth_orbit: 892,
        medium_earth_orbit: 245,
        geostationary: 110,
        average_speed: 7.42,
        satellites_at_risk: 23
      });
      setLoading(false);
    }
  };

  const generateCharts = (source = analytics) => {
    // Orbital distribution data
    setOrbitalData([
      { name: 'LEO', value: source.low_earth_orbit, color: '#00ff88' },
      { name: 'MEO', value: source.medium_earth_orbit, color: '#00ccff' },
      { name: 'GEO', value: source.geostationary, color: '#ff00ff' }
    ]);
    
    // Speed distribution data
    setSpeedDistribution({
      bins: ['<7.0', '7.0-7.5', '7.5-8.0', '>8.0'],
      counts: [124, 456, 389, 278]
    });
  };

  const getRiskColor = (risk) => {
    if (risk > 0.5) return '#ff3333';
    if (risk > 0.2) return '#ffaa00';
    return '#00ff88';
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
          <ChartLine className="text-[#00ff88]" />
          Satellite Analytics
        </h1>
        <p className="text-gray-400">
          Comprehensive analytics and insights for satellite operations
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Satellites', value: analytics.total_satellites, icon: Globe, color: '#00ff88' },
          { label: 'LEO Satellites', value: analytics.low_earth_orbit, icon: TrendingUp, color: '#00ccff' },
          { label: 'MEO Satellites', value: analytics.medium_earth_orbit, icon: Activity, color: '#ffaa00' },
          { label: 'GEO Satellites', value: analytics.geostationary, icon: Map, color: '#ff00ff' },
          { label: 'Avg Speed', value: `${analytics.average_speed.toFixed(2)} km/s`, icon: Zap, color: '#00ff88' },
          { label: 'At Risk', value: analytics.satellites_at_risk, icon: TrendingDown, color: '#ff3333' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-4 text-center"
          >
            <stat.icon className="text-2xl mx-auto mb-2" style={{ color: stat.color }} />
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orbital Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PieChart className="text-[#00ff88]" />
            Orbital Distribution
          </h3>
          <Plot
            data={[{
              values: orbitalData.map(d => d.value),
              labels: orbitalData.map(d => d.name),
              type: 'pie',
              marker: {
                colors: orbitalData.map(d => d.color)
              },
              textinfo: 'label+percent',
              textposition: 'auto',
              hoverinfo: 'label+value'
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
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>LEO: Low Earth Orbit (200-2000km) | MEO: Medium Earth Orbit (2000-35786km) | GEO: Geostationary (35786km)</p>
          </div>
        </motion.div>

        {/* Speed Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart4 className="text-[#00ccff]" />
            Speed Distribution
          </h3>
          <Plot
            data={[{
              x: speedDistribution.bins,
              y: speedDistribution.counts,
              type: 'bar',
              marker: {
                color: '#00ccff',
                opacity: 0.8,
                line: { color: '#00ccff', width: 1 }
              }
            }]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#e0e0ff', family: 'Space Mono' },
              xaxis: { title: 'Speed Range (km/s)', gridcolor: 'rgba(255,255,255,0.1)' },
              yaxis: { title: 'Number of Satellites', gridcolor: 'rgba(255,255,255,0.1)' },
              height: 400,
              bargap: 0.2
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>

        {/* Altitude vs Speed Correlation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-[#ffaa00]" />
            Altitude vs Speed Correlation
          </h3>
          <Plot
            data={[{
              x: [408, 547, 705, 20200, 35786],
              y: [7.66, 7.55, 7.52, 3.87, 3.07],
              mode: 'markers',
              type: 'scatter',
              marker: {
                size: 15,
                color: '#ffaa00',
                symbol: 'circle',
                line: { color: '#ffffff', width: 2 }
              },
              text: ['ISS', 'HST', 'Terra', 'GPS', 'GOES'],
              textposition: 'top center'
            }]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#e0e0ff', family: 'Space Mono' },
              xaxis: { title: 'Altitude (km)', type: 'log', gridcolor: 'rgba(255,255,255,0.1)' },
              yaxis: { title: 'Orbital Speed (km/s)', gridcolor: 'rgba(255,255,255,0.1)' },
              height: 400,
              title: 'Higher altitude = Lower orbital speed'
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>

        {/* Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Risk Assessment
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Collision Risk Index</span>
                <span className="text-yellow-500">MEDIUM</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-[45%] bg-yellow-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Debris Congestion</span>
                <span className="text-orange-500">HIGH</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>AI Prediction Confidence</span>
                <span className="text-green-500">HIGH</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-[94%] bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-white/5">
            <h4 className="font-semibold mb-2">Recommendations</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• LEO region is highly congested - consider higher orbits for new satellites</li>
              <li>• 23 satellites currently at risk - monitor closely</li>
              <li>• Debris mitigation maneuvers recommended for 3 high-risk objects</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end mt-6">
        <div className="glass-card p-1 flex gap-1">
          {['24h', '7d', '30d', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-[#00ff88] text-black'
                  : 'hover:bg-white/10'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SatelliteAnalytics;
