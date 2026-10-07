import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { IoMdRefresh, IoMdSquare, IoMdPlay } from 'react-icons/io';
import { FaSatellite } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const demoSatellites = () => [
  { name: 'Aurora Watch', satellite_id: 'SAT-101', orbit_radius: 7210, altitude: 520, speed: 7.1, color: '#29d8ff', inclination: 21, collision_risk: 0.12 },
  { name: 'Orbit Link', satellite_id: 'SAT-202', orbit_radius: 8420, altitude: 780, speed: 1.18, color: '#b45cff', inclination: 47, collision_risk: 0.08 },
  { name: 'Geo Shield', satellite_id: 'SAT-303', orbit_radius: 9820, altitude: 1200, speed: 0.84, color: '#42b8ff', inclination: 62, collision_risk: 0.21 },
  { name: 'Sentinel Relay', satellite_id: 'SAT-404', orbit_radius: 45239, altitude: 35786, speed: 3.07, color: '#ff3d5a', inclination: 5, collision_risk: 0.05 }
];

const normalizeSatellites = (satList) => {
  const fallbackNames = ['Aurora Watch', 'Orbit Link', 'Geo Shield', 'Sentinel Relay'];
  const colors = ['#29d8ff', '#b45cff', '#42b8ff', '#ff3d5a'];

  return satList.map((sat, idx) => ({
    ...sat,
    name: sat.name || fallbackNames[idx % fallbackNames.length],
    satellite_id: sat.satellite_id || `SAT-${String(idx + 101).padStart(3, '0')}`,
    orbit_radius: sat.orbit_radius || 7000 + idx * 900,
    altitude: sat.altitude || Math.max((sat.orbit_radius || 7000) - 6371, 420),
    speed: sat.speed || 7.2,
    color: sat.color || colors[idx % colors.length],
    inclination: sat.inclination ?? 18 + idx * 14,
    collision_risk: sat.collision_risk ?? 0.1
  }));
};

