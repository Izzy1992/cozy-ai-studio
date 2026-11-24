window.Studio = window.Studio || {};

window.Studio.ZONES = [
  {
    id: "manager",
    name: "Studio Manager Office",
    shortName: "Manager Office",
    description: "Enclosed glass-and-oak corner suite with an executive desk, wide strategy monitor, brass lamp, bookshelf, and visitor seating.",
    occupants: ["agent-01"],
    focus: { x: 240, y: 155, zoom: 1.38 },
    badgeColor: "#d97706"
  },
  {
    id: "dev",
    name: "Main Development Area",
    shortName: "Main Dev Area",
    description: "Dedicated engineering wing featuring dual- and triple-monitor coding rigs, mechanical keyboards, system node diagrams, and warm pendant lights.",
    occupants: ["agent-03", "agent-04"],
    focus: { x: 80, y: -20, zoom: 1.32 },
    badgeColor: "#2563eb"
  },
  {
    id: "creative",
    name: "Creative Design Area",
    shortName: "Creative Design",
    description: "Sunlit design, art, and audio studio equipped with concept storyboards, digital pen display, color swatches, and studio monitor speakers.",
    occupants: ["agent-02", "agent-05", "agent-06"],
    focus: { x: -165, y: 10, zoom: 1.3 },
    badgeColor: "#db2777"
  },
  {
    id: "meeting",
    name: "Meeting Room",
    shortName: "Meeting Room",
    description: "Glass-walled team conference room with an oak boardroom table, six chairs, wall presentation display, whiteboard, and meeting briefs.",
    occupants: [],
    focus: { x: -160, y: 175, zoom: 1.35 },
    badgeColor: "#0d9488"
  },
  {
    id: "qa",
    name: "Testing & QA Area",
    shortName: "Testing & QA",
    description: "Multi-device quality assurance and child-safety test lab with desktop monitor, tablet, mobile device stand, and bug-tracking checklists.",
    occupants: ["agent-07"],
    focus: { x: -30, y: -175, zoom: 1.38 },
    badgeColor: "#447252"
  },
  {
    id: "lounge",
    name: "Cozy Relaxation Area",
    shortName: "Cozy Lounge",
    description: "Warm break lounge with a plush pastel sofa, low coffee table, espresso bar, water dispenser, bookshelf, and indoor greenery.",
    occupants: [],
    focus: { x: -340, y: -60, zoom: 1.38 },
    badgeColor: "#9333ea"
  }
];

