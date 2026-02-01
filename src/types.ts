// ============================================================
// CPU Scheduler Visualizer - Type Definitions
// ============================================================

// Process States
export type ProcessState =
    | 'NEW'
    | 'READY'
    | 'RUNNING'
    | 'WAITING'  // Waiting for I/O
    | 'TERMINATED';

// Burst Types
export type BurstType = 'CPU' | 'IO';

// A single burst in the process execution pattern
export interface Burst {
    type: BurstType;
    duration: number;
    remaining: number;
}

// Scheduling Algorithms
export type Algorithm =
    | 'FCFS'
    | 'SJF'
    | 'SRTF'
    | 'ROUND_ROBIN'
    | 'PRIORITY_PREEMPTIVE'
    | 'PRIORITY_NON_PREEMPTIVE'
    | 'MLFQ';

// Process definition
export interface Process {
    id: string;
    name: string;
    arrivalTime: number;
    priority: number;          // Lower number = higher priority
    bursts: Burst[];           // Pattern: CPU -> IO -> CPU -> IO -> CPU
    currentBurstIndex: number;
    state: ProcessState;
    color: string;

    // Metrics
    waitTime: number;
    turnaroundTime: number;
    responseTime: number | null;  // Time from arrival to first CPU burst
    startTime: number | null;     // When process first got CPU
    completionTime: number | null;

    // For starvation visualization
    waitingSince: number | null;  // Clock time when started waiting

    // For MLFQ
    currentQueueLevel: number;

    // For multi-core
    assignedCore: number | null;
}

// Gantt chart entry
export interface GanttEntry {
    processId: string | null;  // null for idle
    processName: string;
    startTime: number;
    endTime: number;
    color: string;
}

// CPU Core
export interface CPUCore {
    id: number;
    currentProcess: Process | null;
    ganttHistory: GanttEntry[];
    readyQueue: Process[];     // Per-core ready queue for load balancing
    timeQuantumRemaining: number;  // For Round Robin
}

// I/O Device
export interface IODevice {
    id: number;
    waitQueue: Process[];      // Processes waiting for I/O
    currentProcess: Process | null;
}

// Scheduler event for kernel log
export interface SchedulerEvent {
    timestamp: number;
    type:
    | 'PROCESS_ARRIVED'
    | 'PROCESS_STARTED'
    | 'PROCESS_PREEMPTED'
    | 'PROCESS_COMPLETED'
    | 'PROCESS_IO_START'
    | 'PROCESS_IO_COMPLETE'
    | 'CONTEXT_SWITCH'
    | 'PRIORITY_AGED'
    | 'QUEUE_LEVEL_DEMOTED'
    | 'LOAD_BALANCED';
    message: string;
    processId?: string;
    coreId?: number;
}

// Live metrics
export interface Metrics {
    cpuUtilization: number;       // 0-100%
    throughput: number;           // processes completed per time unit
    avgWaitingTime: number;
    avgTurnaroundTime: number;
    avgResponseTime: number;
    totalIdleTime: number;
    totalBusyTime: number;
    completedProcesses: number;
}

// MLFQ Queue configuration
export interface MLFQQueue {
    level: number;
    timeQuantum: number;
    processes: Process[];
}

// Simulation speed
export type SimulationSpeed = 0.5 | 1 | 2 | 4;

// Simulation state
export type SimulationState = 'STOPPED' | 'RUNNING' | 'PAUSED' | 'STEP';

// Core count options
export type CoreCount = 1 | 2 | 4;

// ============================================================
// Test/Prediction Mode Types
// ============================================================

// Simulation mode (Normal, Predict & Verify, or Quiz)
export type InteractionMode = 'NORMAL' | 'PREDICT_VERIFY' | 'QUIZ';

// Individual process prediction
export interface Prediction {
    processId: string;
    processName: string;
    predictedCT: number | null;  // Completion Time
}

// Prediction state for Predict & Verify mode
export interface PredictionState {
    predictions: Prediction[];
    predictedAWT: number | null;     // Average Waiting Time
    submitted: boolean;              // Locked before simulation
    showResults: boolean;            // Show scorecard after simulation
}

// Score breakdown for each prediction
export interface ScoreBreakdown {
    processId: string;
    processName: string;
    predictedCT: number | null;
    actualCT: number | null;
    difference: number | null;
    points: number;
}

// Prediction results after simulation
export interface PredictionResults {
    breakdown: ScoreBreakdown[];
    predictedAWT: number | null;
    actualAWT: number;
    awtDifference: number | null;
    awtPoints: number;
    totalScore: number;
    maxScore: number;
    accuracy: number;  // 0-100%
}

// Quiz question types
export type QuizQuestionType = 'PREEMPTION' | 'NEXT_PROCESS' | 'QUEUE_ORDER';

// Quiz question structure
export interface QuizQuestion {
    id: string;
    type: QuizQuestionType;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    timestamp: number;
    context: {
        currentProcess?: string;
        arrivingProcess?: string;
        algorithm: Algorithm;
    };
}

// Quiz answer history entry
export interface QuizAnswerEntry {
    question: QuizQuestion;
    userAnswer: string;
    correct: boolean;
    timeTaken: number;  // ms
}

