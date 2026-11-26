window.Studio = window.Studio || {};

window.Studio.ZONES = [
  {
    id: "manager",
    name: "Studio Manager Office",
    shortName: "Manager Office",
    description: "Glass-enclosed North-West corner suite with panoramic windows, executive mahogany desk, filing storage, bookshelf, framed studio art, and direct atrium doorway.",
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
    description: "Spacious South-West engineering wing separated from the atrium by grounded glass walls, housing dual-monitor rigs, a system architecture board, and wide walkways.",
    occupants: ["agent-03", "agent-04"],
    focus: { x: 180, y: -155, zoom: 1.28 },
    badgeColor: "#2563eb"
  },
  {
    id: "lounge",
    name: "Garden & Cozy Lounge Atrium",
    shortName: "Garden Lounge",
    description: "Welcoming central relaxation courtyard featuring plush cushioned sofas, coffee table, espresso bar, stone water fountain, warm garden lanterns, stepping-stone walkways, and lush trees.",
    occupants: [],
    focus: { x: 0, y: 45, zoom: 1.28 },
    badgeColor: "#447252"
  },
  {
    id: "creative",
    name: "Art & Audio Studio",
    shortName: "Art & Audio",
    description: "South-East creative wing with acoustic wall panels, storyboards, digital pen display, color palettes, studio monitor speakers, and mixing equipment.",
    occupants: ["agent-02", "agent-05", "agent-06"],
    focus: { x: -230, y: -155, zoom: 1.28 },
    badgeColor: "#db2777"
  },
  {
    id: "qa",
    name: "QA & Child Safety Lab",
    shortName: "QA Testing",
    description: "North-East testing wing with multi-monitor bug tracking displays, handheld tablet & mobile test rigs, QA checklist board, and child-safety audit binders.",
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
    homeNodeId: "desk_izmi",
    workstationName: "Executive Suite Desk #1 (North-West Glass Office)",
    seatPos: { x: 465, y: 245 },
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
    homeNodeId: "desk_izzy",
    workstationName: "Game Concept & Mechanics Desk #2 (Art & Audio Wing)",
    seatPos: { x: 755, y: 552 },
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
    homeNodeId: "desk_isaac",
    workstationName: "Frontend Engineering Rig #3 (Developer Wing)",
    seatPos: { x: 365, y: 548 },
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
    homeNodeId: "desk_hayyan",
    workstationName: "Systems & AI Architecture Rig #4 (Developer Wing)",
    seatPos: { x: 525, y: 632 },
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
    homeNodeId: "desk_anis",
    workstationName: "Pen-Display & Palette Station #5 (Art & Audio Wing)",
    seatPos: { x: 890, y: 628 },
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
    homeNodeId: "desk_abang",
    workstationName: "Sound Engineering & Motion Rig #6 (Art & Audio Wing)",
    seatPos: { x: 1020, y: 552 },
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
    homeNodeId: "desk_sofea",
    workstationName: "Multi-Device QA & Child Safety Lab #7 (North-East Wing)",
    seatPos: { x: 1055, y: 390 },
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
    phase: "Phase 1 — Visual Foundation",
    status: "COMPLETED & APPROVED",
    active: false,
    details: "U-shaped Garden Atrium isometric floorplan, grounded glass partitions, unobstructed doorways, 6 distinct zones, and 7 custom role workstations."
  },
  {
    phase: "Phase 2.1 & 2.2 — State Machines & Pathfinding",
    status: "COMPLETED & APPROVED",
    active: false,
    details: "Independent employee state machines and obstacle-aware BFS waypoint pathfinding across all rooms."
  },
  {
    phase: "Phase 2.3 & 2.4 — Autonomous Routines & Meetings",
    status: "ACTIVE (CURRENT BUILD)",
    active: true,
    details: "Studio day clock, daily work/lounge rhythm, in-world dialogue bubbles, peer desk syncs, and coordinated team stand-ups in the Meeting Room."
  },
  {
    phase: "Phase 3 — Management & Kanban Systems",
    status: "NEXT MILESTONE",
    active: false,
    details: "Full Kanban task board (Backlog to Completed), project creation, task assignment, simulated team chat, meeting notes generator, and Studio Dashboard metrics."
  },
  {
    phase: "Phase 4 & 5 — Persistence & Future Real AI Integration",
    status: "PLANNED",
    active: false,
    details: "Versioned LocalStorage state saving, JSON export/import backups, and clean orchestration service contracts for secure external AI execution."
  }
];
