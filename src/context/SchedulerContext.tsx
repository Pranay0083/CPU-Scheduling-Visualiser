import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type {
    SchedulerState,
    SchedulerAction,
    Process,
    Algorithm,
    CoreCount,
    SimulationSpeed,
    CPUCore,
    IODevice,
    Metrics,
    SchedulerEvent,
    MLFQQueue,
    InteractionMode,
    PredictionState,
    QuizState,
    QuizQuestion,
} from '../types';
import { PROCESS_COLORS } from '../types';
import { getNextProcess, assignProcessToCore, applyPriorityAging } from '../engine/algorithms';

// ============================================================
// Initial State
// ============================================================
function createInitialCores(count: CoreCount): CPUCore[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        currentProcess: null,
        ganttHistory: [],
        readyQueue: [],
        timeQuantumRemaining: 0,
    }));
}

const initialIODevice: IODevice = {
    id: 0,
    waitQueue: [],
    currentProcess: null,
};

const initialMetrics: Metrics = {
    cpuUtilization: 0,
    throughput: 0,
    avgWaitingTime: 0,
    avgTurnaroundTime: 0,
    avgResponseTime: 0,
    totalIdleTime: 0,
    totalBusyTime: 0,
    completedProcesses: 0,
};

function createMLFQQueues(numQueues: number = 3, baseQuantum: number = 2): MLFQQueue[] {
    return Array.from({ length: numQueues }, (_, i) => ({
        level: i,
        timeQuantum: baseQuantum * Math.pow(2, i),
        processes: [],
    }));
}

const initialPredictionState: PredictionState = {
    predictions: [],
    predictedAWT: null,
    submitted: false,
    showResults: false,
};

const initialQuizState: QuizState = {
    active: false,
    currentQuestion: null,
    questionsAnswered: 0,
    correctAnswers: 0,
    totalPoints: 0,
    history: [],
    showFinalResults: false,
};

const initialState: SchedulerState = {
    algorithm: 'FCFS',
    coreCount: 1,
    timeQuantum: 2,
    agingEnabled: false,
    agingThreshold: 5,
    mlfqQueues: createMLFQQueues(),
    clock: 0,
    simulationState: 'STOPPED',
    speed: 1,
    processes: [],
    cores: createInitialCores(1),
    ioDevice: initialIODevice,
    kernelLog: [],
    metrics: initialMetrics,
    clockHistory: [],
    // Test/Prediction Mode
    interactionMode: 'NORMAL',
    predictionState: initialPredictionState,
    quizState: initialQuizState,
};

// ============================================================
// Helper Functions
// ============================================================
let processCounter = 0;

function generateProcessId(): string {
    return `P${++processCounter}`;
}

function getNextColor(existingProcesses: Process[]): string {
    const usedColors = new Set(existingProcesses.map(p => p.color));
    for (const color of PROCESS_COLORS) {
        if (!usedColors.has(color)) return color;
    }
    return PROCESS_COLORS[existingProcesses.length % PROCESS_COLORS.length];
}

function calculateMetrics(state: SchedulerState): Metrics {
    const completedProcesses = state.processes.filter(p => p.state === 'TERMINATED');
    const totalProcesses = completedProcesses.length;

    if (totalProcesses === 0 || state.clock === 0) {
        return {
            ...initialMetrics,
            totalIdleTime: state.cores.reduce((sum, core) => {
                const idleTime = core.ganttHistory
                    .filter(g => g.processId === null)
                    .reduce((s, g) => s + (g.endTime - g.startTime), 0);
                return sum + idleTime;
            }, 0),
        };
    }

    const totalBusyTime = state.cores.reduce((sum, core) => {
        return sum + core.ganttHistory
            .filter(g => g.processId !== null)
            .reduce((s, g) => s + (g.endTime - g.startTime), 0);
    }, 0);

    const totalIdleTime = state.cores.reduce((sum, core) => {
        return sum + core.ganttHistory
            .filter(g => g.processId === null)
            .reduce((s, g) => s + (g.endTime - g.startTime), 0);
    }, 0);

    const cpuUtilization = state.clock > 0
        ? (totalBusyTime / (state.clock * state.coreCount)) * 100
        : 0;

    const avgWaitingTime = completedProcesses.reduce((sum, p) => sum + p.waitTime, 0) / totalProcesses;
    const avgTurnaroundTime = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0) / totalProcesses;

    const processesWithResponse = completedProcesses.filter(p => p.responseTime !== null);
    const avgResponseTime = processesWithResponse.length > 0
        ? processesWithResponse.reduce((sum, p) => sum + (p.responseTime ?? 0), 0) / processesWithResponse.length
        : 0;

    const throughput = totalProcesses / state.clock;

    return {
        cpuUtilization,
        throughput,
        avgWaitingTime,
        avgTurnaroundTime,
        avgResponseTime,
        totalIdleTime,
        totalBusyTime,
        completedProcesses: totalProcesses,
    };
}