// Quiz state for Quiz mode
export interface QuizState {
    active: boolean;                     // Is a question currently showing?
    currentQuestion: QuizQuestion | null;
    questionsAnswered: number;
    correctAnswers: number;
    totalPoints: number;
    history: QuizAnswerEntry[];
    showFinalResults: boolean;
}

// Main Scheduler State
export interface SchedulerState {
    // Configuration
    algorithm: Algorithm;
    coreCount: CoreCount;
    timeQuantum: number;           // For Round Robin
    agingEnabled: boolean;
    agingThreshold: number;        // Time units before priority boost

    // MLFQ config
    mlfqQueues: MLFQQueue[];

    // Simulation
    clock: number;
    simulationState: SimulationState;
    speed: SimulationSpeed;

    // Entities
    processes: Process[];
    cores: CPUCore[];
    ioDevice: IODevice;

    // Logs & Metrics
    kernelLog: SchedulerEvent[];
    metrics: Metrics;

    // History for playback
    clockHistory: number[];

    // Test/Prediction Mode
    interactionMode: InteractionMode;
    predictionState: PredictionState;
    quizState: QuizState;
}

// Actions for reducer
export type SchedulerAction =
    | { type: 'ADD_PROCESS'; payload: Omit<Process, 'id' | 'state' | 'waitTime' | 'turnaroundTime' | 'responseTime' | 'startTime' | 'completionTime' | 'waitingSince' | 'currentQueueLevel' | 'assignedCore' | 'currentBurstIndex'> }
    | { type: 'REMOVE_PROCESS'; payload: string }
    | { type: 'CLEAR_PROCESSES' }
    | { type: 'SET_ALGORITHM'; payload: Algorithm }
    | { type: 'SET_CORE_COUNT'; payload: CoreCount }
    | { type: 'SET_TIME_QUANTUM'; payload: number }
    | { type: 'SET_SPEED'; payload: SimulationSpeed }
    | { type: 'TOGGLE_AGING'; payload: boolean }
    | { type: 'START_SIMULATION' }
    | { type: 'PAUSE_SIMULATION' }
    | { type: 'STOP_SIMULATION' }
    | { type: 'STEP_SIMULATION' }
    | { type: 'TICK' }
    | { type: 'RESET' }
    | { type: 'LOAD_PRESET'; payload: Process[] }
    // Test/Prediction Mode actions
    | { type: 'SET_INTERACTION_MODE'; payload: InteractionMode }
    | { type: 'SET_PREDICTION'; payload: { processId: string; predictedCT: number | null } }
    | { type: 'SET_AWT_PREDICTION'; payload: number | null }
    | { type: 'SUBMIT_PREDICTIONS' }
    | { type: 'INIT_PREDICTIONS' }
    | { type: 'SHOW_PREDICTION_RESULTS' }
    | { type: 'TRIGGER_QUIZ'; payload: QuizQuestion }
    | { type: 'ANSWER_QUIZ'; payload: { answer: string; timeTaken: number } }
    | { type: 'DISMISS_QUIZ' }
    | { type: 'SHOW_QUIZ_RESULTS' };

// Process input form data
export interface ProcessFormData {
    name: string;
    arrivalTime: number;
    priority: number;
    burstPattern: string;  // e.g., "CPU(3) -> IO(2) -> CPU(5)"
}

// Preset scenario
export interface PresetScenario {
    name: string;
    description: string;
    algorithm: Algorithm;
    processes: ProcessFormData[];
    timeQuantum?: number;
    coreCount?: CoreCount;
}

// Color palette for processes
export const PROCESS_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Gold
    '#BB8FCE', // Purple
    '#85C1E9', // Light Blue
    '#F8B500', // Orange
    '#00CED1', // Dark Cyan
];

// Starvation heat map colors (cool to hot)
export const STARVATION_COLORS = {
    cool: '#3498db',      // Blue
    warm: '#f39c12',      // Orange
    hot: '#e74c3c',       // Red
};

// Utility function to get starvation color based on wait time
export function getStarvationColor(waitTime: number, maxWait: number): string {
    if (maxWait === 0) return STARVATION_COLORS.cool;

    const ratio = Math.min(waitTime / maxWait, 1);

    if (ratio < 0.33) {
        return STARVATION_COLORS.cool;
    } else if (ratio < 0.66) {
        return STARVATION_COLORS.warm;
    } else {
        return STARVATION_COLORS.hot;
    }
}

// Parse burst pattern string like "CPU(3) -> IO(2) -> CPU(5)"
export function parseBurstPattern(pattern: string): Burst[] {
    const bursts: Burst[] = [];
    const regex = /(CPU|IO)\s*\(\s*(\d+)\s*\)/gi;
    let match;

    while ((match = regex.exec(pattern)) !== null) {
        const type = match[1].toUpperCase() as BurstType;
        const duration = parseInt(match[2], 10);
        bursts.push({
            type,
            duration,
            remaining: duration,
        });
    }

    return bursts;
}

// Generate a burst pattern string from bursts
export function formatBurstPattern(bursts: Burst[]): string {
    return bursts
        .map(b => `${b.type}(${b.duration})`)
        .join(' -> ');
}
