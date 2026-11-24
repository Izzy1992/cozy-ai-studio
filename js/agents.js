window.Studio = window.Studio || {};

window.Studio.ZONES = [
  {
    id: "manager",
    name: "Studio Manager Office",
    shortName: "Manager Office",
    description: "Glass-enclosed North-West corner suite with panoramic windows, executive mahogany desk, bookshelf, whiteboard, and direct atrium access.",
    occupants: ["agent-01"],
    focus: { x: 220, y: 195, zoom: 1.32 },
    badgeColor: "#d97706"
  },
  {
    id: "meeting",
    name: "Meeting Room",
    shortName: "Meeting Room",
    description: "Dedicated West-wing conference suite with an oak boardroom table, six chairs, large wall presentation monitor, and project pinboards.",
    occupants: [],
    focus: { x: 420, y: 40, zoom: 1.3 },
    badgeColor: "#0d9488"
  },
  {
    id: "dev",
    name: "Developer Wing",
    shortName: "Developer Wing",
    description: "Spacious South-West engineering wing separated from the atrium by glass walls, housing dual- and triple-monitor coding rigs.",
    occupants: ["agent-03", "agent-04"],
    focus: { x: 180, y: -155, zoom: 1.28 },
    badgeColor: "#2563eb"
  },
  {
    id: "lounge",
    name: "Garden & Cozy Lounge Atrium",
    shortName: "Garden Lounge",
    description: "Sunlit central courtyard hub with indoor trees, plush pastel sofas, low coffee tables, espresso bar, and warm social seating.",
    occupants: [],
    focus: { x: 0, y: 45, zoom: 1.28 },
    badgeColor: "#447252"
  },
  {
    id: "creative",
    name: "Art & Audio Studio",
    shortName: "Art & Audio",
    description: "South-East creative wing with acoustic wall panels, storyboards, digital pen display, color swatches, and studio monitor speakers.",
    occupants: ["agent-02", "agent-05", "agent-06"],
    focus: { x: -230, y: -155, zoom: 1.28 },
    badgeColor: "#db2777"
  },
  {
    id: "qa",
    name: "QA & Child Safety Lab",
    shortName: "QA Testing",
    description: "North-East testing wing with multi-device display benches, tablet & mobile test rigs, and child-safety verification checklists.",
    occupants: ["agent-07"],
    focus: { x: -340, y: 40, zoom: 1.32 },
    badgeColor: "#7c3aed"
  }
];

