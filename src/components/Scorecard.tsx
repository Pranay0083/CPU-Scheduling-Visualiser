import { useScheduler } from '../context/SchedulerContext';
import type { PredictionResults, ScoreBreakdown } from '../types';

// Calculate prediction score
function calculatePredictionResults(
    predictions: { processId: string; processName: string; predictedCT: number | null }[],
    processes: { id: string; completionTime: number | null; waitTime: number }[],
    predictedAWT: number | null
): PredictionResults {
    const breakdown: ScoreBreakdown[] = [];
    let totalScore = 0;
    let maxScore = 0;

    // Score each process prediction
    predictions.forEach(pred => {
        const process = processes.find(p => p.id === pred.processId);
        const actualCT = process?.completionTime ?? null;
        let points = 0;
        let difference: number | null = null;

        if (pred.predictedCT !== null && actualCT !== null) {
            difference = Math.abs(pred.predictedCT - actualCT);
            if (difference === 0) {
                points = 10; // Exact match
            } else if (difference <= 1) {
                points = 5; // Within ±1
            } else if (difference <= 3) {
                points = 2; // Within ±3
            }
        }

        maxScore += 10;
        totalScore += points;

        breakdown.push({
            processId: pred.processId,
            processName: pred.processName,
            predictedCT: pred.predictedCT,
            actualCT,
            difference,
            points,
        });
    });

    // Calculate actual AWT
    const completedProcesses = processes.filter(p => p.completionTime !== null);
    const actualAWT = completedProcesses.length > 0
        ? completedProcesses.reduce((sum, p) => sum + p.waitTime, 0) / completedProcesses.length
        : 0;

    // Score AWT prediction
    let awtPoints = 0;
    let awtDifference: number | null = null;
    if (predictedAWT !== null) {
        awtDifference = Math.abs(predictedAWT - actualAWT);
        if (awtDifference <= 0.5) {
            awtPoints = 20;
        } else if (awtDifference <= 1) {
            awtPoints = 10;
        } else if (awtDifference <= 2) {
            awtPoints = 5;
        }
    }
    maxScore += 20;
    totalScore += awtPoints;

    const accuracy = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    return {
        breakdown,
        predictedAWT,
        actualAWT,
        awtDifference,
        awtPoints,
        totalScore,
        maxScore,
        accuracy,
    };
}

function getScoreClass(points: number, maxPoints: number): string {
    const ratio = points / maxPoints;
    if (ratio >= 1) return 'score-perfect';
    if (ratio >= 0.5) return 'score-good';
    if (ratio > 0) return 'score-partial';
    return 'score-miss';
}

function getDifferenceClass(difference: number | null): string {
    if (difference === null) return '';
    if (difference === 0) return 'diff-exact';
    if (difference <= 1) return 'diff-close';
    if (difference <= 3) return 'diff-near';
    return 'diff-far';
}

export function Scorecard() {
    const { state, reset } = useScheduler();
    const { predictionState, processes, interactionMode } = state;

    if (interactionMode !== 'PREDICT_VERIFY' || !predictionState.showResults) {
        return null;
    }

    const results = calculatePredictionResults(
        predictionState.predictions,
        processes,
        predictionState.predictedAWT
    );

    const accuracyClass = results.accuracy >= 80 ? 'accuracy-high' :
        results.accuracy >= 50 ? 'accuracy-medium' : 'accuracy-low';

    return (
        <div className="scorecard-overlay">
            <div className="scorecard">
                <h2 className="scorecard-title">📊 Results</h2>

                <div className={`scorecard-accuracy ${accuracyClass}`}>
                    <span className="accuracy-value">{results.accuracy.toFixed(0)}%</span>
                    <span className="accuracy-label">Accuracy</span>
                </div>

                <div className="scorecard-score">
                    <span className="score-value">{results.totalScore}</span>
                    <span className="score-max">/ {results.maxScore} points</span>
                </div>

                <table className="scorecard-table">
                    <thead>
                        <tr>
                            <th>Process</th>
                            <th>Predicted CT</th>
                            <th>Actual CT</th>
                            <th>Diff</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.breakdown.map(row => (
                            <tr key={row.processId} className={getScoreClass(row.points, 10)}>
                                <td>{row.processName}</td>
                                <td>{row.predictedCT ?? '-'}</td>
                                <td>{row.actualCT ?? '-'}</td>
                                <td className={getDifferenceClass(row.difference)}>
                                    {row.difference !== null ? `±${row.difference}` : '-'}
                                </td>
                                <td className="points-cell">+{row.points}</td>
                            </tr>
                        ))}
                        <tr className={`awt-row ${getScoreClass(results.awtPoints, 20)}`}>
                            <td colSpan={1}><strong>AWT</strong></td>
                            <td>{results.predictedAWT?.toFixed(2) ?? '-'}</td>
                            <td>{results.actualAWT.toFixed(2)}</td>
                            <td className={getDifferenceClass(results.awtDifference)}>
                                {results.awtDifference !== null ? `±${results.awtDifference.toFixed(2)}` : '-'}
                            </td>
                            <td className="points-cell">+{results.awtPoints}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="scorecard-legend">
                    <span className="legend-item score-perfect">Exact +10</span>
                    <span className="legend-item score-good">±1: +5</span>
                    <span className="legend-item score-partial">±3: +2</span>
                    <span className="legend-item score-miss">&gt;3: +0</span>
                </div>

                <button className="scorecard-close" onClick={reset}>
                    🔄 Try Again
                </button>
            </div>
        </div>
    );
}
