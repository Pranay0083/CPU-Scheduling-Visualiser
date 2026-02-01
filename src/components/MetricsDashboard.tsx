import { useScheduler } from '../context/SchedulerContext';

export function MetricsDashboard() {
    const { state } = useScheduler();
    const { metrics, clock } = state;

    const formatNumber = (num: number, decimals: number = 2): string => {
        return num.toFixed(decimals);
    };

    const getUtilizationClass = (util: number): string => {
        if (util >= 80) return 'high';
        if (util >= 50) return 'medium';
        return 'low';
    };

    return (
        <div className="metrics-dashboard">
            <h3 className="metrics-title">Live Metrics</h3>

            <div className="metrics-grid">
                <div className={`metric-card utilization ${getUtilizationClass(metrics.cpuUtilization)}`}>
                    <div className="metric-value">
                        {formatNumber(metrics.cpuUtilization, 1)}%
                    </div>
                    <div className="metric-label">CPU Utilization</div>
                    <div className="metric-bar">
                        <div
                            className="metric-bar-fill"
                            style={{ width: `${Math.min(100, metrics.cpuUtilization)}%` }}
                        />
                    </div>
                </div>

                <div className="metric-card throughput">
                    <div className="metric-value">
                        {formatNumber(metrics.throughput, 3)}
                    </div>
                    <div className="metric-label">Throughput (P/unit)</div>
                    <div className="metric-subtext">
                        {metrics.completedProcesses} completed / {clock} time
                    </div>
                </div>

                <div className="metric-card waiting">
                    <div className="metric-value">
                        {formatNumber(metrics.avgWaitingTime, 2)}
                    </div>
                    <div className="metric-label">Avg Wait Time</div>
                </div>

                <div className="metric-card turnaround">
                    <div className="metric-value">
                        {formatNumber(metrics.avgTurnaroundTime, 2)}
                    </div>
                    <div className="metric-label">Avg Turnaround</div>
                </div>

                <div className="metric-card response">
                    <div className="metric-value">
                        {formatNumber(metrics.avgResponseTime, 2)}
                    </div>
                    <div className="metric-label">Avg Response</div>
                </div>

                <div className="metric-card completed">
                    <div className="metric-value">
                        {metrics.completedProcesses}
                        <span className="metric-total">/ {state.processes.length}</span>
                    </div>
                    <div className="metric-label">Completed</div>
                </div>
            </div>
        </div>
    );
}
