(function () {
  const { AGENTS, ZONES, ROADMAP, OfficeRenderer, SimulationEngine } = window.Studio;

  const navButtons = document.querySelectorAll(".nav-btn");
  const viewSections = document.querySelectorAll(".view-section");
  const isoViewport = document.getElementById("iso-viewport");
  const isoStage = document.getElementById("iso-stage");
  const zoomReadout = document.getElementById("zoom-readout");
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnZoomOut = document.getElementById("btn-zoom-out");
  const btnResetView = document.getElementById("btn-reset-view");
  const zonePills = document.querySelectorAll(".zone-pill");

  const btnSimToggle = document.getElementById("btn-sim-toggle");
  const simSpeedSelect = document.getElementById("sim-speed-select");
  const btnCallMeeting = document.getElementById("btn-call-meeting");
  const btnSimReset = document.getElementById("btn-sim-reset");
  const simStatusDot = document.getElementById("sim-status-dot");
  const simStatusText = document.getElementById("sim-status-text");
  const studioTimeReadout = document.getElementById("studio-time-readout");
  const studioPhaseReadout = document.getElementById("studio-phase-readout");

  const inspectorDrawer = document.getElementById("inspector-drawer");
  const drawerKicker = document.getElementById("drawer-kicker");
  const drawerBody = document.getElementById("drawer-body");
  const btnCloseDrawer = document.getElementById("btn-close-drawer");

  const teamGrid = document.getElementById("team-grid");
  const zonesGrid = document.getElementById("zones-grid");
  const roadmapList = document.getElementById("roadmap-list");

  let camX = 0;
  let camY = 14;
  let camZoom = 1;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let selectedAgentId = null;

  // Cached inspector telemetry elements & HUD throttle state
  let inspectorCache = { agentId: null, badgeEl: null, actEl: null, locEl: null, nextEl: null };
  let lastHudUpdateMs = 0;
  let lastClockText = "";
  let lastPhaseText = "";
  let lastEveningState = null;
  let lastMeetingState = null;

  function applyCameraTransform() {
    const widthRatio = (window.innerWidth - 32) / 1180;
    const heightRatio = (window.innerHeight - 96) / 730;
    const responsiveBase = Math.min(1.22, Math.max(0.42, Math.min(widthRatio, heightRatio)));
    const effectiveScale = camZoom * responsiveBase;

    isoStage.style.transform = `translate(calc(-50% + ${camX}px), calc(-50% + ${camY}px)) scale(${effectiveScale})`;
    zoomReadout.textContent = `${Math.round(camZoom * 100)}%`;
  }

  function focusCamera(x, y, zoom) {
    camX = x;
    camY = y;
    camZoom = Math.min(1.95, Math.max(0.65, zoom));
    applyCameraTransform();
  }

  OfficeRenderer.renderOffice(isoStage, AGENTS, ZONES);
  applyCameraTransform();
  window.addEventListener("resize", applyCameraTransform);

  SimulationEngine.init(AGENTS, (states, clock) => {
    const now = performance.now();
    if (now - lastHudUpdateMs < 200) return; // Throttle DOM HUD writes to ~5 Hz
    lastHudUpdateMs = now;

    if (clock) {
      if (studioTimeReadout && clock.timeStr !== lastClockText) {
        lastClockText = clock.timeStr;
        studioTimeReadout.textContent = clock.timeStr;
      }
      if (studioPhaseReadout && clock.phase !== lastPhaseText) {
        lastPhaseText = clock.phase;
        studioPhaseReadout.textContent = clock.phase;
      }
      if (clock.isEvening !== lastEveningState) {
        lastEveningState = clock.isEvening;
        isoViewport.classList.toggle("evening-mood", clock.isEvening);
      }
      if (btnCallMeeting && clock.meetingActive !== lastMeetingState) {
        lastMeetingState = clock.meetingActive;
        btnCallMeeting.classList.toggle("active", clock.meetingActive);
        btnCallMeeting.textContent = clock.meetingActive ? "Stand-Up Active" : "Call Stand-Up";
      }
    }

    if (selectedAgentId && inspectorDrawer.classList.contains("open")) {
      updateLiveInspectorTelemetry(selectedAgentId);
    }
  });

  btnSimToggle.addEventListener("click", () => {
    const nextRunning = !SimulationEngine.isRunning();
    SimulationEngine.setRunning(nextRunning);
    btnSimToggle.textContent = nextRunning ? "Pause" : "Resume";
    btnSimToggle.classList.toggle("paused", !nextRunning);
    isoStage.classList.toggle("sim-paused", !nextRunning);
    simStatusDot.className = `status-dot ${nextRunning ? "running" : "paused"}`;
    simStatusText.textContent = nextRunning
      ? `Simulation Running (${simSpeedSelect.value}x)`
      : "Simulation Paused";
  });

  simSpeedSelect.addEventListener("change", () => {
    SimulationEngine.setSpeed(simSpeedSelect.value);
    if (SimulationEngine.isRunning()) {
      simStatusText.textContent = `Simulation Running (${simSpeedSelect.value}x)`;
    }
  });

  if (btnCallMeeting) {
    btnCallMeeting.addEventListener("click", () => {
      const started = SimulationEngine.callTeamStandup();
      if (started) {
        const meetingZone = ZONES.find((z) => z.id === "meeting");
        if (meetingZone) {
          zonePills.forEach((p) => p.classList.toggle("active", p.dataset.zone === "meeting"));
          focusCamera(meetingZone.focus.x, meetingZone.focus.y, meetingZone.focus.zoom);
        }
      }
    });
  }

  btnSimReset.addEventListener("click", () => {
    SimulationEngine.reset(AGENTS);
    if (selectedAgentId && inspectorDrawer.classList.contains("open")) {
      updateLiveInspectorTelemetry(selectedAgentId);
    }
  });

  function switchView(viewName) {
    navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === viewName));
    viewSections.forEach((sec) => sec.classList.toggle("active", sec.id === `view-${viewName}`));
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  btnZoomIn.addEventListener("click", () => focusCamera(camX, camY, camZoom + 0.15));
  btnZoomOut.addEventListener("click", () => focusCamera(camX, camY, camZoom - 0.15));
  btnResetView.addEventListener("click", () => {
    zonePills.forEach((p) => p.classList.toggle("active", p.dataset.zone === "all"));
    focusCamera(0, 14, 1);
  });

  isoViewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    focusCamera(camX, camY, camZoom + delta);
  }, { passive: false });

  isoViewport.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".interactive-agent") || e.target.closest(".zone-pill") || e.target.closest(".inspector-drawer")) {
      return;
    }
    isDragging = true;
    dragStartX = e.clientX - camX;
    dragStartY = e.clientY - camY;
    isoStage.classList.add("dragging");
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    camX = e.clientX - dragStartX;
    camY = e.clientY - dragStartY;
    applyCameraTransform();
  });

  window.addEventListener("pointerup", () => {
    if (!isDragging) return;
    isDragging = false;
    isoStage.classList.remove("dragging");
  });

  zonePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const zId = pill.dataset.zone;
      zonePills.forEach((p) => p.classList.toggle("active", p === pill));

      if (zId === "all") {
        focusCamera(0, 14, 1);
        inspectorDrawer.classList.remove("open");
      } else {
        const zone = ZONES.find((z) => z.id === zId);
        if (zone) {
          focusCamera(zone.focus.x, zone.focus.y, zone.focus.zoom);
          openZoneInspector(zone);
        }
      }
    });
  });

  isoStage.addEventListener("click", (e) => {
    const agentEl = e.target.closest(".interactive-agent");
    if (agentEl) {
      const agent = AGENTS.find((a) => a.id === agentEl.dataset.agentId);
      if (agent) selectAgent(agent);
      return;
    }

    const zoneEl = e.target.closest(".zone-hotspot");
    if (zoneEl) {
      const zone = ZONES.find((z) => z.id === zoneEl.dataset.zoneId);
      if (zone) openZoneInspector(zone);
    }
  });

  btnCloseDrawer.addEventListener("click", () => {
    inspectorDrawer.classList.remove("open");
    clearAgentHighlight();
  });

  function clearAgentHighlight() {
    selectedAgentId = null;
    inspectorCache.agentId = null;
    document.querySelectorAll(".interactive-agent").forEach((el) => el.classList.remove("highlighted"));
  }

  function updateLiveInspectorTelemetry(agentId) {
    const st = SimulationEngine.getAgentState(agentId);
    if (!st) return;

    if (inspectorCache.agentId !== agentId) {
      inspectorCache = {
        agentId,
        badgeEl: document.getElementById("live-state-badge"),
        actEl: document.getElementById("live-activity-text"),
        locEl: document.getElementById("live-location-text"),
        nextEl: document.getElementById("live-next-text")
      };
    }

    const { badgeEl, actEl, locEl, nextEl } = inspectorCache;
    if (badgeEl) {
      badgeEl.className = `state-badge state-${st.state}`;
      badgeEl.textContent = st.state.replace(/_/g, " ");
    }
    if (actEl) actEl.textContent = st.currentActivity;
    if (locEl) {
      const z = ZONES.find((zone) => zone.id === st.currentZone);
      locEl.textContent = z ? z.name : st.currentZone;
    }
    if (nextEl) nextEl.textContent = st.nextIntendedActivity.replace(/_/g, " ");
  }

  function selectAgent(agent) {
    switchView("office");
    clearAgentHighlight();
    selectedAgentId = agent.id;

    const el = document.querySelector(`.interactive-agent[data-agent-id="${agent.id}"]`);
    if (el) el.classList.add("highlighted");

    const zone = ZONES.find((z) => z.id === agent.zoneId);
    const st = SimulationEngine.getAgentState(agent.id);

    drawerKicker.textContent = `${agent.code} • LIVE SIMULATION INSPECTOR`;
    drawerBody.innerHTML = `
      <div class="inspector-hero">
        <div class="avatar-circle" style="background:${agent.appearance.accent}; border-color:${agent.appearance.shirt};">
          <svg viewBox="0 0 36 36" width="32" height="32">
            <circle cx="18" cy="14" r="7" fill="${agent.appearance.skin}"/>
            <path d="M11,13 C11,6 25,6 25,13 Z" fill="${agent.appearance.hair}"/>
            <rect x="9" y="22" width="18" height="12" rx="5" fill="${agent.appearance.shirt}"/>
          </svg>
        </div>
        <div>
          <h3 style="font-size:17px; font-weight:800;">${agent.name}</h3>
          <div style="font-size:12px; font-weight:700; color:#c4552d;">${agent.title}</div>
        </div>
      </div>

      <div class="live-telemetry-card">
        <div class="telemetry-row">
          <span style="font-weight:700; color:#756354;">Current State</span>
          <span id="live-state-badge" class="state-badge state-${st ? st.state : 'WORKING'}">${st ? st.state.replace(/_/g, " ") : "WORKING"}</span>
        </div>
        <div class="telemetry-row">
          <span style="font-weight:700; color:#756354;">Current Zone</span>
          <strong id="live-location-text">${zone ? zone.name : ""}</strong>
        </div>
        <div style="font-size:12.5px; margin-top:2px;">
          <span style="font-weight:700; color:#756354;">Activity:</span>
          <span id="live-activity-text">${st ? st.currentActivity : ""}</span>
        </div>
        <div style="font-size:11.5px; color:#756354;">
          <strong>Next State:</strong> <span id="live-next-text">${st ? st.nextIntendedActivity.replace(/_/g, " ") : "THINKING"}</span>
        </div>
        <div class="quick-action-row">
          <button class="drawer-action-btn" id="btn-agent-lounge">Coffee Break</button>
          <button class="drawer-action-btn" id="btn-agent-standup">Call Stand-Up</button>
        </div>
      </div>

      <div class="inspector-section">
        <h4>Home Workstation</h4>
        <p><strong>${agent.workstationName}</strong></p>
      </div>

      <div class="inspector-section">
        <h4>Personality &amp; Role</h4>
        <p>${agent.personality} ${agent.roleDescription}</p>
      </div>

      <div class="inspector-section">
        <h4>Core Skills</h4>
        <div class="tag-row">
          ${agent.skills.map((s) => `<span class="skill-tag">${s}</span>`).join("")}
        </div>
      </div>

      <div class="inspector-section">
        <h4>Key Responsibilities</h4>
        <ul class="inspector-list">
          ${agent.responsibilities.map((r) => `<li>${r}</li>`).join("")}
        </ul>
      </div>

      <div class="phase-notice">
        <strong>Simulated Activity (Phase 2.3 &amp; 2.4):</strong> Weighted Dijkstra pathfinding, doorway queuing, and full day/evening schedules run locally in the browser.
      </div>
    `;

    inspectorCache.agentId = null;
    updateLiveInspectorTelemetry(agent.id);

    document.getElementById("btn-agent-lounge").onclick = () => SimulationEngine.sendAgentToLounge(agent.id);
    document.getElementById("btn-agent-standup").onclick = () => SimulationEngine.callTeamStandup();

    inspectorDrawer.classList.add("open");
  }

  function openZoneInspector(zone) {
    clearAgentHighlight();
    const zoneAgents = AGENTS.filter((a) => a.zoneId === zone.id);

    drawerKicker.textContent = "STUDIO FLOORPLAN ZONE";
    drawerBody.innerHTML = `
      <div>
        <h3 style="font-size:18px; font-weight:800; margin-bottom:4px;">${zone.name}</h3>
        <p style="font-size:13px; color:#756354; line-height:1.45;">${zone.description}</p>
      </div>

      <div class="inspector-section">
        <h4>Assigned Station Staff (${zoneAgents.length})</h4>
        ${
          zoneAgents.length > 0
            ? `<ul class="inspector-list">${zoneAgents
                .map((a) => `<li><strong>${a.name}</strong> — ${a.title}</li>`)
                .join("")}</ul>`
            : `<p>Shared communal destination accessible via the weighted Dijkstra navigation graph.</p>`
        }
      </div>

      <div class="phase-notice">
        Tip: Click <strong>Call Stand-Up</strong> in the top bar to watch Izmi gather teammates in the Meeting Room.
      </div>
    `;
    inspectorDrawer.classList.add("open");
  }

  function renderTeamRoster() {
    teamGrid.innerHTML = AGENTS.map((agent) => {
      const zone = ZONES.find((z) => z.id === agent.zoneId);
      return `
        <article class="studio-card">
          <div class="card-top">
            <div class="avatar-circle" style="background:${agent.appearance.accent}; border-color:${agent.appearance.shirt};">
              <svg viewBox="0 0 36 36" width="32" height="32">
                <circle cx="18" cy="14" r="7" fill="${agent.appearance.skin}"/>
                <path d="M11,13 C11,6 25,6 25,13 Z" fill="${agent.appearance.hair}"/>
                <rect x="9" y="22" width="18" height="12" rx="5" fill="${agent.appearance.shirt}"/>
              </svg>
            </div>
            <div>
              <div style="font-size:10px; font-weight:800; color:#756354;">${agent.code}</div>
              <div class="card-title">${agent.name}</div>
              <div class="card-role">${agent.title}</div>
            </div>
          </div>
          <p style="font-size:13px; color:#5c4a3c; line-height:1.4;">${agent.roleDescription}</p>
          <div style="font-size:12px; color:#756354;"><strong>Home Station:</strong> ${zone ? zone.name : ""}</div>
          <div class="tag-row">
            ${agent.skills.map((s) => `<span class="skill-tag">${s}</span>`).join("")}
          </div>
          <div class="card-actions">
            <button class="primary-pill-btn" data-locate-agent="${agent.id}">Inspect in Office &rarr;</button>
          </div>
        </article>
      `;
    }).join("");

    teamGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-locate-agent]");
      if (btn) {
        const agent = AGENTS.find((a) => a.id === btn.dataset.locateAgent);
        if (agent) selectAgent(agent);
      }
    });
  }

  function renderZonesView() {
    zonesGrid.innerHTML = ZONES.map((zone) => {
      const staff = AGENTS.filter((a) => a.zoneId === zone.id);
      return `
        <article class="studio-card">
          <div class="card-top">
            <div class="avatar-circle" style="background:${zone.badgeColor}20; border-color:${zone.badgeColor}; color:${zone.badgeColor}; font-weight:900;">
              ${zone.shortName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="card-title">${zone.name}</div>
              <div class="card-role" style="color:${zone.badgeColor};">${staff.length} Assigned Workstation(s)</div>
            </div>
          </div>
          <p style="font-size:13px; color:#5c4a3c; line-height:1.45;">${zone.description}</p>
          <div class="card-actions">
            <button class="primary-pill-btn" data-locate-zone="${zone.id}">Focus Zone on Floorplan &rarr;</button>
          </div>
        </article>
      `;
    }).join("");

    zonesGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-locate-zone]");
      if (btn) {
        const zone = ZONES.find((z) => z.id === btn.dataset.locateZone);
        if (zone) {
          switchView("office");
          zonePills.forEach((p) => p.classList.toggle("active", p.dataset.zone === zone.id));
          focusCamera(zone.focus.x, zone.focus.y, zone.focus.zoom);
          openZoneInspector(zone);
        }
      }
    });
  }

  function renderRoadmapView() {
    roadmapList.innerHTML = ROADMAP.map((item) => `
      <div class="roadmap-item">
        <div>
          <h3 style="font-size:16px; font-weight:800; margin-bottom:4px;">${item.phase}</h3>
          <p style="font-size:13px; color:#5c4a3c; line-height:1.45;">${item.details}</p>
        </div>
        <span class="status-pill ${item.active ? "status-active" : "status-upcoming"}">${item.status}</span>
      </div>
    `).join("");
  }

  renderTeamRoster();
  renderZonesView();
  renderRoadmapView();
})();
