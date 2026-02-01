import { useScheduler } from '../context/SchedulerContext';
import { formatBurstPattern, type Process } from '../types';

export function ProcessTable() {
    const { state, removeProcess } = useScheduler();
    const isRunning = state.simulationState === 'RUNNING';

    const getStateClass = (processState: Process['state']): string => {
        switch (processState) {
            case 'NEW': return 'state-new';
            case 'READY': return 'state-ready';
            case 'RUNNING': return 'state-running';
            case 'WAITING': return 'state-waiting';
            case 'TERMINATED': return 'state-terminated';
            default: return '';
        }
    };

    const getStateLabel = (processState: Process['state']): string => {
        switch (processState) {
            case 'NEW': return 'New';
            case 'READY': return 'Ready';
            case 'RUNNING': return 'Running';
            case 'WAITING': return 'I/O Wait';
            case 'TERMINATED': return 'Done';
            default: return processState;
        }
    };

    const getRemainingBurst = (process: Process): string => {
        const currentBurst = process.bursts[process.currentBurstIndex];
        if (!currentBurst) return '-';
        return `${currentBurst.type}(${currentBurst.remaining})`;
    };

    if (state.processes.length === 0) {
        return (
            <div className="process-table-empty">
                <p>No processes added yet.</p>
                <p className="hint">Use the form above or load a preset to add processes.</p>
            </div>
        );
    }

    return (
        <div className="process-table-container">
            <h3 className="table-title">Process Table</h3>

            <div className="table-wrapper">
                <table className="process-table">
                    <thead>
                        <tr>
                            <th>PID</th>
                            <th>Arrival</th>
                            <th>Priority</th>
                            <th>Burst Pattern</th>
                            <th>Current</th>
                            <th>State</th>
                            <th>Wait</th>
                            <th>TAT</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.processes.map(process => (
                            <tr key={process.id} className={getStateClass(process.state)}>
                                <td>
                                    <div className="pid-cell">
                                        <span
                                            className="pid-color"
                                            style={{ backgroundColor: process.color }}
                                        />
                                        {process.name}
                                    </div>
                                </td>
                                <td>{process.arrivalTime}</td>
                                <td>{process.priority}</td>
                                <td className="burst-cell">
                                    <span className="burst-pattern">
                                        {formatBurstPattern(process.bursts)}
                                    </span>
                                </td>
                                <td className="current-burst">
                                    {getRemainingBurst(process)}
                                </td>
                                <td>
                                    <span className={`state-badge ${getStateClass(process.state)}`}>
                                        {getStateLabel(process.state)}
                                    </span>
                                </td>
                                <td>{process.waitTime}</td>
                                <td>
                                    {process.state === 'TERMINATED'
                                        ? process.turnaroundTime
                                        : '-'}
                                </td>
                                <td>
                                    <button
                                        onClick={() => removeProcess(process.id)}
                                        disabled={isRunning}
                                        className="remove-btn"
                                        title="Remove process"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
