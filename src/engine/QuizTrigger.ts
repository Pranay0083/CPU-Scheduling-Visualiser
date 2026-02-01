import type { QuizQuestion, Process, Algorithm, CPUCore } from '../types';

// Utility to generate unique IDs
let questionCounter = 0;
function generateQuestionId(): string {
    return `Q${++questionCounter}`;
}

// Check if a new process should preempt the current running process
export function checkPreemption(
    arrivingProcess: Process,
    runningProcess: Process | null,
    algorithm: Algorithm,
    clock: number
): QuizQuestion | null {
    if (!runningProcess) return null;

    // Only preemptive algorithms trigger preemption questions
    if (algorithm === 'SRTF') {
        const arrivingRemaining = arrivingProcess.bursts[arrivingProcess.currentBurstIndex]?.remaining ?? 0;
        const runningRemaining = runningProcess.bursts[runningProcess.currentBurstIndex]?.remaining ?? 0;

        if (arrivingRemaining < runningRemaining) {
            return {
                id: generateQuestionId(),
                type: 'PREEMPTION',
                question: `${arrivingProcess.name} has arrived with ${arrivingRemaining} units remaining. ${runningProcess.name} has ${runningRemaining} units left. Should the CPU preempt ${runningProcess.name}?`,
                options: ['Yes, preempt', 'No, continue'],
                correctAnswer: 'Yes, preempt',
                explanation: `In SRTF, the process with the shortest remaining time always runs. ${arrivingProcess.name} (${arrivingRemaining} units) < ${runningProcess.name} (${runningRemaining} units), so preemption occurs.`,
                timestamp: clock,
                context: {
                    currentProcess: runningProcess.name,
                    arrivingProcess: arrivingProcess.name,
                    algorithm,
                },
            };
        }
    }

    if (algorithm === 'PRIORITY_PREEMPTIVE') {
        if (arrivingProcess.priority < runningProcess.priority) {
            return {
                id: generateQuestionId(),
                type: 'PREEMPTION',
                question: `${arrivingProcess.name} (priority ${arrivingProcess.priority}) has arrived. ${runningProcess.name} (priority ${runningProcess.priority}) is running. Should preemption occur?`,
                options: ['Yes, preempt', 'No, continue'],
                correctAnswer: 'Yes, preempt',
                explanation: `In Priority Preemptive, lower priority numbers mean higher priority. ${arrivingProcess.name} (${arrivingProcess.priority}) has higher priority than ${runningProcess.name} (${runningProcess.priority}).`,
                timestamp: clock,
                context: {
                    currentProcess: runningProcess.name,
                    arrivingProcess: arrivingProcess.name,
                    algorithm,
                },
            };
        }
    }

    return null;
}

