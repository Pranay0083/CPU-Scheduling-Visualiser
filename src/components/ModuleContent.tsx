import { useState } from 'react';
import type { LearningModuleId, GlossaryTerm } from '../types';

interface ModuleContentProps {
    moduleId: LearningModuleId;
    title: string;
    icon: string;
    hoveredTerm: string | null;
    setHoveredTerm: (term: string | null) => void;
    getTermDefinition: (term: string) => GlossaryTerm | undefined;
    onNavigateToSimulator: (algorithm?: string, preset?: string) => void;
}

// Glossary term wrapper component
function GlossaryLink({
    term,
    setHoveredTerm
}: {
    term: string;
    setHoveredTerm: (term: string | null) => void;
}) {
    return (
        <span
            className="glossary-link"
            onMouseEnter={() => setHoveredTerm(term)}
            onMouseLeave={() => setHoveredTerm(null)}
        >
            {term}
        </span>
    );
}

// Toggleable example component
function ToggleableExample({
    title,
    children
}: {
    title: string;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`toggleable-example ${isOpen ? 'open' : ''}`}>
            <button
                className="toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="toggle-icon">{isOpen ? '▼' : '▶'}</span>
                <span className="toggle-title">{title}</span>
            </button>
            {isOpen && (
                <div className="toggle-content">
                    {children}
                </div>
            )}
        </div>
    );
}

