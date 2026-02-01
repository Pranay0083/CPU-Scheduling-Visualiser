export function FormulaCheatSheet() {
    return (
        <div className="module-content formula-cheatsheet">
            <h2 className="module-title">
                <span className="module-icon">📐</span>
                Formula Cheat Sheet
            </h2>

            <div className="content-section">
                <h3>Core Formulas</h3>
                <p>
                    These are the fundamental equations you'll use when solving scheduling problems:
                </p>

                <div className="formula-grid">
                    <div className="formula-card primary">
                        <h4>Turnaround Time (TAT)</h4>
                        <div className="latex-formula">
                            <span className="formula-main">TAT = CT − AT</span>
                        </div>
                        <p className="formula-desc">
                            Time from arrival to completion
                        </p>
                    </div>

                    <div className="formula-card primary">
                        <h4>Waiting Time (WT)</h4>
                        <div className="latex-formula">
                            <span className="formula-main">WT = TAT − BT</span>
                        </div>
                        <p className="formula-desc">
                            Time spent waiting in ready queue
                        </p>
                        <p className="formula-alt">
                            Alternative: WT = CT − AT − BT
                        </p>
                    </div>

                    <div className="formula-card primary">
                        <h4>Average Waiting Time (AWT)</h4>
                        <div className="latex-formula">
                            <span className="formula-main">AWT = Σ(WTᵢ) / n</span>
                        </div>
                        <p className="formula-desc">
                            Sum of all waiting times divided by number of processes
                        </p>
                    </div>

                    <div className="formula-card">
                        <h4>Average Turnaround Time (ATT)</h4>
                        <div className="latex-formula">
                            <span className="formula-main">ATT = Σ(TATᵢ) / n</span>
                        </div>
                        <p className="formula-desc">
                            Average time for a process to complete
                        </p>
                    </div>

                    <div className="formula-card">
                        <h4>CPU Utilization</h4>
                        <div className="latex-formula">
                            <span className="formula-main">Util = (Busy Time / Total Time) × 100%</span>
                        </div>
                        <p className="formula-desc">
                            Percentage of time CPU is actively processing
                        </p>
                    </div>

                    <div className="formula-card">
                        <h4>Throughput</h4>
                        <div className="latex-formula">
                            <span className="formula-main">TP = Processes Completed / Total Time</span>
                        </div>
                        <p className="formula-desc">
                            Number of processes finished per unit time
                        </p>
                    </div>
                </div>
            </div>

            <div className="content-section">
                <h3>Pro-Tips for Tricky Scenarios</h3>

                <div className="pro-tips">
                    <div className="pro-tip">
                        <div className="tip-header">
                            <span className="tip-badge">🔄 Round Robin</span>
                            <h4>Context Switch Overhead</h4>
                        </div>
                        <div className="tip-content">
                            <p>
                                When calculating with context switches, add CS time after every
                                quantum expiration (except the last):
                            </p>
                            <div className="tip-formula">
                                <code>
                                    Total Time = Σ(BT) + (Number of Context Switches × CS Time)
                                </code>
                            </div>
                            <div className="tip-example">
                                <strong>Example:</strong> P1(BT=7), P2(BT=4), Q=4, CS=1
                                <br />
                                Switches: P1→P2, P2→P1, P1→done = 2 switches (last doesn't count)
                                <br />
                                Total = 7 + 4 + 2(1) = <strong>13 units</strong>
                            </div>
                        </div>
                    </div>

                    <div className="pro-tip">
                        <div className="tip-header">
                            <span className="tip-badge">⭐ Priority</span>
                            <h4>Priority Inversion</h4>
                        </div>
                        <div className="tip-content">
                            <p>
                                When a low-priority process holds a resource needed by a
                                high-priority process:
                            </p>
                            <ul>
                                <li><strong>Problem:</strong> High-priority waits for low-priority</li>
                                <li><strong>Solution:</strong> Priority Inheritance Protocol</li>
                            </ul>
                            <div className="tip-caution">
                                ⚠️ This visualizer doesn't simulate resource locks, but real
                                systems must handle this!
                            </div>
                        </div>
                    </div>

                    <div className="pro-tip">
                        <div className="tip-header">
                            <span className="tip-badge">📈 Aging</span>
                            <h4>Calculating Priority with Aging</h4>
                        </div>
                        <div className="tip-content">
                            <div className="tip-formula">
                                <code>
                                    New Priority = Original Priority − (Wait Time / Aging Threshold)
                                </code>
                            </div>
                            <p>
                                <strong>Note:</strong> Lower number = Higher priority in most systems
                            </p>
                            <div className="tip-example">
                                <strong>Example:</strong> Priority=10, Wait=30, Threshold=10
                                <br />
                                New Priority = 10 − (30/10) = 10 − 3 = <strong>7</strong> (boosted!)
                            </div>
                        </div>
                    </div>

                    <div className="pro-tip">
                        <div className="tip-header">
                            <span className="tip-badge">🔀 MLFQ</span>
                            <h4>Multi-Level Feedback Queue</h4>
                        </div>
                        <div className="tip-content">
                            <p>Key rules to remember:</p>
                            <ul>
                                <li>New processes start at the <strong>highest priority queue</strong></li>
                                <li>If a process uses full quantum, it moves <strong>down</strong> a level</li>
                                <li>If a process does I/O before quantum expires, it <strong>stays</strong> at same level</li>
                                <li>Higher queues have <strong>smaller quantums</strong></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pro-tip">
                        <div className="tip-header">
                            <span className="tip-badge">⚡ SRTF</span>
                            <h4>Optimal Average Waiting Time</h4>
                        </div>
                        <div className="tip-content">
                            <p>
                                <strong>SRTF is provably optimal</strong> for minimizing average
                                waiting time (among non-idling schedulers).
                            </p>
                            <div className="tip-caution">
                                ⚠️ However, it requires knowing burst times in advance and can
                                cause starvation of long processes!
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-section">
                <h3>Quick Reference Table</h3>
                <div className="reference-table-wrapper">
                    <table className="reference-table">
                        <thead>
                            <tr>
                                <th>Algorithm</th>
                                <th>Type</th>
                                <th>Starvation?</th>
                                <th>Best For</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>FCFS</strong></td>
                                <td>Non-Preemptive</td>
                                <td>No</td>
                                <td>Batch systems, simplicity</td>
                            </tr>
                            <tr>
                                <td><strong>SJF</strong></td>
                                <td>Non-Preemptive</td>
                                <td>Yes (long processes)</td>
                                <td>Known burst times</td>
                            </tr>
                            <tr>
                                <td><strong>SRTF</strong></td>
                                <td>Preemptive</td>
                                <td>Yes (long processes)</td>
                                <td>Optimal AWT</td>
                            </tr>
                            <tr>
                                <td><strong>Round Robin</strong></td>
                                <td>Preemptive</td>
                                <td>No</td>
                                <td>Time-sharing, fairness</td>
                            </tr>
                            <tr>
                                <td><strong>Priority</strong></td>
                                <td>Both</td>
                                <td>Yes (low priority)</td>
                                <td>Importance-based systems</td>
                            </tr>
                            <tr>
                                <td><strong>MLFQ</strong></td>
                                <td>Preemptive</td>
                                <td>Possible</td>
                                <td>General-purpose OS</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default FormulaCheatSheet;
