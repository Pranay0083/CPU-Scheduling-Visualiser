import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSandbox } from '../components/sandbox/useSandbox';
import { SandboxHeader } from '../components/sandbox/SandboxHeader';
import { DraftingStudio } from '../components/sandbox/DraftingStudio';
import { LiveStats } from '../components/sandbox/LiveStats';
import { KernelLog } from '../components/sandbox/KernelLog';
import { HistoryTrails } from '../components/sandbox/HistoryTrails';
import { SandboxCanvas } from '../components/sandbox/SandboxCanvas';
import { ThemeToggle } from '../components/ThemeToggle';

export function Sandbox() {
    const navigate = useNavigate();

    // Initialize the massive Simulation State Hook
    const sandboxState = useSandbox();

    const {
        algorithm,
        isPlaying,
        speedMultiplier,
        time,
        timeQuantum,
        isAgingEnabled,
        agingInterval,
        starvationThreshold,
        mlfqQ0Quantum,
        mlfqQ1Quantum,
        mlfqBoostInterval,
        cores,
        processes,
        segments,
        avgWaitTime,
        setAlgorithm,
        setIsPlaying,
        setSpeedMultiplier,
        setTimeQuantum,
        setIsAgingEnabled,
        setAgingInterval,
        setStarvationThreshold,
        setMlfqQ0Quantum,
        setMlfqQ1Quantum,
        setMlfqBoostInterval,
        addProcess,
        setCoresCount,
        loadPreset,
        reset,
        stepForward,
        draftBurst,
        setDraftBurst,
        draftPriority,
        setDraftPriority,
        draftArrival,
        setDraftArrival
    } = sandboxState;

    return (
        <>
            {/* Mobile Block Notice */}
            <div className="md:hidden h-screen w-full bg-[var(--bg-color)] text-[var(--cpu-stroke)] flex flex-col items-center justify-center p-8 text-center font-sans">
                <div className="w-24 h-24 border-2 border-dashed hand-drawn-border border-[var(--cpu-stroke)] flex items-center justify-center mb-6">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="font-architect text-3xl mb-4">Sandbox Requires a Desktop</h2>
                <p className="opacity-80 text-lg mb-8 max-w-sm">
                    The complexity of the OS scheduler cannot be contained on a phone screen. Please switch to a desktop to enter the lab.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 font-architect border-b border-[var(--cpu-stroke)] hover:text-blue-500 hover:border-blue-500 transition-colors text-xl"
                >
                    <ArrowLeft className="w-5 h-5" /> Return Home
                </button>
            </div>

            {/* Main Sandbox Interface (Hidden on mobile) */}
            <div className="hidden md:flex h-screen w-full bg-[var(--bg-color)] text-[var(--cpu-stroke)] overflow-hidden relative font-sans flex-col">

                {/* Unified Top Navigation Bar */}
                <div className="w-full flex items-center justify-between px-6 pt-2 pb-2 z-50 relative pointer-events-none">

                    {/* Left: Exit Lab */}
                    <button
                    onClick={() => {
                        reset();
                        navigate('/');
                    }}
                    className="flex items-center gap-2 font-architect border-b border-transparent hover:border-[var(--cpu-stroke)] transition-colors opacity-70 hover:opacity-100 text-xl pointer-events-auto"
                >
                    <ArrowLeft className="w-5 h-5" /> Exit Lab
                </button>

                {/* Center: Sandbox Header (Brain Controls) */}
                <div className="flex-1 flex justify-center pointer-events-auto">
                    <SandboxHeader
                        algorithm={algorithm}
                        setAlgorithm={setAlgorithm}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        speedMultiplier={speedMultiplier}
                        setSpeedMultiplier={setSpeedMultiplier}
                        starvationThreshold={starvationThreshold}
                        setStarvationThreshold={setStarvationThreshold}
                        stepForward={stepForward}
                    />
                </div>

                {/* Right: Theme Toggle */}
                <div className="w-24 flex justify-end pointer-events-auto">
                    <ThemeToggle />
                </div>

            </div>

            {/* The Assembly Floor: Main layout area */}
            <div className="flex-1 w-full flex flex-row overflow-hidden relative z-20 pb-16 border-dashed border-[var(--grid-color)] border-t-2">

                {/* Left Sidebar: The Drafting Studio (20% width) */}
                <div className="w-[20%] min-w-[300px] h-full border-r border-dashed border-[var(--grid-color)] p-6 bg-[var(--bg-color)]/80 backdrop-blur-sm z-30 overflow-y-auto">
                    <DraftingStudio
                        addProcess={addProcess}
                        processes={processes}
                        draftBurst={draftBurst}
                        setDraftBurst={setDraftBurst}
                        draftPriority={draftPriority}
                        setDraftPriority={setDraftPriority}
                        draftArrival={draftArrival}
                        setDraftArrival={setDraftArrival}
                        coresCount={cores.length}
                        setCoresCount={setCoresCount}
                        loadPreset={loadPreset}
                        currentTime={time}
                        algorithm={algorithm}
                        timeQuantum={timeQuantum}
                        setTimeQuantum={setTimeQuantum}
                        isAgingEnabled={isAgingEnabled}
                        setIsAgingEnabled={setIsAgingEnabled}
                        agingInterval={agingInterval}
                        setAgingInterval={setAgingInterval}
                        mlfqQ0Quantum={mlfqQ0Quantum}
                        setMlfqQ0Quantum={setMlfqQ0Quantum}
                        mlfqQ1Quantum={mlfqQ1Quantum}
                        setMlfqQ1Quantum={setMlfqQ1Quantum}
                        mlfqBoostInterval={mlfqBoostInterval}
                        setMlfqBoostInterval={setMlfqBoostInterval}
                    />
                </div>

                {/* Main Stage: The Assembly Line (Center) */}
                <div className="flex-1 h-full relative z-20 overflow-hidden">
                    <SandboxCanvas
                        processes={processes}
                        cores={cores}
                        algorithm={algorithm}
                        draftBurst={draftBurst}
                        draftPriority={draftPriority}
                        time={time}
                        starvationThreshold={starvationThreshold}
                    />
                </div>

                {/* Right Sidebar: Stats Island (Top Right + Log at Bottom) */}
                <div className="w-[20%] min-w-[280px] h-full flex flex-col items-end p-6 z-30 pointer-events-none gap-6 pt-16 border-l border-dashed border-[var(--grid-color)] bg-[var(--bg-color)]/50 backdrop-blur-sm">
                    <div className="pointer-events-auto w-full">
                        <LiveStats
                            time={time}
                            avgWaitTime={avgWaitTime}
                            completedCount={processes.filter(p => p.status === 'completed').length}
                            totalCount={processes.length}
                        />
                    </div>

                    {/* Kernel Log filling remaining space */}
                    <div className="w-full h-0 flex-1 flex flex-col pointer-events-auto shadow-lg">
                        <KernelLog segments={segments} processes={processes} time={time} />
                    </div>
                </div>

            </div>

            {/* The Bottom Floor: History Ribbon */}
            <div className="absolute bottom-0 left-0 w-full z-40">
                <HistoryTrails
                    segments={segments}
                    cores={cores}
                    time={time}
                    processes={processes}
                />
            </div>

            {/* Faint Dotted Grid Background */}
            <div className="absolute inset-0 pointer-events-none z-0"
                style={{ backgroundImage: 'radial-gradient(var(--grid-color) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.3 }}
            />
            </div>
        </>
    );
}
