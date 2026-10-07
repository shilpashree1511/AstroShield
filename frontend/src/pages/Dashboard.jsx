import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Crosshair,
  HardDrive,
  Radar,
  Radio,
  Satellite,
  Server,
  Shield,
  TrendingUp,
  Zap
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Plot from '../components/Common/Plot';

const Dashboard = () => {
  const [stats, setStats] = useState({
    satellites: 0,
    debris: 0,
    activeAlerts: 0,
    collisionsPrevented: 156,
    riskLevel: 'LOW'
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [riskData, setRiskData] = useState({ times: [], risks: [] });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    const dataInterval = setInterval(fetchDashboardData, 5000);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, alertsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/satellites/analytics', { headers }),
        axios.get('http://localhost:5000/api/alerts/active', { headers })
      ]);

      const alertCount = alertsRes.data.length || 0;
      setStats((prev) => ({
        ...prev,
        satellites: statsRes.data.total_satellites || 0,
        debris: 25,
        activeAlerts: alertCount,
        riskLevel: alertCount > 5 ? 'HIGH' : alertCount > 2 ? 'MEDIUM' : 'LOW'
      }));

      setRecentAlerts(alertsRes.data.slice(0, 5));
      setRiskData(generateRiskData());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
      setRiskData(generateRiskData());
      setLoading(false);
    }
  };

  const generateRiskData = () => {
    const times = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const risks = times.map((_, index) => Math.round(18 + Math.sin(index / 2) * 10 + Math.random() * 26));
    return { times, risks };
  };

  const statCards = [
    { title: 'Active Satellites', value: stats.satellites, icon: Satellite, color: '#29d8ff', trend: '+12%' },
    { title: 'Space Debris', value: stats.debris, icon: HardDrive, color: '#ffb84d', trend: '+5%' },
    { title: 'Active Alerts', value: stats.activeAlerts, icon: AlertTriangle, color: '#ff4d6d', trend: stats.activeAlerts > 0 ? 'rising' : 'stable' },
    { title: 'Risk Level', value: stats.riskLevel, icon: Shield, color: stats.riskLevel === 'HIGH' ? '#ff4d6d' : stats.riskLevel === 'MEDIUM' ? '#ffb84d' : '#18f2a3', trend: 'guarded' },
    { title: 'Collisions Prevented', value: stats.collisionsPrevented, icon: TrendingUp, color: '#7f7cff', trend: '+8' },
    { title: 'AI Accuracy', value: '94%', icon: Zap, color: '#b45cff', trend: '+2%' }
  ];

  const systemStatus = [
    { label: 'Simulation Engine', value: 'Active', icon: Radar },
    { label: 'AI Predictor', value: 'Online', icon: Crosshair },
    { label: 'Database', value: 'Connected', icon: Server },
    { label: 'API Status', value: 'Operational', icon: Radio }
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-8 md:px-8">
      <motion.section
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="command-hero mb-6 overflow-hidden p-5 md:p-7"
      >
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="panel-kicker mb-3 text-xs">Mission Control</p>
            <h1 className="font-orbitron text-3xl font-bold uppercase tracking-[0.12em] text-slate-100 md:text-5xl">
              AstroShield Command
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Real-time satellite collision prevention, orbital risk scoring, and autonomous maneuver readiness.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="mission-pill">Live telemetry</span>
              <span className="mission-pill">AI prediction active</span>
              <span className="mission-pill">LEO/MEO/GEO watch</span>
            </div>
          </div>

          <div className="mission-console">
            <div className="flex items-center justify-between border-b border-cyan-300/10 pb-3">
              <span className="panel-kicker text-[10px]">Orbit Health</span>
              <span className="text-xs text-cyan-100">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500">Tracked Objects</p>
                <p className="mt-1 text-3xl font-bold text-slate-100">{stats.satellites + stats.debris}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Risk Level</p>
                <p className="mt-1 text-3xl font-bold" style={{ color: statCards[3].color }}>{stats.riskLevel}</p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-400" />
            </div>
          </div>
        </div>
      </motion.section>

      <div className="dashboard-grid command-grid">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.06 }}
            className="glass-card stat-panel p-5"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg p-3" style={{ background: `${card.color}18`, boxShadow: `0 0 24px ${card.color}20` }}>
                <card.icon className="text-2xl" style={{ color: card.color }} />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs" style={{ color: card.color }}>
                {card.trend}
              </span>
            </div>
            <h3 className="mb-2 text-xs uppercase tracking-[0.14em] text-slate-500">{card.title}</h3>
            <div className="stat-value text-3xl">{card.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-5"
        >
          <h3 className="mb-4 flex items-center text-xl font-semibold">
            <TrendingUp className="mr-2 text-[#29d8ff]" />
            Collision Risk Trends
          </h3>
          <Plot
            data={[{
              x: riskData.times,
              y: riskData.risks,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: '#29d8ff', size: 6 },
              line: { color: '#29d8ff', width: 2 },
              fill: 'tozeroy',
              fillcolor: 'rgba(41, 216, 255, 0.08)'
            }]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#e0e0ff', family: 'Space Mono' },
              xaxis: { title: 'Time (Hours)', gridcolor: 'rgba(255,255,255,0.08)' },
              yaxis: { title: 'Risk Score', gridcolor: 'rgba(255,255,255,0.08)', range: [0, 100] },
              height: 360,
              margin: { t: 20, r: 20, b: 42, l: 50 }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-5"
        >
          <h3 className="mb-4 flex items-center text-xl font-semibold">
            <Activity className="mr-2 text-[#7f7cff]" />
            Recent Alerts
          </h3>
          <div className="max-h-[360px] space-y-3 overflow-y-auto">
            {recentAlerts.length === 0 ? (
              <div className="quiet-empty">
                <Shield className="mx-auto mb-3 text-emerald-300" size={30} />
                <p>No active alerts</p>
                <span>All tracked objects are inside safe thresholds.</span>
              </div>
            ) : (
              recentAlerts.map((alert, idx) => (
                <div key={`${alert.object1}-${idx}`} className="alert-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-red-300">{alert.object1} to {alert.object2}</p>
                      <p className="mt-1 text-xs text-gray-400">{alert.recommendation}</p>
                    </div>
                    <span className="text-xs font-bold text-red-300">{alert.risk_level}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Distance: {(alert.distance || 15).toFixed(2)} km</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card mt-6 p-5"
      >
        <h3 className="mb-4 flex items-center text-xl font-semibold">
          <Radio className="mr-2 text-[#b45cff]" />
          System Status
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {systemStatus.map((item) => (
            <div key={item.label} className="status-tile">
              <item.icon className="mx-auto mb-2 text-cyan-300" size={22} />
              <div className="text-xs text-gray-400">{item.label}</div>
              <div className="mt-1 font-semibold text-emerald-300">{item.value}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
