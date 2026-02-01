import { SchedulerProvider } from './context/SchedulerContext';
import {
  ControlPanel,
  ProcessForm,
  GanttChart,
  KernelLog,
  MetricsDashboard,
  ProcessQueue,
  ProcessTable,
} from './components';

function App() {
  return (
    <SchedulerProvider>
      <div className="app">
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
        </header>

        {/* Main Layout */}
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
      </div>
    </SchedulerProvider>
  );
}

export default App;
