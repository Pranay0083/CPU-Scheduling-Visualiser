import { motion } from 'framer-motion';
import { NarrativeChapter } from '../NarrativeChapter';
import { CpuCore } from '../CpuCore';
import { PidTag } from '../PidTag';

export function Chapter1TrafficController() {
    return (
        <NarrativeChapter
            id="chapter-1"
            headline="Chapter 1: The Traffic Controller"
            subHeadline="Your CPU is a genius, but it can only do one thing at a time. The OS is the choreographer deciding who gets the 'brain'."
        >
            <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-12 px-4 md:px-0">
                {/* The Ready Queue Mob */}
                <div className="relative w-48 h-64 border-2 border-dashed hand-drawn-border p-4 flex flex-col justify-center items-center" style={{ borderColor: 'var(--grid-color)' }}>
                    <span className="absolute -top-10 font-architect text-xl opacity-70">The Mob</span>

                    <motion.div
                        animate={{ x: [0, 20, -5, 10, 0], y: [0, -10, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute z-10"
                        style={{ top: '20px', left: '10px' }}
                    >
                        <PidTag pid={1042} state="ready" />
                    </motion.div>

                    <motion.div
                        animate={{ x: [0, -15, 10, -10, 0], y: [0, 15, -5, 5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className="absolute z-20"
                        style={{ top: '80px', right: '10px' }}
                    >
                        <PidTag pid={3110} state="ready" />
                    </motion.div>

                    <motion.div
                        animate={{ x: [0, 25, -15, 5, 0], y: [0, -20, 15, -5, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="absolute z-30"
                        style={{ bottom: '40px', left: '20px' }}
                    >
                        <PidTag pid={8080} state="ready" />
                    </motion.div>
                </div>

                {/* The bottleneck arrow */}
                <motion.svg
                    className="w-24 h-12 text-[var(--cpu-stroke)] opacity-50 rotate-90 md:rotate-0 transition-transform duration-500"
                    fill="none"
                    viewBox="0 0 100 50"
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <path stroke="currentColor" strokeWidth="3" strokeDasharray="5,5" strokeLinecap="round" d="M10,25 L80,25" />
                    <path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M70,10 L90,25 L70,40" />
                </motion.svg>

                {/* The CPU (Only one allowed) */}
                <div className="flex flex-col items-center">
                    <CpuCore />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-4 z-20 pointer-events-none">
                        <PidTag pid={4201} state="running" />
                    </div>
                </div>

                <div className="absolute bottom-[-100px] text-center w-full max-w-lg font-sans opacity-70">
                    <p className="italic">Goal: Keep the CPU 100% busy. No slacking.</p>
                </div>
            </div>
        </NarrativeChapter>
    );
}
