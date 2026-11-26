window.Studio = window.Studio || {};

window.Studio.OfficeRenderer = (function () {
  function isoDiamond(cx, cy, rx, ry) {
    return `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;
  }

  function hexPoints(cx, cy, rx, ry) {
    return [
      [cx, cy - ry],            // 0: North
      [cx + rx, cy - ry * 0.5], // 1: North-East
      [cx + rx, cy + ry * 0.5], // 2: South-East
      [cx, cy + ry],            // 3: South
      [cx - rx, cy + ry * 0.5], // 4: South-West
      [cx - rx, cy - ry * 0.5]  // 5: North-West
    ];
  }

  function hexPolygonStr(cx, cy, rx, ry) {
    return hexPoints(cx, cy, rx, ry).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  }

  function isoBox(cx, cy, rx, ry, h, colors) {
    const top = `${cx},${cy - ry - h} ${cx + rx},${cy - h} ${cx},${cy + ry - h} ${cx - rx},${cy - h}`;
    const left = `${cx - rx},${cy - h} ${cx},${cy + ry - h} ${cx},${cy + ry} ${cx - rx},${cy}`;
    const right = `${cx},${cy + ry - h} ${cx + rx},${cy - h} ${cx + rx},${cy} ${cx},${cy + ry}`;
    return `
      <polygon points="${left}" fill="${colors.left}" stroke="${colors.stroke || 'rgba(30,41,59,0.16)'}" stroke-width="0.9"/>
      <polygon points="${right}" fill="${colors.right}" stroke="${colors.stroke || 'rgba(30,41,59,0.16)'}" stroke-width="0.9"/>
      <polygon points="${top}" fill="${colors.top}" stroke="${colors.stroke || 'rgba(30,41,59,0.16)'}" stroke-width="0.9"/>
    `;
  }

  // Architectural wall / tempered glass partition segment
  function archWall(x1, y1, x2, y2, h, options = {}) {
    const {
      wallColor = "#f7f4ef",
      trimColor = "#475569",
      topColor = "#ffffff",
      isGlass = false
    } = options;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * 3.8;
    const ny = (dx / len) * 2.0;

    const faceFill = isGlass ? "rgba(219, 238, 248, 0.24)" : wallColor;
    const faceStroke = isGlass ? "rgba(100, 116, 139, 0.45)" : "#cfc8bc";

    let glassDetail = "";
    if (isGlass) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      glassDetail = `
        <line x1="${mx}" y1="${my}" x2="${mx}" y2="${my - h}" stroke="rgba(100,116,139,0.38)" stroke-width="1.2"/>
        <line x1="${x1}" y1="${y1 - h * 0.5}" x2="${x2}" y2="${y2 - h * 0.5}" stroke="rgba(255,255,255,0.65)" stroke-width="1.2"/>
      `;
    }

    return `
      <g>
        <polygon points="${x1},${y1} ${x2},${y2} ${x2},${y2 - h} ${x1},${y1 - h}"
          fill="${faceFill}" stroke="${faceStroke}" stroke-width="1.1"/>
        <polygon points="${x1},${y1} ${x2},${y2} ${x2},${y2 - 5} ${x1},${y1 - 5}" fill="${trimColor}"/>
        ${glassDetail}
        <polygon points="${x1},${y1 - h} ${x2},${y2 - h} ${x2 + nx},${y2 + ny - h} ${x1 + nx},${y1 + ny - h}"
          fill="${isGlass ? '#475569' : topColor}" stroke="${isGlass ? '#334155' : '#c7bfb2'}" stroke-width="0.9"/>
        ${isoBox(x1, y1, 2.4, 1.4, h + 1, { top: "#475569", left: "#1e293b", right: "#64748b" })}
        ${isoBox(x2, y2, 2.4, 1.4, h + 1, { top: "#475569", left: "#1e293b", right: "#64748b" })}
      </g>
    `;
  }

  // Partition wall with a clean architectural doorway opening
  function archDoorWall(x1, y1, x2, y2, h, options = {}, gapRatio = 0.38) {
    const t1 = (1 - gapRatio) * 0.5;
    const t2 = 1 - t1;
    const dx1 = x1 + (x2 - x1) * t1;
    const dy1 = y1 + (y2 - y1) * t1;
    const dx2 = x1 + (x2 - x1) * t2;
    const dy2 = y1 + (y2 - y1) * t2;

    return `
      <line x1="${dx1}" y1="${dy1}" x2="${dx2}" y2="${dy2}" stroke="#94a3b8" stroke-width="2" opacity="0.55"/>
      ${archWall(x1, y1, dx1, dy1, h, options)}
      ${archWall(dx2, dy2, x2, y2, h, options)}
    `;
  }

  function renderPlanter(x, y, scale = 1, tall = false) {
    return `
      <g class="depth-prop" data-sort-y="${y}" transform="translate(${x}, ${y}) scale(${scale})">
        <ellipse cx="0" cy="4" rx="14" ry="7" fill="rgba(15,23,42,0.14)"/>
        ${isoBox(0, 0, 11, 5.5, 13, { top: "#e7e2d8", left: "#cbd5e1", right: "#d6d1c7" })}
        <ellipse cx="0" cy="-13" rx="8" ry="4" fill="#57534e"/>
        ${tall
          ? `<rect x="-2.2" y="-36" width="4.4" height="24" fill="#78553a"/>
             <circle cx="-8" cy="-38" r="10" fill="#4d7c5b"/>
             <circle cx="8" cy="-36" r="9.5" fill="#5c8d6b"/>
             <circle cx="0" cy="-46" r="12" fill="#6da17d"/>`
          : `<path d="M0,-13 C-11,-24 -13,-31 -4,-32 C-1,-25 0,-19 0,-13 Z" fill="#4d7c5b"/>
             <path d="M0,-13 C11,-24 13,-31 4,-32 C1,-25 0,-19 0,-13 Z" fill="#3f694c"/>
             <path d="M0,-14 C-4,-28 0,-36 3,-35 C6,-28 3,-20 0,-14 Z" fill="#6da17d"/>`
        }
      </g>
    `;
  }

  function renderBookshelf(x, y) {
    return `
      <g class="depth-prop" data-sort-y="${y}" transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="5" rx="28" ry="14" fill="rgba(15,23,42,0.14)"/>
        ${isoBox(0, 0, 26, 13, 56, { top: "#d8be9c", left: "#b89c78", right: "#cbb08c" })}
        <polygon points="2,-38 22,-28 22,-19 2,-29" fill="#475569"/>
        <polygon points="2,-20 22,-10 22,-1 2,-11" fill="#475569"/>
        <polygon points="4,-30 9,-27.5 9,-20 4,-22.5" fill="#e2e8f0"/>
        <polygon points="10,-27 15,-24.5 15,-17 10,-19.5" fill="#94a3b8"/>
        <polygon points="16,-24 20,-22 20,-14.5 16,-16.5" fill="#cbd5e1"/>
        <polygon points="5,-12 11,-9 11,-1.5 5,-4.5" fill="#64748b"/>
        <polygon points="12,-8.5 18,-5.5 18,2 12,-1" fill="#e2e8f0"/>
      </g>
    `;
  }

  function renderErgonomicChair(x, y, fabricColor = "#475569") {
    return `
      <g class="depth-prop" data-sort-y="${y}" transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="5" rx="12" ry="6" fill="rgba(15,23,42,0.16)"/>
        <line x1="0" y1="3" x2="0" y2="-5" stroke="#334155" stroke-width="2.4"/>
        ${isoBox(0, -5, 11, 5.5, 4, { top: fabricColor, left: "#1e293b", right: fabricColor })}
        ${isoBox(-5, -9, 4, 6.5, 15, { top: fabricColor, left: "#0f172a", right: fabricColor })}
      </g>
    `;
  }

  function renderWorkstation(x, y, roleType) {
    const isExec = roleType === "manager";
    const deskTop = isExec ? "#c8a982" : "#dfc7a7";
    const deskLeft = isExec ? "#a68762" : "#bfa584";
    const deskRight = isExec ? "#b89872" : "#cfb594";

    let rigSVG = "";
    if (roleType === "manager") {
      rigSVG = `
        ${isoBox(-5, -22, 14, 4.5, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-17,-35 7,-23 7,-12 -17,-24" fill="#e0f2fe"/>
        <polygon points="8,-13 20,-7 13,-2 1,-8" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
      `;
    } else if (roleType === "designer") {
      rigSVG = `
        ${isoBox(-8, -22, 12, 4.5, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-18,-34 2,-24 2,-14 -18,-24" fill="#bae6fd"/>
        <polygon points="3,-13 19,-5 10,0 -6,-8" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8"/>
      `;
    } else if (roleType === "frontend" || roleType === "systems") {
      rigSVG = `
        ${isoBox(-13, -24, 11, 4, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-22,-36 -4,-27 -4,-17 -22,-26" fill="#bae6fd"/>
        ${isoBox(7, -14, 11, 4, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-2,-26 16,-17 16,-7 -2,-16" fill="#e0f2fe"/>
      `;
    } else if (roleType === "art") {
      rigSVG = `
        ${isoBox(-10, -23, 12, 4.5, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-20,-36 0,-26 0,-15 -20,-25" fill="#bae6fd"/>
        <polygon points="2,-13 19,-4 10,1 -7,-8" fill="#0f172a" stroke="#475569" stroke-width="0.9"/>
        <polygon points="4,-12 16,-5 9,-2 -3,-9" fill="#f8fafc"/>
      `;
    } else if (roleType === "audio") {
      rigSVG = `
        ${isoBox(-21, -27, 4.5, 3.5, 13, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <circle cx="-18" cy="-30" r="2.2" fill="#94a3b8"/>
        ${isoBox(17, -8, 4.5, 3.5, 13, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <circle cx="20" cy="-10" r="2.2" fill="#94a3b8"/>
        ${isoBox(-3, -20, 11, 4.5, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-12,-32 6,-23 6,-13 -12,-22" fill="#bae6fd"/>
      `;
    } else if (roleType === "qa") {
      rigSVG = `
        ${isoBox(-13, -24, 11, 4, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-22,-36 -4,-27 -4,-17 -22,-26" fill="#bae6fd"/>
        ${isoBox(5, -15, 9, 4, 13, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-2,-25 13,-18 13,-9 -2,-16" fill="#e0f2fe"/>
      `;
    }

    return `
      <g class="depth-prop" data-sort-y="${y}" transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="7" rx="38" ry="18" fill="rgba(15,23,42,0.12)"/>
        <rect x="-29" y="-10" width="3" height="19" fill="#475569"/>
        <rect x="25" y="-10" width="3" height="19" fill="#475569"/>
        ${isoBox(0, -12, 36, 18, 5, { top: deskTop, left: deskLeft, right: deskRight })}
        <ellipse cx="19" cy="-10" rx="3.2" ry="1.8" fill="#ffffff" stroke="#94a3b8" stroke-width="0.9"/>
        ${rigSVG}
      </g>
    `;
  }

  function renderAgentCharacter(agent) {
    const { x, y } = agent.seatPos;
    const { skin, hair, hairStyle, shirt, pants, shoes, accent, accessory } = agent.appearance;

    let hairPath = `<path d="M-9,-45 C-9,-53.5 9,-53.5 9,-45 L9,-41.5 L-9,-41.5 Z" fill="${hair}"/>`;
    if (hairStyle === "long") {
      hairPath += `<path d="M-10,-45 L-10,-32 L-5,-32 L-5,-41.5 L5,-41.5 L5,-32 L10,-32 L10,-45 Z" fill="${hair}"/>`;
    } else if (hairStyle === "ponytail") {
      hairPath += `<circle cx="10" cy="-46" r="4.5" fill="${hair}"/>`;
    } else if (hairStyle === "spiky" || hairStyle === "curly") {
      hairPath = `<path d="M-10,-44 L-7.5,-52.5 L-3,-50 L0,-54.5 L4,-50 L8.5,-52.5 L10,-44 Z" fill="${hair}"/>`;
    }

    let accessorySVG = "";
    if (accessory === "glasses") {
      accessorySVG = `
        <rect x="-6.5" y="-43" width="5" height="3.6" rx="1" fill="none" stroke="#1e293b" stroke-width="1"/>
        <rect x="1.5" y="-43" width="5" height="3.6" rx="1" fill="none" stroke="#1e293b" stroke-width="1"/>
        <line x1="-1.5" y1="-41.2" x2="1.5" y2="-41.2" stroke="#1e293b" stroke-width="1"/>
      `;
    } else if (accessory === "headphones") {
      accessorySVG = `
        <path d="M-10.5,-42 C-10.5,-53.5 10.5,-53.5 10.5,-42" fill="none" stroke="#334155" stroke-width="2.2"/>
        <rect x="-12.5" y="-45" width="3.8" height="6.5" rx="1.8" fill="#475569"/>
        <rect x="8.7" y="-45" width="3.8" height="6.5" rx="1.8" fill="#475569"/>
      `;
    } else if (accessory === "beret") {
      accessorySVG = `<ellipse cx="-2" cy="-51" rx="9.5" ry="3.8" transform="rotate(-12 -2 -51)" fill="#9f1239"/>`;
    } else if (accessory === "lanyard") {
      accessorySVG = `<line x1="-2.5" y1="-31" x2="0" y2="-21" stroke="#cbd5e1" stroke-width="1.3"/><rect x="-1.8" y="-22" width="3.6" height="4.5" rx="0.8" fill="#ffffff"/>`;
    }

    return `
      <g class="interactive-agent is-working is-seated" data-agent-id="${agent.id}" data-sort-y="${y}" transform="translate(${x}, ${y})">
        <ellipse class="selection-ring" cx="0" cy="5" rx="20" ry="10" fill="rgba(15,23,42,0.12)" stroke="#334155" stroke-width="2.5"/>
        <ellipse cx="0" cy="5" rx="14" ry="7" fill="rgba(15,23,42,0.18)"/>

        <!-- Directional Flip Container (Body only; keeps text tags readable) -->
        <g class="agent-flip-wrap">
          <g class="agent-body-bob">
            <!-- Standing Legs -->
            <g class="legs-standing">
              <g class="leg-left">
                <rect x="-7" y="-14" width="6" height="13" rx="2" fill="${pants}"/>
                <rect x="-8" y="-2" width="7.5" height="3.8" rx="1.8" fill="${shoes || '#1e293b'}"/>
              </g>
              <g class="leg-right">
                <rect x="1" y="-14" width="6" height="13" rx="2" fill="${pants}"/>
                <rect x="0.5" y="-2" width="7.5" height="3.8" rx="1.8" fill="${shoes || '#1e293b'}"/>
              </g>
            </g>

            <!-- Seated Posture Legs (Knees bent forward over chair edge) -->
            <g class="legs-seated">
              <polygon points="-7,-15 3,-11 -2,-5 -11,-9" fill="${pants}"/>
              <rect x="-11" y="-9" width="5.5" height="9" rx="2" fill="${pants}"/>
              <rect x="-13" y="-1.5" width="7" height="3.5" rx="1.5" fill="${shoes || '#1e293b'}"/>
              <polygon points="0,-13 9,-9 4,-3 -5,-7" fill="${pants}"/>
              <rect x="-4" y="-7" width="5.5" height="9" rx="2" fill="${pants}"/>
              <rect x="-6" y="0.5" width="7" height="3.5" rx="1.5" fill="${shoes || '#1e293b'}"/>
            </g>

            <rect x="-10" y="-32" width="20" height="19" rx="5" fill="${shirt}" stroke="rgba(15,23,42,0.16)" stroke-width="0.9"/>
            <polygon points="-4,-32 4,-32 0,-26" fill="${accent}"/>

            <rect class="arm-left" x="-13.2" y="-30" width="3.8" height="14" rx="1.9" fill="${skin}"/>
            <rect class="arm-right" x="9.4" y="-30" width="3.8" height="14" rx="1.9" fill="${skin}"/>

            <circle cx="0" cy="-42.5" r="10" fill="${skin}" stroke="rgba(15,23,42,0.12)" stroke-width="0.9"/>
            <circle cx="-3.6" cy="-41" r="1.2" fill="#1e293b"/>
            <circle cx="3.6" cy="-41" r="1.2" fill="#1e293b"/>
            <path d="M-2.2,-37.8 Q0,-36 2.2,-37.8" fill="none" stroke="#7c2d12" stroke-width="1.1" stroke-linecap="round"/>
            ${hairPath}
            ${accessorySVG}
          </g>
        </g>

        <!-- Minimal Architectural Name Pill -->
        <g transform="translate(0, -61)">
          <rect x="-32" y="-8" width="64" height="15" rx="7.5" fill="rgba(255,255,255,0.95)" stroke="#cbd5e1" stroke-width="1"/>
          <text x="0" y="2" text-anchor="middle" font-size="8.8" font-weight="700" fill="#1e293b">${agent.name}</text>
          <text class="agent-state-sub" x="0" y="-12" text-anchor="middle" font-size="7.8" font-weight="700" fill="#475569">WORKING</text>
        </g>

        <!-- Speech Bubble -->
        <g class="agent-speech-bubble" transform="translate(0, -92)" opacity="0">
          <rect class="bubble-bg" x="-72" y="-13" width="144" height="21" rx="10.5" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
          <polygon points="-4,8 4,8 0,12" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
          <text class="bubble-text" x="0" y="0.5" text-anchor="middle" font-size="8.8" font-weight="600" fill="#1e293b"></text>
        </g>
      </g>
    `;
  }

  // Architectural Floor-Mounted Room Signage Plaque
  function renderArchSign(x, y, label, accentColor) {
    const w = label.length * 6.4 + 26;
    return `
      <g pointer-events="none" transform="translate(${x}, ${y})">
        <rect x="${-w / 2}" y="-9" width="${w}" height="18" rx="4" fill="rgba(255,255,255,0.94)" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="${-w / 2}" y="-9" width="4" height="18" rx="2" fill="${accentColor}"/>
        <text x="2" y="3" text-anchor="middle" font-size="9" font-weight="800" letter-spacing="0.8" fill="#334155">${label}</text>
      </g>
    `;
  }

  let lastSortKey = "";
  const agentDomCache = {};

  function updateAgentVisuals(agentStates, meetingInfo) {
    const layer = document.getElementById("depth-sorted-layer");
    if (!layer) return;

    const screenPulse = document.getElementById("meeting-screen-active");
    if (screenPulse) {
      screenPulse.setAttribute("opacity", meetingInfo && meetingInfo.active ? "1" : "0");
    }

    agentStates.forEach((st) => {
      let cached = agentDomCache[st.id];
      if (!cached || !cached.el.isConnected) {
        const el = layer.querySelector(`.interactive-agent[data-agent-id="${st.id}"]`);
        if (!el) return;
        cached = agentDomCache[st.id] = {
          el,
          prevX: st.x,
          subLabel: el.querySelector(".agent-state-sub"),
          bubble: el.querySelector(".agent-speech-bubble"),
          bubbleText: el.querySelector(".bubble-text"),
          bubbleBg: el.querySelector(".bubble-bg")
        };
      }
      const { el, subLabel, bubble, bubbleText, bubbleBg } = cached;

      // Update directional facing based on horizontal movement or desk orientation
      const dx = st.x - cached.prevX;
      if (Math.abs(dx) > 0.15) {
        el.classList.toggle("facing-left", dx < 0);
      } else if (st.state === "WORKING") {
        // Face toward workstation monitor when seated at desk
        el.classList.toggle("facing-left", st.x > 680);
      }
      cached.prevX = st.x;

      el.setAttribute("transform", `translate(${st.x.toFixed(1)}, ${st.y.toFixed(1)})`);
      el.dataset.sortY = st.y.toFixed(1);

      const isMoving = st.state === "WALKING" || st.state === "RETURNING_TO_DESK" || st.state === "PEER_REVIEW";
      const isWorking = st.state === "WORKING";
      const isSeated = isWorking || st.state === "THINKING" || st.state === "IN_MEETING";

      el.classList.toggle("is-walking", isMoving);
      el.classList.toggle("is-working", isWorking);
      el.classList.toggle("is-seated", isSeated);

      if (subLabel) {
        const labelMap = {
          WORKING: "WORKING",
          THINKING: "THINKING",
          IDLE: "IDLE",
          WALKING: "WALKING",
          RETURNING_TO_DESK: "RETURNING",
          USING_LOUNGE: "LOUNGE",
          PEER_REVIEW: "SYNCING",
          IN_MEETING: "STAND-UP"
        };
        subLabel.textContent = labelMap[st.state] || st.state;
        subLabel.setAttribute(
          "fill",
          isMoving ? "#0284c7" : st.state === "IN_MEETING" ? "#0d9488" : st.state === "USING_LOUNGE" ? "#7c3aed" : "#475569"
        );
      }

      if (bubble && bubbleText) {
        if (st.speechText && st.speechTimer > 0) {
          bubbleText.textContent = st.speechText;
          const width = Math.max(96, Math.min(200, st.speechText.length * 5.4 + 22));
          if (bubbleBg) {
            bubbleBg.setAttribute("x", (-width / 2).toFixed(0));
            bubbleBg.setAttribute("width", width.toFixed(0));
          }
          bubble.setAttribute("opacity", "1");
        } else {
          bubble.setAttribute("opacity", "0");
        }
      }
    });

    const children = Array.from(layer.children);
    children.sort((a, b) => parseFloat(a.dataset.sortY || 0) - parseFloat(b.dataset.sortY || 0));
    const sortKey = children.map((el) => el.dataset.agentId || el.dataset.sortY).join("|");
    if (sortKey !== lastSortKey) {
      lastSortKey = sortKey;
      children.forEach((el) => layer.appendChild(el));
    }
  }

  function renderOffice(containerEl, agents, zones) {
    lastSortKey = "";
    Object.keys(agentDomCache).forEach((k) => delete agentDomCache[k]);

    const RX = 186;
    const RY = 148;
    const CELLS = {
      lounge:   { cx: 680, cy: 460 },
      manager:  { cx: 680, cy: 164 },
      meeting:  { cx: 401, cy: 312 },
      dev:      { cx: 401, cy: 608 },
      creative: { cx: 959, cy: 608 },
      qa:       { cx: 959, cy: 312 }
    };

    const pts = {};
    Object.keys(CELLS).forEach((k) => {
      pts[k] = hexPoints(CELLS[k].cx, CELLS[k].cy, RX, RY);
    });

    // South Courtyard Terrace cell completing the bottom honeycomb notch
    const southPts = hexPoints(680, 756, RX, RY);
    const southPoly = hexPolygonStr(680, 756, RX, RY);

    const outerWallH = 76;
    const glassBalustradeH = 26; // Sleek half-glass partitions for unobstructed sightlines

    const svg = `
      <svg class="office-svg" viewBox="140 -25 1080 945" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="buildingAmbientShadow" x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#1e293b" flood-opacity="0.18"/>
          </filter>

          <!-- Scandinavian Light Natural Oak Flooring -->
          <pattern id="scandiOak" width="48" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-27)">
            <rect width="48" height="24" fill="#dfcab0"/>
            <rect x="0" y="0" width="48" height="11.5" fill="#e6d3ba"/>
            <line x1="0" y1="12" x2="48" y2="12" stroke="#cbb294" stroke-width="0.9"/>
            <line x1="24" y1="0" x2="24" y2="12" stroke="#cbb294" stroke-width="0.9"/>
          </pattern>

          <!-- Polished Light Stone Corridor Flooring -->
          <pattern id="polishedConcrete" width="44" height="22" patternUnits="userSpaceOnUse">
            <rect width="44" height="22" fill="#ebe7e0"/>
            <polygon points="22,0 44,11 22,22 0,11" fill="none" stroke="#dcd6cb" stroke-width="0.9"/>
          </pattern>
        </defs>

        <!-- UNIFIED SINGLE-BUILDING ARCHITECTURAL SLAB -->
        <g filter="url(#buildingAmbientShadow)">
          ${Object.entries(CELLS).map(([zoneId, cell]) => {
            const poly = hexPolygonStr(cell.cx, cell.cy, RX, RY);
            const oakInset = hexPolygonStr(cell.cx, cell.cy, RX * 0.88, RY * 0.88);
            const p = pts[zoneId];
            return `
              <g class="zone-hotspot" data-zone-id="${zoneId}">
                <polygon points="${p[2][0]},${p[2][1]} ${p[3][0]},${p[3][1]} ${p[3][0]},${p[3][1] + 16} ${p[2][0]},${p[2][1] + 16}" fill="#94a3b8"/>
                <polygon points="${p[3][0]},${p[3][1]} ${p[4][0]},${p[4][1]} ${p[4][0]},${p[4][1] + 16} ${p[3][0]},${p[3][1] + 16}" fill="#cbd5e1"/>
                <polygon points="${poly}" fill="url(#polishedConcrete)" stroke="#cbd5e1" stroke-width="1.5"/>
                <polygon points="${oakInset}" fill="${zoneId === 'lounge' ? 'url(#polishedConcrete)' : 'url(#scandiOak)'}" stroke="#d6cfc2" stroke-width="1"/>
              </g>
            `;
          }).join("")}

          <!-- South Courtyard Terrace (Completes bottom honeycomb symmetry) -->
          <g class="zone-hotspot" data-zone-id="lounge">
            <polygon points="${southPts[2][0]},${southPts[2][1]} ${southPts[3][0]},${southPts[3][1]} ${southPts[3][0]},${southPts[3][1] + 16} ${southPts[2][0]},${southPts[2][1] + 16}" fill="#94a3b8"/>
            <polygon points="${southPts[3][0]},${southPts[3][1]} ${southPts[4][0]},${southPts[4][1]} ${southPts[4][0]},${southPts[4][1] + 16} ${southPts[3][0]},${southPts[3][1] + 16}" fill="#cbd5e1"/>
            <polygon points="${southPoly}" fill="url(#polishedConcrete)" stroke="#cbd5e1" stroke-width="1.5"/>
            <polygon points="${hexPolygonStr(680, 756, RX * 0.84, RY * 0.84)}" fill="#e3ede6" stroke="#c3d4c8" stroke-width="1"/>
          </g>
        </g>

        <!-- OUTER PERIMETER ARCHITECTURAL WALLS -->
        ${archWall(pts.manager[5][0], pts.manager[5][1], pts.manager[0][0], pts.manager[0][1], outerWallH)}
        ${archWall(pts.manager[0][0], pts.manager[0][1], pts.manager[1][0], pts.manager[1][1], outerWallH)}
        <polygon points="545,94 635,49 635,92 545,137" fill="#dceef8" stroke="#64748b" stroke-width="2.5"/>
        <line x1="590" y1="71" x2="590" y2="114" stroke="#64748b" stroke-width="1.8"/>

        ${archWall(pts.meeting[5][0], pts.meeting[5][1], pts.meeting[0][0], pts.meeting[0][1], outerWallH)}
        ${archWall(pts.meeting[0][0], pts.meeting[0][1], pts.meeting[1][0], pts.meeting[1][1], outerWallH)}
        <polygon points="260,242 355,194 355,236 260,284" fill="#1e293b" stroke="#475569" stroke-width="2.5"/>
        <polygon points="267,247 348,206 348,231 267,272" fill="#0f172a"/>
        <polyline points="278,260 302,244 322,240 340,218" fill="none" stroke="#38bdf8" stroke-width="2"/>
        <g id="meeting-screen-active" opacity="0">
          <circle cx="275" cy="252" r="3.5" fill="#22c55e"/>
          <polygon points="284,247 335,221 335,228 284,254" fill="#38bdf8"/>
        </g>

        ${archWall(pts.qa[5][0], pts.qa[5][1], pts.qa[0][0], pts.qa[0][1], outerWallH)}
        ${archWall(pts.qa[0][0], pts.qa[0][1], pts.qa[1][0], pts.qa[1][1], outerWallH)}
        <polygon points="1005,194 1100,242 1100,284 1005,236" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
        <line x1="1018" y1="212" x2="1085" y2="245" stroke="#0ea5e9" stroke-width="1.8"/>
        <line x1="1018" y1="224" x2="1075" y2="252" stroke="#64748b" stroke-width="1.6"/>

        <!-- SLEEK 26px HALF-GLASS PARTITIONS WITH CLEAN ENTRANCES -->
        ${archDoorWall(pts.lounge[5][0], pts.lounge[5][1], pts.lounge[0][0], pts.lounge[0][1], glassBalustradeH, { isGlass: true }, 0.38)}
        ${archDoorWall(pts.lounge[0][0], pts.lounge[0][1], pts.lounge[1][0], pts.lounge[1][1], glassBalustradeH, { isGlass: true }, 0.38)}
        ${archDoorWall(pts.lounge[4][0], pts.lounge[4][1], pts.lounge[5][0], pts.lounge[5][1], glassBalustradeH, { isGlass: true }, 0.40)}
        ${archDoorWall(pts.lounge[1][0], pts.lounge[1][1], pts.lounge[2][0], pts.lounge[2][1], glassBalustradeH, { isGlass: true }, 0.40)}
        ${archDoorWall(pts.lounge[3][0], pts.lounge[3][1], pts.lounge[4][0], pts.lounge[4][1], 14, { isGlass: false, trimColor: "#94a3b8" }, 0.42)}
        ${archDoorWall(pts.lounge[2][0], pts.lounge[2][1], pts.lounge[3][0], pts.lounge[3][1], 14, { isGlass: false, trimColor: "#94a3b8" }, 0.42)}

        ${archWall(pts.meeting[3][0], pts.meeting[3][1], pts.meeting[2][0], pts.meeting[2][1], 20, { isGlass: true })}
        ${archWall(pts.qa[4][0], pts.qa[4][1], pts.qa[3][0], pts.qa[3][1], 20, { isGlass: true })}

        <!-- UNIFIED Y-DEPTH SORTED FURNITURE, PLANTERS & 7 EMPLOYEES -->
        <g id="depth-sorted-layer">
          <!-- 1. Manager Office -->
          ${renderBookshelf(755, 132)}
          ${renderPlanter(585, 162, 0.85, false)}
          ${renderErgonomicChair(705, 158, "#334155")}
          ${renderWorkstation(665, 182, "manager")}
          ${renderErgonomicChair(635, 205, "#78716c")}

          <!-- 2. Meeting Room -->
          ${renderErgonomicChair(360, 285, "#334155")}
          ${renderErgonomicChair(401, 270, "#334155")}
          ${renderErgonomicChair(442, 288, "#334155")}
          <g class="depth-prop" data-sort-y="314">
            ${isoBox(401, 314, 58, 29, 5.5, { top: "#d8be9c", left: "#b89c78", right: "#cbb08c" })}
            <polygon points="388,305 403,312 396,316 381,309" fill="#ffffff"/>
          </g>
          ${renderErgonomicChair(360, 338, "#334155")}
          ${renderErgonomicChair(401, 352, "#334155")}
          ${renderErgonomicChair(442, 338, "#334155")}

          <!-- 3. Garden Lounge Central Atrium -->
          <g class="depth-prop" data-sort-y="455">
            <polygon points="${isoDiamond(680, 455, 92, 58)}" fill="#e5dfd5" stroke="#cfc7ba" stroke-width="1"/>
          </g>
          ${renderPlanter(680, 378, 0.92, true)}
          ${renderPlanter(575, 455, 0.84, true)}
          ${renderPlanter(785, 455, 0.84, true)}
          <g class="depth-prop" data-sort-y="445">
            ${isoBox(635, 445, 32, 15, 11, { top: "#cbd5e1", left: "#94a3b8", right: "#b0bec5" })}
          </g>
          <g class="depth-prop" data-sort-y="465">
            ${isoBox(680, 465, 22, 12, 7, { top: "#d8be9c", left: "#b89c78", right: "#cbb08c" })}
          </g>
          <g class="depth-prop" data-sort-y="486">
            ${isoBox(725, 486, 32, 15, 11, { top: "#cbd5e1", left: "#94a3b8", right: "#b0bec5" })}
          </g>
          <g class="depth-prop" data-sort-y="524">
            ${isoBox(680, 524, 22, 11, 16, { top: "#f8fafc", left: "#cbd5e1", right: "#e2e8f0" })}
            ${isoBox(680, 511, 8, 5, 9, { top: "#334155", left: "#0f172a", right: "#1e293b" })}
          </g>

          <!-- South Courtyard Terrace Planters & Bench -->
          ${renderPlanter(610, 745, 0.85, true)}
          ${renderPlanter(750, 745, 0.85, true)}
          <g class="depth-prop" data-sort-y="756">
            ${isoBox(680, 756, 38, 16, 8, { top: "#d8be9c", left: "#b89c78", right: "#cbb08c" })}
          </g>

          <!-- 4. QA Testing Lab -->
          ${renderBookshelf(1045, 292)}
          ${renderErgonomicChair(975, 305, "#334155")}
          ${renderWorkstation(935, 328, "qa")}
          ${renderPlanter(1035, 355, 0.85, false)}

          <!-- 5. Developer Wing -->
          ${renderWorkstation(355, 578, "frontend")}
          ${renderErgonomicChair(305, 598, "#334155")}
          ${renderWorkstation(465, 622, "systems")}
          ${renderErgonomicChair(415, 642, "#334155")}
          ${renderPlanter(285, 635, 0.88, false)}

          <!-- 6. Art & Audio Studio -->
          ${renderErgonomicChair(875, 575, "#334155")}
          ${renderWorkstation(840, 598, "designer")}
          ${renderErgonomicChair(975, 628, "#334155")}
          ${renderWorkstation(940, 652, "art")}
          ${renderErgonomicChair(1065, 575, "#334155")}
          ${renderWorkstation(1030, 598, "audio")}
          ${renderPlanter(1075, 645, 0.88, false)}

          <!-- 7. Seven AI Studio Employees -->
          ${agents.map(renderAgentCharacter).join("")}
        </g>

        <!-- MINIMAL ARCHITECTURAL DEPARTMENT SIGNAGE -->
        ${renderArchSign(680, 26, "MANAGER OFFICE", "#d97706")}
        ${renderArchSign(272, 376, "MEETING ROOM", "#0d9488")}
        ${renderArchSign(680, 332, "GARDEN LOUNGE", "#447252")}
        ${renderArchSign(1086, 376, "QA TESTING", "#7c3aed")}
        ${renderArchSign(310, 712, "DEVELOPER WING", "#2563eb")}
        ${renderArchSign(1050, 712, "ART & AUDIO", "#db2777")}
        ${renderArchSign(680, 868, "SOUTH COURTYARD", "#447252")}
      </svg>
    `;

    containerEl.innerHTML = svg;
  }

  return { renderOffice, updateAgentVisuals };
})();