window.Studio.AGENTS = [
  {
    id: "agent-01",
    code: "AGENT 01",
    name: "Izmi",
    title: "AI Studio Manager",
    zoneId: "manager",
    workstationName: "Executive Suite Desk #1 (North-West Glass Office)",
    seatPos: { x: 465, y: 245 },
    status: "At Workstation (Phase 1.3 Visual)",
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
      skin: "#d8a47f",
      hair: "#1e293b",
      hairStyle: "short",
      shirt: "#d97706",
      pants: "#334155",
      shoes: "#1e293b",
      accent: "#fef3c7",
      accessory: "glasses"
    }
  },
  {
    id: "agent-02",
    code: "AGENT 02",
    name: "Izzy",
    title: "Game Designer & Child Experience Designer",
    zoneId: "creative",
    workstationName: "Game Concept & Mechanics Desk #2 (Art & Audio Wing)",
    seatPos: { x: 760, y: 555 },
    status: "At Workstation (Phase 1.3 Visual)",
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
      skin: "#e2b08a",
      hair: "#1e293b",
      hairStyle: "spiky",
      shirt: "#0284c7",
      pants: "#1e3a8a",
      shoes: "#f8fafc",
      accent: "#e0f2fe",
      accessory: "lanyard"
    }
  },
  {
    id: "agent-03",
    code: "AGENT 03",
    name: "Isaac",
    title: "Senior Frontend Developer",
    zoneId: "dev",
    workstationName: "Frontend Engineering Rig #3 (Developer Wing)",
    seatPos: { x: 375, y: 555 },
    status: "At Workstation (Phase 1.3 Visual)",
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
      hair: "#292524",
      hairStyle: "short",
      shirt: "#2563eb",
      pants: "#1e293b",
      shoes: "#0f172a",
      accent: "#dbeafe",
      accessory: "glasses"
    }
  },
  {
    id: "agent-04",
    code: "AGENT 04",
    name: "Hayyan",
    title: "Game Systems & AI Developer",
    zoneId: "dev",
    workstationName: "Systems & AI Architecture Rig #4 (Developer Wing)",
    seatPos: { x: 515, y: 630 },
    status: "At Workstation (Phase 1.3 Visual)",
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
      skin: "#d6a17c",
      hair: "#1c1917",
      hairStyle: "curly",
      shirt: "#7c3aed",
      pants: "#312e81",
      shoes: "#f1f5f9",
      accent: "#ede9fe",
      accessory: "none"
    }
  },
  {
    id: "agent-05",
    code: "AGENT 05",
    name: "Anis",
    title: "Art Director & Environment Designer",
    zoneId: "creative",
    workstationName: "Pen-Display & Palette Station #5 (Art & Audio Wing)",
    seatPos: { x: 890, y: 625 },
    status: "At Workstation (Phase 1.3 Visual)",
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
      skin: "#eab996",
      hair: "#4a2c18",
      hairStyle: "long",
      shirt: "#db2777",
      pants: "#4c1d95",
      shoes: "#be185d",
      accent: "#fce7f3",
      accessory: "beret"
    }
  },
  {
    id: "agent-06",
    code: "AGENT 06",
    name: "Abang",
    title: "Sound Engineer, Audio & Animation Designer",
    zoneId: "creative",
    workstationName: "Sound Engineering & Motion Rig #6 (Art & Audio Wing)",
    seatPos: { x: 1015, y: 555 },
    status: "At Workstation (Phase 1.3 Visual)",
    personality: "Expressive, creative and detail-oriented.",
    roleDescription: "Produces joyful sound effects, Web Audio synthesizers, studio mixes, and smooth character animations.",
    skills: ["Sound Engineering", "Web Audio SFX", "Character Motion", "Studio Mixing"],
    responsibilities: [
      "Design and mix child-friendly sound effects and chimes",
      "Create smooth character walking and working animations",
      "Build subtle environmental audio-visual feedback",
      "Coordinate sound cues with gameplay events"
    ],
    appearance: {
      skin: "#c68b63",
      hair: "#1e293b",
      hairStyle: "short",
      shirt: "#ea580c",
      pants: "#292524",
      shoes: "#f97316",
      accent: "#ffedd5",
      accessory: "headphones"
    }
  },
  {
    id: "agent-07",
    code: "AGENT 07",
    name: "Sofea",
    title: "QA Engineer & Child Safety Reviewer",
    zoneId: "qa",
    workstationName: "Multi-Device QA & Child Safety Lab #7 (North-East Wing)",
    seatPos: { x: 1055, y: 390 },
    status: "At Workstation (Phase 1.3 Visual)",
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
      skin: "#f0c6a5",
      hair: "#5c3a21",
      hairStyle: "ponytail",
      shirt: "#447252",
      pants: "#1f2937",
      shoes: "#374151",
      accent: "#e6f2ea",
      accessory: "glasses"
    }
  }
];

window.Studio.ROADMAP = [
  {
    phase: "Phase 1 — Visual Foundation (1.3 U-Shaped Garden Atrium)",
    status: "ACTIVE (CURRENT BUILD)",
    active: true,
    details: "Spacious U-shaped isometric floorplan wrapping around a sunlit central garden & lounge atrium, 6 distinct rooms, 7 custom role workstations (Izmi, Izzy, Isaac, Hayyan, Anis, Abang, Sofea), and exterior-edge room plaques."
  },
  {
    phase: "Phase 2 — Employee Simulation",
    status: "UPCOMING (AWAITING PHASE 1.3 APPROVAL)",
    active: false,
    details: "Autonomous state machines (IDLE, WALKING, WORKING, THINKING, IN_MEETING, ON_BREAK), smooth pathfinding through the central garden atrium, coffee breaks, and meeting room gatherings."
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
