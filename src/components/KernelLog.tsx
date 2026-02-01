import { useRef, useEffect } from 'react';
import { useScheduler } from '../context/SchedulerContext';

export function KernelLog() {
    const { state } = useScheduler();
    const logRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [state.kernelLog.length]);

    const getEventIcon = (type: string): string => {
        switch (type) {
            case 'PROCESS_ARRIVED': return '📥';
            case 'PROCESS_STARTED': return '▶️';
            case 'PROCESS_PREEMPTED': return '⏸️';
            case 'PROCESS_COMPLETED': return '✅';
            case 'PROCESS_IO_START': return '💾';
            case 'PROCESS_IO_COMPLETE': return '📤';
            case 'CONTEXT_SWITCH': return '🔄';
            case 'PRIORITY_AGED': return '⬆️';
            case 'QUEUE_LEVEL_DEMOTED': return '⬇️';
            case 'LOAD_BALANCED': return '⚖️';
            default: return '📋';
        }
    };

    const getEventClass = (type: string): string => {
        switch (type) {
            case 'PROCESS_PREEMPTED': return 'event-preempted';
            case 'PROCESS_COMPLETED': return 'event-completed';
            case 'PROCESS_IO_START':
            case 'PROCESS_IO_COMPLETE': return 'event-io';
            case 'PRIORITY_AGED': return 'event-aged';
            default: return '';
        }
    };

    return (
        <div className="kernel-log">
            <h3 className="log-title">
                <span>Kernel Log</span>
                <span className="log-count">{state.kernelLog.length}</span>
            </h3>

            <div className="log-container" ref={logRef}>
                {state.kernelLog.length === 0 ? (
                    <div className="log-empty">
                        No events yet. Start the simulation to see scheduler decisions.
                    </div>
                ) : (
                    state.kernelLog.map((event, idx) => (
                        <div key={idx} className={`log-entry ${getEventClass(event.type)}`}>
                            <span className="log-time">[{event.timestamp}]</span>
                            <span className="log-icon">{getEventIcon(event.type)}</span>
                            <span className="log-message">{event.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