const OrbitVisualization = () => {
  const [isSimulating, setIsSimulating] = useState(true);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [satellites, setSatellites] = useState([]);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    fetchSatellites();
  }, []);

  useEffect(() => {
    if (!isSimulating) return undefined;

    const interval = setInterval(() => {
      setFrame((currentFrame) => currentFrame + 1);
    }, 120);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const fetchSatellites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/satellites', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const satelliteList = Array.isArray(response.data) ? response.data : response.data?.satellites;
      const sourceSatellites = satelliteList?.length ? satelliteList : demoSatellites();
      const data = normalizeSatellites(sourceSatellites);
      setSatellites(data);
      setSelectedSatellite(data[0]);
    } catch (error) {
      console.error('Error fetching satellites:', error);
      const data = demoSatellites();
      setSatellites(data);
      setSelectedSatellite(data[0]);
    }
  };

  const orbitObjects = useMemo(() => satellites.map((sat, index) => {
    const speedFactor = Math.max(12, 44 - Number(sat.speed || 1) * 3);
    const radius = Math.min(92, 48 + index * 13);
    const theta = ((frame * (sat.speed || 1) * 0.022) + index * 1.25) % (Math.PI * 2);
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius * 0.38;

    return {
      ...sat,
      radius,
      theta,
      x,
      y,
      direction: (sat.inclination || 0) > 30 ? 1 : -1,
      duration: `${speedFactor}s`,
      delay: `${index * -5}s`
    };
  }), [satellites, frame]);

  const activeSatellite = selectedSatellite || orbitObjects[0];

  const startSimulation = () => {
    setIsSimulating(true);
    toast.success('Simulation started');
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    toast.success('Simulation paused');
  };

  const resetView = () => {
    setSelectedSatellite(orbitObjects[0] || null);
    setFrame(0);
    toast.success('Orbit view reset');
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] px-4 pb-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="panel-kicker mb-2 text-xs">Orbital Command View</p>
            <h1 className="font-orbitron text-3xl font-bold uppercase tracking-[0.16em] text-slate-100 md:text-4xl">
              AstroShield Orbits
            </h1>
          </div>
          <div className="glass-card px-4 py-2 text-sm text-slate-300">
            <span className="text-[#29d8ff]">Threat monitor:</span> {satellites.length + 3} objects under watch
          </div>
        </motion.div>

        <div className="grid min-h-[680px] grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            className="orbital-stage relative overflow-hidden rounded-[28px] p-3"
          >
            <div className={`orbit-map ${isSimulating ? '' : 'orbit-paused'}`}>
              <div className="star-field" />
              <div className="earth-core">
                <div className="earth-glow" />
                <div className="earth-disc">
                  <span className="continent continent-a" />
                  <span className="continent continent-b" />
                  <span className="continent continent-c" />
                </div>
              </div>

              {orbitObjects.map((sat, index) => (
                <button
                  key={sat.satellite_id || sat.name || index}
                  type="button"
                  onClick={() => setSelectedSatellite(sat)}
                  className={`orbit-track orbit-track-${index + 1} ${activeSatellite?.satellite_id === sat.satellite_id ? 'is-active' : ''}`}
                  style={{
                    '--orbit-size': `${58 + index * 13}%`,
                    '--orbit-tilt': `${sat.inclination - 28}deg`,
                    '--sat-color': sat.color,
                    '--sat-duration': sat.duration,
                    '--sat-delay': sat.delay,
                    '--sat-direction': sat.direction,
                    '--sat-offset': `${116 + index * 28}px`
                  }}
                  aria-label={`Select ${sat.name}`}
                >
                  <span className="satellite-dot">
                    <span className="satellite-pulse" />
                    <span className="satellite-label">{sat.satellite_id}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="absolute left-6 top-6 z-20 glass-card px-4 py-3">
              <p className="panel-kicker text-[10px]">Orbital Command View</p>
              <p className="mt-1 text-sm text-slate-300">{satellites.length} satellites, 3 debris objects</p>
            </div>

            <div className="absolute right-6 top-6 z-20 glass-card px-4 py-3 text-right">
              <p className="panel-kicker text-[10px]">Threat Monitor</p>
              <p className="mt-1 text-2xl font-bold text-slate-100">{satellites.length + 3}</p>
              <p className="text-xs text-slate-400">objects under watch</p>
            </div>

            <div className="absolute bottom-6 left-6 z-20 glass-card p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#29d8ff]">
                <FaSatellite /> Orbit Controls
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startSimulation}
                  className="rounded-lg bg-cyan-400/15 p-2 transition hover:bg-cyan-400/25 disabled:opacity-40"
                  disabled={isSimulating}
                  aria-label="Start simulation"
                >
                  <IoMdPlay className="text-2xl text-cyan-300" />
                </button>
                <button
                  onClick={stopSimulation}
                  className="rounded-lg bg-red-500/20 p-2 transition hover:bg-red-500/30 disabled:opacity-40"
                  disabled={!isSimulating}
                  aria-label="Pause simulation"
                >
                  <IoMdSquare className="text-2xl text-red-400" />
                </button>
                <button
                  onClick={resetView}
                  className="rounded-lg bg-violet-500/20 p-2 transition hover:bg-violet-500/30"
                  aria-label="Reset orbit view"
                >
                  <IoMdRefresh className="text-2xl text-violet-300" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 z-20 glass-card px-4 py-3 text-xs text-slate-400">
              <p className="panel-kicker text-[10px]">Frame {frame % 1000}</p>
              <p className="mt-1">Click a satellite marker for telemetry focus</p>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card overflow-hidden p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="panel-kicker text-xs">Orbit Telemetry</p>
                <p className="mt-2 text-xs text-slate-400">x = r * cos(theta), y = r * sin(theta)</p>
              </div>
              <span className="rounded-full bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-200">
                Frame {frame % 100}
              </span>
            </div>

            <div className="mb-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.06] p-4">
              <p className="panel-kicker text-[10px]">Active Track</p>
              <h2 className="mt-2 text-xl font-bold text-slate-100">{activeSatellite?.name || 'Loading orbit...'}</h2>
              <p className="mt-2 text-xs text-slate-400">
                Risk score {(Number(activeSatellite?.collision_risk || 0) * 100).toFixed(1)}% with live orbital path estimation.
              </p>
            </div>

            <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1">
              {orbitObjects.map((sat, idx) => (
                <button
                  key={sat.satellite_id || sat.name || idx}
                  onClick={() => setSelectedSatellite(sat)}
                  className={`telemetry-card block w-full p-4 text-left transition ${
                    activeSatellite?.satellite_id === sat.satellite_id
                      ? 'border-cyan-300/60 bg-cyan-400/10'
                      : 'hover:border-cyan-300/30 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{sat.name}</h3>
                      <p className="text-xs text-slate-500">{sat.satellite_id}</p>
                    </div>
                    <span
                      className="mt-1 h-3 w-3 rounded-full shadow-[0_0_16px_currentColor]"
                      style={{ color: sat.color, backgroundColor: sat.color }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-slate-400 xl:grid-cols-3">
                    <div>
                      <p>Coordinates</p>
                      <p className="text-slate-200">({sat.x.toFixed(2)}, {sat.y.toFixed(2)})</p>
                    </div>
                    <div>
                      <p>Altitude</p>
                      <p className="text-slate-200">{sat.altitude} km</p>
                    </div>
                    <div>
                      <p>Orbit radius</p>
                      <p className="text-slate-200">{Number(sat.orbit_radius).toLocaleString()} km</p>
                    </div>
                    <div>
                      <p>Speed</p>
                      <p className="text-slate-200">{sat.speed} km/s</p>
                    </div>
                    <div>
                      <p>Direction</p>
                      <p className="text-slate-200">{sat.direction}</p>
                    </div>
                    <div>
                      <p>Future theta</p>
                      <p className="text-slate-200">{(sat.theta + 0.77).toFixed(3)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default OrbitVisualization;
