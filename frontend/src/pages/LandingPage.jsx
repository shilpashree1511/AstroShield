import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Shield, 
  Cpu, 
  Globe, 
  ChevronRight,
  Star,
  Satellite as SatIcon,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    { icon: Globe, title: '3D Earth Visualization', description: 'Real-time 3D visualization of Earth with orbiting satellites using CesiumJS' },
    { icon: SatIcon, title: 'Satellite Tracking', description: 'Track multiple satellites with different orbits, speeds, and altitudes' },
    { icon: AlertTriangle, title: 'Collision Detection', description: 'Real-time collision detection and alert system' },
    { icon: Cpu, title: 'AI Predictions', description: 'Machine learning models predicting collision probabilities' },
    { icon: TrendingUp, title: 'Space Debris Monitoring', description: 'Track and monitor space debris movements' },
    { icon: Shield, title: 'Avoidance Recommendations', description: 'Intelligent collision avoidance suggestions' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-black"></div>
        
        {/* Animated Stars Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Rocket className="text-6xl text-[#00ff88]" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">AstroShield</span>
              <br />
              AI Collision Prevention
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-based satellite collision prevention and orbital threat monitoring
              for safer, more sustainable space operations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black font-bold rounded-lg flex items-center gap-2 mx-auto"
                >
                  Launch Dashboard <ChevronRight />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border border-[#00ff88] text-[#00ff88] font-bold rounded-lg"
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-black/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '12,000+', label: 'Satellites Tracked' },
              { value: '99.7%', label: 'Prediction Accuracy' },
              { value: '156', label: 'Collisions Prevented' },
              { value: '24/7', label: 'Real-time Monitoring' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-bold text-[#00ff88]">{stat.value}</div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Cutting-edge technology for comprehensive space traffic management
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover:transform hover:scale-105 transition-all duration-300"
              >
                <feature.icon className="text-4xl text-[#00ff88] mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#00ff88]/10 to-[#00ccff]/10 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Secure Space Operations?
            </h2>
            <p className="text-gray-300 mb-8">
              Join the future of space traffic management with our AI-powered platform
            </p>
            <Link to="/login">
              <button className="px-8 py-3 bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black font-bold rounded-lg">
                Get Started Now
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
