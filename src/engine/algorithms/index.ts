import type {
    Process,
    Algorithm,
    SchedulerEvent,
    CPUCore,
} from '../../types';

// ============================================================
// FCFS - First Come First Serve
// ============================================================
export function fcfsSchedule(
    readyQueue: Process[],
    _currentTime: number
): Process | null {
    if (readyQueue.length === 0) return null;

    // Sort by arrival time, then by ID for consistency
    const sorted = [...readyQueue].sort((a, b) => {
        if (a.arrivalTime !== b.arrivalTime) {
            return a.arrivalTime - b.arrivalTime;
        }
        return a.id.localeCompare(b.id);
    });

    return sorted[0];
}

// ============================================================
// SJF - Shortest Job First (Non-preemptive)
// ============================================================
export function sjfSchedule(
    readyQueue: Process[],
    _currentTime: number
): Process | null {
    if (readyQueue.length === 0) return null;

    // Get remaining CPU burst time for current burst
    const getRemainingBurst = (p: Process): number => {
        const currentBurst = p.bursts[p.currentBurstIndex];
        return currentBurst?.remaining ?? Infinity;
    };

    const sorted = [...readyQueue].sort((a, b) => {
        const burstA = getRemainingBurst(a);
        const burstB = getRemainingBurst(b);
        if (burstA !== burstB) return burstA - burstB;
        // Tie-breaker: arrival time
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.id.localeCompare(b.id);
    });

    return sorted[0];
}

// ============================================================
// SRTF - Shortest Remaining Time First (Preemptive SJF)
// ============================================================
export function srtfSchedule(
    readyQueue: Process[],
    currentProcess: Process | null,
    _currentTime: number
): { selected: Process | null; shouldPreempt: boolean } {
    if (readyQueue.length === 0 && !currentProcess) {
        return { selected: null, shouldPreempt: false };
    }

    const getRemainingBurst = (p: Process): number => {
        const currentBurst = p.bursts[p.currentBurstIndex];
        return currentBurst?.remaining ?? Infinity;
    };

    // Include current process in comparison
    const candidates = currentProcess
        ? [...readyQueue, currentProcess]
        : [...readyQueue];

    if (candidates.length === 0) {
        return { selected: null, shouldPreempt: false };
    }

    const sorted = candidates.sort((a, b) => {
        const burstA = getRemainingBurst(a);
        const burstB = getRemainingBurst(b);
        if (burstA !== burstB) return burstA - burstB;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.id.localeCompare(b.id);
    });

    const selected = sorted[0];
    const shouldPreempt = currentProcess !== null &&
        selected.id !== currentProcess.id;

    return { selected, shouldPreempt };
}

// ============================================================
// Round Robin
// ============================================================
export function roundRobinSchedule(
    readyQueue: Process[],
    currentProcess: Process | null,
    timeQuantumRemaining: number,
    _currentTime: number
): { selected: Process | null; shouldPreempt: boolean; resetQuantum: boolean } {

    // If no running process
    if (!currentProcess) {
        if (readyQueue.length === 0) {
            return { selected: null, shouldPreempt: false, resetQuantum: false };
        }

        // Pick first in queue
        return {
            selected: readyQueue[0],
            shouldPreempt: false,
            resetQuantum: true
        };
    }

    // If time slice over → preempt
    if (timeQuantumRemaining <= 0 && readyQueue.length > 0) {
        return {
            selected: readyQueue[0], // Next in line
            shouldPreempt: true,
            resetQuantum: true
        };
    }

    // Otherwise continue
    return {
        selected: currentProcess,
        shouldPreempt: false,
        resetQuantum: false
    };
}

// ============================================================
// Priority Scheduling (Preemptive)
// ============================================================



