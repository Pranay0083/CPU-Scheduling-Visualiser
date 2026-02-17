import { ControlPanel } from './ControlPanel';
import { ProcessForm } from './ProcessForm';
import { MetricsDashboard } from './MetricsDashboard';
import { ProcessTable } from './ProcessTable';
import { PredictionTable } from './PredictionTable';
import { GanttChart } from './GanttChart';
import { ProcessQueue } from './ProcessQueue';
import { KernelLog } from './KernelLog';
import { Scorecard } from './Scorecard';

export function SimulatorPage() {
  return (
    <>
      <main className="grid grid-cols-[300px_1fr_300px] gap-6 p-6 h-[calc(100vh-120px)] overflow-hidden">
        <aside className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-thin pr-2">
          <ControlPanel />
        </aside>

        <div className="flex flex-col gap-6 h-full overflow-y-auto scrollbar-thin pr-2">
          <section className="grid grid-cols-[1.6fr_1fr] gap-6">
            <div className="flex flex-col gap-4">
              <ProcessForm />
              <PredictionTable />
              <ProcessTable />
            </div>
            <div className="h-full">
              <MetricsDashboard />
            </div>
          </section>

          <section className="min-h-[200px]">
            <GanttChart />
          </section>

          <section className="min-h-[150px]">
            <ProcessQueue />
          </section>
        </div>

        <aside className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-thin pr-2">
          <KernelLog />
        </aside>
      </main>

      <footer className="glass-footer text-text-secondary">
        <p>
          Algorithms: FCFS • SJF • SRTF • Round Robin • Priority • MLFQ |
          Multi-Core Support • I/O Bursts • Priority Aging
        </p>
      </footer>

      <Scorecard />
    </>
  );
}