// ============================================================
// Scheduler Tick Logic
// ============================================================
function performTick(state: SchedulerState): SchedulerState {
    const newClock = state.clock + 1;
    const events: SchedulerEvent[] = [];
    let updatedProcesses = [...state.processes];
    let updatedCores = state.cores.map(c => ({ ...c }));
    let updatedIODevice = { ...state.ioDevice, waitQueue: [...state.ioDevice.waitQueue] };

    // 1. Check for newly arrived processes
    const newlyArrived = updatedProcesses.filter(
        p => p.arrivalTime === state.clock && p.state === 'NEW'
    );

    newlyArrived.forEach(process => {
        events.push({
            timestamp: state.clock,
            type: 'PROCESS_ARRIVED',
            message: `${process.name} arrived`,
            processId: process.id,
        });

        // Assign to a core using load balancer
        const coreId = assignProcessToCore(updatedCores, process);

        // Update process state
        const idx = updatedProcesses.findIndex(p => p.id === process.id);
        updatedProcesses[idx] = {
            ...process,
            state: 'READY',
            assignedCore: coreId,
            waitingSince: state.clock,
            currentQueueLevel: 0,
        };

        // Add to core's ready queue
        updatedCores[coreId].readyQueue.push(updatedProcesses[idx]);

        if (state.coreCount > 1) {
            events.push({
                timestamp: state.clock,
                type: 'LOAD_BALANCED',
                message: `${process.name} assigned to Core ${coreId} (shortest queue)`,
                processId: process.id,
                coreId,
            });
        }
    });

    // 2. Handle I/O completion
    const completedIO = updatedIODevice.waitQueue.filter(p => {
        const currentBurst = p.bursts[p.currentBurstIndex];
        return currentBurst && currentBurst.remaining <= 0;
    });

    completedIO.forEach(process => {
        // Move to next burst
        const idx = updatedProcesses.findIndex(p => p.id === process.id);
        const nextBurstIndex = process.currentBurstIndex + 1;

        if (nextBurstIndex < process.bursts.length) {
            events.push({
                timestamp: state.clock,
                type: 'PROCESS_IO_COMPLETE',
                message: `${process.name} I/O completed, returning to ready queue`,
                processId: process.id,
            });

            updatedProcesses[idx] = {
                ...updatedProcesses[idx],
                state: 'READY',
                currentBurstIndex: nextBurstIndex,
                waitingSince: state.clock,
            };

            const coreId = process.assignedCore ?? 0;
            updatedCores[coreId].readyQueue.push(updatedProcesses[idx]);
        }

        // Remove from I/O queue
        updatedIODevice.waitQueue = updatedIODevice.waitQueue.filter(p => p.id !== process.id);
    });

    // 3. Process I/O bursts
    updatedIODevice.waitQueue = updatedIODevice.waitQueue.map(process => {
        const currentBurst = process.bursts[process.currentBurstIndex];
        if (currentBurst && currentBurst.type === 'IO') {
            return {
                ...process,
                bursts: process.bursts.map((b, i) =>
                    i === process.currentBurstIndex
                        ? { ...b, remaining: b.remaining - 1 }
                        : b
                ),
            };
        }
        return process;
    });

    // 4. Apply priority aging if enabled
    if (state.agingEnabled) {
        const agingResult = applyPriorityAging(updatedProcesses, state.clock, state.agingThreshold);
        updatedProcesses = agingResult.updatedProcesses;
        events.push(...agingResult.events);
    }

    // 5. Schedule processes on each core
    updatedCores = updatedCores.map((core, coreIndex) => {
        let currentProcess = core.currentProcess;
        let timeQuantumRemaining = core.timeQuantumRemaining;
        let readyQueue = core.readyQueue.filter(p =>
            updatedProcesses.find(up => up.id === p.id)?.state === 'READY'
        );

        // Decrement time quantum
        if (currentProcess && timeQuantumRemaining > 0) {
            timeQuantumRemaining--;
        }

        // Get MLFQ queues for this core if needed
        let mlfqQueues: Process[][] | undefined;
        if (state.algorithm === 'MLFQ') {
            mlfqQueues = state.mlfqQueues.map(q =>
                q.processes.filter(p => p.assignedCore === coreIndex && p.state === 'READY')
            );
        }

        // Get scheduling decision
        const decision = getNextProcess(
            state.algorithm,
            readyQueue,
            currentProcess,
            state.clock,
            timeQuantumRemaining,
            mlfqQueues,
            state.timeQuantum
        );

        let ganttHistory = [...core.ganttHistory];

        // Handle preemption
        if (decision.shouldPreempt && currentProcess) {
            events.push({
                timestamp: state.clock,
                type: 'PROCESS_PREEMPTED',
                message: `${currentProcess.name} preempted by ${decision.selected?.name ?? 'N/A'}: ${getPreemptionReason(state.algorithm, currentProcess, decision.selected)}`,
                processId: currentProcess.id,
                coreId: coreIndex,
            });

            // Update preempted process
            const preemptedIdx = updatedProcesses.findIndex(p => p.id === currentProcess!.id);
            updatedProcesses[preemptedIdx] = {
                ...updatedProcesses[preemptedIdx],
                state: 'READY',
                waitingSince: state.clock,
                // Demote in MLFQ
                currentQueueLevel: decision.demoteProcess
                    ? Math.min(updatedProcesses[preemptedIdx].currentQueueLevel + 1, state.mlfqQueues.length - 1)
                    : updatedProcesses[preemptedIdx].currentQueueLevel,
            };

            readyQueue.push(updatedProcesses[preemptedIdx]);

            // End current Gantt entry
            if (ganttHistory.length > 0) {
                const lastEntry = ganttHistory[ganttHistory.length - 1];
                if (lastEntry.processId === currentProcess.id && lastEntry.endTime === state.clock) {
                    // Already ended
                } else {
                    ganttHistory[ganttHistory.length - 1] = {
                        ...lastEntry,
                        endTime: state.clock,
                    };
                }
            }

            currentProcess = null;
        }

        // Assign selected process
        if (decision.selected && decision.selected.id !== currentProcess?.id) {
            const selectedProcess = decision.selected;
            const selectedIdx = updatedProcesses.findIndex(p => p.id === selectedProcess.id);

            events.push({
                timestamp: state.clock,
                type: currentProcess ? 'CONTEXT_SWITCH' : 'PROCESS_STARTED',
                message: `${selectedProcess.name} started on Core ${coreIndex}`,
                processId: selectedProcess.id,
                coreId: coreIndex,
            });

            // Update process state
            updatedProcesses[selectedIdx] = {
                ...updatedProcesses[selectedIdx],
                state: 'RUNNING',
                startTime: updatedProcesses[selectedIdx].startTime ?? state.clock,
                responseTime: updatedProcesses[selectedIdx].responseTime ?? (state.clock - updatedProcesses[selectedIdx].arrivalTime),
                waitingSince: null,
            };

            // Remove from ready queue
            readyQueue = readyQueue.filter(p => p.id !== selectedProcess.id);

            currentProcess = updatedProcesses[selectedIdx];

            // Start new Gantt entry
            ganttHistory.push({
                processId: selectedProcess.id,
                processName: selectedProcess.name,
                startTime: state.clock,
                endTime: newClock,
                color: selectedProcess.color,
            });

            if (decision.resetQuantum) {
                timeQuantumRemaining = decision.quantumForProcess ?? state.timeQuantum;
            }
        } else if (currentProcess) {
            // Continue current process
            if (ganttHistory.length > 0) {
                ganttHistory[ganttHistory.length - 1].endTime = newClock;
            }
        } else {
            // CPU idle
            if (ganttHistory.length === 0 || ganttHistory[ganttHistory.length - 1].processId !== null) {
                ganttHistory.push({
                    processId: null,
                    processName: 'Idle',
                    startTime: state.clock,
                    endTime: newClock,
                    color: '#374151',
                });
            } else {
                ganttHistory[ganttHistory.length - 1].endTime = newClock;
            }
        }

        // 6. Execute current process (CPU burst)
        if (currentProcess) {
            const currentBurst = currentProcess.bursts[currentProcess.currentBurstIndex];

            if (currentBurst && currentBurst.type === 'CPU') {
                const processIdx = updatedProcesses.findIndex(p => p.id === currentProcess!.id);
                const newRemaining = currentBurst.remaining - 1;

                updatedProcesses[processIdx] = {
                    ...updatedProcesses[processIdx],
                    bursts: updatedProcesses[processIdx].bursts.map((b, i) =>
                        i === currentProcess!.currentBurstIndex
                            ? { ...b, remaining: newRemaining }
                            : b
                    ),
                };

                // Check if burst completed
                if (newRemaining <= 0) {
                    const nextBurstIndex = currentProcess.currentBurstIndex + 1;

                    if (nextBurstIndex >= currentProcess.bursts.length) {
                        // Process completed
                        events.push({
                            timestamp: newClock,
                            type: 'PROCESS_COMPLETED',
                            message: `${currentProcess.name} completed execution`,
                            processId: currentProcess.id,
                            coreId: coreIndex,
                        });

                        updatedProcesses[processIdx] = {
                            ...updatedProcesses[processIdx],
                            state: 'TERMINATED',
                            completionTime: newClock,
                            turnaroundTime: newClock - updatedProcesses[processIdx].arrivalTime,
                            currentBurstIndex: nextBurstIndex,
                        };

                        // Calculate wait time
                        const totalBurstTime = updatedProcesses[processIdx].bursts
                            .reduce((sum, b) => sum + b.duration, 0);
                        updatedProcesses[processIdx].waitTime =
                            updatedProcesses[processIdx].turnaroundTime - totalBurstTime;

                        currentProcess = null;
                    } else {
                        // Move to I/O
                        const nextBurst = currentProcess.bursts[nextBurstIndex];

                        if (nextBurst.type === 'IO') {
                            events.push({
                                timestamp: newClock,
                                type: 'PROCESS_IO_START',
                                message: `${currentProcess.name} starting I/O operation (${nextBurst.duration} units)`,
                                processId: currentProcess.id,
                                coreId: coreIndex,
                            });

                            updatedProcesses[processIdx] = {
                                ...updatedProcesses[processIdx],
                                state: 'WAITING',
                                currentBurstIndex: nextBurstIndex,
                            };

                            updatedIODevice.waitQueue.push(updatedProcesses[processIdx]);
                            currentProcess = null;
                        } else {
                            // Next CPU burst
                            updatedProcesses[processIdx] = {
                                ...updatedProcesses[processIdx],
                                currentBurstIndex: nextBurstIndex,
                            };
                            currentProcess = updatedProcesses[processIdx];
                        }
                    }
                } else {
                    currentProcess = updatedProcesses[processIdx];
                }
            }
        }

        // Update wait time for processes in ready queue
        readyQueue.forEach(p => {
            const idx = updatedProcesses.findIndex(up => up.id === p.id);
            if (idx !== -1 && updatedProcesses[idx].state === 'READY') {
                updatedProcesses[idx] = {
                    ...updatedProcesses[idx],
                    waitTime: updatedProcesses[idx].waitTime + 1,
                };
            }
        });

        return {
            ...core,
            currentProcess,
            ganttHistory,
            readyQueue,
            timeQuantumRemaining,
        };
    });

    // Update processes in cores' ready queues with latest state
    updatedCores = updatedCores.map(core => ({
        ...core,
        readyQueue: core.readyQueue.map(p =>
            updatedProcesses.find(up => up.id === p.id) ?? p
        ).filter(p => p.state === 'READY'),
    }));

    const newState: SchedulerState = {
        ...state,
        clock: newClock,
        processes: updatedProcesses,
        cores: updatedCores,
        ioDevice: updatedIODevice,
        kernelLog: [...state.kernelLog, ...events],
        clockHistory: [...state.clockHistory, newClock],
    };

    // Update metrics
    newState.metrics = calculateMetrics(newState);

    // Check if simulation should stop
    const allCompleted = newState.processes.length > 0 &&
        newState.processes.every(p => p.state === 'TERMINATED');

    if (allCompleted) {
        newState.simulationState = 'STOPPED';
    }

    return newState;
}