// Check which process should run next when a process completes
export function checkNextProcess(
    readyQueue: Process[],
    algorithm: Algorithm,
    clock: number
): QuizQuestion | null {
    if (readyQueue.length < 2) return null;

    // Find the correct next process based on algorithm
    let correctProcess: Process | null = null;
    let explanation = '';

    switch (algorithm) {
        case 'FCFS':
            correctProcess = readyQueue.reduce((earliest, p) =>
                p.arrivalTime < earliest.arrivalTime ? p : earliest
            );
            explanation = `In FCFS, the process that arrived first runs next. ${correctProcess.name} arrived at time ${correctProcess.arrivalTime}.`;
            break;

        case 'SJF':
        case 'SRTF':
            correctProcess = readyQueue.reduce((shortest, p) => {
                const pRemaining = p.bursts[p.currentBurstIndex]?.remaining ?? Infinity;
                const shortestRemaining = shortest.bursts[shortest.currentBurstIndex]?.remaining ?? Infinity;
                return pRemaining < shortestRemaining ? p : shortest;
            });
            const remaining = correctProcess.bursts[correctProcess.currentBurstIndex]?.remaining ?? 0;
            explanation = `In ${algorithm}, the process with the shortest (remaining) burst runs next. ${correctProcess.name} has ${remaining} units.`;
            break;

        case 'PRIORITY_PREEMPTIVE':
        case 'PRIORITY_NON_PREEMPTIVE':
            correctProcess = readyQueue.reduce((highest, p) =>
                p.priority < highest.priority ? p : highest
            );
            explanation = `In Priority scheduling, the lowest priority number runs first. ${correctProcess.name} has priority ${correctProcess.priority}.`;
            break;

        case 'ROUND_ROBIN':
            // In RR, it's typically the one that's been waiting longest
            correctProcess = readyQueue[0];
            explanation = `In Round Robin, processes run in FIFO order within the ready queue. ${correctProcess.name} is at the front.`;
            break;

        default:
            return null;
    }

    if (!correctProcess) return null;

    // Create options from ready queue processes
    const options = readyQueue.slice(0, 4).map(p => p.name);
    if (!options.includes(correctProcess.name)) {
        options[options.length - 1] = correctProcess.name;
    }

    return {
        id: generateQuestionId(),
        type: 'NEXT_PROCESS',
        question: `The CPU is idle and the ready queue has: ${readyQueue.map(p => p.name).join(', ')}. Which process runs next?`,
        options,
        correctAnswer: correctProcess.name,
        explanation,
        timestamp: clock,
        context: {
            algorithm,
        },
    };
}

// Check for time quantum expiry in Round Robin
export function checkQuantumExpiry(
    runningProcess: Process,
    readyQueue: Process[],
    timeQuantum: number,
    quantumUsed: number,
    clock: number
): QuizQuestion | null {
    if (quantumUsed < timeQuantum) return null;
    if (readyQueue.length === 0) return null;

    const remaining = runningProcess.bursts[runningProcess.currentBurstIndex]?.remaining ?? 0;
    if (remaining <= 0) return null;

    return {
        id: generateQuestionId(),
        type: 'PREEMPTION',
        question: `Time quantum (${timeQuantum}) has expired for ${runningProcess.name}. It has ${remaining} units remaining. What happens next?`,
        options: [
            `${runningProcess.name} goes to back of queue`,
            `${runningProcess.name} continues running`,
            `${runningProcess.name} terminates`,
        ],
        correctAnswer: `${runningProcess.name} goes to back of queue`,
        explanation: `In Round Robin, when the time quantum expires, the process is moved to the back of the ready queue if it still has work remaining.`,
        timestamp: clock,
        context: {
            currentProcess: runningProcess.name,
            algorithm: 'ROUND_ROBIN',
        },
    };
}

// Main function to check for quiz triggers during a tick
export function checkQuizTriggers(
    cores: CPUCore[],
    readyQueue: Process[],
    newArrivals: Process[],
    algorithm: Algorithm,
    clock: number,
    timeQuantum: number,
    recentCompletion: boolean
): QuizQuestion | null {
    // Check preemption for new arrivals
    for (const arrival of newArrivals) {
        for (const core of cores) {
            if (core.currentProcess) {
                const question = checkPreemption(arrival, core.currentProcess, algorithm, clock);
                if (question) return question;
            }
        }
    }

    // Check next process after completion
    if (recentCompletion && readyQueue.length >= 2) {
        const question = checkNextProcess(readyQueue, algorithm, clock);
        if (question && Math.random() < 0.5) { // 50% chance to trigger
            return question;
        }
    }

    // Check quantum expiry in Round Robin
    if (algorithm === 'ROUND_ROBIN') {
        for (const core of cores) {
            if (core.currentProcess && core.timeQuantumRemaining === 0) {
                const question = checkQuantumExpiry(
                    core.currentProcess,
                    readyQueue,
                    timeQuantum,
                    timeQuantum,
                    clock
                );
                if (question) return question;
            }
        }
    }

    return null;
}
