import { useState, useEffect, useRef } from 'react';
import type { LearningModuleId, GlossaryTerm } from '../types';
import { FormulaCheatSheet } from './FormulaCheatSheet';
import { ModuleContent } from './ModuleContent';

// Glossary terms data
export const GLOSSARY_TERMS: GlossaryTerm[] = [
    {
        term: 'Preemption',
        definition: 'The act of temporarily interrupting a running process to allow another process to execute, typically done by the scheduler based on priority or time quantum.',
        example: 'In SRTF, when a new process arrives with a shorter burst than the remaining time of the current process, preemption occurs.',
    },
    {
        term: 'Time Quantum',
        definition: 'A fixed time slice allocated to each process in Round Robin scheduling. When expired, the process is moved to the back of the ready queue.',
        example: 'With a quantum of 4ms, each process runs for at most 4ms before being switched out.',
    },
    {
        term: 'Starvation',
        definition: 'A situation where a process waits indefinitely because other processes are continuously given preference.',
        example: 'In Priority Scheduling without aging, low-priority processes may starve if high-priority processes keep arriving.',
    },
    {
        term: 'Convoy Effect',
        definition: 'A phenomenon in FCFS where short processes must wait behind long processes, leading to poor average waiting time.',
        example: 'If process P1 with burst 100ms arrives first, processes P2, P3, P4 with bursts of 1ms each must all wait 100+ ms.',
    },
    {
        term: 'Context Switch',
        definition: 'The process of saving the state of a running process and loading the state of another process to continue execution.',
        example: 'Moving from P1 to P2 requires saving P1\'s registers and loading P2\'s state.',
    },
    {
        term: 'Turnaround Time',
        definition: 'Total time from process arrival to completion. Formula: Turnaround Time = Completion Time − Arrival Time.',
    },
    {
        term: 'Waiting Time',
        definition: 'Total time a process spends waiting in the ready queue. Formula: Waiting Time = Turnaround Time − Burst Time.',
    },
    {
        term: 'Throughput',
        definition: 'The number of processes completed per unit time. Higher throughput indicates better system efficiency.',
    },
    {
        term: 'Response Time',
        definition: 'Time from process arrival to first execution on the CPU. Critical for interactive systems.',
    },
    {
        term: 'Aging',
        definition: 'A technique to prevent starvation by gradually increasing the priority of waiting processes over time.',
        example: 'After every 10 time units of waiting, increase a process\'s priority by 1.',
    },
];

// Module navigation items
const MODULES: { id: LearningModuleId; title: string; icon: string }[] = [
    { id: 'basics', title: 'The Basics', icon: '📚' },
    { id: 'scheduling-criteria', title: 'Scheduling Criteria', icon: '📊' },
    { id: 'preemption', title: 'Preemption', icon: '🔄' },
    { id: 'advanced', title: 'Advanced Concepts', icon: '🎓' },
    { id: 'formulas', title: 'Formula Cheat Sheet', icon: '📐' },
];

interface LearnPageProps {
    onNavigateToSimulator: (algorithm?: string, preset?: string) => void;
    darkMode: boolean;
    onToggleDarkMode: () => void;
}