function getPreemptionReason(
    algorithm: Algorithm,
    preempted: Process,
    selected: Process | null
): string {
    if (!selected) return '';

    switch (algorithm) {
        case 'SRTF':
            return `shorter remaining time (${selected.bursts[selected.currentBurstIndex]?.remaining ?? 0} < ${preempted.bursts[preempted.currentBurstIndex]?.remaining ?? 0})`;
        case 'PRIORITY_PREEMPTIVE':
            return `higher priority (${selected.priority} < ${preempted.priority})`;
        case 'ROUND_ROBIN':
            return 'time quantum expired';
        case 'MLFQ':
            return selected.currentQueueLevel < preempted.currentQueueLevel
                ? `higher queue level (Q${selected.currentQueueLevel} > Q${preempted.currentQueueLevel})`
                : 'time quantum expired';
        default:
            return '';
    }
}

// ============================================================
// Reducer
// ============================================================
function schedulerReducer(state: SchedulerState, action: SchedulerAction): SchedulerState {
    switch (action.type) {
        case 'ADD_PROCESS': {
            const id = generateProcessId();
            const color = getNextColor(state.processes);
            const newProcess: Process = {
                ...action.payload,
                id,
                color,
                state: 'NEW',
                currentBurstIndex: 0,
                waitTime: 0,
                turnaroundTime: 0,
                responseTime: null,
                startTime: null,
                completionTime: null,
                waitingSince: null,
                currentQueueLevel: 0,
                assignedCore: null,
            };
            return {
                ...state,
                processes: [...state.processes, newProcess],
            };
        }

        case 'REMOVE_PROCESS':
            return {
                ...state,
                processes: state.processes.filter(p => p.id !== action.payload),
                cores: state.cores.map(c => ({
                    ...c,
                    readyQueue: c.readyQueue.filter(p => p.id !== action.payload),
                    currentProcess: c.currentProcess?.id === action.payload ? null : c.currentProcess,
                })),
            };

        case 'CLEAR_PROCESSES':
            processCounter = 0;
            return {
                ...state,
                processes: [],
                cores: createInitialCores(state.coreCount),
                ioDevice: initialIODevice,
                kernelLog: [],
                metrics: initialMetrics,
                clock: 0,
                clockHistory: [],
                simulationState: 'STOPPED',
            };

        case 'SET_ALGORITHM':
            return { ...state, algorithm: action.payload };

        case 'SET_CORE_COUNT':
            return {
                ...state,
                coreCount: action.payload,
                cores: createInitialCores(action.payload),
            };

        case 'SET_TIME_QUANTUM':
            return {
                ...state,
                timeQuantum: action.payload,
                mlfqQueues: createMLFQQueues(3, action.payload),
            };

        case 'SET_SPEED':
            return { ...state, speed: action.payload };

        case 'TOGGLE_AGING':
            return { ...state, agingEnabled: action.payload };

        case 'START_SIMULATION':
            return { ...state, simulationState: 'RUNNING' };

        case 'PAUSE_SIMULATION':
            return { ...state, simulationState: 'PAUSED' };

        case 'STOP_SIMULATION':
            return { ...state, simulationState: 'STOPPED' };

        case 'STEP_SIMULATION':
            return performTick({ ...state, simulationState: 'STEP' });

        case 'TICK':
            if (state.simulationState !== 'RUNNING') return state;
            return performTick(state);

        case 'RESET':
            processCounter = 0;
            return {
                ...initialState,
                algorithm: state.algorithm,
                coreCount: state.coreCount,
                timeQuantum: state.timeQuantum,
                agingEnabled: state.agingEnabled,
                speed: state.speed,
                cores: createInitialCores(state.coreCount),
                mlfqQueues: createMLFQQueues(3, state.timeQuantum),
            };

        case 'LOAD_PRESET':
            processCounter = 0;
            const presetProcesses = action.payload.map(p => ({
                ...p,
                id: generateProcessId(),
                color: getNextColor([]),
            }));
            return {
                ...state,
                processes: presetProcesses,
                cores: createInitialCores(state.coreCount),
                ioDevice: initialIODevice,
                kernelLog: [],
                metrics: initialMetrics,
                clock: 0,
                clockHistory: [],
                simulationState: 'STOPPED',
                predictionState: initialPredictionState,
                quizState: initialQuizState,
            };

        // ============================================================
        // Test/Prediction Mode Actions
        // ============================================================
        case 'SET_INTERACTION_MODE':
            return {
                ...state,
                interactionMode: action.payload,
                predictionState: initialPredictionState,
                quizState: initialQuizState,
            };

        case 'INIT_PREDICTIONS':
            // Initialize predictions for all current processes
            return {
                ...state,
                predictionState: {
                    ...state.predictionState,
                    predictions: state.processes.map(p => ({
                        processId: p.id,
                        processName: p.name,
                        predictedCT: null,
                    })),
                    submitted: false,
                    showResults: false,
                },
            };

        case 'SET_PREDICTION':
            return {
                ...state,
                predictionState: {
                    ...state.predictionState,
                    predictions: state.predictionState.predictions.map(p =>
                        p.processId === action.payload.processId
                            ? { ...p, predictedCT: action.payload.predictedCT }
                            : p
                    ),
                },
            };

        case 'SET_AWT_PREDICTION':
            return {
                ...state,
                predictionState: {
                    ...state.predictionState,
                    predictedAWT: action.payload,
                },
            };

        case 'SUBMIT_PREDICTIONS':
            return {
                ...state,
                predictionState: {
                    ...state.predictionState,
                    submitted: true,
                },
            };

        case 'SHOW_PREDICTION_RESULTS':
            return {
                ...state,
                predictionState: {
                    ...state.predictionState,
                    showResults: true,
                },
            };

        case 'TRIGGER_QUIZ':
            return {
                ...state,
                simulationState: 'PAUSED',
                quizState: {
                    ...state.quizState,
                    active: true,
                    currentQuestion: action.payload,
                },
            };

        case 'ANSWER_QUIZ': {
            const currentQuestion = state.quizState.currentQuestion;
            if (!currentQuestion) return state;

            const isCorrect = action.payload.answer === currentQuestion.correctAnswer;
            const points = isCorrect ? 10 : 0;

            return {
                ...state,
                quizState: {
                    ...state.quizState,
                    questionsAnswered: state.quizState.questionsAnswered + 1,
                    correctAnswers: state.quizState.correctAnswers + (isCorrect ? 1 : 0),
                    totalPoints: state.quizState.totalPoints + points,
                    history: [
                        ...state.quizState.history,
                        {
                            question: currentQuestion,
                            userAnswer: action.payload.answer,
                            correct: isCorrect,
                            timeTaken: action.payload.timeTaken,
                        },
                    ],
                },
            };
        }

        case 'DISMISS_QUIZ':
            return {
                ...state,
                simulationState: 'RUNNING',
                quizState: {
                    ...state.quizState,
                    active: false,
                    currentQuestion: null,
                },
            };

        case 'SHOW_QUIZ_RESULTS':
            return {
                ...state,
                quizState: {
                    ...state.quizState,
                    showFinalResults: true,
                },
            };

        default:
            return state;
    }
}

