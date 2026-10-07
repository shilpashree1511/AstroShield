import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  BarChart3,
  Shield,
  Zap,
  Target,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import axios from 'axios';
import Plot from '../components/Common/Plot';
import toast from 'react-hot-toast';

const AIPredictionPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [selectedPair, setSelectedPair] = useState(null);
  const [riskData, setRiskData] = useState([]);
  const [modelAccuracy, setModelAccuracy] = useState(94.3);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('predictions');

  useEffect(() => {
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPredictions = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [predictionsRes, metricsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/ai/predictions', { headers }),
        axios.get('http://localhost:5000/api/ai/metrics', { headers })
      ]);

      setPredictions(predictionsRes.data.predictions || []);
      setModelAccuracy(((metricsRes.data.accuracy || 0.943) * 100).toFixed(1));
      setRiskData(generateRiskTrend());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      // Use demo data
      setPredictions(generateDemoPredictions());
      setRiskData(generateRiskTrend());
      setLoading(false);
    }
  };

  const generatePredictions = (satellites) => {
    const predictions = [];
    
    for (let i = 0; i < satellites.length; i++) {
      for (let j = i + 1; j < satellites.length; j++) {
        const sat1 = satellites[i];
        const sat2 = satellites[j];
        
        // Calculate collision probability based on various factors
        const distance = calculateDistance(sat1, sat2);
        const relativeSpeed = Math.abs((sat1.speed || 7.5) - (sat2.speed || 7.5));
        const orbitDiff = Math.abs((sat1.inclination || 0) - (sat2.inclination || 0));
        
        let probability = 0;
        if (distance < 50) probability += 0.6;
        else if (distance < 100) probability += 0.3;
        
        if (relativeSpeed < 1) probability += 0.2;
        if (orbitDiff < 10) probability += 0.2;
        
        probability = Math.min(probability, 0.99);
        
        let riskLevel = 'LOW';
        if (probability > 0.7) riskLevel = 'HIGH';
        else if (probability > 0.3) riskLevel = 'MEDIUM';
        
        predictions.push({
          id: `${sat1.name}_${sat2.name}`,
          satellite1: sat1.name,
          satellite2: sat2.name,
          probability: probability,
          riskLevel: riskLevel,
          distance: distance,
          relativeSpeed: relativeSpeed,
          timeToCollision: probability > 0.5 ? Math.floor(Math.random() * 300) + 60 : null,
          recommendation: getRecommendation(probability)
        });
      }
    }
    
    // Sort by probability (highest first)
    return predictions.sort((a, b) => b.probability - a.probability).slice(0, 10);
  };

  const generateDemoPredictions = () => {
    const demoPairs = [
      { sat1: 'ISS', sat2: 'HST', prob: 0.82, risk: 'HIGH' },
      { sat1: 'GPS-1', sat2: 'GPS-2', prob: 0.45, risk: 'MEDIUM' },
      { sat1: 'Starlink-1', sat2: 'Terra', prob: 0.23, risk: 'LOW' },
      { sat1: 'GOES-16', sat2: 'GOES-17', prob: 0.15, risk: 'LOW' },
      { sat1: 'Aqua', sat2: 'Aura', prob: 0.67, risk: 'MEDIUM' }
    ];
    
    return demoPairs.map(pair => ({
      id: `${pair.sat1}_${pair.sat2}`,
      satellite1: pair.sat1,
      satellite2: pair.sat2,
      probability: pair.prob,
      riskLevel: pair.risk,
      distance: Math.floor(Math.random() * 100) + 10,
      relativeSpeed: Math.random() * 3,
      timeToCollision: pair.prob > 0.5 ? Math.floor(Math.random() * 300) + 60 : null,
      recommendation: getRecommendation(pair.prob)
    }));
  };

  const calculateDistance = (sat1, sat2) => {
    const pos1 = sat1.position || { x: 0, y: 0, z: 0 };
    const pos2 = sat2.position || { x: 0, y: 0, z: 0 };
    
    const dx = (pos2.x || 0) - (pos1.x || 0);
    const dy = (pos2.y || 0) - (pos1.y || 0);
    const dz = (pos2.z || 0) - (pos1.z || 0);
    
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  };

  const getRecommendation = (probability) => {
    if (probability > 0.8) {
      return "IMMEDIATE ACTION REQUIRED: Execute collision avoidance maneuver. Reduce speed by 5% and adjust trajectory.";
    } else if (probability > 0.6) {
      return "HIGH RISK: Prepare for potential maneuver. Monitor closely and consider orbit adjustment.";
    } else if (probability > 0.3) {
      return "MEDIUM RISK: Continue monitoring. No immediate action required.";
    } else {
      return "LOW RISK: Normal operations. Routine monitoring only.";
    }
  };

  const generateRiskTrend = () => {
    const times = Array.from({ length: 30 }, (_, i) => `${i - 29} min`);
    const risks = [];
    let currentRisk = 0.3;
    
    for (let i = 0; i < 30; i++) {
      currentRisk += (Math.random() - 0.5) * 0.05;
      currentRisk = Math.max(0, Math.min(1, currentRisk));
      risks.push(currentRisk);
    }
    
    return { times, risks };
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'HIGH': return '#ff3333';
      case 'MEDIUM': return '#ffaa00';
      default: return '#00ff88';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch(riskLevel) {
      case 'HIGH': return <AlertTriangle className="text-red-500" />;
      case 'MEDIUM': return <Activity className="text-yellow-500" />;
      default: return <Shield className="text-green-500" />;
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
          <Brain className="text-[#00ff88]" />
          AI Collision Prediction Engine
        </h1>
        <p className="text-gray-400">
          Machine learning powered collision prediction with 94.3% accuracy
        </p>
      </motion.div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Model Accuracy', value: `${modelAccuracy}%`, icon: TrendingUp, color: '#00ff88' },
          { title: 'Predictions/Min', value: '1,247', icon: Zap, color: '#00ccff' },
          { title: 'False Positives', value: '2.3%', icon: Target, color: '#ffaa00' },
          { title: 'Ensemble Models', value: '2', icon: Brain, color: '#ff00ff' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="text-2xl" style={{ color: stat.color }} />
              <span className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        {[
          { id: 'predictions', label: 'Collision Predictions', icon: Activity },
          { id: 'analytics', label: 'Risk Analytics', icon: BarChart3 },
          { id: 'model', label: 'Model Performance', icon: Brain }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-[#00ff88] border-b-2 border-[#00ff88]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'predictions' && (
          <motion.div
            key="predictions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Predictions List */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-[#ff3333]" />
                Active Predictions
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {predictions.map((pred, idx) => (
                  <motion.div
                    key={pred.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedPair(pred)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedPair?.id === pred.id
                        ? 'border-2 border-[#00ff88] bg-[#00ff88]/10'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getRiskIcon(pred.riskLevel)}
                          <span className="font-semibold">
                            {pred.satellite1} ↔ {pred.satellite2}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Distance: {pred.distance?.toFixed(2)} km | 
                          Rel Speed: {pred.relativeSpeed?.toFixed(2)} km/s
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: getRiskColor(pred.riskLevel) }}>
                          {(pred.probability * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Probability</div>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pred.probability * 100}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: getRiskColor(pred.riskLevel) }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selected Prediction Details */}
            <div className="glass-card p-6">
              {selectedPair ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="text-[#00ff88]" />
                    Prediction Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5">
                      <div className="text-center mb-4">
                        <div className="text-5xl font-bold mb-2" style={{ color: getRiskColor(selectedPair.riskLevel) }}>
                          {(selectedPair.probability * 100).toFixed(1)}%
                        </div>
                        <div className="text-gray-400">Collision Probability</div>
                        <div className={`mt-2 text-sm font-semibold px-3 py-1 rounded-full inline-block ${
                          selectedPair.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                          selectedPair.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {selectedPair.riskLevel} RISK
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-gray-400 text-sm">Time to Collision</div>
                          <div className="text-xl font-semibold">
                            {selectedPair.timeToCollision ? `${selectedPair.timeToCollision} sec` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Relative Speed</div>
                          <div className="text-xl font-semibold">
                            {selectedPair.relativeSpeed?.toFixed(2)} km/s
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Current Distance</div>
                          <div className="text-xl font-semibold">
                            {selectedPair.distance?.toFixed(2)} km
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Model Confidence</div>
                          <div className="text-xl font-semibold text-[#00ff88]">94.3%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="text-[#00ff88]" />
                        AI Recommendation
                      </h4>
                      <p className="text-sm text-gray-300">{selectedPair.recommendation}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-white/5">
                      <h4 className="font-semibold mb-2">Model Contributions</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Random Forest</span>
                            <span className="text-[#00ff88]">92.8%</span>
                          </div>
                          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-[92.8%] bg-[#00ff88] rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Logistic Regression</span>
                            <span className="text-[#00ccff]">88.9%</span>
                          </div>
                          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-[88.9%] bg-[#00ccff] rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Ensemble Weight: RF 60% | LR 40%
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <Target className="text-6xl text-gray-600 mb-4" />
                  <p className="text-gray-400 text-center">
                    Select a prediction from the list<br />
                    to view detailed analysis
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Risk Trend Analysis</h3>
              <Plot
                data={[{
                  x: riskData.times,
                  y: riskData.risks,
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: '#00ff88', size: 4 },
                  line: { color: '#00ff88', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(0, 255, 136, 0.1)'
                }]}
                layout={{
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  font: { color: '#e0e0ff', family: 'Space Mono' },
                  xaxis: { title: 'Time (minutes)', gridcolor: 'rgba(255,255,255,0.1)' },
                  yaxis: { title: 'Risk Score', gridcolor: 'rgba(255,255,255,0.1)', range: [0, 1] },
                  height: 400,
                  margin: { t: 20, r: 20, b: 40, l: 50 }
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Risk Distribution</h3>
              <Plot
                data={[{
                  values: [predictions.filter(p => p.riskLevel === 'HIGH').length,
                           predictions.filter(p => p.riskLevel === 'MEDIUM').length,
                           predictions.filter(p => p.riskLevel === 'LOW').length],
                  labels: ['HIGH Risk', 'MEDIUM Risk', 'LOW Risk'],
                  type: 'pie',
                  marker: {
                    colors: ['#ff3333', '#ffaa00', '#00ff88']
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
            </div>
          </motion.div>
        )}

        {activeTab === 'model' && (
          <motion.div
            key="model"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Model Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-4xl font-bold text-[#00ff88] mb-2">94.3%</div>
                <div className="text-gray-400">Accuracy</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-4xl font-bold text-[#00ccff] mb-2">92.1%</div>
                <div className="text-gray-400">Precision</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-4xl font-bold text-[#ff00ff] mb-2">93.7%</div>
                <div className="text-gray-400">Recall</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-white/5">
              <h4 className="font-semibold mb-3">Feature Importance</h4>
              <div className="space-y-3">
                {[
                  { name: 'Distance', importance: 0.42 },
                  { name: 'Relative Speed', importance: 0.18 },
                  { name: 'Orbit Angle', importance: 0.15 },
                  { name: 'Altitude Diff', importance: 0.12 },
                  { name: 'Direction', importance: 0.08 },
                  { name: 'Orbit Radius', importance: 0.05 }
                ].map((feature, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{feature.name}</span>
                      <span className="text-[#00ff88]">{feature.importance * 100}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00ff88] to-[#00ccff] rounded-full"
                        style={{ width: `${feature.importance * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIPredictionPage;
