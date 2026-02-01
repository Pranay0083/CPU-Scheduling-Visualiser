import { useState, useEffect } from 'react';
import { SchedulerProvider } from './context/SchedulerContext';
import type { AppPage } from './types';
import {
  ControlPanel,
  ProcessForm,
  GanttChart,
  KernelLog,
  MetricsDashboard,
  ProcessQueue,
  ProcessTable,
  PredictionTable,
  Scorecard,
  QuizPopup,
  LearnPage,
} from './components';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('SIMULATOR');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('cpu-scheduler-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('cpu-scheduler-dark-mode', String(darkMode));
  }, [darkMode]);

  const handleNavigateToSimulator = (algorithm?: string, _preset?: string) => {
    setCurrentPage('SIMULATOR');
    // If algorithm specified, could set it in context (future enhancement)
    console.log('Navigate to simulator with algorithm:', algorithm);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <SchedulerProvider>
      <div className={`app ${darkMode ? 'dark' : 'light'}`}>
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-icon">⚡</span>
              CPU Scheduler Visualizer
            </h1>
            <p className="app-subtitle">
              Interactive simulation of CPU scheduling algorithms
            </p>
          </div>

          {/* Page Navigation Tabs */}
          <nav className="page-nav">
            <button
              className={`nav-tab ${currentPage === 'SIMULATOR' ? 'active' : ''}`}
              onClick={() => setCurrentPage('SIMULATOR')}
            >
              <span className="nav-icon">⚡</span>
              Simulator
            </button>
            <button
              className={`nav-tab ${currentPage === 'LEARN' ? 'active' : ''}`}
              onClick={() => setCurrentPage('LEARN')}
            >
              <span className="nav-icon">📚</span>
              Learn
            </button>
          </nav>
        </header>

        {/* Conditional Page Rendering */}
        {currentPage === 'SIMULATOR' ? (
          <>
            {/* Simulator Layout */}
            <main className="app-main">
              {/* Left Sidebar - Controls */}
              <aside className="sidebar-left">
                <ControlPanel />
              </aside>

              {/* Center Content */}
              <div className="main-content">
                {/* Top Section - Process Input & Metrics */}
                <section className="top-section">
                  <div className="top-left">
                    <ProcessForm />
                    <PredictionTable />
                    <ProcessTable />
                  </div>
                  <div className="top-right">
                    <MetricsDashboard />
                  </div>
                </section>

                {/* Middle Section - Gantt Chart */}
                <section className="middle-section">
                  <GanttChart />
                </section>

                {/* Bottom Section - Queues */}
                <section className="bottom-section">
                  <ProcessQueue />
                </section>
              </div>

              {/* Right Sidebar - Kernel Log */}
              <aside className="sidebar-right">
                <KernelLog />
              </aside>
            </main>

            {/* Footer */}
            <footer className="app-footer">
              <p>
                Algorithms: FCFS • SJF • SRTF • Round Robin • Priority • MLFQ |
                Multi-Core Support • I/O Bursts • Priority Aging
              </p>
            </footer>

            {/* Overlays for Test Mode */}
            <Scorecard />
            <QuizPopup />
          </>
        ) : (
          /* Learn Page */
          <LearnPage
            onNavigateToSimulator={handleNavigateToSimulator}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}
      </div>
    </SchedulerProvider>
  );
}

export default App;