window.Studio.AGENTS = [
  {
    id: "agent-01",
    code: "AGENT 01",
    name: "Clara Vance",
    title: "AI Studio Manager",
    zoneId: "manager",
    workstationName: "Executive Suite Desk #1 (Mahogany Desk & Wide Display)",
    seatPos: { x: 435, y: 270 },
    status: "At Workstation (Phase 1.1 Visual)",
    personality: "Organised, professional, responsible and strategic.",
    roleDescription: "Coordinates all studio agents, distributes tasks, monitors milestones, and prepares daily Director reports.",
    skills: ["Sprint Planning", "Task Triage", "Bottleneck Analysis", "Team Coordination"],
    responsibilities: [
      "Coordinate all seven studio agents",
      "Distribute tasks and balance workloads",
      "Monitor project progress and deadlines",
      "Organise team meetings and review submissions",
      "Prepare daily studio status reports"
    ],
    appearance: {
      skin: "#f2c6a0",
      hair: "#4a2c18",
      hairStyle: "bun",
      shirt: "#d97706",
      pants: "#334155",
      accent: "#fef3c7",
      accessory: "glasses"
    }
  },
  {
    id: "agent-02",
    code: "AGENT 02",
    name: "Leo Takahashi",
    title: "Game Designer & Child Experience Designer",
    zoneId: "creative",
    workstationName: "Concept & Mechanics Desk #2 (Storyboard & Level Board)",
    seatPos: { x: 735, y: 375 },
    status: "At Workstation (Phase 1.1 Visual)",
    personality: "Creative, imaginative and thoughtful.",
    roleDescription: "Crafts engaging, age-appropriate gameplay loops, progression systems, and joyful interactions for young players.",
    skills: ["Child UX (Ages 4–6)", "Gameplay Mechanics", "Level Pacing", "Interactive Storytelling"],
    responsibilities: [
      "Develop original kid-friendly game concepts",
      "Design intuitive gameplay mechanics",
      "Create rewarding progression systems",
      "Ensure age-appropriate difficulty and feedback"
    ],
    appearance: {
      skin: "#eab696",
      hair: "#1e293b",
      hairStyle: "spiky",
      shirt: "#0284c7",
      pants: "#1e3a8a",
      accent: "#e0f2fe",
      accessory: "lanyard"
    }
  },
  {
    id: "agent-03",
    code: "AGENT 03",
    name: "Marcus Chen",
    title: "Senior Frontend Developer",
    zoneId: "dev",
    workstationName: "Frontend Engineering Rig #3 (Dual Ultrawide Monitors)",
    seatPos: { x: 515, y: 445 },
    status: "At Workstation (Phase 1.1 Visual)",
    personality: "Analytical, precise and methodical.",
    roleDescription: "Architects responsive HTML5, CSS3, and modular Vanilla JavaScript systems with clean 60fps performance.",
    skills: ["HTML5 / CSS3", "Vanilla JS", "Responsive UI", "Browser Performance"],
    responsibilities: [
      "Develop clean semantic HTML structures",
      "Write maintainable responsive CSS",
      "Implement modular JavaScript architecture",
      "Optimise rendering performance across devices"
    ],
    appearance: {
      skin: "#e5b894",
      hair: "#18181b",
      hairStyle: "short",
      shirt: "#2563eb",
      pants: "#1e293b",
      accent: "#dbeafe",
      accessory: "glasses"
    }
  },
  {
    id: "agent-04",
    code: "AGENT 04",
    name: "Priya Nair",
    title: "Game Systems & AI Developer",
    zoneId: "dev",
    workstationName: "Systems & AI Architecture Rig #4 (Triple-Screen Station)",
    seatPos: { x: 645, y: 515 },
    status: "At Workstation (Phase 1.1 Visual)",
    personality: "Technical, logical and curious.",
    roleDescription: "Builds autonomous agent state machines, pathfinding, simulation engines, and future AI service adapters.",
    skills: ["State Machines", "Simulation Logic", "Pathfinding", "AI Orchestration"],
    responsibilities: [
      "Develop core game logic and rules",
      "Create autonomous character behaviours",
      "Implement state management and simulation loops",
      "Architect clean external AI integration contracts"
    ],
    appearance: {
      skin: "#b97a56",
      hair: "#1c1917",
      hairStyle: "long",
      shirt: "#7c3aed",
      pants: "#312e81",
      accent: "#ede9fe",
      accessory: "none"
    }
  },
  {
    id: "agent-05",
    code: "AGENT 05",
    name: "Elena Rostova",
    title: "Art Director & Environment Designer",
    zoneId: "creative",
    workstationName: "Art Studio Desk #5 (Pen Display & Color Swatch Station)",
    seatPos: { x: 845, y: 430 },
    status: "At Workstation (Phase 1.1 Visual)",
    personality: "Artistic, observant and imaginative.",
    roleDescription: "Establishes warm visual direction, isometric environments, color palettes, and expressive character designs.",
    skills: ["Isometric Art", "Color Theory", "Environment Design", "Character Concepts"],
    responsibilities: [
      "Design cohesive game environments and props",
      "Establish warm, welcoming visual direction",
      "Create character concepts and palettes",
      "Review studio-wide visual consistency"
    ],
    appearance: {
      skin: "#f6d2b8",
      hair: "#b45309",
      hairStyle: "bob",
      shirt: "#db2777",
      pants: "#4c1d95",
      accent: "#fce7f3",
      accessory: "beret"
    }
  },
  {
    id: "agent-06",
    code: "AGENT 06",
    name: "Mateo Silva",
    title: "Animation & Audio Designer",
    zoneId: "creative",
    workstationName: "Motion & Sound Desk #6 (Studio Speakers & Timeline Rig)",
    seatPos: { x: 955, y: 485 },
    status: "At Workstation (Phase 1.1 Visual)",
    personality: "Expressive, creative and detail-oriented.",
    roleDescription: "Brings characters and environments to life through smooth keyframe motion, UI micro-interactions, and joyful audio.",
    skills: ["Character Motion", "Web Audio SFX", "Micro-Interactions", "Visual Feedback"],
    responsibilities: [
      "Design smooth character walking and working animations",
      "Create subtle environmental motion",
      "Design child-friendly sound effects and chimes",
      "Enhance interactive visual feedback"
    ],
    appearance: {
      skin: "#c68b63",
      hair: "#292524",
      hairStyle: "curly",
      shirt: "#ea580c",
      pants: "#292524",
      accent: "#ffedd5",
      accessory: "headphones"
    }
  },
  {
    id: "agent-07",
    code: "AGENT 07",
    name: "Hannah Lindqvist",
    title: "QA Engineer & Child Safety Reviewer",
    zoneId: "qa",
    workstationName: "Multi-Device QA Lab #7 (Desktop, Tablet & Mobile Test Rig)",
    seatPos: { x: 695, y: 650 },
    status: "At Workstation (Phase 1.1 Visual)",
    personality: "Careful, systematic and responsible.",
    roleDescription: "Verifies cross-browser stability, responsive layouts, and strict child-safety standards across every studio release.",
    skills: ["Cross-Device QA", "Child Safety Audits", "Responsive Testing", "Bug Reporting"],
    responsibilities: [
      "Test application functionality and edge cases",
      "Verify desktop, tablet, and mobile layouts",
      "Audit interactions for child safety and clarity",
      "Prepare structured quality assurance reports"
    ],
    appearance: {
      skin: "#f5d0b5",
      hair: "#d97706",
      hairStyle: "ponytail",
      shirt: "#447252",
      pants: "#1f2937",
      accent: "#e6f2ea",
      accessory: "glasses"
    }
  }
];

