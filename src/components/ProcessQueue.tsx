import { useScheduler } from '../context/SchedulerContext';
import { getStarvationColor, type Process } from '../types';

export function ProcessQueue() {
    const { state } = useScheduler();

    // Get all processes in READY state grouped by core
    const readyProcesses = state.processes.filter(p => p.state === 'READY');
    const waitingProcesses = state.processes.filter(p => p.state === 'WAITING');
    const runningProcesses = state.processes.filter(p => p.state === 'RUNNING');

    // Calculate max wait time for heat map
    const maxWaitTime = Math.max(
        ...readyProcesses.map(p => p.waitTime),
        10
    );

    const renderProcessChip = (process: Process, showHeatMap: boolean = false) => {
        const heatColor = showHeatMap
            ? getStarvationColor(process.waitTime, maxWaitTime)
            : undefined;

        return (
            <div
                key={process.id}
                className="process-chip"
                style={{
                    backgroundColor: process.color,
                    borderColor: heatColor,
                    boxShadow: heatColor ? `0 0 8px ${heatColor}` : undefined,
                }}
                title={`${process.name} | Priority: ${process.priority} | Wait: ${process.waitTime}`}
            >
                <span className="chip-name">{process.name}</span>
                {state.agingEnabled && (
                    <span className="chip-priority">P{process.priority}</span>
                )}
                {showHeatMap && process.waitTime > 0 && (
                    <span
                        className="chip-heat"
                        style={{ backgroundColor: heatColor }}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="process-queue">
            <h3 className="queue-title">Process Queues</h3>

            <div className="queue-sections">
                {/* Running Processes */}
                <div className="queue-section running">
                    <h4 className="section-title">
                        <span className="status-dot running" />
                        Running
                        <span className="section-count">{runningProcesses.length}</span>
                    </h4>
                    <div className="process-list">
                        {runningProcesses.length === 0 ? (
                            <span className="empty-text">No running processes</span>
                        ) : (
                            runningProcesses.map(p => renderProcessChip(p))
                        )}
                    </div>
                </div>

                {/* Ready Queue */}
                <div className="queue-section ready">
                    <h4 className="section-title">
                        <span className="status-dot ready" />
                        Ready Queue
                        <span className="section-count">{readyProcesses.length}</span>
                    </h4>
                    <div className="process-list">
                        {readyProcesses.length === 0 ? (
                            <span className="empty-text">Empty</span>
                        ) : (
                            readyProcesses.map(p => renderProcessChip(p, true))
                        )}
                    </div>

                    {state.agingEnabled && readyProcesses.length > 0 && (
                        <div className="heat-legend">
                            <span>Starvation:</span>
                            <div className="heat-gradient" />
                            <span className="heat-labels">
                                <span>Cool</span>
                                <span>Hot</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* I/O Wait Queue */}
                <div className="queue-section waiting">
                    <h4 className="section-title">
                        <span className="status-dot waiting" />
                        I/O Wait Queue
                        <span className="section-count">{waitingProcesses.length}</span>
                    </h4>
                    <div className="process-list">
                        {waitingProcesses.length === 0 ? (
                            <span className="empty-text">Empty</span>
                        ) : (
                            waitingProcesses.map(p => {
                                const currentBurst = p.bursts[p.currentBurstIndex];
                                return (
                                    <div
                                        key={p.id}
                                        className="process-chip io"
                                        style={{ backgroundColor: p.color }}
                                        title={`${p.name} | I/O Remaining: ${currentBurst?.remaining ?? 0}`}
                                    >
                                        <span className="chip-name">{p.name}</span>
                                        <span className="chip-io">
                                            💾 {currentBurst?.remaining ?? 0}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
