import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaChartLine, 
  FaGlobe, 
  FaBrain, 
  FaTrash, 
  FaClipboardList,
  FaSignOutAlt,
  FaUserAstronaut,
  FaBell,
  FaCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/visualization', label: 'Orbits', icon: FaGlobe },
    { path: '/ai-prediction', label: 'AI Prediction', icon: FaBrain },
    { path: '/debris', label: 'Debris', icon: FaTrash },
    { path: '/analytics', label: 'Analytics', icon: FaChartLine },
    { path: '/logs', label: 'Logs', icon: FaClipboardList }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-4 left-0 right-0 z-50 px-4"
    >
      <div className={`astro-nav max-w-6xl mx-auto px-5 sm:px-7 ${scrolled ? 'astro-nav-scrolled' : ''}`}>
        <div className="flex justify-between items-center min-h-[76px] gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
            <span className="brand-mark">
              <FaUserAstronaut className="text-xl text-[#29d8ff]" />
            </span>
            <div className="min-w-0">
              <span className="brand-wordmark block leading-none">AstroShield</span>
              <span className="hidden sm:block text-[10px] text-slate-400 mt-1 tracking-[0.18em] uppercase truncate">
                AI-Based Satellite Collision System
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 rounded-full transition-all duration-200 flex items-center gap-2 text-sm ${
                    isActive
                      ? 'nav-chip-active text-[#29d8ff]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="text-sm" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-x-4 -bottom-1 h-px bg-gradient-to-r from-transparent via-[#29d8ff] to-transparent"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200">
              <FaCircle className="text-[8px] text-emerald-300" />
              Live
            </div>
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition">
              <FaBell className="text-gray-300" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold">{user?.username || 'User'}</div>
                <div className="text-xs text-gray-400">{user?.role || 'Operator'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/20 transition group"
              >
                <FaSignOutAlt className="text-gray-300 group-hover:text-red-400 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
