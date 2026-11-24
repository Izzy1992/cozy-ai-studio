(function () {
  const { AGENTS, ZONES, ROADMAP, OfficeRenderer } = window.Studio;

  // DOM Elements
  const navButtons = document.querySelectorAll(".nav-btn");
  const viewSections = document.querySelectorAll(".view-section");
  const isoViewport = document.getElementById("iso-viewport");
  const isoStage = document.getElementById("iso-stage");
  const zoomReadout = document.getElementById("zoom-readout");
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnZoomOut = document.getElementById("btn-zoom-out");
  const btnResetView = document.getElementById("btn-reset-view");
  const zonePills = document.querySelectorAll(".zone-pill");

  const inspectorDrawer = document.getElementById("inspector-drawer");
  const drawerKicker = document.getElementById("drawer-kicker");
  const drawerBody = document.getElementById("drawer-body");
  const btnCloseDrawer = document.getElementById("btn-close-drawer");

  const teamGrid = document.getElementById("team-grid");
  const zonesGrid = document.getElementById("zones-grid");
  const roadmapList = document.getElementById("roadmap-list");

  // Camera Pan & Zoom State
  let camX = 0;
  let camY = 12;
  let camZoom = 1;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let selectedAgentId = null;

  function applyCameraTransform() {
    // Improved scaling so the office occupies a rich, generous portion of desktop & tablet viewports
    const widthRatio = window.innerWidth / 1220;
    const heightRatio = (window.innerHeight - 60) / 780;
    const responsiveBase = Math.min(1.18, Math.max(0.42, Math.min(widthRatio, heightRatio)));
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

  // Render Isometric Office SVG
  OfficeRenderer.renderOffice(isoStage, AGENTS, ZONES);
  applyCameraTransform();
  window.addEventListener("resize", applyCameraTransform);

  // Navigation Switching
  function switchView(viewName) {
    navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === viewName));
    viewSections.forEach((sec) => sec.classList.toggle("active", sec.id === `view-${viewName}`));
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  // Zoom & Reset Controls
  btnZoomIn.addEventListener("click", () => focusCamera(camX, camY, camZoom + 0.15));
  btnZoomOut.addEventListener("click", () => focusCamera(camX, camY, camZoom - 0.15));
  btnResetView.addEventListener("click", () => {
    zonePills.forEach((p) => p.classList.toggle("active", p.dataset.zone === "all"));
    focusCamera(0, 12, 1);
  });

  // Mouse Wheel Zoom
  isoViewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    focusCamera(camX, camY, camZoom + delta);
  }, { passive: false });

  // Pointer Panning (Mouse & Touch)
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

  // Zone Quick-Jump Pills
  zonePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const zId = pill.dataset.zone;
      zonePills.forEach((p) => p.classList.toggle("active", p === pill));

      if (zId === "all") {
        focusCamera(0, 12, 1);
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

  // Agent & Zone Click Handlers inside SVG
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
    document.querySelectorAll(".interactive-agent").forEach((el) => el.classList.remove("highlighted"));
  }

  function selectAgent(agent) {
    switchView("office");
    clearAgentHighlight();
    selectedAgentId = agent.id;

    const el = document.querySelector(`.interactive-agent[data-agent-id="${agent.id}"]`);
    if (el) el.classList.add("highlighted");

    const zone = ZONES.find((z) => z.id === agent.zoneId);
    if (zone) {
      zonePills.forEach((p) => p.classList.toggle("active", p.dataset.zone === zone.id));
      focusCamera(zone.focus.x, zone.focus.y, zone.focus.zoom);
    }

    drawerKicker.textContent = `${agent.code} • EMPLOYEE PROFILE`;
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
          <div style="font-size:11px; color:#447252; font-weight:700; margin-top:2px;">&bull; ${agent.status}</div>
        </div>
      </div>

      <div class="inspector-section">
        <h4>Assigned Workstation</h4>
        <p><strong>${agent.workstationName}</strong> (${zone ? zone.name : ""})</p>
      </div>

      <div class="inspector-section">
        <h4>Personality &amp; Working Style</h4>
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
        <strong>Phase 1.1 Visual Foundation:</strong> Workstation equipment, character design, and role metadata are active. Autonomous walking, meetings, and task assignment unlock in <strong>Phase 2 &amp; Phase 3</strong>.
      </div>
    `;
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
            : `<p>Shared communal space used during Phase 2 simulated meetings and coffee breaks.</p>`
        }
      </div>

      <div class="phase-notice">
        Tip: Click any character directly in the isometric studio to inspect their personal workstation and responsibilities.
      </div>
    `;
    inspectorDrawer.classList.add("open");
  }

  // Populate Team Roster View
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
          <div style="font-size:12px; color:#756354;"><strong>Station:</strong> ${zone ? zone.name : ""}</div>
          <div class="tag-row">
            ${agent.skills.map((s) => `<span class="skill-tag">${s}</span>`).join("")}
          </div>
          <div class="card-actions">
            <button class="primary-pill-btn" data-locate-agent="${agent.id}">Locate in Office &rarr;</button>
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

  // Populate Office Zones View
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

  // Populate Roadmap View
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