export function ModuleContent({
    moduleId,
    title,
    icon,
    setHoveredTerm,
    onNavigateToSimulator
}: ModuleContentProps) {

    // Module 1: The Basics
    if (moduleId === 'basics') {
        return (
            <div className="module-content">
                <h2 className="module-title">
                    <span className="module-icon">{icon}</span>
                    {title}
                </h2>

                <div className="content-section">
                    <h3>What is a CPU Scheduler?</h3>
                    <p>
                        The <strong>CPU Scheduler</strong> (also called the <em>Short-term Scheduler</em>)
                        is the component of an operating system responsible for selecting which process
                        from the <strong>ready queue</strong> should be executed next on the CPU.
                    </p>
                    <div className="info-box">
                        <span className="info-icon">💡</span>
                        <p>
                            Think of the scheduler as a "traffic controller" for processes – it decides
                            who gets to use the CPU and for how long.
                        </p>
                    </div>
                </div>

                <div className="content-section">
                    <h3>Types of Schedulers</h3>
                    <div className="scheduler-types">
                        <div className="scheduler-type">
                            <h4>🔵 Long-term Scheduler</h4>
                            <p>
                                Controls the <strong>degree of multiprogramming</strong>. Decides which
                                processes are admitted to the system from the job pool.
                            </p>
                            <span className="frequency-badge">Runs: Infrequently (minutes)</span>
                        </div>
                        <div className="scheduler-type">
                            <h4>🟢 Short-term Scheduler (CPU Scheduler)</h4>
                            <p>
                                Selects from processes in the <strong>ready queue</strong> and allocates
                                CPU time. This is what we simulate in this tool!
                            </p>
                            <span className="frequency-badge">Runs: Very frequently (milliseconds)</span>
                        </div>
                        <div className="scheduler-type">
                            <h4>🟡 Medium-term Scheduler</h4>
                            <p>
                                Handles <strong>swapping</strong> – temporarily removing processes from
                                memory to reduce multiprogramming degree.
                            </p>
                            <span className="frequency-badge">Runs: Occasionally (seconds)</span>
                        </div>
                    </div>
                </div>

                <div className="content-section">
                    <h3>Process States</h3>
                    <p>
                        A process transitions through various states during its lifecycle:
                    </p>

                    <div className="process-states-diagram">
                        <div className="state-flow">
                            <div className="state new">NEW</div>
                            <span className="arrow">→</span>
                            <div className="state ready">READY</div>
                            <span className="arrow">⇄</span>
                            <div className="state running">RUNNING</div>
                            <span className="arrow">→</span>
                            <div className="state terminated">TERMINATED</div>
                        </div>
                        <div className="io-branch">
                            <span className="branch-arrow">↓</span>
                            <div className="state waiting">WAITING (I/O)</div>
                            <span className="branch-arrow-up">↗</span>
                        </div>
                    </div>

                    <div className="states-table">
                        <div className="state-row">
                            <span className="state-badge new">NEW</span>
                            <span>Process is being created</span>
                        </div>
                        <div className="state-row">
                            <span className="state-badge ready">READY</span>
                            <span>Process is waiting in the ready queue for CPU time</span>
                        </div>
                        <div className="state-row">
                            <span className="state-badge running">RUNNING</span>
                            <span>Process is currently executing on the CPU</span>
                        </div>
                        <div className="state-row">
                            <span className="state-badge waiting">WAITING</span>
                            <span>Process is waiting for I/O operation to complete</span>
                        </div>
                        <div className="state-row">
                            <span className="state-badge terminated">TERMINATED</span>
                            <span>Process has finished execution</span>
                        </div>
                    </div>
                </div>

                <button
                    className="btn-jump-simulator"
                    onClick={() => onNavigateToSimulator('FCFS')}
                >
                    🚀 Try FCFS Simulation →
                </button>
            </div>
        );
    }

    // Module 2: Scheduling Criteria
    if (moduleId === 'scheduling-criteria') {
        return (
            <div className="module-content">
                <h2 className="module-title">
                    <span className="module-icon">{icon}</span>
                    {title}
                </h2>

                <div className="content-section">
                    <h3>Key Time Metrics</h3>
                    <p>
                        Understanding these metrics is essential for analyzing scheduler performance:
                    </p>

                    <div className="metrics-grid">
                        <div className="metric-card">
                            <h4>⏱️ Arrival Time (AT)</h4>
                            <p>The time at which a process enters the ready queue.</p>
                            <code className="formula">AT = When process arrives</code>
                        </div>
                        <div className="metric-card">
                            <h4>⚡ Burst Time (BT)</h4>
                            <p>Total CPU time required by a process to complete.</p>
                            <code className="formula">BT = Total CPU cycles needed</code>
                        </div>
                        <div className="metric-card">
                            <h4>✅ Completion Time (CT)</h4>
                            <p>The time at which a process finishes execution.</p>
                            <code className="formula">CT = When process ends</code>
                        </div>
                        <div className="metric-card highlight">
                            <h4>🔄 <GlossaryLink term="Turnaround Time" setHoveredTerm={setHoveredTerm} /></h4>
                            <p>Total time from arrival to completion.</p>
                            <code className="formula">TAT = CT − AT</code>
                        </div>
                        <div className="metric-card highlight">
                            <h4>⏳ <GlossaryLink term="Waiting Time" setHoveredTerm={setHoveredTerm} /></h4>
                            <p>Time spent waiting in the ready queue.</p>
                            <code className="formula">WT = TAT − BT</code>
                        </div>
                        <div className="metric-card">
                            <h4>🎯 <GlossaryLink term="Response Time" setHoveredTerm={setHoveredTerm} /></h4>
                            <p>Time from arrival to first CPU execution.</p>
                            <code className="formula">RT = First CPU − AT</code>
                        </div>
                    </div>
                </div>

                <div className="content-section">
                    <h3>Why Optimize for Average Waiting Time (AWT)?</h3>
                    <div className="goal-box">
                        <h4>🎯 The Scheduling Goal</h4>
                        <p>
                            Most scheduling algorithms aim to <strong>minimize Average Waiting Time (AWT)</strong>
                            because:
                        </p>
                        <ul>
                            <li>Reduces overall system delay experienced by users</li>
                            <li>Improves CPU utilization efficiency</li>
                            <li>Balances fairness across processes</li>
                            <li>Directly impacts user satisfaction in interactive systems</li>
                        </ul>
                        <code className="formula large">
                            AWT = (WT₁ + WT₂ + ... + WTₙ) / n
                        </code>
                    </div>
                </div>

                <ToggleableExample title="📝 Example: Calculating Turnaround and Waiting Time">
                    <div className="example-content">
                        <p><strong>Given:</strong> Process P1 with AT=0, BT=5, and it completes at CT=8</p>
                        <div className="calculation">
                            <p>Turnaround Time = CT − AT = 8 − 0 = <strong>8 units</strong></p>
                            <p>Waiting Time = TAT − BT = 8 − 5 = <strong>3 units</strong></p>
                        </div>
                        <p className="insight">
                            💡 P1 spent 3 time units waiting in the ready queue before completing!
                        </p>
                    </div>
                </ToggleableExample>

                <button
                    className="btn-jump-simulator"
                    onClick={() => onNavigateToSimulator('SJF')}
                >
                    🚀 Try SJF Simulation (Optimal AWT) →
                </button>
            </div>
        );
    }

    // Module 3: Preemption
    if (moduleId === 'preemption') {
        return (
            <div className="module-content">
                <h2 className="module-title">
                    <span className="module-icon">{icon}</span>
                    {title}
                </h2>

                <div className="content-section">
                    <h3>What is <GlossaryLink term="Preemption" setHoveredTerm={setHoveredTerm} />?</h3>
                    <p>
                        <strong>Preemption</strong> is the act of <em>interrupting</em> a currently
                        running process to allow another process to execute. The interrupted process
                        is moved back to the ready queue.
                    </p>

                    <div className="comparison-box">
                        <div className="comparison-item non-preemptive">
                            <h4>🚫 Non-Preemptive</h4>
                            <p>Once a process starts, it runs until completion or I/O.</p>
                            <ul>
                                <li>Simpler to implement</li>
                                <li>Lower context switch overhead</li>
                                <li>Can cause <GlossaryLink term="Convoy Effect" setHoveredTerm={setHoveredTerm} /></li>
                            </ul>
                            <span className="algo-examples">Examples: FCFS, SJF</span>
                        </div>
                        <div className="comparison-item preemptive">
                            <h4>✅ Preemptive</h4>
                            <p>Scheduler can interrupt a running process at any time.</p>
                            <ul>
                                <li>Better response time</li>
                                <li>More <GlossaryLink term="Context Switch" setHoveredTerm={setHoveredTerm} /> overhead</li>
                                <li>Prevents long processes from hogging CPU</li>
                            </ul>
                            <span className="algo-examples">Examples: SRTF, Round Robin, Priority (P)</span>
                        </div>
                    </div>
                </div>

                <ToggleableExample title="🔍 Click: See SRTF as Preemptive SJF">
                    <div className="example-content">
                        <div className="side-by-side">
                            <div className="example-left">
                                <h5>SJF (Non-Preemptive)</h5>
                                <p>Selects the process with the shortest <em>total</em> burst time.</p>
                                <p>Once selected, the process runs to completion.</p>
                            </div>
                            <div className="example-right">
                                <h5>SRTF (Preemptive SJF)</h5>
                                <p>Selects the process with the shortest <em>remaining</em> time.</p>
                                <p>If a new process arrives with shorter remaining time, it preempts!</p>
                            </div>
                        </div>
                        <div className="timeline-example">
                            <p><strong>Scenario:</strong> P1 (BT=10) arrives at t=0, P2 (BT=3) arrives at t=2</p>
                            <div className="timeline">
                                <div className="timeline-bar sjf">
                                    <span>SJF: P1 runs 0→10, then P2 runs 10→13</span>
                                </div>
                                <div className="timeline-bar srtf">
                                    <span>SRTF: P1 runs 0→2, P2 preempts 2→5, P1 resumes 5→13</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ToggleableExample>

                <button
                    className="btn-jump-simulator"
                    onClick={() => onNavigateToSimulator('SRTF')}
                >
                    🚀 Try SRTF (Preemptive) Simulation →
                </button>
            </div>
        );
    }

    // Module 4: Advanced Concepts
    if (moduleId === 'advanced') {
        return (
            <div className="module-content">
                <h2 className="module-title">
                    <span className="module-icon">{icon}</span>
                    {title}
                </h2>

                <div className="content-section">
                    <h3><GlossaryLink term="Convoy Effect" setHoveredTerm={setHoveredTerm} /></h3>
                    <p>
                        A phenomenon in <strong>FCFS</strong> where many short processes "convoy"
                        behind a long process, causing poor average waiting time.
                    </p>
                    <div className="warning-box">
                        <span className="warning-icon">⚠️</span>
                        <div>
                            <p><strong>Why it happens:</strong></p>
                            <p>
                                If a CPU-bound process with high burst time arrives first, all
                                subsequent short I/O-bound processes must wait, even if they
                                only need the CPU for 1-2 units.
                            </p>
                        </div>
                    </div>
                    <ToggleableExample title="📊 Convoy Effect Example">
                        <div className="example-content">
                            <p>Consider: P1 (BT=100) arrives at t=0, P2, P3, P4 (BT=1 each) arrive at t=1</p>
                            <div className="convoy-visual">
                                <div className="big-truck">P1 (100 units) 🚛</div>
                                <div className="small-cars">P2 🚗 P3 🚗 P4 🚗 waiting...</div>
                            </div>
                            <p className="insight">
                                With FCFS: P2 waits 99 units, P3 waits 100, P4 waits 101! <br />
                                Average WT = (0 + 99 + 100 + 101) / 4 = <strong>75 units</strong>
                            </p>
                        </div>
                    </ToggleableExample>
                </div>

                <div className="content-section">
                    <h3><GlossaryLink term="Starvation" setHoveredTerm={setHoveredTerm} /></h3>
                    <p>
                        A situation where a process <strong>waits indefinitely</strong> because
                        other processes continuously receive preference.
                    </p>
                    <div className="warning-box">
                        <span className="warning-icon">🚨</span>
                        <div>
                            <p><strong>Common in:</strong> Priority Scheduling (without aging)</p>
                            <p>
                                Low-priority processes may never run if high-priority processes
                                keep arriving.
                            </p>
                        </div>
                    </div>
                    <div className="solution-box">
                        <h4>✅ Solution: <GlossaryLink term="Aging" setHoveredTerm={setHoveredTerm} /></h4>
                        <p>
                            Gradually increase the priority of waiting processes over time.
                            Eventually, even low-priority processes will become high-priority
                            and get scheduled.
                        </p>
                    </div>
                </div>

                <div className="content-section">
                    <h3><GlossaryLink term="Time Quantum" setHoveredTerm={setHoveredTerm} /> (Round Robin)</h3>
                    <p>
                        In Round Robin, each process receives a fixed time slice called the
                        <strong> time quantum</strong> (or time slice).
                    </p>

                    <div className="quantum-tips">
                        <div className="tip good">
                            <h5>⚖️ Choosing the Right Quantum</h5>
                            <ul>
                                <li><strong>Too small:</strong> High context switch overhead</li>
                                <li><strong>Too large:</strong> Degrades to FCFS behavior</li>
                                <li><strong>Optimal:</strong> ~80% of CPU bursts should complete within one quantum</li>
                            </ul>
                        </div>
                    </div>

                    <ToggleableExample title="🔢 Round Robin with Context Switches">
                        <div className="example-content">
                            <p><strong>Given:</strong> P1 (BT=10), P2 (BT=4), Quantum=4, Context Switch=1</p>
                            <div className="rr-timeline">
                                <div className="rr-segment" style={{ width: '80px' }}>P1 (4)</div>
                                <div className="rr-segment cs" style={{ width: '20px' }}>CS</div>
                                <div className="rr-segment" style={{ width: '80px' }}>P2 (4)</div>
                                <div className="rr-segment cs" style={{ width: '20px' }}>CS</div>
                                <div className="rr-segment" style={{ width: '80px' }}>P1 (4)</div>
                                <div className="rr-segment cs" style={{ width: '20px' }}>CS</div>
                                <div className="rr-segment" style={{ width: '40px' }}>P1 (2)</div>
                            </div>
                            <p className="insight">
                                💡 With context switches, total time = 10 + 4 + 3 = <strong>17 units</strong>
                                instead of 14!
                            </p>
                        </div>
                    </ToggleableExample>
                </div>

                <button
                    className="btn-jump-simulator"
                    onClick={() => onNavigateToSimulator('ROUND_ROBIN')}
                >
                    🚀 Try Round Robin Simulation →
                </button>
            </div>
        );
    }

    // Default fallback
    return null;
}

export default ModuleContent;