export function LearnPage({ onNavigateToSimulator, darkMode, onToggleDarkMode }: LearnPageProps) {
    const [activeModule, setActiveModule] = useState<LearningModuleId>('basics');
    const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const moduleRefs = useRef<Record<LearningModuleId, HTMLElement | null>>({
        'basics': null,
        'scheduling-criteria': null,
        'preemption': null,
        'advanced': null,
        'formulas': null,
    });

    // Handle scroll to update active module
    useEffect(() => {
        const handleScroll = () => {
            if (!contentRef.current) return;

            const scrollTop = contentRef.current.scrollTop;
            const offset = 100;

            for (const module of MODULES) {
                const el = moduleRefs.current[module.id];
                if (el) {
                    const top = el.offsetTop - offset;
                    const bottom = top + el.offsetHeight;
                    if (scrollTop >= top && scrollTop < bottom) {
                        setActiveModule(module.id);
                        break;
                    }
                }
            }
        };

        const content = contentRef.current;
        content?.addEventListener('scroll', handleScroll);
        return () => content?.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to module when clicking sidebar
    const scrollToModule = (moduleId: LearningModuleId) => {
        const el = moduleRefs.current[moduleId];
        if (el && contentRef.current) {
            contentRef.current.scrollTo({
                top: el.offsetTop - 20,
                behavior: 'smooth',
            });
            setActiveModule(moduleId);
        }
    };

    // Register module ref
    const registerModuleRef = (id: LearningModuleId, el: HTMLElement | null) => {
        moduleRefs.current[id] = el;
    };

    // Find glossary term definition
    const getTermDefinition = (term: string): GlossaryTerm | undefined => {
        return GLOSSARY_TERMS.find(g => g.term.toLowerCase() === term.toLowerCase());
    };

    return (
        <div className="learn-page">
            {/* Sidebar Navigation */}
            <aside className="learn-sidebar">
                <div className="learn-sidebar-header">
                    <h3>📖 Learning Modules</h3>
                    <button
                        className="theme-toggle"
                        onClick={onToggleDarkMode}
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>

                <nav className="learn-nav">
                    {MODULES.map((module) => (
                        <button
                            key={module.id}
                            className={`learn-nav-item ${activeModule === module.id ? 'active' : ''}`}
                            onClick={() => scrollToModule(module.id)}
                        >
                            <span className="nav-icon">{module.icon}</span>
                            <span className="nav-title">{module.title}</span>
                        </button>
                    ))}
                </nav>

                <div className="learn-sidebar-footer">
                    <button
                        className="btn-try-simulator"
                        onClick={() => onNavigateToSimulator()}
                    >
                        ⚡ Open Simulator
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="learn-content" ref={contentRef}>
                {/* Module 1: The Basics */}
                <section
                    id="basics"
                    className="learn-module"
                    ref={(el) => registerModuleRef('basics', el)}
                >
                    <ModuleContent
                        moduleId="basics"
                        title="Module 1: The Basics"
                        icon="📚"
                        hoveredTerm={hoveredTerm}
                        setHoveredTerm={setHoveredTerm}
                        getTermDefinition={getTermDefinition}
                        onNavigateToSimulator={onNavigateToSimulator}
                    />
                </section>

                {/* Module 2: Scheduling Criteria */}
                <section
                    id="scheduling-criteria"
                    className="learn-module"
                    ref={(el) => registerModuleRef('scheduling-criteria', el)}
                >
                    <ModuleContent
                        moduleId="scheduling-criteria"
                        title="Module 2: Scheduling Criteria"
                        icon="📊"
                        hoveredTerm={hoveredTerm}
                        setHoveredTerm={setHoveredTerm}
                        getTermDefinition={getTermDefinition}
                        onNavigateToSimulator={onNavigateToSimulator}
                    />
                </section>

                {/* Module 3: Preemption */}
                <section
                    id="preemption"
                    className="learn-module"
                    ref={(el) => registerModuleRef('preemption', el)}
                >
                    <ModuleContent
                        moduleId="preemption"
                        title="Module 3: Non-Preemptive vs Preemptive"
                        icon="🔄"
                        hoveredTerm={hoveredTerm}
                        setHoveredTerm={setHoveredTerm}
                        getTermDefinition={getTermDefinition}
                        onNavigateToSimulator={onNavigateToSimulator}
                    />
                </section>

                {/* Module 4: Advanced Concepts */}
                <section
                    id="advanced"
                    className="learn-module"
                    ref={(el) => registerModuleRef('advanced', el)}
                >
                    <ModuleContent
                        moduleId="advanced"
                        title="Module 4: Advanced Concepts"
                        icon="🎓"
                        hoveredTerm={hoveredTerm}
                        setHoveredTerm={setHoveredTerm}
                        getTermDefinition={getTermDefinition}
                        onNavigateToSimulator={onNavigateToSimulator}
                    />
                </section>

                {/* Formula Cheat Sheet */}
                <section
                    id="formulas"
                    className="learn-module"
                    ref={(el) => registerModuleRef('formulas', el)}
                >
                    <FormulaCheatSheet />
                </section>
            </main>

            {/* Floating Glossary Tooltip */}
            {hoveredTerm && getTermDefinition(hoveredTerm) && (
                <div className="glossary-tooltip">
                    <h4>{getTermDefinition(hoveredTerm)!.term}</h4>
                    <p>{getTermDefinition(hoveredTerm)!.definition}</p>
                    {getTermDefinition(hoveredTerm)!.example && (
                        <p className="tooltip-example">
                            <strong>Example:</strong> {getTermDefinition(hoveredTerm)!.example}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default LearnPage;
