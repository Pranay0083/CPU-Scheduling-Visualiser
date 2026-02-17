import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { SchedulerProvider, useScheduler } from './context/SchedulerContext';
import type { Algorithm } from './types';
import {
  LandingPage,
  SimulatorPage,
  LearnPage,
} from './components';

// Preset configurations for quick-start demos
const DEMO_PRESETS = {
  'convoy': {
    algorithm: 'FCFS' as Algorithm,
    processes: [
      { name: 'P1 (Long)', arrivalTime: 0, burst: 12, priority: 1 },
      { name: 'P2 (Short)', arrivalTime: 1, burst: 2, priority: 1 },
      { name: 'P3 (Short)', arrivalTime: 2, burst: 2, priority: 1 },
      { name: 'P4 (Short)', arrivalTime: 3, burst: 2, priority: 1 },
    ],
  },
  'rr-quantum': {
    algorithm: 'ROUND_ROBIN' as Algorithm,
    processes: [
      { name: 'P1', arrivalTime: 0, burst: 8, priority: 1 },
      { name: 'P2', arrivalTime: 1, burst: 4, priority: 1 },
      { name: 'P3', arrivalTime: 2, burst: 6, priority: 1 },
    ],
  },
  'starvation': {
    algorithm: 'PRIORITY_NON_PREEMPTIVE' as Algorithm,
    processes: [
      { name: 'High (P1)', arrivalTime: 0, burst: 4, priority: 1 },
      { name: 'High (P2)', arrivalTime: 2, burst: 4, priority: 1 },
      { name: 'High (P3)', arrivalTime: 4, burst: 4, priority: 2 },
      { name: 'LOW (Starve)', arrivalTime: 1, burst: 3, priority: 10 },
    ],
  },
};

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cpu-scheduler-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { dispatch } = useScheduler();

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('cpu-scheduler-dark-mode', String(darkMode));
  }, [darkMode]);

  const handleNavigate = (page: 'SIMULATOR' | 'LEARN') => {
    if (page === 'SIMULATOR') navigate('/simulator');
    if (page === 'LEARN') navigate('/learn');
  };

  const handleLoadPreset = (presetName: string) => {
    const preset = DEMO_PRESETS[presetName as keyof typeof DEMO_PRESETS];
    if (preset) {
      dispatch({ type: 'SET_ALGORITHM', payload: preset.algorithm });
      dispatch({ type: 'CLEAR_PROCESSES' });
      // Add processes from preset
      preset.processes.forEach((p) => {
        dispatch({
          type: 'ADD_PROCESS',
          payload: {
            name: p.name,
            arrivalTime: p.arrivalTime,
            priority: p.priority,
            bursts: [{ type: 'CPU', duration: p.burst, remaining: p.burst }],
            color: '',
          },
        });
      });
      navigate('/simulator');
    }
  };

  const handleNavigateToSimulator = (algorithm?: string, _preset?: string) => {
    if (algorithm) {
      dispatch({ type: 'SET_ALGORITHM', payload: algorithm as Algorithm });
    }
    navigate('/simulator');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const isHome = location.pathname === '/';

  return (
    <div className={`min-h-screen flex flex-col bg-bg-primary text-text-primary transition-colors duration-200 ${darkMode ? 'dark' : 'light'}`}>
      {/* Header - Only show on SIMULATOR and LEARN pages */}
      {!isHome && (
        <header className="glass-header justify-between">
          <div className="flex flex-col gap-1">
            <h1 
              className="text-2xl font-bold bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-transparent flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity" 
              onClick={() => navigate('/')}
            >
              <span className="text-2xl">⚡</span>
              CPU Scheduler Visualizer
            </h1>
            <p className="text-text-secondary text-sm">
              Interactive simulation of CPU scheduling algorithms
            </p>
          </div>

          <nav className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-medium border ${location.pathname === '/simulator' ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10'}`}
              onClick={() => navigate('/simulator')}
            >
              <span className="text-lg">⚡</span>
              Simulator
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-medium border ${location.pathname === '/learn' ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10'}`}
              onClick={() => navigate('/learn')}
            >
              <span className="text-lg">📚</span>
              Learn
            </button>
          </nav>
        </header>
      )}

      {/* Page Routing */}
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage
              onNavigate={handleNavigate}
              onLoadPreset={handleLoadPreset}
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          } 
        />
        <Route 
          path="/simulator" 
          element={<SimulatorPage />} 
        />
        <Route 
          path="/learn" 
          element={
            <LearnPage
              onNavigateToSimulator={handleNavigateToSimulator}
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SchedulerProvider>
        <AppLayout />
      </SchedulerProvider>
    </BrowserRouter>
  );
}

export default App;
