import { useScheduler } from '../context/SchedulerContext';
import { parseBurstPattern } from '../types';
import type { Algorithm, CoreCount, SimulationSpeed, InteractionMode } from '../types';

const INTERACTION_MODES: { value: InteractionMode; label: string; icon: string }[] = [
    { value: 'NORMAL', label: 'Normal', icon: '▶️' },
    { value: 'PREDICT_VERIFY', label: 'Predict & Verify', icon: '📝' },
    { value: 'QUIZ', label: 'Quiz Mode', icon: '❓' },
];

const ALGORITHMS: { value: Algorithm; label: string }[] = [
    { value: 'FCFS', label: 'First Come First Serve' },
    { value: 'SJF', label: 'Shortest Job First' },
    { value: 'SRTF', label: 'Shortest Remaining Time' },
    { value: 'ROUND_ROBIN', label: 'Round Robin' },
    { value: 'PRIORITY_PREEMPTIVE', label: 'Priority (Preemptive)' },
    { value: 'PRIORITY_NON_PREEMPTIVE', label: 'Priority (Non-Preemptive)' },
    { value: 'MLFQ', label: 'Multi-Level Feedback Queue' },
];

const PRESETS = [
    {
        name: 'Basic FCFS',
        processes: [
            { name: 'P1', arrivalTime: 0, priority: 1, burstPattern: 'CPU(5)' },
            { name: 'P2', arrivalTime: 1, priority: 1, burstPattern: 'CPU(3)' },
            { name: 'P3', arrivalTime: 2, priority: 1, burstPattern: 'CPU(4)' },
        ],
    },
    {
        name: 'Preemption Demo',
        processes: [
            { name: 'P1', arrivalTime: 0, priority: 3, burstPattern: 'CPU(8)' },
            { name: 'P2', arrivalTime: 2, priority: 1, burstPattern: 'CPU(4)' },
            { name: 'P3', arrivalTime: 4, priority: 2, burstPattern: 'CPU(2)' },
        ],
    },
    {
        name: 'I/O Bound',
        processes: [
            { name: 'P1', arrivalTime: 0, priority: 1, burstPattern: 'CPU(3) -> IO(2) -> CPU(2)' },
            { name: 'P2', arrivalTime: 1, priority: 2, burstPattern: 'CPU(2) -> IO(3) -> CPU(3)' },
            { name: 'P3', arrivalTime: 2, priority: 1, burstPattern: 'CPU(4)' },
        ],
    },
    {
        name: 'Multi-Core Load',
        processes: [
            { name: 'P1', arrivalTime: 0, priority: 1, burstPattern: 'CPU(6)' },
            { name: 'P2', arrivalTime: 0, priority: 2, burstPattern: 'CPU(4)' },
            { name: 'P3', arrivalTime: 0, priority: 1, burstPattern: 'CPU(5)' },
            { name: 'P4', arrivalTime: 0, priority: 3, burstPattern: 'CPU(3)' },
        ],
    },
];

export function ControlPanel() {
    const {
        state,
        setAlgorithm,
        setCoreCount,
        setTimeQuantum,
        setSpeed,
        toggleAging,
        start,
        pause,
        step,
        reset,
        clearProcesses,
        addProcess,
        setInteractionMode,
    } = useScheduler();

    const isRunning = state.simulationState === 'RUNNING';
    const canStart = state.processes.length > 0;

    const loadPreset = (preset: typeof PRESETS[0]) => {
        clearProcesses();
        preset.processes.forEach(p => {
            const bursts = parseBurstPattern(p.burstPattern);
            addProcess({
                name: p.name,
                arrivalTime: p.arrivalTime,
                priority: p.priority,
                bursts,
                color: '',
            });
        });
    };

    return (
        <div className="control-panel">
            {/* Simulation Mode Selector */}
            <div className="control-section mode-section">
                <h3 className="control-title">Mode</h3>
                <div className="mode-buttons">
                    {INTERACTION_MODES.map(mode => (
                        <button
                            key={mode.value}
                            onClick={() => setInteractionMode(mode.value)}
                            disabled={isRunning}
                            className={`mode-button ${state.interactionMode === mode.value ? 'active' : ''}`}
                            title={mode.label}
                        >
                            <span className="mode-icon">{mode.icon}</span>
                            <span className="mode-label">{mode.label}</span>
                        </button>
                    ))}
                </div>
                {state.interactionMode === 'QUIZ' && (
                    <div className="mode-score">
                        Score: <strong>{state.quizState.totalPoints}</strong> pts
                    </div>
                )}
            </div>

            <div className="control-section">
                <h3 className="control-title">Algorithm</h3>
                <select
                    value={state.algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                    disabled={isRunning}
                    className="control-select"
                >
                    {ALGORITHMS.map(algo => (
                        <option key={algo.value} value={algo.value}>
                            {algo.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="control-section">
                <h3 className="control-title">CPU Cores</h3>
                <div className="core-buttons">
                    {[1, 2, 4].map(count => (
                        <button
                            key={count}
                            onClick={() => setCoreCount(count as CoreCount)}
                            disabled={isRunning}
                            className={`core-button ${state.coreCount === count ? 'active' : ''}`}
                        >
                            {count}
                        </button>
                    ))}
                </div>
            </div>

            {(state.algorithm === 'ROUND_ROBIN' || state.algorithm === 'MLFQ') && (
                <div className="control-section">
                    <h3 className="control-title">Time Quantum</h3>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={state.timeQuantum}
                        onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
                        disabled={isRunning}
                        className="control-input"
                    />
                </div>
            )}

            <div className="control-section">
                <h3 className="control-title">Speed</h3>
                <div className="speed-buttons">
                    {[0.5, 1, 2, 4].map(speed => (
                        <button
                            key={speed}
                            onClick={() => setSpeed(speed as SimulationSpeed)}
                            className={`speed-button ${state.speed === speed ? 'active' : ''}`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>

            <div className="control-section">
                <label className="aging-label">
                    <input
                        type="checkbox"
                        checked={state.agingEnabled}
                        onChange={(e) => toggleAging(e.target.checked)}
                        disabled={isRunning}
                    />
                    <span>Priority Aging</span>
                </label>
            </div>

            <div className="control-section">
                <h3 className="control-title">Presets</h3>
                <select
                    onChange={(e) => {
                        const preset = PRESETS.find(p => p.name === e.target.value);
                        if (preset) loadPreset(preset);
                    }}
                    disabled={isRunning}
                    className="control-select"
                    defaultValue=""
                >
                    <option value="" disabled>Load preset...</option>
                    {PRESETS.map(preset => (
                        <option key={preset.name} value={preset.name}>
                            {preset.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="control-section playback-controls">
                <button
                    onClick={isRunning ? pause : start}
                    disabled={!canStart && !isRunning}
                    className={`control-button ${isRunning ? 'pause' : 'play'}`}
                >
                    {isRunning ? '⏸ Pause' : '▶ Play'}
                </button>

                <button
                    onClick={step}
                    disabled={isRunning || !canStart}
                    className="control-button step"
                >
                    ⏭ Step
                </button>

                <button
                    onClick={reset}
                    className="control-button reset"
                >
                    ↺ Reset
                </button>
            </div>

            <div className="clock-display">
                <span className="clock-label">Clock</span>
                <span className="clock-value">{state.clock}</span>
            </div>
        </div>
    );
}