// ============================================================
// Context
// ============================================================
interface SchedulerContextType {
    state: SchedulerState;
    dispatch: React.Dispatch<SchedulerAction>;
    addProcess: (data: Omit<Process, 'id' | 'state' | 'waitTime' | 'turnaroundTime' | 'responseTime' | 'startTime' | 'completionTime' | 'waitingSince' | 'currentQueueLevel' | 'assignedCore' | 'currentBurstIndex'>) => void;
    removeProcess: (id: string) => void;
    clearProcesses: () => void;
    setAlgorithm: (algo: Algorithm) => void;
    setCoreCount: (count: CoreCount) => void;
    setTimeQuantum: (quantum: number) => void;
    setSpeed: (speed: SimulationSpeed) => void;
    toggleAging: (enabled: boolean) => void;
    start: () => void;
    pause: () => void;
    stop: () => void;
    step: () => void;
    reset: () => void;
    // Test/Prediction Mode
    setInteractionMode: (mode: InteractionMode) => void;
    initPredictions: () => void;
    setPrediction: (processId: string, predictedCT: number | null) => void;
    setAWTPrediction: (awt: number | null) => void;
    submitPredictions: () => void;
    showPredictionResults: () => void;
    triggerQuiz: (question: QuizQuestion) => void;
    answerQuiz: (answer: string, timeTaken: number) => void;
    dismissQuiz: () => void;
    showQuizResults: () => void;
}