export function priorityPreemptiveSchedule(
    readyQueue: Process[],
    currentProcess: Process | null,
    _currentTime: number
): { selected: Process | null; shouldPreempt: boolean } {

    // No process at all
    if (!currentProcess && readyQueue.length === 0) {
        return { selected: null, shouldPreempt: false };
    }

    // If CPU is idle → pick best from ready queue
    if (!currentProcess) {
        let best = readyQueue[0];

        for (const p of readyQueue) {
            if (
                p.priority < best.priority || // Higher priority
                (p.priority === best.priority &&
                 p.arrivalTime < best.arrivalTime)
            ) {
                best = p;
            }
        }

        return {
            selected: best,
            shouldPreempt: false
        };
    }

    // Find best in ready queue
    let best = null;

    if (readyQueue.length > 0) {
        best = readyQueue[0];

        for (const p of readyQueue) {
            if (
                p.priority < best.priority ||
                (p.priority === best.priority &&
                 p.arrivalTime < best.arrivalTime)
            ) {
                best = p;
            }
        }
    }

    // Nothing better → continue
    if (!best) {
        return {
            selected: currentProcess,
            shouldPreempt: false
        };
    }

    // Preempt ONLY if better priority
    if (best.priority < currentProcess.priority) {
        return {
            selected: best,
            shouldPreempt: true
        };
    }

    // Otherwise keep running
    return {
        selected: currentProcess,
        shouldPreempt: false
    };
}


// ============================================================
// Priority Scheduling (Non-preemptive)
// ============================================================
export function priorityNonPreemptiveSchedule(
    readyQueue: Process[],
    currentProcess: Process | null,
    _currentTime: number
): Process | null {

    // Don't preempt
    if (currentProcess) return currentProcess;

    if (readyQueue.length === 0) return null;

    let best = readyQueue[0];

    for (const p of readyQueue) {
        if (
            p.priority < best.priority ||
            (p.priority === best.priority &&
             p.arrivalTime < best.arrivalTime)
        ) {
            best = p;
        }
    }

    return best;
}


// ============================================================
// MLFQ - Multi-Level Feedback Queue
// ============================================================
export interface MLFQConfig {
    numQueues: number;
    baseQuantum: number;  // Quantum doubles for each lower level
}

export interface MLFQResult {
    selected: Process | null;
    shouldPreempt: boolean;
    resetQuantum: boolean;
    quantumForProcess: number;
    demoteProcess: boolean;
}

export function mlfqSchedule(
    queues: Process[][],  // Array of queues, index 0 is highest priority
    currentProcess: Process | null,
    timeQuantumRemaining: number,
    baseQuantum: number,
    _currentTime: number
): MLFQResult {
    const getQuantumForLevel = (level: number): number => {
        return baseQuantum * Math.pow(2, level);
    };

    // If no current process, find one from the queues
    if (!currentProcess) {
        for (let level = 0; level < queues.length; level++) {
            if (queues[level].length > 0) {
                const sorted = [...queues[level]].sort((a, b) => {
                    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
                    return a.id.localeCompare(b.id);
                });
                return {
                    selected: sorted[0],
                    shouldPreempt: false,
                    resetQuantum: true,
                    quantumForProcess: getQuantumForLevel(level),
                    demoteProcess: false,
                };
            }
        }
        return {
            selected: null,
            shouldPreempt: false,
            resetQuantum: false,
            quantumForProcess: baseQuantum,
            demoteProcess: false,
        };
    }

    // Check if higher priority queue has a process
    for (let level = 0; level < currentProcess.currentQueueLevel; level++) {
        if (queues[level].length > 0) {
            const sorted = [...queues[level]].sort((a, b) => {
                if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
                return a.id.localeCompare(b.id);
            });
            return {
                selected: sorted[0],
                shouldPreempt: true,
                resetQuantum: true,
                quantumForProcess: getQuantumForLevel(level),
                demoteProcess: true,  // Current process should be demoted
            };
        }
    }

    // Check if quantum expired
    if (timeQuantumRemaining <= 0) {
        // Demote current process and pick next
        const currentLevel = currentProcess.currentQueueLevel;

        // Find next process from current or lower levels
        for (let level = currentLevel; level < queues.length; level++) {
            const queueProcesses = queues[level].filter(p => p.id !== currentProcess.id);
            if (queueProcesses.length > 0) {
                const sorted = queueProcesses.sort((a, b) => {
                    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
                    return a.id.localeCompare(b.id);
                });
                return {
                    selected: sorted[0],
                    shouldPreempt: true,
                    resetQuantum: true,
                    quantumForProcess: getQuantumForLevel(level),
                    demoteProcess: true,
                };
            }
        }

        // No other process, continue with current (demoted)
        const newLevel = Math.min(currentLevel + 1, queues.length - 1);
        return {
            selected: currentProcess,
            shouldPreempt: false,
            resetQuantum: true,
            quantumForProcess: getQuantumForLevel(newLevel),
            demoteProcess: true,
        };
    }

    // Continue with current process
    return {
        selected: currentProcess,
        shouldPreempt: false,
        resetQuantum: false,
        quantumForProcess: getQuantumForLevel(currentProcess.currentQueueLevel),
        demoteProcess: false,
    };
}

