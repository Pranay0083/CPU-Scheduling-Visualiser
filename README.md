# ⚡ CoreFlow: CPU Scheduler Visualizer

A comprehensive, interactive CPU scheduling algorithms visualizer and simulator built with React + TypeScript + Vite.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://cpu-scheduling-visualiser.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF)](https://vite.dev/)

> Visualize process life cycles, master complex scheduling algorithms, and test your OS knowledge with real-time simulations.

---

## ✨ Features

### 🎮 Scheduling Algorithms (6 Total)

| Algorithm | Type | Description |
|-----------|------|-------------|
| **FCFS** | Non-preemptive | First Come First Serve |
| **SJF** | Non-preemptive | Shortest Job First |
| **SRTF** | Preemptive | Shortest Remaining Time First |
| **Round Robin** | Preemptive | Time quantum based |
| **Priority** | Both modes | Preemptive & Non-preemptive |
| **MLFQ** | Preemptive | Multi-Level Feedback Queue |

### 🖥️ Multi-Core Support
- Toggle between 1, 2, or 4 CPU cores
- **Shortest Queue First** load balancing
- Parallel Gantt charts for each core

### 💾 I/O Burst Handling
- Realistic process patterns: `CPU(n) → I/O(n) → CPU(n)`
- Automatic I/O wait queue management
- Visual I/O queue representation

### 🔥 Advanced Features
- **Starvation Heat Map**: Watch processes turn red as they wait too long
- **Priority Aging**: Rescue starving processes automatically
- **Speed Control**: Adjust simulation speed (0.5x - 4x)
- **Dark/Light Mode**: Toggle theme for comfortable viewing

### 📝 Test Mode
- **Predict & Verify**: Enter completion time predictions before simulation
- **Quiz Mode**: Answer questions about scheduler decisions at critical points
- **Scorecard**: Track your accuracy with detailed results

### 📚 Learning Hub
- **Structured Modules**: Learn CPU scheduling from basics to advanced concepts
- **Interactive Examples**: See algorithms in action with toggleable comparisons
- **Formula Cheat Sheet**: All formulas with pro-tips for common mistakes
- **Visual Glossary**: Hover tooltips for key terms

### 🚀 Landing Page
- Beautiful hero section with animated gradient title
- 3-Pillar navigation: Learn, Visualize, Test
- One-click demo presets (Convoy Effect, Starvation, etc.)
- Process journey visualization

---

## 🏃 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Pranay0083/CPU-Scheduling-Visualiser.git

# Navigate to project directory
cd CPU-Scheduling-Visualiser

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🎯 How to Use

### 1. Simulator Mode
1. Select an algorithm from the **Control Panel**
2. Add processes with arrival time, burst time, and priority
3. Choose number of CPU cores (1, 2, or 4)
4. Click **Play** to start simulation
5. Watch the Gantt chart animate and metrics update in real-time

### 2. Test Mode
1. Toggle to **Predict & Verify** or **Quiz Mode**
2. Enter your predictions for completion times
3. Run simulation to see actual results
4. Get scored on your accuracy

### 3. Learning Hub
1. Click **Learn** in the navigation
2. Read through structured modules
3. Toggle interactive examples
4. Use the Formula Cheat Sheet for quick reference

---

## 🏗️ Architecture

```
src/
├── types.ts                    # TypeScript interfaces
├── App.tsx                     # Main application component
├── context/
│   └── SchedulerContext.tsx    # State management (React Context + useReducer)
├── engine/
│   └── algorithms/
│       └── index.ts            # All scheduling algorithm implementations
└── components/
    ├── LandingPage.tsx         # Landing page with hero section
    ├── LearnPage.tsx           # Learning hub
    ├── ControlPanel.tsx        # Algorithm & settings controls
    ├── ProcessForm.tsx         # Process input form
    ├── GanttChart.tsx          # Animated Gantt chart visualization
    ├── MetricsDashboard.tsx    # Real-time metrics display
    ├── KernelLog.tsx           # Scheduler decision log
    ├── ProcessQueue.tsx        # Running/Ready/I/O queue visualization
    └── ...
```

---

## 📊 Metrics Displayed

| Metric | Description |
|--------|-------------|
| **CPU Utilization** | Percentage of time CPU is busy |
| **Throughput** | Processes completed per unit time |
| **Average Waiting Time (AWT)** | Mean time in ready queue |
| **Average Turnaround Time (ATAT)** | Mean time from arrival to completion |
| **Response Time** | Time from arrival to first CPU burst |

---

## 🎨 UI/UX Highlights

- **Dark Mode**: Deep navy/slate background with vibrant accents
- **Light Mode**: Clean, bright interface for daytime use
- **Responsive Design**: Works on desktop and tablet
- **Smooth Animations**: Micro-interactions for enhanced experience
- **System Font Stack**: Clean typography with monospace for data

---

## 🧪 Demo Scenarios

Click these in the landing page for instant demos:

| Demo | Algorithm | What it Shows |
|------|-----------|---------------|
| **Convoy Effect** | FCFS | Long process blocking short ones |
| **Time Quantum Test** | Round Robin | Impact of quantum size |
| **Starvation Demo** | Priority | Low-priority process never executing |

---

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript 5
- **Build Tool**: Vite 7
- **Styling**: CSS with CSS Variables
- **State Management**: React Context + useReducer
- **Package Manager**: npm

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<p align="center">
  <strong>Currently simulating 6 algorithms, 4 cores, and ∞ possibilities</strong> 💜
</p>
