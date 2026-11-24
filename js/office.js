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
    const faceStroke = isGlass ? "#38bdf8" : "#c4ae92";

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

  // Warm Ceiling Pendant Lamp with Golden Ambient Light Pool
  function renderPendantLight(x, y, cordLen = 36) {
    return `
      <g transform="translate(${x}, ${y})" pointer-events="none">
        <ellipse cx="0" cy="${cordLen + 55}" rx="56" ry="28" fill="rgba(254, 243, 199, 0.24)"/>
        <line x1="0" y1="0" x2="0" y2="${cordLen}" stroke="#475569" stroke-width="1.5"/>
        <path d="M-14,${cordLen + 10} C-14,${cordLen} 14,${cordLen} 14,${cordLen + 10} Z" fill="#d97706" stroke="#92400e" stroke-width="1"/>
        <ellipse cx="0" cy="${cordLen + 10}" rx="14" ry="4" fill="#fef08a"/>
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

  // Bookshelf & Storage Cabinet
  function renderBookshelf(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="6" rx="36" ry="17" fill="rgba(51,38,29,0.15)"/>
        ${isoBox(0, 0, 34, 17, 72, { top: "#b88456", left: "#9c6b40", right: "#c99668" })}
        <polygon points="2,-49 30,-35 30,-23 2,-37" fill="#5c3d24"/>
        <polygon points="2,-26 30,-12 30,0 2,-14" fill="#5c3d24"/>
        <polygon points="5,-38 10,-35 10,-25 5,-28" fill="#e11d48"/>
        <polygon points="11,-35 16,-32 16,-22 11,-25" fill="#2563eb"/>
        <polygon points="17,-32 22,-29 22,-19 17,-22" fill="#d97706"/>
        <polygon points="6,-15 12,-12 12,-2 6,-5" fill="#447252"/>
        <polygon points="14,-11 20,-8 20,2 14,-1" fill="#7c3aed"/>
      </g>
    `;
  }

  // Small Waste Bin & Floor Lamp Props
  function renderWasteBin(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="3" rx="7" ry="3.5" fill="rgba(51,38,29,0.18)"/>
        ${isoBox(0, 0, 6, 3.5, 11, { top: "#475569", left: "#64748b", right: "#334155" })}
      </g>
    `;
  }

  function renderFloorLamp(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="3" rx="10" ry="5" fill="#78350f"/>
        <line x1="0" y1="2" x2="0" y2="-48" stroke="#92400e" stroke-width="3"/>
        <polygon points="-12,-44 12,-44 8,-60 -8,-60" fill="#fef3c7" stroke="#d97706" stroke-width="1.2"/>
        <ellipse cx="0" cy="-35" rx="22" ry="11" fill="rgba(254, 240, 138, 0.28)"/>
      </g>
    `;
  }

  function renderLamp(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="0" rx="6" ry="3" fill="#d97706"/>
        <line x1="0" y1="0" x2="-4" y2="-16" stroke="#78350f" stroke-width="2.5"/>
        <polygon points="-10,-15 4,-19 0,-26 -8,-23" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
        <ellipse cx="-3" cy="-14" rx="13" ry="6.5" fill="rgba(254, 240, 138, 0.38)"/>
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
      // Agent 01: Executive wide monitor, organised folders & brass lamp
      rigSVG = `
        ${isoBox(-6, -26, 16, 6, 18, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <polygon points="-20,-41 8,-27 8,-14 -20,-28" fill="#fbbf24"/>
        <!-- Organised Documents & Folder -->
        <polygon points="10,-15 24,-8 16,-3 2,-10" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
        <polygon points="12,-17 26,-10 18,-5 4,-12" fill="#fef3c7" stroke="#f59e0b" stroke-width="0.8"/>
      `;
    } else if (roleType === "designer") {
      // Agent 02: Game Designer — Concept Storyboard Monitor + Level Sketchbook
      rigSVG = `
        ${isoBox(-10, -26, 14, 6, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-22,-40 2,-28 2,-16 -22,-28" fill="#38bdf8"/>
        <!-- Concept Sketchbook & Dice Token -->
        <polygon points="4,-15 22,-6 12,0 -6,-9" fill="#fffbeb" stroke="#d97706" stroke-width="0.9"/>
        <circle cx="18" cy="-14" r="3.5" fill="#ef4444"/>
      `;
    } else if (roleType === "frontend") {
      // Agent 03: Senior Frontend — Dual Ultrawide Monitors + Reference Binder
      rigSVG = `
        ${isoBox(-16, -29, 13, 5, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-27,-43 -5,-32 -5,-20 -27,-31" fill="#38bdf8"/>
        ${isoBox(8, -17, 13, 5, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-3,-31 19,-20 19,-8 -3,-19" fill="#60a5fa"/>
      `;
    } else if (roleType === "systems") {
      // Agent 04: Game Systems & AI — Dual Monitors + Node Diagram Screen + Mini Tower
      rigSVG = `
        ${isoBox(-16, -29, 13, 5, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-27,-43 -5,-32 -5,-20 -27,-31" fill="#a78bfa"/>
        ${isoBox(8, -17, 13, 5, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-3,-31 19,-20 19,-8 -3,-19" fill="#c084fc"/>
        <!-- Mini Dev Server Box -->
        ${isoBox(28, -15, 6, 4, 13, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
      `;
    } else if (roleType === "art") {
      // Agent 05: Art Director — Color-Calibrated Display + Angled Pen Tablet & Swatch Cards
      rigSVG = `
        ${isoBox(-12, -27, 14, 6, 18, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-24,-42 0,-30 0,-17 -24,-29" fill="#f472b6"/>
        <!-- Pen Display Tablet -->
        <polygon points="2,-15 22,-5 12,1 -8,-9" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
        <polygon points="4,-14 19,-6 11,-2 -4,-10" fill="#fde68a"/>
        <!-- Color Swatch Fan -->
        <polygon points="-24,-14 -14,-9 -18,-5 -28,-10" fill="#fb7185"/>
      `;
    } else if (roleType === "audio") {
      // Agent 06: Animation & Audio — Timeline Monitor + Dual Studio Speakers + MIDI Pad
      rigSVG = `
        <!-- Left & Right Studio Monitor Speakers -->
        ${isoBox(-26, -32, 6, 5, 14, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <circle cx="-22" cy="-35" r="2.5" fill="#fbbf24"/>
        ${isoBox(20, -9, 6, 5, 14, { top: "#1e293b", left: "#0f172a", right: "#334155" })}
        <circle cx="24" cy="-12" r="2.5" fill="#fbbf24"/>
        <!-- Animation Timeline Screen -->
        ${isoBox(-4, -24, 13, 6, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-15,-38 7,-27 7,-15 -15,-26" fill="#fb923c"/>
      `;
    } else if (roleType === "qa") {
      // Agent 07: QA & Child Safety — Main Test Monitor + Handheld Tablet + Mobile Phone Rig
      rigSVG = `
        ${isoBox(-14, -27, 14, 6, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-26,-41 -2,-29 -2,-17 -26,-29" fill="#4ade80"/>
        <!-- Tablet & Mobile Test Devices -->
        <polygon points="4,-15 19,-7 11,-2 -4,-10" fill="#0f172a"/>
        <polygon points="6,-14 16,-8 10,-4 0,-10" fill="#38bdf8"/>
        <polygon points="20,-8 28,-4 24,-1 16,-5" fill="#0f172a"/>
      `;
    }

    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="8" rx="46" ry="23" fill="rgba(51,38,29,0.14)"/>
        <rect x="-36" y="-12" width="4" height="22" fill="#5c4033"/>
        <rect x="32" y="-12" width="4" height="22" fill="#5c4033"/>
        <rect x="-2" y="4" width="4" height="22" fill="#473127"/>
        ${isoBox(0, -14, 44, 23, 6, { top: deskTop, left: deskLeft, right: deskRight })}
        <!-- Keyboard & Mug -->
        <polygon points="-8,-16 8,-8 2,-4 -14,-12" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/>
        <ellipse cx="24" cy="-12" rx="4" ry="2.5" fill="#ffffff" stroke="#d97706" stroke-width="1.2"/>
        ${rigSVG}
        ${renderLamp(-30, -23)}
      </g>
    `;
  }

  // Distinct Illustrated Employee Character with Hairstyles & Accessories
  function renderAgentCharacter(agent) {
    const { x, y } = agent.seatPos;
    const { skin, hair, hairStyle, shirt, pants, accent, accessory } = agent.appearance;

    let hairPath = `<path d="M-9.5,-47 C-9.5,-56 9.5,-56 9.5,-47 L9.5,-43 L-9.5,-43 Z" fill="${hair}"/>`;
    if (hairStyle === "bun") {
      hairPath += `<circle cx="-7" cy="-55" r="5" fill="${hair}"/>`;
    } else if (hairStyle === "long" || hairStyle === "bob") {
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
    }

    return `
      <g class="interactive-agent" data-agent-id="${agent.id}" transform="translate(${x}, ${y})">
        <ellipse class="selection-ring" cx="0" cy="6" rx="24" ry="12" fill="rgba(217,119,6,0.2)" stroke="#d97706" stroke-width="3"/>
        <ellipse cx="0" cy="6" rx="16" ry="8" fill="rgba(51,38,29,0.22)"/>

        <g class="agent-body-bob">
          <rect x="-7.5" y="-15" width="6.5" height="17" rx="2.5" fill="${pants}"/>
          <rect x="1" y="-15" width="6.5" height="17" rx="2.5" fill="${pants}"/>
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

        <!-- Floating Name Tag Pill -->
        <g transform="translate(0, -67)">
          <rect x="-38" y="-10" width="76" height="18" rx="9" fill="#fffdf9" stroke="#d4c2a6" stroke-width="1.2"/>
          <text x="0" y="2.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="#33261d">${agent.name.split(" ")[0]}</text>
        </g>
      </g>
    `;
  }

  function renderOffice(containerEl, agents, zones) {
    // Larger 1360x880 Isometric Floorplan for Full-Screen Presence
    const floorCx = 680;
    const floorCy = 465;
    const rx = 565;
    const ry = 295;
    const wallH = 128;

    const svg = `
      <svg class="office-svg" viewBox="0 0 1360 880" xmlns="http://www.w3.org/2000/svg">
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

        <!-- 3D Floor Slab Base -->
        <polygon points="${floorCx - rx},${floorCy} ${floorCx},${floorCy + ry} ${floorCx},${floorCy + ry + 26} ${floorCx - rx},${floorCy + 26}" fill="#b08962"/>
        <polygon points="${floorCx},${floorCy + ry} ${floorCx + rx},${floorCy} ${floorCx + rx},${floorCy + 26} ${floorCx},${floorCy + ry + 26}" fill="#8f6b47"/>

        <!-- Main Warm Wooden Floor -->
        <polygon points="${isoDiamond(floorCx, floorCy, rx, ry)}" fill="url(#woodPlanks)" stroke="#b08962" stroke-width="2.5"/>

        <!-- Back-Left & Back-Right Outer Studio Walls -->
        <polygon points="${floorCx - rx},${floorCy} ${floorCx},${floorCy - ry} ${floorCx},${floorCy - ry - wallH} ${floorCx - rx},${floorCy - wallH}" fill="url(#wallLeftGrad)" stroke="#d4c2a8" stroke-width="2"/>
        <polygon points="${floorCx},${floorCy - ry} ${floorCx + rx},${floorCy} ${floorCx + rx},${floorCy - wallH} ${floorCx},${floorCy - ry - wallH}" fill="url(#wallRightGrad)" stroke="#d4c2a8" stroke-width="2"/>

        <!-- Large Sunlit Studio Windows + Sunlight Beams -->
        <g>
          <polygon points="245,305 395,226 395,302 245,381" fill="#bae6fd" stroke="#9c7a54" stroke-width="4"/>
          <line x1="320" y1="265" x2="320" y2="341" stroke="#9c7a54" stroke-width="3"/>
          <polygon points="440,202 590,123 590,199 440,278" fill="#bae6fd" stroke="#9c7a54" stroke-width="4"/>
          <line x1="515" y1="162" x2="515" y2="238" stroke="#9c7a54" stroke-width="3"/>
          <polygon points="245,381 395,302 535,375 385,454" fill="rgba(254, 249, 195, 0.26)"/>
          <polygon points="440,278 590,199 730,272 580,351" fill="rgba(254, 249, 195, 0.24)"/>
        </g>

        <!-- Wall Clock above Corridor -->
        <g transform="translate(650, 125)">
          <ellipse cx="0" cy="0" rx="12" ry="15" fill="#fffdf9" stroke="#92400e" stroke-width="2.5"/>
          <line x1="0" y1="0" x2="0" y2="-7" stroke="#33261d" stroke-width="1.8"/>
          <line x1="0" y1="0" x2="5" y2="3" stroke="#d97706" stroke-width="1.8"/>
        </g>

        <!-- Meeting Room Presentation Screen & Whiteboard (Back-Right Wall) -->
        <g>
          <polygon points="785,152 945,236 945,302 785,218" fill="#1e293b" stroke="#64748b" stroke-width="3"/>
          <polygon points="794,163 936,238 936,291 794,216" fill="#0f172a"/>
          <polygon points="810,206 838,195 868,225 915,228" fill="none" stroke="#4ade80" stroke-width="2.5"/>
          <circle cx="915" cy="228" r="4" fill="#fbbf24"/>
        </g>

        <!-- Creative Pinboard & Color Chart (Back-Right Wall) -->
        <g>
          <polygon points="990,260 1105,320 1105,376 990,316" fill="#d97706" stroke="#92400e" stroke-width="2.5"/>
          <polygon points="1002,273 1032,289 1032,313 1002,297" fill="#fef08a"/>
          <polygon points="1044,295 1080,314 1080,340 1044,321" fill="#fbcfe8"/>
        </g>

        <!-- ================= SIX ZONE CARPETS ================= -->
        <g class="zone-hotspot" data-zone-id="manager">
          <polygon points="${isoDiamond(435, 300, 130, 70)}" fill="rgba(254, 243, 199, 0.74)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="meeting">
          <polygon points="${isoDiamond(855, 285, 145, 76)}" fill="rgba(204, 251, 241, 0.7)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="dev">
          <polygon points="${isoDiamond(580, 480, 175, 92)}" fill="rgba(219, 234, 254, 0.68)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="creative">
          <polygon points="${isoDiamond(855, 425, 175, 92)}" fill="rgba(252, 231, 243, 0.68)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="qa">
          <polygon points="${isoDiamond(685, 650, 145, 76)}" fill="rgba(220, 252, 231, 0.76)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="lounge">
          <polygon points="${isoDiamond(1065, 505, 130, 70)}" fill="rgba(243, 232, 255, 0.74)"/>
        </g>

        <!-- ================= ARCHITECTURAL INTERIOR WALLS & PARTITIONS ================= -->
        <!-- Manager Suite Back-Right Wall -->
        ${isoWallSegment(435, 230, 565, 298, 82, { wallColor: "#f7ede0", trimColor: "#d97706" })}

        <!-- Meeting Room Left Glass Wall -->
        ${isoWallSegment(855, 209, 710, 285, 82, { isGlass: true, trimColor: "#0d9488" })}

        <!-- Bookshelf & Plants -->
        ${renderBookshelf(650, 202)}
        ${renderPlant(215, 415, 1.1)}
        ${renderPlant(575, 252, 0.92)}

        <!-- Zone E: Manager Suite (Agent 01) -->
        ${renderChair(460, 278, "#d97706")}
        ${renderWorkstation(415, 308, "manager")}
        ${renderWasteBin(370, 325)}

        <!-- Manager Suite Front Glass Wall + Doorway -->
        ${isoWallSegment(305, 300, 405, 352, 66, { isGlass: true, trimColor: "#d97706" })}
        ${isoBox(408, 354, 4, 3, 70, { top: "#b45309", left: "#92400e", right: "#d97706" })}
        ${isoBox(448, 375, 4, 3, 70, { top: "#b45309", left: "#92400e", right: "#d97706" })}

        <!-- Zone C: Meeting Room Conference Table, Chairs & Documents -->
        <g class="zone-hotspot" data-zone-id="meeting">
          ${renderChair(815, 265, "#0d9488")}
          ${renderChair(895, 265, "#0d9488")}
          ${isoBox(855, 290, 70, 36, 7, { top: "#d4a373", left: "#a97c50", right: "#bc8a5f" })}
          <!-- Meeting Documents on Table -->
          <polygon points="835,278 852,287 844,292 827,283" fill="#ffffff"/>
          <polygon points="868,284 885,293 877,298 860,289" fill="#fef3c7"/>
          ${renderChair(810, 320, "#0d9488")}
          ${renderChair(895, 320, "#0d9488")}
        </g>

        <!-- Meeting Room Front Glass Wall + Double Doorway -->
        ${isoWallSegment(710, 285, 805, 335, 66, { isGlass: true, trimColor: "#0d9488" })}
        ${isoBox(808, 337, 4, 3, 70, { top: "#0f766e", left: "#115e59", right: "#0d9488" })}
        ${isoBox(872, 370, 4, 3, 70, { top: "#0f766e", left: "#115e59", right: "#0d9488" })}
        ${isoWallSegment(875, 372, 1000, 306, 66, { isGlass: true, trimColor: "#0d9488" })}

        <!-- Department Divider Wall: Main Dev Area vs. Creative Design -->
        ${isoWallSegment(675, 375, 805, 444, 38, { wallColor: "#efe2ce", trimColor: "#b08962", topColor: "#d4a373" })}
        ${renderPlant(668, 372, 0.88)}
        ${renderPlant(812, 446, 0.88)}

        <!-- Zone B: Creative Design Workstations (Agents 02, 05, 06) -->
        ${renderChair(750, 380, "#0284c7")}
        ${renderWorkstation(710, 405, "designer")}

        ${renderChair(860, 435, "#db2777")}
        ${renderWorkstation(820, 460, "art")}

        ${renderChair(970, 490, "#ea580c")}
        ${renderWorkstation(930, 515, "audio")}

        <!-- Zone A: Main Development Workstations (Agents 03 & 04) -->
        ${renderWorkstation(565, 430, "frontend")}
        ${renderChair(505, 452, "#2563eb")}
        ${renderWasteBin(595, 412)}

        ${renderWorkstation(695, 500, "systems")}
        ${renderChair(635, 522, "#7c3aed")}

        <!-- Divider Partition: Creative Design vs. Cozy Lounge -->
        ${isoWallSegment(1045, 428, 955, 476, 46, { wallColor: "#f3e8ff", trimColor: "#9333ea", topColor: "#d8b4fe" })}
        ${renderPlant(1165, 468, 1.1)}
        ${renderFloorLamp(1135, 442)}

        <!-- Zone F: Cozy Relaxation Area (Sofa, Coffee Table, Espresso & Water Station) -->
        <g class="zone-hotspot" data-zone-id="lounge">
          ${isoBox(1085, 478, 46, 22, 15, { top: "#86efac", left: "#4ade80", right: "#22c55e" })}
          ${isoBox(1104, 468, 13, 24, 28, { top: "#4ade80", left: "#16a34a", right: "#22c55e" })}
          ${isoBox(1042, 515, 26, 14, 9, { top: "#e6c7a1", left: "#b08962", right: "#c8a276" })}
          <!-- Espresso Bar -->
          ${isoBox(1120, 535, 24, 15, 24, { top: "#f8fafc", left: "#cbd5e1", right: "#e2e8f0" })}
          ${isoBox(1120, 517, 13, 9, 15, { top: "#ef4444", left: "#b91c1c", right: "#dc2626" })}
          <!-- Water Dispenser -->
          ${isoBox(1155, 512, 10, 10, 26, { top: "#f1f5f9", left: "#cbd5e1", right: "#e2e8f0" })}
          <ellipse cx="1155" cy="482" rx="7" ry="10" fill="rgba(56, 189, 248, 0.75)"/>
        </g>

        <!-- Divider Partition: Main Dev Area vs. Testing & QA Lab -->
        ${isoWallSegment(540, 650, 655, 588, 36, { wallColor: "#dcfce7", trimColor: "#447252", topColor: "#86efac" })}
        ${isoWallSegment(725, 588, 825, 640, 36, { wallColor: "#dcfce7", trimColor: "#447252", topColor: "#86efac" })}
        ${renderPlant(535, 672, 0.95)}

        <!-- Zone D: Testing & QA Workstation (Agent 07) -->
        ${renderWorkstation(745, 632, "qa")}
        ${renderChair(685, 656, "#447252")}

        <!-- ================= SEVEN AI STUDIO EMPLOYEES ================= -->
        <g id="agents-layer">
          ${agents.map(renderAgentCharacter).join("")}
        </g>

        <!-- ================= WARM PENDANT CEILING LIGHTS ================= -->
        ${renderPendantLight(435, 155, 34)}
        ${renderPendantLight(610, 300, 38)}
        ${renderPendantLight(855, 290, 36)}
        ${renderPendantLight(700, 505, 38)}

        <!-- ================= NON-OVERLAPPING ARCHITECTURAL ZONE SIGNBOARDS ================= -->
        <g pointer-events="none" font-size="10.5" font-weight="800" fill="#33261d">
          <!-- Manager Suite Sign (Upper West Edge) -->
          <rect x="278" y="242" width="112" height="19" rx="9.5" fill="rgba(255,253,249,0.95)" stroke="#f59e0b" stroke-width="1.4"/>
          <text x="334" y="255" text-anchor="middle">MANAGER SUITE</text>

          <!-- Meeting Room Sign (Upper East Glass Wall Header) -->
          <rect x="862" y="182" width="110" height="19" rx="9.5" fill="rgba(255,253,249,0.95)" stroke="#14b8a6" stroke-width="1.4"/>
          <text x="917" y="195" text-anchor="middle">MEETING ROOM</text>

          <!-- Main Dev Area Sign (South-West Floor Edge) -->
          <rect x="445" y="542" width="112" height="19" rx="9.5" fill="rgba(255,253,249,0.95)" stroke="#3b82f6" stroke-width="1.4"/>
          <text x="501" y="555" text-anchor="middle">MAIN DEV AREA</text>

          <!-- Creative Design Sign (East Corridor Edge, clear of Meeting Room & Agents) -->
          <rect x="965" y="388" width="122" height="19" rx="9.5" fill="rgba(255,253,249,0.95)" stroke="#ec4899" stroke-width="1.4"/>
          <text x="1026" y="401" text-anchor="middle">CREATIVE DESIGN</text>

          <!-- Testing & QA Sign (South Floor Edge) -->
          <rect x="630" y="722" width="108" height="19" rx="9.5" fill="rgba(255,253,249,0.95)" stroke="#22c55e" stroke-width="1.4"/>
          <text x="684" y="735" text-anchor="middle">TESTING &amp; QA</text>

          <!-- Cozy Lounge Sign (South-East Floor Edge) -->
          <rect x="1045" y="582" width="102" height="19" rx="9.5" fill="rgba(255,253,249,0.95)" stroke="#a855f7" stroke-width="1.4"/>
          <text x="1096" y="595" text-anchor="middle">COZY LOUNGE</text>
        </g>
      </svg>
    `;

    containerEl.innerHTML = svg;
  }

  return { renderOffice };
})();
