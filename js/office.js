window.Studio = window.Studio || {};

window.Studio.OfficeRenderer = (function () {
  function isoDiamond(cx, cy, rx, ry) {
    return `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;
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

  // Architectural Isometric Partition Wall
  function isoWallSegment(x1, y1, x2, y2, h, options = {}) {
    const {
      wallColor = "#f5ebd9",
      trimColor = "#b08962",
      topColor = "#fffaf0",
      isGlass = false,
      hasFrame = true
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
        <line x1="${mx}" y1="${my}" x2="${mx}" y2="${my - h}" stroke="#475569" stroke-width="2"/>
        <line x1="${x1}" y1="${y1 - h * 0.5}" x2="${x2}" y2="${y2 - h * 0.5}" stroke="rgba(71,85,105,0.42)" stroke-width="1.2"/>
      `;
    }

    const baseBoard = hasFrame
      ? `<polygon points="${x1},${y1} ${x2},${y2} ${x2},${y2 - 8} ${x1},${y1 - 8}" fill="${trimColor}"/>`
      : "";

    const topCap = `
      <polygon points="${x1},${y1 - h} ${x2},${y2 - h} ${x2 + nx},${y2 + ny - h} ${x1 + nx},${y1 + ny - h}"
        fill="${isGlass ? '#475569' : topColor}" stroke="${isGlass ? '#334155' : '#bfa688'}" stroke-width="1"/>
    `;

    return `
      <g>
        <polygon points="${x1},${y1} ${x2},${y2} ${x2 + nx * 2.2},${y2 + ny * 2.2} ${x1 + nx * 2.2},${y1 + ny * 2.2}"
          fill="rgba(51,38,29,0.12)"/>
        <polygon points="${x1},${y1} ${x2},${y2} ${x2},${y2 - h} ${x1},${y1 - h}"
          fill="${faceFill}" stroke="${faceStroke}" stroke-width="1.5"/>
        ${baseBoard}
        ${glassMullions}
        ${topCap}
      </g>
    `;
  }

  // Lush Indoor Atrium Tree
  function renderAtriumTree(x, y, scale = 1) {
    return `
      <g transform="translate(${x}, ${y}) scale(${scale})">
        <ellipse cx="0" cy="6" rx="22" ry="11" fill="rgba(51,38,29,0.18)"/>
        ${isoBox(0, 0, 16, 8, 16, { top: "#9a5b3c", left: "#c87d55", right: "#a6623e" })}
        <rect x="-3.5" y="-42" width="7" height="28" fill="#78350f"/>
        <circle cx="-12" cy="-46" r="14" fill="#3b6347"/>
        <circle cx="12" cy="-44" r="13" fill="#447252"/>
        <circle cx="0" cy="-58" r="17" fill="#5e966f"/>
        <circle cx="-5" cy="-48" r="12" fill="#4d7c5b"/>
      </g>
    `;
  }

  // Potted Indoor Plant
  function renderPlant(x, y, scale = 1) {
    return `
      <g transform="translate(${x}, ${y}) scale(${scale})">
        <ellipse cx="0" cy="4" rx="14" ry="7" fill="rgba(51,38,29,0.16)"/>
        ${isoBox(0, 0, 11, 6, 14, { top: "#9a5b3c", left: "#c87d55", right: "#a6623e" })}
        <ellipse cx="0" cy="-14" rx="9" ry="4.5" fill="#4a3525"/>
        <path d="M0,-14 C-14,-28 -18,-36 -6,-38 C-2,-30 0,-22 0,-14 Z" fill="#447252"/>
        <path d="M0,-14 C14,-28 18,-36 6,-38 C2,-30 0,-22 0,-14 Z" fill="#355940"/>
        <path d="M0,-15 C-6,-34 0,-46 4,-44 C8,-34 4,-24 0,-15 Z" fill="#5e966f"/>
        <path d="M0,-14 C-16,-18 -22,-24 -12,-28 C-6,-24 -2,-18 0,-14 Z" fill="#5e966f"/>
        <path d="M0,-14 C16,-18 22,-24 12,-28 C6,-24 2,-18 0,-14 Z" fill="#447252"/>
      </g>
    `;
  }

  // Bookshelf
  function renderBookshelf(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="6" rx="34" ry="16" fill="rgba(51,38,29,0.15)"/>
        ${isoBox(0, 0, 32, 16, 68, { top: "#b88456", left: "#9c6b40", right: "#c99668" })}
        <polygon points="2,-46 28,-33 28,-21 2,-34" fill="#5c3d24"/>
        <polygon points="2,-24 28,-11 28,1 2,-12" fill="#5c3d24"/>
        <polygon points="5,-35 10,-32 10,-22 5,-25" fill="#e11d48"/>
        <polygon points="11,-32 16,-29 16,-19 11,-22" fill="#2563eb"/>
        <polygon points="17,-29 22,-26 22,-16 17,-19" fill="#d97706"/>
        <polygon points="6,-13 12,-10 12,0 6,-3" fill="#447252"/>
        <polygon points="14,-9 20,-6 20,4 14,1" fill="#7c3aed"/>
      </g>
    `;
  }

  function renderLamp(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="0" rx="6" ry="3" fill="#d97706"/>
        <line x1="0" y1="0" x2="-4" y2="-16" stroke="#78350f" stroke-width="2.5"/>
        <polygon points="-10,-15 4,-19 0,-26 -8,-23" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
        <ellipse cx="-3" cy="-14" rx="12" ry="6" fill="rgba(254, 240, 138, 0.36)"/>
      </g>
    `;
  }

  function renderChair(x, y, color = "#475569") {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="6" rx="14" ry="7" fill="rgba(51,38,29,0.18)"/>
        <line x1="0" y1="4" x2="0" y2="-6" stroke="#334155" stroke-width="3"/>
        ${isoBox(0, -6, 13, 7, 5, { top: color, left: "#334155", right: color })}
        ${isoBox(-6, -11, 5, 8, 18, { top: color, left: "#1e293b", right: color })}
      </g>
    `;
  }

  // Seven Role-Specific Workstations
  function renderWorkstation(x, y, roleType) {
    const isManager = roleType === "manager";
    const deskTop = isManager ? "#c68b59" : "#ebd8be";
    const deskLeft = isManager ? "#9c663c" : "#cbb394";
    const deskRight = isManager ? "#b0774a" : "#dec7a8";

    let rigSVG = "";

    if (roleType === "manager") {
      rigSVG = `
        ${isoBox(-6, -26, 16, 6, 18, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-20,-41 8,-27 8,-14 -20,-28" fill="#fbbf24"/>
        <polygon points="10,-15 24,-8 16,-3 2,-10" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
        <polygon points="12,-17 26,-10 18,-5 4,-12" fill="#fef3c7" stroke="#f59e0b" stroke-width="0.8"/>
      `;
    } else if (roleType === "designer") {
      rigSVG = `
        ${isoBox(-10, -26, 14, 6, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-22,-40 2,-28 2,-16 -22,-28" fill="#38bdf8"/>
        <polygon points="4,-15 22,-6 12,0 -6,-9" fill="#fffbeb" stroke="#d97706" stroke-width="0.9"/>
        <circle cx="18" cy="-14" r="3.8" fill="#ef4444"/>
        <circle cx="12" cy="-16" r="2.8" fill="#facc15"/>
      `;
    } else if (roleType === "frontend") {
      rigSVG = `
        ${isoBox(-16, -29, 13, 5, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-27,-43 -5,-32 -5,-20 -27,-31" fill="#38bdf8"/>
        ${isoBox(8, -17, 13, 5, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-3,-31 19,-20 19,-8 -3,-19" fill="#60a5fa"/>
      `;
    } else if (roleType === "systems") {
      rigSVG = `
        ${isoBox(-16, -29, 13, 5, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-27,-43 -5,-32 -5,-20 -27,-31" fill="#a78bfa"/>
        ${isoBox(8, -17, 13, 5, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-3,-31 19,-20 19,-8 -3,-19" fill="#c084fc"/>
        ${isoBox(28, -15, 6, 4, 14, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
      `;
    } else if (roleType === "art") {
      rigSVG = `
        ${isoBox(-12, -27, 14, 6, 18, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-24,-42 0,-30 0,-17 -24,-29" fill="#f472b6"/>
        <polygon points="2,-15 22,-5 12,1 -8,-9" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
        <polygon points="4,-14 19,-6 11,-2 -4,-10" fill="#fde68a"/>
        <polygon points="-24,-14 -14,-9 -18,-5 -28,-10" fill="#fb7185"/>
      `;
    } else if (roleType === "audio") {
      // Abang — Sound Engineer & Audio Studio Rig (Dual Speakers, Mixer Pad & Waveform Monitor)
      rigSVG = `
        ${isoBox(-26, -32, 6, 5, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <circle cx="-22" cy="-35" r="2.8" fill="#fbbf24"/>
        ${isoBox(20, -9, 6, 5, 15, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <circle cx="24" cy="-12" r="2.8" fill="#fbbf24"/>
        ${isoBox(-4, -24, 13, 6, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-15,-38 7,-27 7,-15 -15,-26" fill="#fb923c"/>
        <polygon points="4,-12 16,-6 10,-2 -2,-8" fill="#1e293b"/>
      `;
    } else if (roleType === "qa") {
      // Sofea — QA & Child Safety Multi-Device Rig
      rigSVG = `
        ${isoBox(-14, -27, 14, 6, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-26,-41 -2,-29 -2,-17 -26,-29" fill="#4ade80"/>
        <polygon points="4,-15 19,-7 11,-2 -4,-10" fill="#0f172a"/>
        <polygon points="6,-14 16,-8 10,-4 0,-10" fill="#38bdf8"/>
        <polygon points="20,-8 28,-4 24,-1 16,-5" fill="#0f172a"/>
      `;
    }

    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="8" rx="45" ry="22" fill="rgba(51,38,29,0.14)"/>
        <rect x="-35" y="-12" width="4" height="22" fill="#5c4033"/>
        <rect x="31" y="-12" width="4" height="22" fill="#5c4033"/>
        <rect x="-2" y="4" width="4" height="22" fill="#473127"/>
        ${isoBox(0, -14, 43, 22, 6, { top: deskTop, left: deskLeft, right: deskRight })}
        <polygon points="-8,-16 8,-8 2,-4 -14,-12" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/>
        <ellipse cx="23" cy="-12" rx="4" ry="2.5" fill="#ffffff" stroke="#d97706" stroke-width="1.2"/>
        ${rigSVG}
        ${renderLamp(-29, -22)}
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
      <g class="interactive-agent" data-agent-id="${agent.id}" transform="translate(${x}, ${y})">
        <ellipse class="selection-ring" cx="0" cy="6" rx="24" ry="12" fill="rgba(217,119,6,0.2)" stroke="#d97706" stroke-width="3"/>
        <ellipse cx="0" cy="6" rx="16" ry="8" fill="rgba(51,38,29,0.22)"/>

        <g class="agent-body-bob">
          <rect x="-7.5" y="-15" width="6.5" height="14" rx="2" fill="${pants}"/>
          <rect x="1" y="-15" width="6.5" height="14" rx="2" fill="${pants}"/>
          <rect x="-8.5" y="-2" width="8" height="4" rx="2" fill="${shoes || '#1e293b'}"/>
          <rect x="0.5" y="-2" width="8" height="4" rx="2" fill="${shoes || '#1e293b'}"/>
          <rect x="-10.5" y="-33" width="21" height="20" rx="5.5" fill="${shirt}" stroke="rgba(0,0,0,0.18)" stroke-width="1"/>
          <polygon points="-4.5,-33 4.5,-33 0,-26.5" fill="${accent}"/>
          <rect x="-14" y="-31" width="4" height="14.5" rx="2" fill="${skin}"/>
          <rect x="10" y="-31" width="4" height="14.5" rx="2" fill="${skin}"/>
          <circle cx="0" cy="-44" r="10.5" fill="${skin}" stroke="rgba(0,0,0,0.14)" stroke-width="1"/>
          <circle cx="-3.8" cy="-42.5" r="1.3" fill="#1e293b"/>
          <circle cx="3.8" cy="-42.5" r="1.3" fill="#1e293b"/>
          <path d="M-2.5,-39 Q0,-37 2.5,-39" fill="none" stroke="#7c2d12" stroke-width="1.2" stroke-linecap="round"/>
          ${hairPath}
          ${accessorySVG}
        </g>

        <g transform="translate(0, -67)">
          <rect x="-36" y="-10" width="72" height="18" rx="9" fill="#fffdf9" stroke="#d4c2a6" stroke-width="1.2"/>
          <text x="0" y="2.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="#33261d">${agent.name}</text>
        </g>
      </g>
    `;
  }

  function renderOffice(containerEl, agents, zones) {
    // Choice 3: Spacious U-Shaped Garden Atrium Floorplan
    const wallH = 115;

    const svg = `
      <svg class="office-svg" viewBox="60 55 1240 770" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="woodPlanks" width="52" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(-27)">
            <rect width="52" height="26" fill="#dfb98e"/>
            <rect x="0" y="0" width="52" height="12" fill="#e7c69e"/>
            <line x1="0" y1="13" x2="52" y2="13" stroke="#c59c6e" stroke-width="1"/>
            <line x1="26" y1="0" x2="26" y2="13" stroke="#c59c6e" stroke-width="1"/>
            <line x1="12" y1="13" x2="12" y2="26" stroke="#c59c6e" stroke-width="1"/>
          </pattern>

          <linearGradient id="wallLeftGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fdf8ef"/>
            <stop offset="100%" stop-color="#efe3d0"/>
          </linearGradient>
          <linearGradient id="wallRightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f7efe2"/>
            <stop offset="100%" stop-color="#e5d5bc"/>
          </linearGradient>
        </defs>

        <!-- ================= U-SHAPED FLOOR SLAB & WOODEN DECK ================= -->
        <!-- Outer U-Shaped Floor Polygon with Central Courtyard Indent -->
        <polygon points="680,145 1235,435 880,620 755,555 680,595 605,555 480,620 125,435"
          fill="url(#woodPlanks)" stroke="#b08962" stroke-width="2.5"/>

        <!-- South-West Developer Wing Extension -->
        <polygon points="480,620 680,515 680,725 480,825 260,710 260,505"
          fill="url(#woodPlanks)" stroke="#b08962" stroke-width="2.5"/>

        <!-- South-East Art & Audio Wing Extension -->
        <polygon points="880,620 680,515 680,725 880,825 1100,710 1100,505"
          fill="url(#woodPlanks)" stroke="#b08962" stroke-width="2.5"/>

        <!-- 3D Floor Slab Base Edges -->
        <polygon points="125,435 260,505 260,527 125,457" fill="#b08962"/>
        <polygon points="260,710 480,825 480,847 260,732" fill="#b08962"/>
        <polygon points="480,825 680,725 680,747 480,847" fill="#8f6b47"/>
        <polygon points="680,725 880,825 880,847 680,747" fill="#b08962"/>
        <polygon points="880,825 1100,710 1100,732 880,847" fill="#8f6b47"/>
        <polygon points="1100,505 1235,435 1235,457 1100,527" fill="#8f6b47"/>

        <!-- ================= BACK PERIMETER STUDIO WALLS ================= -->
        <!-- North-West Wall -->
        <polygon points="125,435 680,145 680,${145 - wallH} 125,${435 - wallH}"
          fill="url(#wallLeftGrad)" stroke="#d4c2a8" stroke-width="2"/>
        <!-- North-East Wall -->
        <polygon points="680,145 1235,435 1235,${435 - wallH} 680,${145 - wallH}"
          fill="url(#wallRightGrad)" stroke="#d4c2a8" stroke-width="2"/>

        <!-- Large Panoramic Windows Along Back Walls -->
        <g>
          <polygon points="390,260 540,182 540,255 390,333" fill="#bae6fd" stroke="#9c7a54" stroke-width="4"/>
          <line x1="465" y1="221" x2="465" y2="294" stroke="#9c7a54" stroke-width="3"/>
          <polygon points="780,175 935,256 935,328 780,247" fill="#bae6fd" stroke="#9c7a54" stroke-width="4"/>
          <line x1="857" y1="215" x2="857" y2="287" stroke="#9c7a54" stroke-width="3"/>
          <polygon points="975,277 1110,348 1110,418 975,347" fill="#bae6fd" stroke="#9c7a54" stroke-width="4"/>
          <line x1="1042" y1="312" x2="1042" y2="382" stroke="#9c7a54" stroke-width="3"/>
        </g>

        <!-- Meeting Room Presentation Screen & Pinboard (West Wall) -->
        <g>
          <polygon points="185,365 320,295 320,355 185,425" fill="#1e293b" stroke="#64748b" stroke-width="3"/>
          <polygon points="193,373 312,311 312,347 193,409" fill="#0f172a"/>
          <polygon points="210,392 238,372 268,365 298,332" fill="none" stroke="#4ade80" stroke-width="2.5"/>
          <circle cx="298" cy="332" r="3.5" fill="#fbbf24"/>
        </g>

        <!-- ================= SIX DISTINCT ZONE FLOOR CARPETS ================= -->
        <!-- 1. North-West: Manager Office (Izmi) -->
        <g class="zone-hotspot" data-zone-id="manager">
          <polygon points="${isoDiamond(475, 270, 125, 66)}" fill="rgba(254, 243, 199, 0.78)"/>
        </g>

        <!-- 2. West Wing: Meeting Room -->
        <g class="zone-hotspot" data-zone-id="meeting">
          <polygon points="${isoDiamond(275, 425, 130, 68)}" fill="rgba(204, 251, 241, 0.74)"/>
        </g>

        <!-- 3. Center Atrium: Garden & Cozy Lounge -->
        <g class="zone-hotspot" data-zone-id="lounge">
          <polygon points="${isoDiamond(680, 395, 175, 92)}" fill="rgba(220, 252, 231, 0.74)" stroke="#86efac" stroke-width="1.5"/>
        </g>

        <!-- 4. North-East Wing: QA & Child Safety Lab (Sofea) -->
        <g class="zone-hotspot" data-zone-id="qa">
          <polygon points="${isoDiamond(1055, 415, 130, 68)}" fill="rgba(243, 232, 255, 0.76)"/>
        </g>

        <!-- 5. South-West Wing: Developer Wing (Isaac & Hayyan) -->
        <g class="zone-hotspot" data-zone-id="dev">
          <polygon points="${isoDiamond(465, 625, 165, 86)}" fill="rgba(219, 234, 254, 0.74)"/>
        </g>

        <!-- 6. South-East Wing: Art & Audio Studio (Izzy, Anis, Abang) -->
        <g class="zone-hotspot" data-zone-id="creative">
          <polygon points="${isoDiamond(895, 625, 175, 92)}" fill="rgba(252, 231, 243, 0.74)"/>
        </g>

        <!-- ================= GLASS PARTITIONS & ROOM WALLS ================= -->
        <!-- Manager Suite Glass Enclosure (With Atrium Doorway) -->
        ${isoWallSegment(350, 270, 445, 320, 68, { isGlass: true, trimColor: "#d97706" })}
        ${isoWallSegment(505, 320, 600, 270, 68, { isGlass: true, trimColor: "#d97706" })}

        <!-- Meeting Room Partition from Developer Wing -->
        ${isoWallSegment(260, 505, 395, 435, 58, { isGlass: true, trimColor: "#0d9488" })}

        <!-- Developer Wing Glass Partition Facing Central Garden Atrium -->
        ${isoWallSegment(415, 515, 515, 462, 54, { isGlass: true, trimColor: "#2563eb" })}
        ${isoWallSegment(565, 488, 665, 540, 54, { isGlass: true, trimColor: "#2563eb" })}

        <!-- Art & Audio Wing Acoustic Wall Facing Central Garden Atrium -->
        ${isoWallSegment(945, 515, 845, 462, 54, { wallColor: "#fdf2f8", trimColor: "#db2777", topColor: "#fbcfe8" })}
        ${isoWallSegment(795, 488, 695, 540, 54, { wallColor: "#fdf2f8", trimColor: "#db2777", topColor: "#fbcfe8" })}

        <!-- QA Wing Glass Partition -->
        ${isoWallSegment(925, 415, 1020, 465, 58, { isGlass: true, trimColor: "#7c3aed" })}

        <!-- ================= FURNITURE & PROPS ================= -->
        <!-- 1. Manager Suite (Izmi) -->
        ${renderBookshelf(565, 225)}
        ${renderChair(485, 250, "#d97706")}
        ${renderWorkstation(445, 280, "manager")}
        ${renderPlant(375, 275, 0.92)}

        <!-- 2. Meeting Room Conference Table & 6 Chairs -->
        <g class="zone-hotspot" data-zone-id="meeting">
          ${renderChair(235, 395, "#0d9488")}
          ${renderChair(275, 378, "#0d9488")}
          ${renderChair(315, 400, "#0d9488")}
          ${isoBox(275, 425, 68, 35, 7, { top: "#d4a373", left: "#a97c50", right: "#bc8a5f" })}
          <polygon points="258,414 275,423 267,428 250,419" fill="#ffffff"/>
          ${renderChair(235, 450, "#0d9488")}
          ${renderChair(275, 466, "#0d9488")}
          ${renderChair(315, 450, "#0d9488")}
        </g>

        <!-- 3. Central Garden & Cozy Lounge Atrium -->
        <g class="zone-hotspot" data-zone-id="lounge">
          ${renderAtriumTree(680, 315, 1.05)}
          ${renderAtriumTree(575, 390, 0.92)}
          ${renderAtriumTree(785, 390, 0.92)}

          <!-- Plush Pastel Lounge Sofas -->
          ${isoBox(635, 385, 36, 17, 13, { top: "#fbcfe8", left: "#f472b6", right: "#ec4899" })}
          ${isoBox(622, 376, 10, 19, 24, { top: "#f472b6", left: "#db2777", right: "#ec4899" })}

          ${isoBox(725, 425, 36, 17, 13, { top: "#bae6fd", left: "#38bdf8", right: "#0284c7" })}
          ${isoBox(738, 434, 10, 19, 24, { top: "#38bdf8", left: "#0369a1", right: "#0284c7" })}

          <!-- Coffee Table & Espresso Bar -->
          ${isoBox(680, 412, 24, 13, 8, { top: "#e6c7a1", left: "#b08962", right: "#c8a276" })}
          ${isoBox(680, 355, 26, 14, 22, { top: "#f8fafc", left: "#cbd5e1", right: "#e2e8f0" })}
          ${isoBox(680, 338, 12, 8, 14, { top: "#ef4444", left: "#b91c1c", right: "#dc2626" })}
        </g>

        <!-- 4. QA & Child Safety Wing (Sofea) -->
        ${renderBookshelf(1125, 385)}
        ${renderChair(1075, 395, "#447252")}
        ${renderWorkstation(1030, 422, "qa")}
        ${renderPlant(1155, 445, 0.95)}

        <!-- 5. Developer Wing (Isaac & Hayyan) -->
        ${renderWorkstation(425, 540, "frontend")}
        ${renderChair(365, 562, "#2563eb")}

        ${renderWorkstation(565, 615, "systems")}
        ${renderChair(505, 637, "#7c3aed")}
        ${renderPlant(305, 685, 1.0)}

        <!-- 6. Art & Audio Studio Wing (Izzy, Anis, Abang) -->
        ${renderChair(780, 560, "#0284c7")}
        ${renderWorkstation(740, 588, "designer")}

        ${renderChair(910, 630, "#db2777")}
        ${renderWorkstation(870, 658, "art")}

        ${renderChair(1035, 560, "#ea580c")}
        ${renderWorkstation(995, 588, "audio")}
        ${renderPlant(1070, 685, 1.0)}

        <!-- ================= SEVEN AI STUDIO EMPLOYEES ================= -->
        <g id="agents-layer">
          ${agents.map(renderAgentCharacter).join("")}
        </g>

        <!-- ================= EXTERIOR NON-OVERLAPPING ZONE PLAQUES ================= -->
        <g pointer-events="none" font-size="10.5" font-weight="800" fill="#33261d">
          <!-- Manager Suite (North-West Apex) -->
          <rect x="415" y="162" width="122" height="20" rx="10" fill="rgba(255,253,249,0.96)" stroke="#f59e0b" stroke-width="1.5"/>
          <text x="476" y="175.5" text-anchor="middle">MANAGER OFFICE</text>

          <!-- Meeting Room (West Outer Edge) -->
          <rect x="145" y="472" width="114" height="20" rx="10" fill="rgba(255,253,249,0.96)" stroke="#14b8a6" stroke-width="1.5"/>
          <text x="202" y="485.5" text-anchor="middle">MEETING ROOM</text>

          <!-- Garden Lounge Atrium (Top Center Atrium Header) -->
          <rect x="622" y="255" width="116" height="20" rx="10" fill="rgba(255,253,249,0.96)" stroke="#22c55e" stroke-width="1.5"/>
          <text x="680" y="268.5" text-anchor="middle">GARDEN LOUNGE</text>

          <!-- QA Testing Lab (East Outer Edge) -->
          <rect x="1115" y="472" width="106" height="20" rx="10" fill="rgba(255,253,249,0.96)" stroke="#7c3aed" stroke-width="1.5"/>
          <text x="1168" y="485.5" text-anchor="middle">QA TESTING</text>

          <!-- Developer Wing (South-West Outer Edge) -->
          <rect x="315" y="758" width="124" height="20" rx="10" fill="rgba(255,253,249,0.96)" stroke="#3b82f6" stroke-width="1.5"/>
          <text x="377" y="771.5" text-anchor="middle">DEVELOPER WING</text>

          <!-- Art & Audio Studio (South-East Outer Edge) -->
          <rect x="920" y="758" width="116" height="20" rx="10" fill="rgba(255,253,249,0.96)" stroke="#ec4899" stroke-width="1.5"/>
          <text x="978" y="771.5" text-anchor="middle">ART &amp; AUDIO</text>
        </g>
      </svg>
    `;

    containerEl.innerHTML = svg;
  }

  return { renderOffice };
})();