window.Studio.ROADMAP = [
  {
    phase: "Phase 1 & 1.1 — Visual Foundation & Refinement",
    status: "ACTIVE (CURRENT BUILD)",
    active: true,
    details: "Full-scale isometric office diorama, warm plank flooring, 6 architecturally divided zones, 7 bespoke role workstations, distinct employee appearances, pendant lighting, and non-overlapping zone plaques."
  },
  {
    phase: "Phase 2 — Employee Simulation",
    status: "UPCOMING (AWAITING PHASE 1.1 APPROVAL)",
    active: false,
    details: "Autonomous state machines (IDLE, WALKING, WORKING, THINKING, IN_MEETING, ON_BREAK), smooth isometric pathfinding, coffee breaks in the lounge, and synchronized meeting room gatherings."
  },
  {
    phase: "Phase 3 — Management & Kanban Systems",
    status: "PLANNED",
    active: false,
    details: "Full Kanban task board (Backlog to Completed), project creation, task assignment, simulated team chat, meeting notes generator, and real-time Studio Dashboard metrics."
  },
  {
    phase: "Phase 4 — Persistence & Reliability",
    status: "PLANNED",
    active: false,
    details: "Versioned LocalStorage state saving, JSON export/import backups, safe reset confirmations, and mobile performance optimization."
  },
  {
    phase: "Phase 5 — Future Real AI Integration",
    status: "PLANNED",
    active: false,
    details: "Clean orchestration service contracts designed to connect agents to a secure external AI backend without exposing API keys in public repositories."
  }
];
