window.Studio = window.Studio || {};

window.Studio.OfficeRenderer = (function () {
  // Matematik Heksagon Isometrik (Nisbah 2:1 supaya setiap sisi selari dengan grid isometrik)
  // Setiap heksagon mempunyai jejari melintang RX dan jejari menegak RY
  function hexPoints(cx, cy, rx, ry) {
    const hw = rx * 0.5;
    return [
      [cx, cy - ry],        // 0: Bucu Atas (N)
      [cx + rx, cy - ry * 0.5], // 1: Bucu Kanan Atas (NE)
      [cx + rx, cy + ry * 0.5], // 2: Bucu Kanan Bawah (SE)
      [cx, cy + ry],        // 3: Bucu Bawah (S)
      [cx - rx, cy + ry * 0.5], // 4: Bucu Kiri Bawah (SW)
      [cx - rx, cy - ry * 0.5]  // 5: Bucu Kiri Atas (NW)
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
      <polygon points="${left}" fill="${colors.left}" stroke="${colors.stroke || 'rgba(51,38,29,0.22)'}" stroke-width="1"/>
      <polygon points="${right}" fill="${colors.right}" stroke="${colors.stroke || 'rgba(51,38,29,0.22)'}" stroke-width="1"/>
      <polygon points="${top}" fill="${colors.top}" stroke="${colors.stroke || 'rgba(51,38,29,0.22)'}" stroke-width="1"/>
    `;
  }

  // Segmen dinding lurus antara dua titik (x1,y1) -> (x2,y2) dengan ketinggian h
  function isoWallSegment(x1, y1, x2, y2, h, options = {}) {
    const {
      wallColor = "#f5ebd9",
      trimColor = "#9c7a54",
      topColor = "#fffaf0",
      isGlass = false
    } = options;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * 4.5;
    const ny = (dx / len) * 2.4;

    const faceFill = isGlass ? "rgba(186, 230, 253, 0.34)" : wallColor;
    const faceStroke = isGlass ? "#0284c7" : "#c4ae92";

    let glassMullions = "";
    if (isGlass) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      glassMullions = `
        <line x1="${mx}" y1="${my}" x2="${mx}" y2="${my - h}" stroke="#475569" stroke-width="1.8"/>
        <line x1="${x1}" y1="${y1 - h * 0.52}" x2="${x2}" y2="${y2 - h * 0.52}" stroke="rgba(71,85,105,0.35)" stroke-width="1.2"/>
      `;
    }

    const floorPlinth = `
      <polygon points="${x1},${y1} ${x2},${y2} ${x2},${y2 - 9} ${x1},${y1 - 9}" fill="${trimColor}"/>
    `;

    const topCap = `
      <polygon points="${x1},${y1 - h} ${x2},${y2 - h} ${x2 + nx},${y2 + ny - h} ${x1 + nx},${y1 + ny - h}"
        fill="${isGlass ? '#475569' : topColor}" stroke="${isGlass ? '#334155' : '#bfa688'}" stroke-width="1"/>
    `;

    return `
      <g>
        <polygon points="${x1},${y1} ${x2},${y2} ${x2},${y2 - h} ${x1},${y1 - h}"
          fill="${faceFill}" stroke="${faceStroke}" stroke-width="1.4"/>
        ${floorPlinth}
        ${glassMullions}
        ${topCap}
        ${isoBox(x1, y1, 3.2, 2.0, h + 2, { top: trimColor, left: "#5c4033", right: trimColor })}
        ${isoBox(x2, y2, 3.2, 2.0, h + 2, { top: trimColor, left: "#5c4033", right: trimColor })}
      </g>
    `;
  }

  // Bina dinding pemisah antara dua titik dengan ruang pintu laluan di tengah (gapRatio = 0.34)
  function wallWithDoorway(p1, p2, h, options = {}, gapRatio = 0.34) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    const t1 = (1 - gapRatio) * 0.5;
    const t2 = 1 - t1;

    const dx1 = x1 + (x2 - x1) * t1;
    const dy1 = y1 + (y2 - y1) * t1;
    const dx2 = x1 + (x2 - x1) * t2;
    const dy2 = y1 + (y2 - y1) * t2;

    // Ambang pintu kayu di lantai supaya jelas laluan masuk
    const threshold = `
      <line x1="${dx1}" y1="${dy1}" x2="${dx2}" y2="${dy2}" stroke="#d97706" stroke-width="3.5" stroke-dasharray="6,3" opacity="0.75"/>
    `;

    return `
      ${threshold}
      ${isoWallSegment(x1, y1, dx1, dy1, h, options)}
      ${isoWallSegment(dx2, dy2, x2, y2, h, options)}
    `;
  }

  function renderAtriumTree(x, y, scale = 1) {
    return `
      <g transform="translate(${x}, ${y}) scale(${scale})">
        <ellipse cx="0" cy="5" rx="20" ry="10" fill="rgba(51,38,29,0.18)"/>
        ${isoBox(0, 0, 15, 8, 13, { top: "#9a5b3c", left: "#c87d55", right: "#a6623e" })}
        <ellipse cx="0" cy="-13" rx="12" ry="6" fill="#4a3525"/>
        <rect x="-3" y="-38" width="6" height="26" fill="#78350f"/>
        <circle cx="-11" cy="-42" r="12" fill="#3b6347"/>
        <circle cx="11" cy="-40" r="11" fill="#447252"/>
        <circle cx="0" cy="-52" r="15" fill="#5e966f"/>
        <circle cx="-4" cy="-44" r="10" fill="#4d7c5b"/>
      </g>
    `;
  }

  function renderPlant(x, y, scale = 1) {
    return `
      <g transform="translate(${x}, ${y}) scale(${scale})">
        <ellipse cx="0" cy="3" rx="12" ry="6" fill="rgba(51,38,29,0.16)"/>
        ${isoBox(0, 0, 9, 5, 12, { top: "#9a5b3c", left: "#c87d55", right: "#a6623e" })}
        <ellipse cx="0" cy="-12" rx="7.5" ry="4" fill="#4a3525"/>
        <path d="M0,-12 C-12,-24 -15,-31 -5,-33 C-2,-26 0,-19 0,-12 Z" fill="#447252"/>
        <path d="M0,-12 C12,-24 15,-31 5,-33 C2,-26 0,-19 0,-12 Z" fill="#355940"/>
        <path d="M0,-13 C-5,-29 0,-39 3.5,-38 C7,-29 3.5,-20 0,-13 Z" fill="#5e966f"/>
      </g>
    `;
  }

  function renderWaterFeature(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="4" rx="25" ry="12.5" fill="rgba(51,38,29,0.16)"/>
        <ellipse cx="0" cy="0" rx="23" ry="11.5" fill="#94a3b8" stroke="#64748b" stroke-width="1.5"/>
        <ellipse cx="0" cy="-2" rx="18" ry="9" fill="#38bdf8"/>
        <ellipse cx="0" cy="-2" rx="12" ry="5.5" fill="none" stroke="#bae6fd" stroke-width="1.2"/>
        ${isoBox(0, -3, 5, 3, 10, { top: "#cbd5e1", left: "#64748b", right: "#94a3b8" })}
        <path d="M0,-14 C-6,-12 -8,-6 -9,-2" fill="none" stroke="#e0f2fe" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M0,-14 C6,-12 8,-6 9,-2" fill="none" stroke="#e0f2fe" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="0" cy="-15" r="2.2" fill="#e0f2fe"/>
      </g>
    `;
  }

  function renderBookshelf(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="5" rx="26" ry="13" fill="rgba(51,38,29,0.15)"/>
        ${isoBox(0, 0, 24, 12, 54, { top: "#b88456", left: "#9c6b40", right: "#c99668" })}
        <polygon points="2,-36 21,-26 21,-17 2,-27" fill="#5c3d24"/>
        <polygon points="2,-19 21,-9 21,0 2,-10" fill="#5c3d24"/>
        <polygon points="4,-28 8,-26 8,-18 4,-20" fill="#e11d48"/>
        <polygon points="9,-25 13,-23 13,-15 9,-17" fill="#2563eb"/>
        <polygon points="14,-23 18,-21 18,-13 14,-15" fill="#d97706"/>
        <polygon points="5,-11 10,-8 10,0 5,-3" fill="#447252"/>
        <polygon points="11,-8 16,-5 16,3 11,0" fill="#7c3aed"/>
      </g>
    `;
  }

  function renderLamp(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="0" rx="5" ry="2.5" fill="#d97706"/>
        <line x1="0" y1="0" x2="-3" y2="-14" stroke="#78350f" stroke-width="2.2"/>
        <polygon points="-8,-13 3,-16 0,-22 -7,-20" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
        <ellipse cx="-2" cy="-12" rx="10" ry="5" fill="rgba(254, 240, 138, 0.35)"/>
      </g>
    `;
  }

  function renderChair(x, y, color = "#475569") {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="5" rx="12" ry="6" fill="rgba(51,38,29,0.18)"/>
        <line x1="0" y1="3" x2="0" y2="-5" stroke="#334155" stroke-width="2.5"/>
        ${isoBox(0, -5, 11, 6, 4.5, { top: color, left: "#334155", right: color })}
        ${isoBox(-5, -9, 4.5, 7, 15, { top: color, left: "#1e293b", right: color })}
      </g>
    `;
  }

  function renderWorkstation(x, y, roleType) {
    const isManager = roleType === "manager";
    const deskTop = isManager ? "#c68b59" : "#ebd8be";
    const deskLeft = isManager ? "#9c663c" : "#cbb394";
    const deskRight = isManager ? "#b0774a" : "#dec7a8";

    let rigSVG = "";
    if (roleType === "manager") {
      rigSVG = `
        ${isoBox(-5, -22, 14, 5, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-17,-35 7,-23 7,-12 -17,-24" fill="#fbbf24"/>
        <polygon points="8,-13 20,-7 13,-2 1,-8" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
      `;
    } else if (roleType === "designer") {
      rigSVG = `
        ${isoBox(-8, -22, 12, 5, 15, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-18,-34 2,-24 2,-14 -18,-24" fill="#38bdf8"/>
        <polygon points="3,-13 19,-5 10,0 -6,-8" fill="#fffbeb" stroke="#d97706" stroke-width="0.9"/>
      `;
    } else if (roleType === "frontend") {
      rigSVG = `
        ${isoBox(-13, -24, 11, 4.5, 15, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-22,-36 -4,-27 -4,-17 -22,-26" fill="#38bdf8"/>
        ${isoBox(7, -14, 11, 4.5, 15, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-2,-26 16,-17 16,-7 -2,-16" fill="#60a5fa"/>
      `;
    } else if (roleType === "systems") {
      rigSVG = `
        ${isoBox(-13, -24, 11, 4.5, 15, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-22,-36 -4,-27 -4,-17 -22,-26" fill="#a78bfa"/>
        ${isoBox(7, -14, 11, 4.5, 15, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-2,-26 16,-17 16,-7 -2,-16" fill="#c084fc"/>
      `;
    } else if (roleType === "art") {
      rigSVG = `
        ${isoBox(-10, -23, 12, 5, 15, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-20,-36 0,-26 0,-15 -20,-25" fill="#f472b6"/>
        <polygon points="2,-13 19,-4 10,1 -7,-8" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
        <polygon points="4,-12 16,-5 9,-2 -3,-9" fill="#fde68a"/>
      `;
    } else if (roleType === "audio") {
      rigSVG = `
        ${isoBox(-21, -27, 5, 4, 13, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <circle cx="-18" cy="-30" r="2.4" fill="#fbbf24"/>
        ${isoBox(17, -8, 5, 4, 13, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <circle cx="20" cy="-10" r="2.4" fill="#fbbf24"/>
        ${isoBox(-3, -20, 11, 5, 15, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-12,-32 6,-23 6,-13 -12,-22" fill="#fb923c"/>
      `;
    } else if (roleType === "qa") {
      rigSVG = `
        ${isoBox(-13, -24, 11, 4.5, 15, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-22,-36 -4,-27 -4,-17 -22,-26" fill="#4ade80"/>
        ${isoBox(5, -15, 9, 4.5, 13, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-2,-25 13,-18 13,-9 -2,-16" fill="#a3e635"/>
      `;
    }

    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="7" rx="38" ry="18" fill="rgba(51,38,29,0.14)"/>
        <rect x="-29" y="-10" width="3.5" height="19" fill="#5c4033"/>
        <rect x="25" y="-10" width="3.5" height="19" fill="#5c4033"/>
        ${isoBox(0, -12, 36, 18, 5.5, { top: deskTop, left: deskLeft, right: deskRight })}
        <ellipse cx="19" cy="-10" rx="3.5" ry="2" fill="#ffffff" stroke="#d97706" stroke-width="1"/>
        ${rigSVG}
        ${renderLamp(-24, -18)}
      </g>
    `;
  }

  function renderAgentCharacter(agent) {
    const { x, y } = agent.seatPos;
    const { skin, hair, hairStyle, shirt, pants, shoes, accent, accessory } = agent.appearance;

    let hairPath = `<path d="M-9.5,-47 C-9.5,-56 9.5,-56 9.5,-47 L9.5,-43 L-9.5,-43 Z" fill="${hair}"/>`;
    if (hairStyle === "long") {
      hairPath += `<path d="M-10.5,-47 L-10.5,-33 L-5.5,-33 L-5.5,-43 L5.5,-43 L5.5,-33 L10.5,-33 L10.5,-47 Z" fill="${hair}"/>`;
    } else if (hairStyle === "ponytail") {
      hairPath += `<circle cx="10.5" cy="-48" r="4.8" fill="${hair}"/>`;
    } else if (hairStyle === "spiky" || hairStyle === "curly") {
      hairPath = `<path d="M-10.5,-46 L-8,-55 L-3,-52 L0,-57 L4,-52 L9,-55 L10.5,-46 Z" fill="${hair}"/>`;
    }

    let accessorySVG = "";
    if (accessory === "glasses") {
      accessorySVG = `
        <rect x="-7" y="-44.5" width="5.5" height="4" rx="1" fill="none" stroke="#1e293b" stroke-width="1.1"/>
        <rect x="1.5" y="-44.5" width="5.5" height="4" rx="1" fill="none" stroke="#1e293b" stroke-width="1.1"/>
        <line x1="-1.5" y1="-42.5" x2="1.5" y2="-42.5" stroke="#1e293b" stroke-width="1.1"/>
      `;
    } else if (accessory === "headphones") {
      accessorySVG = `
        <path d="M-11,-44 C-11,-56 11,-56 11,-44" fill="none" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="-13" y="-47" width="4" height="7" rx="2" fill="#ea580c"/>
        <rect x="9" y="-47" width="4" height="7" rx="2" fill="#ea580c"/>
      `;
    } else if (accessory === "beret") {
      accessorySVG = `<ellipse cx="-2" cy="-53" rx="10" ry="4" transform="rotate(-12 -2 -53)" fill="#be185d"/>`;
    } else if (accessory === "lanyard") {
      accessorySVG = `<line x1="-3" y1="-32" x2="0" y2="-22" stroke="#facc15" stroke-width="1.5"/><rect x="-2" y="-23" width="4" height="5" rx="1" fill="#ffffff"/>`;
    }

    return `
      <g class="interactive-agent is-working" data-agent-id="${agent.id}" transform="translate(${x}, ${y})">
        <ellipse class="selection-ring" cx="0" cy="6" rx="22" ry="11" fill="rgba(217,119,6,0.2)" stroke="#d97706" stroke-width="3"/>
        <ellipse cx="0" cy="6" rx="15" ry="7.5" fill="rgba(51,38,29,0.22)"/>

        <g class="agent-body-bob">
          <g class="leg-left">
            <rect x="-7.5" y="-15" width="6.5" height="14" rx="2" fill="${pants}"/>
            <rect x="-8.5" y="-2" width="8" height="4" rx="2" fill="${shoes || '#1e293b'}"/>
          </g>
          <g class="leg-right">
            <rect x="1" y="-15" width="6.5" height="14" rx="2" fill="${pants}"/>
            <rect x="0.5" y="-2" width="8" height="4" rx="2" fill="${shoes || '#1e293b'}"/>
          </g>

          <rect x="-10.5" y="-33" width="21" height="20" rx="5.5" fill="${shirt}" stroke="rgba(0,0,0,0.18)" stroke-width="1"/>
          <polygon points="-4.5,-33 4.5,-33 0,-26.5" fill="${accent}"/>

          <rect class="arm-left" x="-14" y="-31" width="4" height="14.5" rx="2" fill="${skin}"/>
          <rect class="arm-right" x="10" y="-31" width="4" height="14.5" rx="2" fill="${skin}"/>

          <circle cx="0" cy="-44" r="10.5" fill="${skin}" stroke="rgba(0,0,0,0.14)" stroke-width="1"/>
          <circle cx="-3.8" cy="-42.5" r="1.3" fill="#1e293b"/>
          <circle cx="3.8" cy="-42.5" r="1.3" fill="#1e293b"/>
          <path d="M-2.5,-39 Q0,-37 2.5,-39" fill="none" stroke="#7c2d12" stroke-width="1.2" stroke-linecap="round"/>
          ${hairPath}
          ${accessorySVG}
        </g>

        <g transform="translate(0, -64)">
          <rect x="-34" y="-9" width="68" height="16" rx="8" fill="#fffdf9" stroke="#d4c2a6" stroke-width="1.2"/>
          <text x="0" y="2" text-anchor="middle" font-size="9" font-weight="800" fill="#33261d">${agent.name}</text>
          <text class="agent-state-sub" x="0" y="-13" text-anchor="middle" font-size="8" font-weight="800" fill="#447252">WORKING</text>
        </g>

        <g class="agent-speech-bubble" transform="translate(0, -96)" opacity="0">
          <rect class="bubble-bg" x="-72" y="-14" width="144" height="22" rx="11" fill="#fffdf9" stroke="#d97706" stroke-width="1.4"/>
          <polygon points="-4,8 4,8 0,13" fill="#fffdf9" stroke="#d97706" stroke-width="1.2"/>
          <text class="bubble-text" x="0" y="0" text-anchor="middle" font-size="9" font-weight="700" fill="#33261d"></text>
        </g>
      </g>
    `;
  }

  let lastSortKey = "";
  const agentDomCache = {};

  function updateAgentVisuals(agentStates, meetingInfo) {
    const layer = document.getElementById("agents-layer");
    if (!layer) return;

    const screenPulse = document.getElementById("meeting-screen-active");
    if (screenPulse) {
      screenPulse.setAttribute("opacity", meetingInfo && meetingInfo.active ? "1" : "0");
    }

    const sorted = [...agentStates].sort((a, b) => a.y - b.y);
    const sortKey = sorted.map((s) => s.id).join(",");
    const orderChanged = sortKey !== lastSortKey;

    sorted.forEach((st) => {
      let cached = agentDomCache[st.id];
      if (!cached || !cached.el.isConnected) {
        const el = layer.querySelector(`.interactive-agent[data-agent-id="${st.id}"]`);
        if (!el) return;
        cached = agentDomCache[st.id] = {
          el,
          subLabel: el.querySelector(".agent-state-sub"),
          bubble: el.querySelector(".agent-speech-bubble"),
          bubbleText: el.querySelector(".bubble-text"),
          bubbleBg: el.querySelector(".bubble-bg")
        };
      }
      const { el, subLabel, bubble, bubbleText, bubbleBg } = cached;

      el.setAttribute("transform", `translate(${st.x.toFixed(1)}, ${st.y.toFixed(1)})`);

      const isMoving = st.state === "WALKING" || st.state === "RETURNING_TO_DESK" || st.state === "PEER_REVIEW";
      const isWorking = st.state === "WORKING";
      el.classList.toggle("is-walking", isMoving);
      el.classList.toggle("is-working", isWorking);

      if (subLabel) {
        const labelMap = {
          WORKING: "WORKING",
          THINKING: "THINKING...",
          IDLE: "IDLE",
          WALKING: "WALKING",
          RETURNING_TO_DESK: "RETURNING",
          USING_LOUNGE: "LOUNGE BREAK",
          PEER_REVIEW: "PEER SYNC",
          IN_MEETING: "STAND-UP"
        };
        subLabel.textContent = labelMap[st.state] || st.state;
        subLabel.setAttribute(
          "fill",
          isMoving ? "#0284c7" : st.state === "IN_MEETING" ? "#0d9488" : st.state === "USING_LOUNGE" ? "#9333ea" : st.state === "THINKING" ? "#d97706" : "#447252"
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

      if (orderChanged) {
        layer.appendChild(el);
      }
    });

    if (orderChanged) {
      lastSortKey = sortKey;
    }
  }

  function renderOffice(containerEl, agents, zones) {
    lastSortKey = "";
    Object.keys(agentDomCache).forEach((k) => delete agentDomCache[k]);

    // Geometri Sarang Lebah (Honeycomb):
    // Setiap sel heksagon mempunyai RX = 186, RY = 148.
    // Pusat Atrium Tengah = (680, 460)
    // Jarak pusat-ke-pusat jiran menegak = 2 * RY = 296
    // Jarak pusat-ke-pusat jiran pepenjuru = DX = 1.5 * RX = 279, DY = 1.5 * RY = 222
    const RX = 186;
    const RY = 148;
    const CELLS = {
      lounge:   { cx: 680, cy: 460, fill: "rgba(220, 252, 231, 0.85)", stroke: "#22c55e" }, // Tengah
      manager:  { cx: 680, cy: 164, fill: "rgba(254, 243, 199, 0.88)", stroke: "#d97706" }, // Utara (Atas)
      meeting:  { cx: 401, cy: 312, fill: "rgba(204, 251, 241, 0.88)", stroke: "#0d9488" }, // Barat Laut (Kiri Atas)
      dev:      { cx: 401, cy: 608, fill: "rgba(219, 234, 254, 0.88)", stroke: "#2563eb" }, // Barat Daya (Kiri Bawah)
      creative: { cx: 959, cy: 608, fill: "rgba(252, 231, 243, 0.88)", stroke: "#db2777" }, // Tenggara (Kanan Bawah)
      qa:       { cx: 959, cy: 312, fill: "rgba(243, 232, 255, 0.88)", stroke: "#7c3aed" }  // Timur Laut (Kanan Atas)
    };

    const pts = {};
    Object.keys(CELLS).forEach((k) => {
      pts[k] = hexPoints(CELLS[k].cx, CELLS[k].cy, RX, RY);
    });

    const outerWallH = 74;
    const innerWallH = 52;

    const svg = `
      <svg class="office-svg" viewBox="140 -25 1080 860" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="honeycombShadow" x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#33261d" flood-opacity="0.22"/>
          </filter>
          <pattern id="woodPlanks" width="48" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-27)">
            <rect width="48" height="24" fill="#dfb98e"/>
            <rect x="0" y="0" width="48" height="11" fill="#e7c69e"/>
            <line x1="0" y1="12" x2="48" y2="12" stroke="#c59c6e" stroke-width="1"/>
            <line x1="24" y1="0" x2="24" y2="12" stroke="#c59c6e" stroke-width="1"/>
          </pattern>
        </defs>

        <!-- LANTAI SARANG LEBAH (6 SEL HEKSAGON BERCANTUM RAPAT) -->
        <g filter="url(#honeycombShadow)">
          ${Object.entries(CELLS).map(([zoneId, cell]) => {
            const poly = hexPolygonStr(cell.cx, cell.cy, RX, RY);
            const p = pts[zoneId];
            // Tebal tapak 3D bawah setiap sel heksagon (sisi SE, S, SW)
            return `
              <g class="zone-hotspot" data-zone-id="${zoneId}">
                <polygon points="${p[2][0]},${p[2][1]} ${p[3][0]},${p[3][1]} ${p[3][0]},${p[3][1] + 18} ${p[2][0]},${p[2][1] + 18}" fill="#8f6b47"/>
                <polygon points="${p[3][0]},${p[3][1]} ${p[4][0]},${p[4][1]} ${p[4][0]},${p[4][1] + 18} ${p[3][0]},${p[3][1] + 18}" fill="#b08962"/>
                <polygon points="${poly}" fill="url(#woodPlanks)" stroke="#9c7a54" stroke-width="2.5"/>
                <polygon points="${poly}" fill="${cell.fill}" stroke="${cell.stroke}" stroke-width="2"/>
              </g>
            `;
          }).join("")}
        </g>

        <!-- DINDING LUAR BILIK ATAS (SUPAYA TINGKAP & PAPAN SKRIN TERLETAK KEMAS DI DALAM DINDING) -->
        <!-- Dinding Belakang Manager Office (Utara) -->
        ${isoWallSegment(pts.manager[5][0], pts.manager[5][1], pts.manager[0][0], pts.manager[0][1], outerWallH, { trimColor: "#d97706" })}
        ${isoWallSegment(pts.manager[0][0], pts.manager[0][1], pts.manager[1][0], pts.manager[1][1], outerWallH, { trimColor: "#d97706" })}
        <!-- Tingkap Manager Office (Muat kemas di dalam dinding kiri atas) -->
        <polygon points="545,95 635,50 635,92 545,137" fill="#bae6fd" stroke="#9c7a54" stroke-width="3"/>
        <line x1="590" y1="72" x2="590" y2="114" stroke="#9c7a54" stroke-width="2"/>

        <!-- Dinding Belakang Meeting Room (Barat Laut) -->
        ${isoWallSegment(pts.meeting[5][0], pts.meeting[5][1], pts.meeting[0][0], pts.meeting[0][1], outerWallH, { trimColor: "#0d9488" })}
        ${isoWallSegment(pts.meeting[0][0], pts.meeting[0][1], pts.meeting[1][0], pts.meeting[1][1], outerWallH, { trimColor: "#0d9488" })}
        <!-- Skrin Pembentangan Meeting Room (100% di dalam dinding kiri atas bilik) -->
        <polygon points="260,242 355,194 355,236 260,284" fill="#1e293b" stroke="#64748b" stroke-width="2.5"/>
        <polygon points="267,247 348,206 348,231 267,272" fill="#0f172a"/>
        <polyline points="278,260 302,244 322,240 340,218" fill="none" stroke="#4ade80" stroke-width="2"/>
        <g id="meeting-screen-active" opacity="0">
          <circle cx="275" cy="252" r="3.5" fill="#22c55e"/>
          <polygon points="284,247 335,221 335,228 284,254" fill="#38bdf8"/>
        </g>

        <!-- Dinding Belakang QA Testing (Timur Laut) -->
        ${isoWallSegment(pts.qa[5][0], pts.qa[5][1], pts.qa[0][0], pts.qa[0][1], outerWallH, { trimColor: "#7c3aed" })}
        ${isoWallSegment(pts.qa[0][0], pts.qa[0][1], pts.qa[1][0], pts.qa[1][1], outerWallH, { trimColor: "#7c3aed" })}
        <!-- Papan Checklist QA (100% di dalam dinding kanan atas bilik) -->
        <polygon points="1005,194 1100,242 1100,284 1005,236" fill="#ffffff" stroke="#7c3aed" stroke-width="2.5"/>
        <line x1="1018" y1="212" x2="1085" y2="245" stroke="#22c55e" stroke-width="2"/>
        <line x1="1018" y1="224" x2="1075" y2="252" stroke="#64748b" stroke-width="1.8"/>

        <!-- Dinding Belakang Developer Wing & Art Studio -->
        ${isoWallSegment(pts.dev[5][0], pts.dev[5][1], pts.dev[0][0], pts.dev[0][1], innerWallH, { isGlass: true, trimColor: "#2563eb" })}
        ${isoWallSegment(pts.creative[0][0], pts.creative[0][1], pts.creative[1][0], pts.creative[1][1], innerWallH, { wallColor: "#fdf2f8", trimColor: "#db2777", topColor: "#fbcfe8" })}

        <!-- DINDING PEMISAH ANTARA JABATAN DENGAN PINTU LALUAN (SEMPADAN HEKSAGON) -->
        <!-- 1. Sempadan Manager Office <-> Garden Lounge -->
        ${wallWithDoorway(pts.lounge[5], pts.lounge[0], innerWallH, { isGlass: true, trimColor: "#d97706" }, 0.36)}
        ${wallWithDoorway(pts.lounge[0], pts.lounge[1], innerWallH, { isGlass: true, trimColor: "#d97706" }, 0.36)}

        <!-- 2. Sempadan Meeting Room <-> Garden Lounge -->
        ${wallWithDoorway(pts.lounge[4], pts.lounge[5], innerWallH, { isGlass: true, trimColor: "#0d9488" }, 0.38)}

        <!-- 3. Sempadan QA Testing <-> Garden Lounge -->
        ${wallWithDoorway(pts.lounge[1], pts.lounge[2], innerWallH, { isGlass: true, trimColor: "#7c3aed" }, 0.38)}

        <!-- 4. Sempadan Developer Wing <-> Garden Lounge -->
        ${wallWithDoorway(pts.lounge[3], pts.lounge[4], innerWallH, { isGlass: true, trimColor: "#2563eb" }, 0.38)}

        <!-- 5. Sempadan Art & Audio <-> Garden Lounge -->
        ${wallWithDoorway(pts.lounge[2], pts.lounge[3], innerWallH, { wallColor: "#fdf2f8", trimColor: "#db2777", topColor: "#fbcfe8" }, 0.38)}

        <!-- 6. Dinding Pemisah Penuh Meeting Room <-> Developer Wing (Tiada pintu terus, mesti lalu Atrium) -->
        ${isoWallSegment(pts.meeting[3][0], pts.meeting[3][1], pts.meeting[2][0], pts.meeting[2][1], innerWallH, { trimColor: "#0d9488" })}

        <!-- 7. Dinding Pemisah Penuh QA Testing <-> Art & Audio (Tiada pintu terus, mesti lalu Atrium) -->
        ${isoWallSegment(pts.qa[4][0], pts.qa[4][1], pts.qa[3][0], pts.qa[3][1], innerWallH, { trimColor: "#7c3aed" })}

        <!-- PERABOT SETIAP BILIK (SEMUA TERLETAK DI DALAM SEMPADAN HEKSAGON) -->
        <!-- 1. Manager Office (Pusat: 680, 164) -->
        ${renderBookshelf(755, 132)}
        ${renderPlant(585, 162, 0.85)}
        ${renderChair(705, 158, "#d97706")}
        ${renderWorkstation(665, 182, "manager")}

        <!-- 2. Meeting Room (Pusat: 401, 312) -->
        ${renderChair(360, 285, "#0d9488")}
        ${renderChair(401, 270, "#0d9488")}
        ${renderChair(442, 288, "#0d9488")}
        ${isoBox(401, 314, 56, 28, 6, { top: "#d4a373", left: "#a97c50", right: "#bc8a5f" })}
        <polygon points="388,305 403,312 396,316 381,309" fill="#ffffff"/>
        ${renderChair(360, 338, "#0d9488")}
        ${renderChair(401, 352, "#0d9488")}
        ${renderChair(442, 338, "#0d9488")}

        <!-- 3. Garden & Cozy Lounge Atrium (Pusat: 680, 460) -->
        ${renderAtriumTree(680, 378, 0.92)}
        ${renderAtriumTree(575, 455, 0.82)}
        ${renderAtriumTree(785, 455, 0.82)}
        ${renderWaterFeature(680, 420)}
        ${isoBox(635, 466, 30, 14, 11, { top: "#fbcfe8", left: "#f472b6", right: "#ec4899" })}
        ${isoBox(725, 492, 30, 14, 11, { top: "#bae6fd", left: "#38bdf8", right: "#0284c7" })}
        ${isoBox(680, 526, 20, 11, 16, { top: "#f8fafc", left: "#cbd5e1", right: "#e2e8f0" })}
        ${isoBox(680, 513, 9, 6, 10, { top: "#ef4444", left: "#b91c1c", right: "#dc2626" })}

        <!-- 4. QA & Child Safety Lab (Pusat: 959, 312) -->
        ${renderBookshelf(1045, 292)}
        ${renderChair(975, 305, "#447252")}
        ${renderWorkstation(935, 328, "qa")}
        ${renderPlant(1035, 355, 0.85)}

        <!-- 5. Developer Wing (Pusat: 401, 608) -->
        ${renderWorkstation(355, 578, "frontend")}
        ${renderChair(305, 598, "#2563eb")}
        ${renderWorkstation(465, 622, "systems")}
        ${renderChair(415, 642, "#7c3aed")}
        ${renderPlant(285, 635, 0.88)}

        <!-- 6. Art & Audio Studio (Pusat: 959, 608) -->
        ${renderChair(875, 575, "#0284c7")}
        ${renderWorkstation(840, 598, "designer")}
        ${renderChair(975, 628, "#db2777")}
        ${renderWorkstation(940, 652, "art")}
        ${renderChair(1065, 575, "#ea580c")}
        ${renderWorkstation(1030, 598, "audio")}
        ${renderPlant(1075, 645, 0.88)}

        <!-- TUJUH PEKERJA STUDIO AI -->
        <g id="agents-layer">
          ${agents.map(renderAgentCharacter).join("")}
        </g>

        <!-- LABEL NAMA BILIK HEKSAGON (TERLETAK KEMAS DI LUAR KAWASAN LALUAN) -->
        <g pointer-events="none" font-size="10" font-weight="800" fill="#33261d">
          <rect x="619" y="18" width="122" height="19" rx="9.5" fill="rgba(255,253,249,0.96)" stroke="#d97706" stroke-width="1.5"/>
          <text x="680" y="30.5" text-anchor="middle">MANAGER OFFICE</text>

          <rect x="215" y="378" width="112" height="19" rx="9.5" fill="rgba(255,253,249,0.96)" stroke="#0d9488" stroke-width="1.5"/>
          <text x="271" y="390.5" text-anchor="middle">MEETING ROOM</text>

          <rect x="622" y="328" width="116" height="19" rx="9.5" fill="rgba(255,253,249,0.96)" stroke="#22c55e" stroke-width="1.5"/>
          <text x="680" y="340.5" text-anchor="middle">GARDEN LOUNGE</text>

          <rect x="1035" y="378" width="104" height="19" rx="9.5" fill="rgba(255,253,249,0.96)" stroke="#7c3aed" stroke-width="1.5"/>
          <text x="1087" y="390.5" text-anchor="middle">QA TESTING</text>

          <rect x="339" y="758" width="124" height="19" rx="9.5" fill="rgba(255,253,249,0.96)" stroke="#2563eb" stroke-width="1.5"/>
          <text x="401" y="770.5" text-anchor="middle">DEVELOPER WING</text>

          <rect x="901" y="758" width="116" height="19" rx="9.5" fill="rgba(255,253,249,0.96)" stroke="#db2777" stroke-width="1.5"/>
          <text x="959" y="770.5" text-anchor="middle">ART &amp; AUDIO</text>
        </g>
      </svg>
    `;

    containerEl.innerHTML = svg;
  }

  return { renderOffice, updateAgentVisuals };
})();