const SchedulerContext = createContext<SchedulerContextType | null>(null);

export function SchedulerProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(schedulerReducer, initialState);
    const intervalRef = useRef<number | null>(null);

    // Simulation loop
    useEffect(() => {
        if (state.simulationState === 'RUNNING') {
            const interval = 1000 / state.speed;
            intervalRef.current = window.setInterval(() => {
                dispatch({ type: 'TICK' });
            }, interval);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [state.simulationState, state.speed]);

    const addProcess = useCallback((data: Omit<Process, 'id' | 'state' | 'waitTime' | 'turnaroundTime' | 'responseTime' | 'startTime' | 'completionTime' | 'waitingSince' | 'currentQueueLevel' | 'assignedCore' | 'currentBurstIndex'>) => {
        dispatch({ type: 'ADD_PROCESS', payload: data });
    }, []);

    const removeProcess = useCallback((id: string) => {
        dispatch({ type: 'REMOVE_PROCESS', payload: id });
    }, []);

    const clearProcesses = useCallback(() => {
        dispatch({ type: 'CLEAR_PROCESSES' });
    }, []);

    const setAlgorithm = useCallback((algo: Algorithm) => {
        dispatch({ type: 'SET_ALGORITHM', payload: algo });
    }, []);

    const setCoreCount = useCallback((count: CoreCount) => {
        dispatch({ type: 'SET_CORE_COUNT', payload: count });
    }, []);

    const setTimeQuantum = useCallback((quantum: number) => {
        dispatch({ type: 'SET_TIME_QUANTUM', payload: quantum });
    }, []);

    const setSpeed = useCallback((speed: SimulationSpeed) => {
        dispatch({ type: 'SET_SPEED', payload: speed });
    }, []);

    const toggleAging = useCallback((enabled: boolean) => {
        dispatch({ type: 'TOGGLE_AGING', payload: enabled });
    }, []);

    const start = useCallback(() => {
        dispatch({ type: 'START_SIMULATION' });
    }, []);

    const pause = useCallback(() => {
        dispatch({ type: 'PAUSE_SIMULATION' });
    }, []);

    const stop = useCallback(() => {
        dispatch({ type: 'STOP_SIMULATION' });
    }, []);

    const step = useCallback(() => {
        dispatch({ type: 'STEP_SIMULATION' });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    // Test/Prediction Mode actions
    const setInteractionMode = useCallback((mode: InteractionMode) => {
        dispatch({ type: 'SET_INTERACTION_MODE', payload: mode });
    }, []);

    const initPredictions = useCallback(() => {
        dispatch({ type: 'INIT_PREDICTIONS' });
    }, []);

    const setPrediction = useCallback((processId: string, predictedCT: number | null) => {
        dispatch({ type: 'SET_PREDICTION', payload: { processId, predictedCT } });
    }, []);

    const setAWTPrediction = useCallback((awt: number | null) => {
        dispatch({ type: 'SET_AWT_PREDICTION', payload: awt });
    }, []);

    const submitPredictions = useCallback(() => {
        dispatch({ type: 'SUBMIT_PREDICTIONS' });
    }, []);

    const showPredictionResults = useCallback(() => {
        dispatch({ type: 'SHOW_PREDICTION_RESULTS' });
    }, []);

    const triggerQuiz = useCallback((question: QuizQuestion) => {
        dispatch({ type: 'TRIGGER_QUIZ', payload: question });
    }, []);

    const answerQuiz = useCallback((answer: string, timeTaken: number) => {
        dispatch({ type: 'ANSWER_QUIZ', payload: { answer, timeTaken } });
    }, []);

    const dismissQuiz = useCallback(() => {
        dispatch({ type: 'DISMISS_QUIZ' });
    }, []);

    const showQuizResults = useCallback(() => {
        dispatch({ type: 'SHOW_QUIZ_RESULTS' });
    }, []);

    const value = {
        state,
        dispatch,
        addProcess,
        removeProcess,
        clearProcesses,
        setAlgorithm,
        setCoreCount,
        setTimeQuantum,
        setSpeed,
        toggleAging,
        start,
        pause,
        stop,
        step,
        reset,
        // Test/Prediction Mode
        setInteractionMode,
        initPredictions,
        setPrediction,
        setAWTPrediction,
        submitPredictions,
        showPredictionResults,
        triggerQuiz,
        answerQuiz,
        dismissQuiz,
        showQuizResults,
    };

    return (
        <SchedulerContext.Provider value={value}>
            {children}
        </SchedulerContext.Provider>
    );
}

export function useScheduler() {
    const context = useContext(SchedulerContext);
    if (!context) {
        throw new Error('useScheduler must be used within a SchedulerProvider');
    }
    return context;
}
