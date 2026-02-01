import { useScheduler } from '../context/SchedulerContext';

export function PredictionTable() {
    const { state, setPrediction, setAWTPrediction, submitPredictions, initPredictions } = useScheduler();
    const { predictionState, processes, interactionMode, simulationState } = state;

    // Initialize predictions when processes change
    const shouldInit = processes.length > 0 &&
        predictionState.predictions.length !== processes.length &&
        !predictionState.submitted;

    if (shouldInit && interactionMode === 'PREDICT_VERIFY') {
        initPredictions();
    }

    if (interactionMode !== 'PREDICT_VERIFY') {
        return null;
    }

    if (processes.length === 0) {
        return (
            <div className="prediction-table">
                <h3 className="prediction-title">📝 Predict & Verify</h3>
                <p className="prediction-empty">Add processes first, then make your predictions!</p>
            </div>
        );
    }

    const handlePredictionChange = (processId: string, value: string) => {
        const numValue = value === '' ? null : parseInt(value, 10);
        setPrediction(processId, numValue);
    };

    const handleAWTChange = (value: string) => {
        const numValue = value === '' ? null : parseFloat(value);
        setAWTPrediction(numValue);
    };

    const handleSubmit = () => {
        submitPredictions();
    };

    const allPredictionsFilled = predictionState.predictions.every(p => p.predictedCT !== null) &&
        predictionState.predictedAWT !== null;

    const isDisabled = predictionState.submitted || simulationState === 'RUNNING';

    return (
        <div className="prediction-table">
            <h3 className="prediction-title">
                📝 Predict & Verify
                {predictionState.submitted && <span className="prediction-locked">🔒 Locked</span>}
            </h3>

            <p className="prediction-hint">
                Predict the Completion Time (CT) for each process and the Average Waiting Time (AWT).
            </p>

            <div className="prediction-grid">
                <div className="prediction-header">
                    <span>Process</span>
                    <span>Arrival</span>
                    <span>Burst</span>
                    <span>Predicted CT</span>
                </div>

                {predictionState.predictions.map(prediction => {
                    const process = processes.find(p => p.id === prediction.processId);
                    if (!process) return null;

                    const totalBurst = process.bursts.reduce((sum, b) => sum + b.duration, 0);

                    return (
                        <div key={prediction.processId} className="prediction-row">
                            <span className="prediction-process-name">
                                <span
                                    className="prediction-color-dot"
                                    style={{ backgroundColor: process.color }}
                                />
                                {prediction.processName}
                            </span>
                            <span className="prediction-value">{process.arrivalTime}</span>
                            <span className="prediction-value">{totalBurst}</span>
                            <input
                                type="number"
                                min="0"
                                value={prediction.predictedCT ?? ''}
                                onChange={(e) => handlePredictionChange(prediction.processId, e.target.value)}
                                disabled={isDisabled}
                                className={`prediction-input ${prediction.predictedCT === null ? 'empty' : ''}`}
                                placeholder="?"
                            />
                        </div>
                    );
                })}
            </div>

            <div className="prediction-awt">
                <label>
                    <span>Predicted Avg Waiting Time (AWT):</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={predictionState.predictedAWT ?? ''}
                        onChange={(e) => handleAWTChange(e.target.value)}
                        disabled={isDisabled}
                        className={`prediction-input awt-input ${predictionState.predictedAWT === null ? 'empty' : ''}`}
                        placeholder="?"
                    />
                </label>
            </div>

            {!predictionState.submitted && (
                <button
                    onClick={handleSubmit}
                    disabled={!allPredictionsFilled}
                    className="prediction-submit"
                >
                    {allPredictionsFilled ? '🔒 Lock Predictions & Start' : 'Fill all predictions first'}
                </button>
            )}

            {predictionState.submitted && simulationState === 'STOPPED' && (
                <p className="prediction-ready">
                    ✅ Predictions locked! Click <strong>Play</strong> to start the simulation.
                </p>
            )}
        </div>
    );
}