// ============================================================
// Load Balancer - Shortest Queue First
// ============================================================
export function assignProcessToCore(
    cores: CPUCore[],
    _process: Process
): number {
    // Find core with shortest ready queue + current process (if any)
    let minLoad = Infinity;
    let selectedCore = 0;

    for (let i = 0; i < cores.length; i++) {
        const load = cores[i].readyQueue.length + (cores[i].currentProcess ? 1 : 0);
        if (load < minLoad) {
            minLoad = load;
            selectedCore = i;
        }
    }

    return selectedCore;
}

// ============================================================
// Priority Aging
// ============================================================
export function applyPriorityAging(
    processes: Process[],
    currentTime: number,
    agingThreshold: number
): { updatedProcesses: Process[]; events: SchedulerEvent[] } {
    const events: SchedulerEvent[] = [];

    const updatedProcesses = processes.map(process => {
        if (process.state === 'READY' && process.waitingSince !== null) {
            const waitDuration = currentTime - process.waitingSince;

            if (waitDuration >= agingThreshold && process.priority > 0) {
                events.push({
                    timestamp: currentTime,
                    type: 'PRIORITY_AGED',
                    message: `${process.name} priority boosted: ${process.priority} → ${process.priority - 1} (waited ${waitDuration} units)`,
                    processId: process.id,
                });

                return {
                    ...process,
                    priority: process.priority - 1,
                    waitingSince: currentTime,  // Reset waiting timer
                };
            }
        }
        return process;
    });

    return { updatedProcesses, events };
}

// ============================================================
// Select scheduling function based on algorithm
// ============================================================
export function getNextProcess(
    algorithm: Algorithm,
    readyQueue: Process[],
    currentProcess: Process | null,
    currentTime: number,
    timeQuantumRemaining: number,
    mlfqQueues?: Process[][],
    baseQuantum?: number
): {
    selected: Process | null;
    shouldPreempt: boolean;
    resetQuantum: boolean;
    quantumForProcess?: number;
    demoteProcess?: boolean;
} {
    switch (algorithm) {
        case 'FCFS':
            return {
                selected: currentProcess ?? fcfsSchedule(readyQueue, currentTime),
                shouldPreempt: false,
                resetQuantum: !currentProcess,
            };

        case 'SJF':
            return {
                selected: currentProcess ?? sjfSchedule(readyQueue, currentTime),
                shouldPreempt: false,
                resetQuantum: !currentProcess,
            };

        case 'SRTF':
            const srtfResult = srtfSchedule(readyQueue, currentProcess, currentTime);
            return { ...srtfResult, resetQuantum: srtfResult.shouldPreempt };

        case 'ROUND_ROBIN':
            return roundRobinSchedule(readyQueue, currentProcess, timeQuantumRemaining, currentTime);

        case 'PRIORITY_PREEMPTIVE':
            const preemptiveResult = priorityPreemptiveSchedule(readyQueue, currentProcess, currentTime);
            return { ...preemptiveResult, resetQuantum: preemptiveResult.shouldPreempt };

        case 'PRIORITY_NON_PREEMPTIVE':
            return {
                selected: priorityNonPreemptiveSchedule(readyQueue, currentProcess, currentTime),
                shouldPreempt: false,
                resetQuantum: !currentProcess,
            };

        case 'MLFQ':
            if (mlfqQueues && baseQuantum !== undefined) {
                return mlfqSchedule(mlfqQueues, currentProcess, timeQuantumRemaining, baseQuantum, currentTime);
            }
            return { selected: null, shouldPreempt: false, resetQuantum: false };

        default:
            return { selected: null, shouldPreempt: false, resetQuantum: false };
    }
}
