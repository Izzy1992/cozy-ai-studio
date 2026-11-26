window.Studio = window.Studio || {};

window.Studio.SimulationEngine = (function () {
  const NAV_NODES = {
    desk_izmi:   { x: 465,  y: 245, zone: "manager",  label: "Izmi's Executive Desk" },
    desk_isaac:  { x: 365,  y: 548, zone: "dev",      label: "Isaac's Frontend Rig" },
    desk_hayyan: { x: 525,  y: 632, zone: "dev",      label: "Hayyan's Systems Rig" },
    desk_izzy:   { x: 755,  y: 552, zone: "creative", label: "Izzy's Concept Desk" },
    desk_anis:   { x: 890,  y: 628, zone: "creative", label: "Anis's Art Studio Desk" },
    desk_abang:  { x: 1020, y: 552, zone: "creative", label: "Abang's Audio Rig" },
    desk_sofea:  { x: 1055, y: 390, zone: "qa",       label: "Sofea's QA Lab Desk" },

    door_manager: { x: 475, y: 318, zone: "manager",  label: "Manager Office Doorway" },
    corridor_nw:  { x: 520, y: 350, zone: "lounge",   label: "North-West Corridor" },

    door_meeting: { x: 392, y: 432, zone: "meeting",  label: "Meeting Room Entrance" },
    meeting_seat1:{ x: 235, y: 395, zone: "meeting",  label: "Meeting Table (NW Seat)" },
    meeting_seat2:{ x: 315, y: 400, zone: "meeting",  label: "Meeting Table (NE Seat)" },
    meeting_seat3:{ x: 235, y: 450, zone: "meeting",  label: "Meeting Table (SW Seat)" },
    meeting_seat4:{ x: 315, y: 450, zone: "meeting",  label: "Meeting Table (SE Seat)" },

    door_dev:     { x: 538, y: 482, zone: "dev",      label: "Developer Wing Entrance" },
    aisle_dev:    { x: 455, y: 575, zone: "dev",      label: "Developer Wing Aisle" },

    door_creative:{ x: 822, y: 482, zone: "creative", label: "Art & Audio Entrance" },
    aisle_cre_w:  { x: 810, y: 585, zone: "creative", label: "Creative West Aisle" },
    aisle_cre_e:  { x: 960, y: 585, zone: "creative", label: "Creative East Aisle" },

    door_qa:      { x: 960, y: 436, zone: "qa",       label: "QA Lab Entrance" },

    atrium_w:     { x: 545, y: 435, zone: "lounge",   label: "West Garden Walkway" },
    atrium_s:     { x: 680, y: 498, zone: "lounge",   label: "South Atrium Espresso Bar" },
    atrium_e:     { x: 815, y: 435, zone: "lounge",   label: "East Garden Walkway" },
    atrium_n:     { x: 680, y: 372, zone: "lounge",   label: "Fountain Viewpoint" },
    lounge_sofa_w:{ x: 622, y: 418, zone: "lounge",   label: "Pink Lounge Sofa" },
    lounge_sofa_e:{ x: 738, y: 452, zone: "lounge",   label: "Blue Lounge Sofa" }
  };

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

  const ADJACENCY = {};
  Object.keys(NAV_NODES).forEach((id) => (ADJACENCY[id] = []));
  NAV_EDGES.forEach(([a, b]) => {
    if (ADJACENCY[a] && ADJACENCY[b]) {
      ADJACENCY[a].push(b);
      ADJACENCY[b].push(a);
    }
  });

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

  const ROLE_ACTIVITIES = {
    "agent-01": {
      WORKING: "Reviewing sprint milestones & studio priorities",
      THINKING: "Planning next milestone allocation",
      IDLE: "Organising daily studio schedule",
      quotes: ["Sprint velocity looks healthy!", "Let's check milestone progress.", "Time for a quick team sync."]
    },
    "agent-02": {
      WORKING: "Sketching kid-friendly level flow & rewards",
      THINKING: "Brainstorming age 4–6 game mechanics",
      IDLE: "Reviewing player progression notes",
      quotes: ["What if kids unlock a golden badge?", "Testing the new reward loop!", "Love how cozy this feels!"]
    },
    "agent-03": {
      WORKING: "Refining responsive CSS & UI components",
      THINKING: "Evaluating rendering frame budget",
      IDLE: "Checking layout alignment across viewports",
      quotes: ["60fps smooth on mobile!", "Polishing the drawer transitions.", "Clean semantic markup ready."]
    },
    "agent-04": {
      WORKING: "Tuning agent state transitions & pathfinding",
      THINKING: "Analyzing navigation graph edge weights",
      IDLE: "Inspecting simulation tick telemetry",
      quotes: ["BFS pathfinding is zero-collision!", "State machine transitions locked in.", "Let's test multi-agent sync."]
    },
    "agent-05": {
      WORKING: "Illustrating warm isometric props & palettes",
      THINKING: "Comparing pastel color harmony swatches",
      IDLE: "Inspecting studio visual consistency",
      quotes: ["Warm cream + sage feels so cozy!", "Adding soft shadows to the planters.", "Palette harmony approved!"]
    },
    "agent-06": {
      WORKING: "Mixing Web Audio chimes & character motion",
      THINKING: "Auditioning gentle sound feedback cues",
      IDLE: "Adjusting studio monitor levels",
      quotes: ["Gentle marimba chime ready!", "Walk cycle bounce feels lively.", "Audio cues synced to actions."]
    },
    "agent-07": {
      WORKING: "Running child-safety & cross-device QA checks",
      THINKING: "Verifying walkway & boundary edge cases",
      IDLE: "Reviewing QA verification checklist",
      quotes: ["Zero doorway clipping detected!", "Child-safety audit 100% passed.", "Checking tablet viewport spacing."]
    }
  };

  const STANDUP_TOPICS = [
    "Sprint 2.3: Daily Routine & Dialogue Sync",
    "Child UX & Sound Cues Playtest Review",
    "Isometric Atrium Performance & QA Sign-Off"
  ];

  let agentStates = [];
  let isRunning = true;
  let speedMultiplier = 1;
  let rafId = null;
  let lastTimestamp = 0;
  let onTickCallback = null;

  let studioMinutes = 555;
  let dailyStandupTriggered = false;
  let meetingState = { active: false, timer: 0, topic: STANDUP_TOPICS[0] };

  const LOUNGE_SPOTS = ["lounge_sofa_w", "lounge_sofa_e", "atrium_s", "atrium_n"];
  const PEER_AISLES = ["aisle_dev", "aisle_cre_w", "aisle_cre_e", "corridor_nw"];
  const MEETING_SPOTS = ["meeting_seat1", "meeting_seat2", "meeting_seat3", "meeting_seat4"];

  function speak(st, text, duration = 4.2) {
    st.speechText = text;
    st.speechTimer = duration;
  }

  function createInitialStates(agents) {
    studioMinutes = 555;
    dailyStandupTriggered = false;
    meetingState = { active: false, timer: 0, topic: STANDUP_TOPICS[0] };

    return agents.map((agent, idx) => {
      const homeNode = NAV_NODES[agent.homeNodeId];
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
        activityDuration: 5 + idx * 3.2,
        nextIntendedActivity: "THINKING",
        speechText: idx === 0 ? "Morning team! Let's build!" : "",
        speechTimer: idx === 0 ? 4.0 : 0
      };
    });
  }

  function transitionState(st, newState, targetNodeId = null) {
    st.previousState = st.state;
    st.state = newState;

    if (newState === "WORKING") {
      st.currentActivity = ROLE_ACTIVITIES[st.id].WORKING;
      st.activityDuration = 10 + Math.random() * 9;
      st.nextIntendedActivity = Math.random() < 0.55 ? "THINKING" : "USING_LOUNGE";
      if (Math.random() < 0.35) {
        const q = ROLE_ACTIVITIES[st.id].quotes;
        speak(st, q[Math.floor(Math.random() * q.length)], 3.8);
      }
    } else if (newState === "THINKING") {
      st.currentActivity = ROLE_ACTIVITIES[st.id].THINKING;
      st.activityDuration = 4 + Math.random() * 3.5;
      st.nextIntendedActivity = Math.random() < 0.55 ? "WORKING" : "USING_LOUNGE";
    } else if (newState === "IDLE") {
      st.currentActivity = ROLE_ACTIVITIES[st.id].IDLE;
      st.activityDuration = 3 + Math.random() * 2.5;
      st.nextIntendedActivity = "WORKING";
    } else if (newState === "WALKING" && targetNodeId) {
      const path = findPath(st.currentNodeId, targetNodeId);
      if (path.length === 0) {
        transitionState(st, "WORKING");
        return;
      }
      st.targetNodeId = targetNodeId;
      st.waypoints = path;
      const dest = NAV_NODES[targetNodeId];
      st.currentActivity = `Walking to ${dest.label}`;
      if (dest.zone === "meeting") {
        st.nextIntendedActivity = "IN_MEETING";
      } else if (PEER_AISLES.includes(targetNodeId)) {
        st.nextIntendedActivity = "PEER_REVIEW";
      } else {
        st.nextIntendedActivity = "USING_LOUNGE";
      }
    } else if (newState === "USING_LOUNGE") {
      const isEspresso = st.currentNodeId === "atrium_s";
      st.currentActivity = isEspresso ? "Brewing fresh espresso in Atrium" : "Relaxing in the Garden Lounge";
      st.activityDuration = 6 + Math.random() * 4.5;
      st.nextIntendedActivity = "RETURNING_TO_DESK";
      speak(st, isEspresso ? "Fresh espresso boost!" : "Nice garden breeze~", 4.0);
    } else if (newState === "PEER_REVIEW") {
      st.currentActivity = "Syncing with teammates on current milestone";
      st.activityDuration = 5 + Math.random() * 3;
      st.nextIntendedActivity = "RETURNING_TO_DESK";
      const q = ROLE_ACTIVITIES[st.id].quotes;
      speak(st, q[Math.floor(Math.random() * q.length)], 4.5);
    } else if (newState === "IN_MEETING") {
      st.currentActivity = `Stand-Up: ${meetingState.topic}`;
      st.activityDuration = 11;
      st.nextIntendedActivity = "RETURNING_TO_DESK";
      const q = ROLE_ACTIVITIES[st.id].quotes;
      speak(st, q[Math.floor(Math.random() * q.length)], 5.0);
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

  function callTeamStandup() {
    if (meetingState.active) return false;
    meetingState.active = true;
    meetingState.timer = 16;
    meetingState.topic = STANDUP_TOPICS[Math.floor(Math.random() * STANDUP_TOPICS.length)];

    const izmi = agentStates.find((s) => s.id === "agent-01");
    const others = agentStates.filter((s) => s.id !== "agent-01");
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const attendees = izmi ? [izmi, ...shuffled] : shuffled.slice(0, 4);

    attendees.forEach((st, idx) => {
      const seat = MEETING_SPOTS[idx];
      if (seat) {
        speak(st, idx === 0 ? "Team stand-up in Meeting Room!" : "On my way to stand-up!", 3.8);
        transitionState(st, "WALKING", seat);
      }
    });
    return true;
  }

  function sendAgentToLounge(agentId) {
    const st = getAgentState(agentId);
    if (!st) return;
    const occupied = new Set(agentStates.map((s) => s.targetNodeId));
    const spot = LOUNGE_SPOTS.find((id) => !occupied.has(id)) || "atrium_s";
    speak(st, "Heading for a quick coffee break!", 3.5);
    transitionState(st, "WALKING", spot);
  }

  function chooseNextDestination(occupiedNodes) {
    const isLunchHour = studioMinutes >= 720 && studioMinutes <= 810;
    const roll = Math.random();
    let pool = LOUNGE_SPOTS;
    if (!isLunchHour && roll > 0.68) {
      pool = PEER_AISLES;
    }
    const available = pool.filter((nodeId) => !occupiedNodes.has(nodeId));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  function stepSimulation(dt) {
    studioMinutes += dt * 2.0;
    if (studioMinutes >= 1080) {
      studioMinutes = 540;
      dailyStandupTriggered = false;
    }

    if (!dailyStandupTriggered && studioMinutes >= 870 && studioMinutes < 880) {
      dailyStandupTriggered = true;
      callTeamStandup();
    }

    if (meetingState.active) {
      meetingState.timer -= dt;
      if (meetingState.timer <= 0) {
        meetingState.active = false;
        agentStates.forEach((st) => {
          if (st.state === "IN_MEETING" || st.nextIntendedActivity === "IN_MEETING") {
            speak(st, "Great sync, back to work!", 3.5);
            transitionState(st, "RETURNING_TO_DESK");
          }
        });
      }
    }

    const walkSpeed = 66;
    const occupiedNodes = new Set(
      agentStates.map((s) => (s.waypoints.length > 0 ? s.targetNodeId : s.currentNodeId))
    );

    agentStates.forEach((st) => {
      if (st.speechTimer > 0) {
        st.speechTimer = Math.max(0, st.speechTimer - dt);
      }

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

  function getClockSnapshot() {
    const total = Math.floor(studioMinutes);
    const hh24 = Math.floor(total / 60);
    const mm = total % 60;
    const ampm = hh24 >= 12 ? "PM" : "AM";
    const hh12 = hh24 % 12 || 12;
    const timeStr = `${String(hh12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${ampm}`;

    let phase = "Morning Sprint";
    if (hh24 >= 12 && hh24 < 14) phase = "Midday Lounge";
    else if (hh24 >= 14 && hh24 < 16) phase = "Afternoon Sync";
    else if (hh24 >= 16) phase = "Golden Hour Wrap";

    return { timeStr, phase, isEvening: hh24 >= 16, meetingActive: meetingState.active, meetingTopic: meetingState.topic };
  }

  function loop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const rawDt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    if (isRunning) {
      stepSimulation(rawDt * speedMultiplier);
      if (window.Studio.OfficeRenderer && window.Studio.OfficeRenderer.updateAgentVisuals) {
        window.Studio.OfficeRenderer.updateAgentVisuals(agentStates, { active: meetingState.active });
      }
      if (typeof onTickCallback === "function") {
        onTickCallback(agentStates, getClockSnapshot());
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  function init(agents, tickCallback) {
    agentStates = createInitialStates(agents);
    onTickCallback = tickCallback || null;
    if (window.Studio.OfficeRenderer && window.Studio.OfficeRenderer.updateAgentVisuals) {
      window.Studio.OfficeRenderer.updateAgentVisuals(agentStates, { active: false });
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
      window.Studio.OfficeRenderer.updateAgentVisuals(agentStates, { active: false });
    }
    if (typeof onTickCallback === "function") {
      onTickCallback(agentStates, getClockSnapshot());
    }
  }

  function getAgentState(agentId) {
    return agentStates.find((s) => s.id === agentId) || null;
  }

  return {
    init,
    setRunning,
    setSpeed,
    reset,
    callTeamStandup,
    sendAgentToLounge,
    getAgentState,
    getClockSnapshot,
    isRunning: () => isRunning
  };
})();
