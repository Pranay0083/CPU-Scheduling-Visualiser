import React, { useState } from 'react';
import { useScheduler } from '../context/SchedulerContext';
import { parseBurstPattern } from '../types';

export function ProcessForm() {
    const { addProcess, state } = useScheduler();
    const [formData, setFormData] = useState({
        name: '',
        arrivalTime: 0,
        priority: 1,
        burstPattern: 'CPU(5)',
    });
    const [error, setError] = useState('');

    const isRunning = state.simulationState === 'RUNNING';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const bursts = parseBurstPattern(formData.burstPattern);

        if (bursts.length === 0) {
            setError('Invalid burst pattern. Use format: CPU(3) -> IO(2) -> CPU(5)');
            return;
        }

        if (!formData.name.trim()) {
            setError('Process name is required');
            return;
        }

        addProcess({
            name: formData.name.trim(),
            arrivalTime: formData.arrivalTime,
            priority: formData.priority,
            bursts,
            color: '',
        });

        // Reset form with incremented name
        const match = formData.name.match(/^P(\d+)$/);
        const nextName = match ? `P${parseInt(match[1]) + 1}` : 'P1';

        setFormData(prev => ({
            ...prev,
            name: nextName,
            arrivalTime: prev.arrivalTime + 1,
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="process-form">
            <h3 className="form-title">Add Process</h3>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="P1"
                        disabled={isRunning}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="arrivalTime">Arrival</label>
                    <input
                        id="arrivalTime"
                        type="number"
                        min="0"
                        value={formData.arrivalTime}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            arrivalTime: Math.max(0, parseInt(e.target.value) || 0)
                        }))}
                        disabled={isRunning}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <input
                        id="priority"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            priority: Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
                        }))}
                        disabled={isRunning}
                        className="form-input"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="burstPattern">Burst Pattern</label>
                <input
                    id="burstPattern"
                    type="text"
                    value={formData.burstPattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, burstPattern: e.target.value }))}
                    placeholder="CPU(3) -> IO(2) -> CPU(5)"
                    disabled={isRunning}
                    className="form-input burst-input"
                />
                <span className="form-hint">Format: CPU(n) → IO(n) → CPU(n)</span>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" disabled={isRunning} className="form-submit">
                + Add Process
            </button>
        </form>
    );
}
