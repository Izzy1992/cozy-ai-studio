window.Studio = window.Studio || {};

window.Studio.SimulationEngine = (function () {
  // Phase 2.2: Obstacle-Aware Isometric Navigation Graph
  // Every node sits on walkable wooden floor / stepping-stone pathways clear of desks, walls, and planters.
  const NAV_NODES = {
    // Home Desk Seat Nodes (Exact seat coordinates)
    desk_izmi:   { x: 465,  y: 245, zone: "manager",  label: "Izmi's Executive Desk" },
    desk_isaac:  { x: 365,  y: 548, zone: "dev",      label: "Isaac's Frontend Rig" },
    desk_hayyan: { x: 525,  y: 632, zone: "dev",      label: "Hayyan's Systems Rig" },
    desk_izzy:   { x: 755,  y: 552, zone: "creative", label: "Izzy's Concept Desk" },
    desk_anis:   { x: 890,  y: 628, zone: "creative", label: "Anis's Art Studio Desk" },
    desk_abang:  { x: 1020, y: 552, zone: "creative", label: "Abang's Audio Rig" },
    desk_sofea:  { x: 1055, y: 390, zone: "qa",       label: "Sofea's QA Lab Desk" },

    // Doorway & Corridor Waypoints (Preventing wall/glass clipping)
    door_manager: { x: 475, y: 318, zone: "manager",  label: "Manager Office Doorway" },
    corridor_nw:  { x: 520, y: 350, zone: "lounge",   label: "North-West Corridor" },

    door_meeting: { x: 392, y: 432, zone: "meeting",  label: "Meeting Room Entrance" },
    meeting_seat1:{ x: 235, y: 395, zone: "meeting",  label: "Meeting Table (North-West Seat)" },
    meeting_seat2:{ x: 315, y: 400, zone: "meeting",  label: "Meeting Table (North-East Seat)" },
    meeting_seat3:{ x: 235, y: 450, zone: "meeting",  label: "Meeting Table (South-West Seat)" },
    meeting_seat4:{ x: 315, y: 450, zone: "meeting",  label: "Meeting Table (South-East Seat)" },

    door_dev:     { x: 538, y: 482, zone: "dev",      label: "Developer Wing Entrance" },
    aisle_dev:    { x: 455, y: 575, zone: "dev",      label: "Developer Wing Aisle" },

    door_creative:{ x: 822, y: 482, zone: "creative", label: "Art & Audio Entrance" },
    aisle_cre_w:  { x: 810, y: 585, zone: "creative", label: "Creative West Aisle" },
    aisle_cre_e:  { x: 960, y: 585, zone: "creative", label: "Creative East Aisle" },

    door_qa:      { x: 960, y: 436, zone: "qa",       label: "QA Lab Entrance" },

    // Central Garden & Lounge Atrium Walkways (Around the central water fountain & sofas)
    atrium_w:     { x: 545, y: 435, zone: "lounge",   label: "West Garden Walkway" },
    atrium_s:     { x: 680, y: 498, zone: "lounge",   label: "South Atrium Espresso Bar" },
    atrium_e:     { x: 815, y: 435, zone: "lounge",   label: "East Garden Walkway" },
    atrium_n:     { x: 680, y: 372, zone: "lounge",   label: "Fountain Viewpoint" },
    lounge_sofa_w:{ x: 622, y: 418, zone: "lounge",   label: "Pink Lounge Sofa" },
    lounge_sofa_e:{ x: 738, y: 452, zone: "lounge",   label: "Blue Lounge Sofa" }
  };

  // Bidirectional Edges Defining Valid Walkable Routes
  const NAV_EDGES = [
    ["desk_izmi", "door_manager"],
    ["door_manager", "corridor_nw"],
    ["corridor_nw", "atrium_n"],
    ["corridor_nw", "atrium_w"],

    ["door_meeting", "atrium_w"],
    ["door_meeting", "meeting_seat1"],
    ["door_meeting", "meeting_seat2"],
    ["door_meeting", "meeting_seat3"],
    ["door_meeting", "meeting_seat4"],

    ["atrium_w", "door_dev"],
    ["atrium_w", "atrium_s"],
    ["atrium_w", "lounge_sofa_w"],
    ["atrium_n", "lounge_sofa_w"],
    ["atrium_n", "atrium_e"],
    ["atrium_s", "lounge_sofa_w"],
    ["atrium_s", "lounge_sofa_e"],
    ["atrium_s", "door_dev"],
    ["atrium_s", "door_creative"],
    ["atrium_e", "lounge_sofa_e"],
    ["atrium_e", "door_creative"],
    ["atrium_e", "door_qa"],

    ["door_dev", "aisle_dev"],
    ["aisle_dev", "desk_isaac"],
    ["aisle_dev", "desk_hayyan"],

    ["door_creative", "aisle_cre_w"],
    ["aisle_cre_w", "desk_izzy"],
    ["aisle_cre_w", "aisle_cre_e"],
    ["aisle_cre_e", "desk_anis"],
    ["aisle_cre_e", "desk_abang"],

    ["door_qa", "desk_sofea"]
  ];

  // Build adjacency lookup
  const ADJACENCY = {};
  Object.keys(NAV_NODES).forEach((id) => (ADJACENCY[id] = []));
  NAV_EDGES.forEach(([a, b]) => {
    if (ADJACENCY[a] && ADJACENCY[b]) {
      ADJACENCY[a].push(b);
      ADJACENCY[b].push(a);
    }
  });

  // BFS Shortest Path Finder on the Isometric Waypoint Graph
  function findPath(startNodeId, goalNodeId) {
    if (startNodeId === goalNodeId) return [];
    const queue = [[startNodeId]];
    const visited = new Set([startNodeId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      const neighbors = ADJACENCY[current] || [];

      for (const next of neighbors) {
        if (next === goalNodeId) {
          return path.slice(1).concat(next);
        }
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(path.concat(next));
        }
      }
    }
    return [];
  }

  // Role-specific activity descriptions for realistic telemetry
  const ROLE_ACTIVITIES = {
    "agent-01": {
      WORKING: "Reviewing sprint milestones & studio priorities",
      THINKING: "Planning next milestone allocation",
      IDLE: "Organising daily studio schedule"
    },
    "agent-02": {
      WORKING: "Sketching kid-friendly level flow & rewards",
      THINKING: "Brainstorming age 4–6 game mechanics",
      IDLE: "Reviewing player progression notes"
    },
    "agent-03": {
      WORKING: "Refining responsive CSS & UI components",
      THINKING: "Evaluating rendering frame budget",
      IDLE: "Checking layout alignment across viewports"
    },
    "agent-04": {
      WORKING: "Tuning agent state transitions & pathfinding",
      THINKING: "Analyzing navigation graph edge weights",
      IDLE: "Inspecting simulation tick telemetry"
    },
    "agent-05": {
      WORKING: "Illustrating warm isometric props & palettes",
      THINKING: "Comparing pastel color harmony swatches",
      IDLE: "Inspecting studio visual consistency"
    },
    "agent-06": {
      WORKING: "Mixing Web Audio chimes & character motion",
      THINKING: "Auditioning gentle sound feedback cues",
      IDLE: "Adjusting studio monitor levels"
    },
    "agent-07": {
      WORKING: "Running child-safety & cross-device QA checks",
      THINKING: "Verifying walkway & boundary edge cases",
      IDLE: "Reviewing QA verification checklist"
    }
  };

  let agentStates = [];
  let isRunning = true;
  let speedMultiplier = 1;
  let rafId = null;
  let lastTimestamp = 0;
  let onTickCallback = null;

  const LOUNGE_SPOTS = ["lounge_sofa_w", "lounge_sofa_e", "atrium_s", "atrium_n"];
  const MEETING_SPOTS = ["meeting_seat1", "meeting_seat2", "meeting_seat3", "meeting_seat4"];

  function createInitialStates(agents) {
    return agents.map((agent, idx) => {
      const homeNode = NAV_NODES[agent.homeNodeId];
      // Stagger initial timers so all 7 employees do not move simultaneously
      const initialDuration = 6 + idx * 3.5;
      return {
        id: agent.id,
        name: agent.name,
        title: agent.title,
        state: "WORKING",
        previousState: "IDLE",
        currentNodeId: agent.homeNodeId,
        targetNodeId: agent.homeNodeId,
        homeNodeId: agent.homeNodeId,
        homeWorkstation: agent.workstationName,
        currentZone: agent.zoneId,
        x: homeNode.x,
        y: homeNode.y,
        waypoints: [],
        currentActivity: ROLE_ACTIVITIES[agent.id].WORKING,
        activityDuration: initialDuration,
        nextIntendedActivity: "THINKING"
      };
    });
  }

  function transitionState(st, newState, targetNodeId = null) {
    st.previousState = st.state;
    st.state = newState;

    if (newState === "WORKING") {
      st.currentActivity = ROLE_ACTIVITIES[st.id].WORKING;
      st.activityDuration = 10 + Math.random() * 10;
      st.nextIntendedActivity = Math.random() < 0.65 ? "THINKING" : "USING_LOUNGE";
    } else if (newState === "THINKING") {
      st.currentActivity = ROLE_ACTIVITIES[st.id].THINKING;
      st.activityDuration = 4 + Math.random() * 4;
      st.nextIntendedActivity = Math.random() < 0.6 ? "WORKING" : "USING_LOUNGE";
    } else if (newState === "IDLE") {
      st.currentActivity = ROLE_ACTIVITIES[st.id].IDLE;
      st.activityDuration = 3 + Math.random() * 3;
      st.nextIntendedActivity = "WORKING";
    } else if (newState === "WALKING" && targetNodeId) {
      const path = findPath(st.currentNodeId, targetNodeId);
      if (path.length === 0) {
        transitionState(st, "WORKING");
        return;
      }
      st.targetNodeId = targetNodeId;
      st.waypoints = path;
      const destLabel = NAV_NODES[targetNodeId].label;
      st.currentActivity = `Walking to ${destLabel}`;
      st.nextIntendedActivity = NAV_NODES[targetNodeId].zone === "meeting" ? "IN_MEETING" : "USING_LOUNGE";
    } else if (newState === "USING_LOUNGE") {
      st.currentActivity = "Relaxing in the Garden Lounge";
      st.activityDuration = 6 + Math.random() * 5;
      st.nextIntendedActivity = "RETURNING_TO_DESK";
    } else if (newState === "IN_MEETING") {
      st.currentActivity = "Reviewing studio notes in Meeting Room";
      st.activityDuration = 7 + Math.random() * 5;
      st.nextIntendedActivity = "RETURNING_TO_DESK";
    } else if (newState === "RETURNING_TO_DESK") {
      const path = findPath(st.currentNodeId, st.homeNodeId);
      if (path.length === 0) {
        transitionState(st, "WORKING");
        return;
      }
      st.targetNodeId = st.homeNodeId;
      st.waypoints = path;
      st.currentActivity = `Returning to ${st.homeWorkstation}`;
      st.nextIntendedActivity = "WORKING";
    }
  }

  function chooseNextDestination(occupiedNodes) {
    // 75% chance to visit Garden Lounge, 25% chance to visit Meeting Room
    const pool = Math.random() < 0.75 ? LOUNGE_SPOTS : MEETING_SPOTS;
    const available = pool.filter((nodeId) => !occupiedNodes.has(nodeId));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  function stepSimulation(dt) {
    const walkSpeed = 62; // Pixels per second along isometric corridors
    const occupiedNodes = new Set(
      agentStates.map((s) => (s.waypoints.length > 0 ? s.targetNodeId : s.currentNodeId))
    );

    agentStates.forEach((st) => {
      if (st.state === "WALKING" || st.state === "RETURNING_TO_DESK") {
        if (st.waypoints.length === 0) {
          transitionState(st, st.nextIntendedActivity || "WORKING");
          return;
        }

        const nextNodeId = st.waypoints[0];
        const targetPt = NAV_NODES[nextNodeId];
        const dx = targetPt.x - st.x;
        const dy = targetPt.y - st.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= walkSpeed * dt + 1.5) {
          st.x = targetPt.x;
          st.y = targetPt.y;
          st.currentNodeId = nextNodeId;
          st.currentZone = targetPt.zone;
          st.waypoints.shift();

          if (st.waypoints.length === 0) {
            transitionState(st, st.nextIntendedActivity || "WORKING");
          }
        } else {
          st.x += (dx / dist) * walkSpeed * dt;
          st.y += (dy / dist) * walkSpeed * dt;
        }
      } else {
        // Stationary states: WORKING, THINKING, IDLE, USING_LOUNGE, IN_MEETING
        st.activityDuration -= dt;
        if (st.activityDuration <= 0) {
          if (st.nextIntendedActivity === "USING_LOUNGE") {
            const dest = chooseNextDestination(occupiedNodes);
            if (dest) {
              occupiedNodes.add(dest);
              transitionState(st, "WALKING", dest);
            } else {
              transitionState(st, "IDLE");
            }
          } else if (st.nextIntendedActivity === "RETURNING_TO_DESK") {
            transitionState(st, "RETURNING_TO_DESK");
          } else {
            transitionState(st, st.nextIntendedActivity || "WORKING");
          }
        }
      }
    });

    // Soft personal-space repulsion when two walking agents pass each other in a corridor
    for (let i = 0; i < agentStates.length; i++) {
      for (let j = i + 1; j < agentStates.length; j++) {
        const a = agentStates[i];
        const b = agentStates[j];
        const aMoving = a.state === "WALKING" || a.state === "RETURNING_TO_DESK";
        const bMoving = b.state === "WALKING" || b.state === "RETURNING_TO_DESK";
        if (!aMoving && !bMoving) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.1 && dist < 24) {
          const push = (24 - dist) * 0.25;
          const nx = dx / dist;
          const ny = dy / dist;
          if (aMoving) { a.x -= nx * push; a.y -= ny * push; }
          if (bMoving) { b.x += nx * push; b.y += ny * push; }
        }
      }
    }
  }

  function loop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const rawDt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    if (isRunning) {
      stepSimulation(rawDt * speedMultiplier);
      if (window.Studio.OfficeRenderer && window.Studio.OfficeRenderer.updateAgentVisuals) {
        window.Studio.OfficeRenderer.updateAgentVisuals(agentStates);
      }
      if (typeof onTickCallback === "function") {
        onTickCallback(agentStates);
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  function init(agents, tickCallback) {
    agentStates = createInitialStates(agents);
    onTickCallback = tickCallback || null;
    if (window.Studio.OfficeRenderer && window.Studio.OfficeRenderer.updateAgentVisuals) {
      window.Studio.OfficeRenderer.updateAgentVisuals(agentStates);
    }
    if (!rafId) {
      lastTimestamp = 0;
      rafId = requestAnimationFrame(loop);
    }
  }

  function setRunning(running) {
    isRunning = Boolean(running);
    lastTimestamp = performance.now();
  }

  function setSpeed(mult) {
    speedMultiplier = Math.max(0.25, Math.min(5, Number(mult) || 1));
  }

  function reset(agents) {
    agentStates = createInitialStates(agents);
    if (window.Studio.OfficeRenderer && window.Studio.OfficeRenderer.updateAgentVisuals) {
      window.Studio.OfficeRenderer.updateAgentVisuals(agentStates);
    }
    if (typeof onTickCallback === "function") {
      onTickCallback(agentStates);
    }
  }

  function getAgentState(agentId) {
    return agentStates.find((s) => s.id === agentId) || null;
  }

  function getAllStates() {
    return agentStates;
  }

  return {
    init,
    setRunning,
    setSpeed,
    reset,
    getAgentState,
    getAllStates,
    isRunning: () => isRunning
  };
})();
