window.Studio = window.Studio || {};

window.Studio.SimulationEngine = (function () {
  const NAV_NODES = {
    desk_izmi:   { x: 690,  y: 162, zone: "manager",  label: "Izmi's Executive Desk" },
    desk_isaac:  { x: 318,  y: 592, zone: "dev",      label: "Isaac's Frontend Rig" },
    desk_hayyan: { x: 428,  y: 636, zone: "dev",      label: "Hayyan's Systems Rig" },
    desk_izzy:   { x: 862,  y: 572, zone: "creative", label: "Izzy's Concept Desk" },
    desk_anis:   { x: 962,  y: 625, zone: "creative", label: "Anis's Art Studio Desk" },
    desk_abang:  { x: 1052, y: 572, zone: "creative", label: "Abang's Audio Rig" },
    desk_sofea:  { x: 962,  y: 306, zone: "qa",       label: "Sofea's QA Lab Desk" },

    door_manager: { x: 635, y: 295, zone: "manager",  label: "Manager Office Doorway" },
    door_meeting: { x: 540, y: 386, zone: "meeting",  label: "Meeting Room Doorway" },
    door_dev:     { x: 540, y: 534, zone: "dev",      label: "Developer Wing Doorway" },
    door_creative:{ x: 820, y: 534, zone: "creative", label: "Art & Audio Doorway" },
    door_qa:      { x: 820, y: 386, zone: "qa",       label: "QA Lab Doorway" },

    aisle_manager:{ x: 665, y: 235, zone: "manager",  label: "Manager Suite Floor" },
    meeting_seat1:{ x: 360, y: 285, zone: "meeting",  label: "Meeting Table (NW Seat)" },
    meeting_seat2:{ x: 442, y: 288, zone: "meeting",  label: "Meeting Table (NE Seat)" },
    meeting_seat3:{ x: 360, y: 338, zone: "meeting",  label: "Meeting Table (SW Seat)" },
    meeting_seat4:{ x: 442, y: 338, zone: "meeting",  label: "Meeting Table (SE Seat)" },

    aisle_dev:    { x: 425, y: 575, zone: "dev",      label: "Developer Wing Aisle" },
    aisle_cre_w:  { x: 895, y: 555, zone: "creative", label: "Creative West Aisle" },
    aisle_cre_e:  { x: 995, y: 585, zone: "creative", label: "Creative East Aisle" },
    aisle_qa:     { x: 915, y: 345, zone: "qa",       label: "QA Lab Aisle" },

    atrium_n:     { x: 645, y: 355, zone: "lounge",   label: "North Atrium Walkway" },
    atrium_w:     { x: 585, y: 420, zone: "lounge",   label: "West Atrium Walkway" },
    atrium_sw:    { x: 585, y: 500, zone: "lounge",   label: "South-West Atrium Walkway" },
    atrium_s:     { x: 680, y: 505, zone: "lounge",   label: "Atrium Espresso Bar" },
    atrium_se:    { x: 775, y: 500, zone: "lounge",   label: "South-East Atrium Walkway" },
    atrium_e:     { x: 775, y: 420, zone: "lounge",   label: "East Atrium Walkway" },
    lounge_sofa_w:{ x: 625, y: 462, zone: "lounge",   label: "West Lounge Sofa" },
    lounge_sofa_e:{ x: 735, y: 486, zone: "lounge",   label: "East Lounge Sofa" }
  };

  const NAV_EDGES = [
    ["desk_izmi", "aisle_manager"],
    ["aisle_manager", "door_manager"],
    ["door_manager", "atrium_n"],

    ["door_meeting", "atrium_w"],
    ["door_meeting", "meeting_seat1"],
    ["door_meeting", "meeting_seat2"],
    ["door_meeting", "meeting_seat3"],
    ["door_meeting", "meeting_seat4"],

    ["door_dev", "atrium_sw"],
    ["door_dev", "aisle_dev"],
    ["aisle_dev", "desk_isaac"],
    ["aisle_dev", "desk_hayyan"],

    ["door_creative", "atrium_se"],
    ["door_creative", "aisle_cre_w"],
    ["aisle_cre_w", "desk_izzy"],
    ["aisle_cre_w", "aisle_cre_e"],
    ["aisle_cre_e", "desk_anis"],
    ["aisle_cre_e", "desk_abang"],

    ["door_qa", "atrium_e"],
    ["door_qa", "aisle_qa"],
    ["aisle_qa", "desk_sofea"],

    ["atrium_n", "atrium_w"],
    ["atrium_n", "atrium_e"],
    ["atrium_w", "atrium_sw"],
    ["atrium_w", "lounge_sofa_w"],
    ["atrium_sw", "atrium_s"],
    ["atrium_sw", "lounge_sofa_w"],
    ["atrium_s", "lounge_sofa_w"],
    ["atrium_s", "lounge_sofa_e"],
    ["atrium_s", "atrium_se"],
    ["atrium_se", "atrium_e"],
    ["atrium_e", "lounge_sofa_e"]
  ];

  const ADJACENCY = {};
  Object.keys(NAV_NODES).forEach((id) => (ADJACENCY[id] = []));
  NAV_EDGES.forEach(([a, b]) => {
    const na = NAV_NODES[a];
    const nb = NAV_NODES[b];
    if (na && nb) {
      const weight = Math.hypot(nb.x - na.x, nb.y - na.y);
      ADJACENCY[a].push({ id: b, weight });
      ADJACENCY[b].push({ id: a, weight });
    }
  });

  function findPath(startNodeId, goalNodeId) {
    if (startNodeId === goalNodeId) return [];
    const dist = {};
    const prev = {};
    const unvisited = new Set(Object.keys(NAV_NODES));

    unvisited.forEach((id) => {
      dist[id] = Infinity;
      prev[id] = null;
    });
    dist[startNodeId] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let bestDist = Infinity;
      unvisited.forEach((id) => {
        if (dist[id] < bestDist) {
          bestDist = dist[id];
          current = id;
        }
      });

      if (!current || current === goalNodeId) break;
      unvisited.delete(current);

      const neighbors = ADJACENCY[current] || [];
      for (const edge of neighbors) {
        if (!unvisited.has(edge.id)) continue;
        const alt = dist[current] + edge.weight;
        if (alt < dist[edge.id]) {
          dist[edge.id] = alt;
          prev[edge.id] = current;
        }
      }
    }

    if (dist[goalNodeId] === Infinity) return [];
    const path = [];
    let step = goalNodeId;
    while (step && step !== startNodeId) {
      path.unshift(step);
      step = prev[step];
    }
    return path;
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
      quotes: ["Dijkstra pathfinding locked in!", "Zero doorway collisions now.", "Let's test multi-agent sync."]
    },
    "agent-05": {
      WORKING: "Illustrating warm isometric props & palettes",
      THINKING: "Comparing pastel color harmony swatches",
      IDLE: "Inspecting studio visual consistency",
      quotes: ["Warm oak + stone feels so clean!", "Adding soft shadows to the planters.", "Palette harmony approved!"]
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
    "Sprint 3: Live Kanban & Milestone Review",
    "Child UX & Sound Cues Playtest Review",
    "Corporate Studio Layout & QA Sign-Off"
  ];

  let agentStates = [];
  let isRunning = true;
  let speedMultiplier = 1;
  let rafId = null;
  let lastTimestamp = 0;
  let onTickCallback = null;

  let studioMinutes = 545;
  let dayCount = 1;
  let dailyStandupTriggered = false;
  let eveningWrapTriggered = false;
  let morningArrivalTriggered = true;
  let meetingState = { active: false, timer: 0, topic: STANDUP_TOPICS[0] };

  const LOUNGE_SPOTS = ["lounge_sofa_w", "lounge_sofa_e", "atrium_s", "atrium_n"];
  const PEER_AISLES = ["aisle_dev", "aisle_cre_w", "aisle_cre_e", "aisle_qa"];
  const MEETING_SPOTS = ["meeting_seat1", "meeting_seat2", "meeting_seat3", "meeting_seat4"];

  function speak(st, text, duration = 4.2) {
    st.speechText = text;
    st.speechTimer = duration;
  }

  function createInitialStates(agents) {
    studioMinutes = 545;
    dayCount = 1;
    dailyStandupTriggered = false;
    eveningWrapTriggered = false;
    morningArrivalTriggered = true;
    meetingState = { active: false, timer: 0, topic: STANDUP_TOPICS[0] };

    return agents.map((agent, idx) => {
      const homeNode = NAV_NODES[agent.homeNodeId];
      const activeTask = window.Studio.KanbanStore
        ? window.Studio.KanbanStore.getActiveTaskForAgent(agent.id)
        : null;

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
        currentActivity: activeTask ? `Task: ${activeTask.title}` : ROLE_ACTIVITIES[agent.id].WORKING,
        taskProgress: activeTask ? (agent.id === "agent-07" ? (activeTask.qaProgress || 0) : activeTask.progress) : 0,
        activeTaskTitle: activeTask ? activeTask.title : "",
        activityDuration: 5 + idx * 3.2,
        nextIntendedActivity: "THINKING",
        speechText: idx === 0 ? "Morning team! Sprint board is live!" : "",
        speechTimer: idx === 0 ? 4.2 : 0
      };
    });
  }

  function transitionState(st, newState, targetNodeId = null) {
    st.previousState = st.state;
    st.state = newState;

    if (newState === "WORKING") {
      const activeTask = window.Studio.KanbanStore
        ? (window.Studio.KanbanStore.getActiveTaskForAgent(st.id) || window.Studio.KanbanStore.claimNextBacklogTask(st.id))
        : null;
      st.currentActivity = activeTask ? `Task: ${activeTask.title}` : ROLE_ACTIVITIES[st.id].WORKING;
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
      st.currentActivity = "Syncing with teammates on current sprint";
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

  function isWayBlockedAhead(st, targetPt) {
    const dx = targetPt.x - st.x;
    const dy = targetPt.y - st.y;
    const distToNode = Math.hypot(dx, dy);
    if (distToNode < 1) return false;
    const dirX = dx / distToNode;
    const dirY = dy / distToNode;

    for (const other of agentStates) {
      if (other.id === st.id) continue;
      const otherMoving = other.state === "WALKING" || other.state === "RETURNING_TO_DESK";
      if (!otherMoving) continue;

      const ox = other.x - st.x;
      const oy = other.y - st.y;
      const d = Math.hypot(ox, oy);
      if (d > 0 && d < 26) {
        const dot = (ox * dirX + oy * dirY) / d;
        if (dot > 0.72) return true;
      }
    }
    return false;
  }

  function stepSimulation(dt) {
    const isOvernight = studioMinutes >= 1110 || studioMinutes < 525;
    studioMinutes += dt * (isOvernight ? 18.0 : 2.0);

    if (studioMinutes >= 1440) {
      studioMinutes -= 1440;
      dayCount++;
      dailyStandupTriggered = false;
      eveningWrapTriggered = false;
      morningArrivalTriggered = false;
    }

    if (!morningArrivalTriggered && studioMinutes >= 525 && studioMinutes < 545) {
      morningArrivalTriggered = true;
      agentStates.forEach((st, idx) => {
        if (idx === 0) speak(st, `Good morning team! Day ${dayCount} starts!`, 4.5);
        if (st.currentNodeId !== st.homeNodeId) {
          transitionState(st, "RETURNING_TO_DESK");
        } else {
          transitionState(st, "WORKING");
        }
      });
    }

    if (!dailyStandupTriggered && studioMinutes >= 870 && studioMinutes < 885) {
      dailyStandupTriggered = true;
      callTeamStandup();
    }

    if (!eveningWrapTriggered && studioMinutes >= 1065 && studioMinutes < 1090) {
      eveningWrapTriggered = true;
      meetingState.active = false;
      agentStates.forEach((st, idx) => {
        speak(st, idx === 0 ? "Great work today! Wrapping up!" : "Saving progress for tonight!", 4.5);
        if (st.currentNodeId !== st.homeNodeId) {
          transitionState(st, "RETURNING_TO_DESK");
        } else {
          transitionState(st, "IDLE");
        }
      });
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

        if (isWayBlockedAhead(st, targetPt)) {
          return;
        }

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
        if (isOvernight) {
          st.state = "IDLE";
          st.currentActivity = "Studio closed overnight (Resumes 08:45 AM)";
          return;
        }

        // Advance active Kanban task while WORKING at desk
        if (st.state === "WORKING" && window.Studio.KanbanStore) {
          const res = window.Studio.KanbanStore.advanceAgentWork(st.id, dt * 3.8);
          if (res && res.task) {
            st.activeTaskTitle = res.task.title;
            st.taskProgress = st.id === "agent-07" ? (res.task.qaProgress || 0) : res.task.progress;
            st.currentActivity = `Task (${Math.round(st.taskProgress)}%): ${res.task.title}`;

            if (res.event === "READY_FOR_QA") {
              speak(st, `Done! Sent "${res.task.title.slice(0, 22)}..." to Sofea for QA!`, 4.8);
            } else if (res.event === "QA_APPROVED") {
              speak(st, `QA Approved: "${res.task.title.slice(0, 22)}..."!`, 4.8);
            } else if (res.event === "QA_RETURNED") {
              speak(st, `Found a small UI tweak on "${res.task.title.slice(0, 18)}..."!`, 4.8);
            }
          } else {
            st.activeTaskTitle = "";
            st.taskProgress = 0;
          }
        }

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
  }

  function getClockSnapshot() {
    const total = Math.floor(studioMinutes);
    const hh24 = Math.floor(total / 60);
    const mm = total % 60;
    const ampm = hh24 >= 12 ? "PM" : "AM";
    const hh12 = hh24 % 12 || 12;
    const timeStr = `Day ${dayCount} · ${String(hh12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${ampm}`;

    let phase = "Morning Sprint";
    if (hh24 >= 18 || hh24 < 8 || (hh24 === 8 && mm < 45)) phase = "After Hours";
    else if (hh24 === 8) phase = "Morning Arrival";
    else if (hh24 >= 12 && hh24 < 14) phase = "Midday Lounge";
    else if (hh24 >= 14 && hh24 < 16) phase = "Afternoon Sync";
    else if (hh24 >= 16) phase = "Evening Wrap-Up";

    return {
      timeStr,
      phase,
      isEvening: hh24 >= 16 || hh24 < 8,
      meetingActive: meetingState.active,
      meetingTopic: meetingState.topic
    };
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
