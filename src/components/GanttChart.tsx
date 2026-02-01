import { useRef, useEffect } from 'react';
import { useScheduler } from '../context/SchedulerContext';
import type { GanttEntry } from '../types';

const CELL_WIDTH = 40;

export function GanttChart() {
    const { state } = useScheduler();
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current time
    useEffect(() => {
        if (containerRef.current) {
            const scrollPosition = (state.clock - 10) * CELL_WIDTH;
            containerRef.current.scrollLeft = Math.max(0, scrollPosition);
        }
    }, [state.clock]);

    const maxTime = Math.max(state.clock + 10, 20);
    const timeMarkers = Array.from({ length: maxTime + 1 }, (_, i) => i);

    const renderGanttRow = (coreId: number, history: GanttEntry[]) => {
        return (
            <div key={coreId} className="gantt-row">
                <div className="gantt-core-label">
                    Core {coreId}
                </div>
                <div className="gantt-timeline">
                    {history.map((entry, idx) => {
                        const width = (entry.endTime - entry.startTime) * CELL_WIDTH;
                        const left = entry.startTime * CELL_WIDTH;

                        return (
                            <div
                                key={`${entry.processId}-${entry.startTime}-${idx}`}
                                className={`gantt-block ${entry.processId ? 'active' : 'idle'}`}
                                style={{
                                    width: `${width}px`,
                                    left: `${left}px`,
                                    backgroundColor: entry.color,
                                }}
                                title={`${entry.processName}: ${entry.startTime} - ${entry.endTime}`}
                            >
                                {entry.processId && width >= 30 && (
                                    <span className="gantt-block-label">{entry.processName}</span>
                                )}
                            </div>
                        );
                    })}

                    {/* Current time indicator */}
                    <div
                        className="gantt-current-time"
                        style={{ left: `${state.clock * CELL_WIDTH}px` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="gantt-container">
            <h3 className="gantt-title">Gantt Chart</h3>

            <div className="gantt-wrapper" ref={containerRef}>
                <div className="gantt-content" style={{ width: `${(maxTime + 1) * CELL_WIDTH + 80}px` }}>
                    {/* Time axis */}
                    <div className="gantt-row time-axis">
                        <div className="gantt-core-label">Time</div>
                        <div className="gantt-timeline time-markers">
                            {timeMarkers.map(time => (
                                <div
                                    key={time}
                                    className={`time-marker ${time === state.clock ? 'current' : ''}`}
                                    style={{ left: `${time * CELL_WIDTH}px` }}
                                >
                                    {time}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Core rows */}
                    {state.cores.map(core => renderGanttRow(core.id, core.ganttHistory))}
                </div>
            </div>

            {/* Legend */}
            <div className="gantt-legend">
                {state.processes.map(process => (
                    <div key={process.id} className="legend-item">
                        <div
                            className="legend-color"
                            style={{ backgroundColor: process.color }}
                        />
                        <span>{process.name}</span>
                    </div>
                ))}
                <div className="legend-item">
                    <div className="legend-color idle" />
                    <span>Idle</span>
                </div>
            </div>
        </div>
    );
}
