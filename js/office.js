window.Studio = window.Studio || {};

window.Studio.OfficeRenderer = (function () {
  // Helper to build isometric diamond polygon points
  function isoDiamond(cx, cy, rx, ry) {
    return `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;
  }

  // Helper to build an isometric 3D box (top, left, right faces)
  function isoBox(cx, cy, rx, ry, h, colors) {
    const top = `${cx},${cy - ry - h} ${cx + rx},${cy - h} ${cx},${cy + ry - h} ${cx - rx},${cy - h}`;
    const left = `${cx - rx},${cy - h} ${cx},${cy + ry - h} ${cx},${cy + ry} ${cx - rx},${cy}`;
    const right = `${cx},${cy + ry - h} ${cx + rx},${cy - h} ${cx + rx},${cy} ${cx},${cy + ry}`;
    return `
      <polygon points="${left}" fill="${colors.left}" stroke="${colors.stroke || 'rgba(54,41,32,0.22)'}" stroke-width="1"/>
      <polygon points="${right}" fill="${colors.right}" stroke="${colors.stroke || 'rgba(54,41,32,0.22)'}" stroke-width="1"/>
      <polygon points="${top}" fill="${colors.top}" stroke="${colors.stroke || 'rgba(54,41,32,0.22)'}" stroke-width="1"/>
    `;
  }

  // Isometric Interior Wall Segment from (x1, y1) to (x2, y2) with height h and thickness t
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
    // Perpendicular offset for wall thickness (~6px)
    const nx = (-dy / len) * 4;
    const ny = (dx / len) * 2.2;

    const faceFill = isGlass ? "rgba(186, 230, 253, 0.34)" : wallColor;
    const faceStroke = isGlass ? "#38bdf8" : "#c8b296";

    let glassMullions = "";
    if (isGlass) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      glassMullions = `
        <line x1="${mx}" y1="${my}" x2="${mx}" y2="${my - h}" stroke="#64748b" stroke-width="2"/>
        <line x1="${x1}" y1="${y1 - h * 0.5}" x2="${x2}" y2="${y2 - h * 0.5}" stroke="rgba(100,116,139,0.45)" stroke-width="1.2"/>
      `;
    }

    const baseBoard = hasFrame
      ? `<polygon points="${x1},${y1} ${x2},${y2} ${x2},${y2 - 8} ${x1},${y1 - 8}" fill="${trimColor}"/>`
      : "";

    const topCap = `
      <polygon points="${x1},${y1 - h} ${x2},${y2 - h} ${x2 + nx},${y2 + ny - h} ${x1 + nx},${y1 + ny - h}"
        fill="${isGlass ? '#64748b' : topColor}" stroke="${isGlass ? '#475569' : '#bfa688'}" stroke-width="1"/>
    `;

    return `
      <g>
        <!-- Floor Shadow -->
        <polygon points="${x1},${y1} ${x2},${y2} ${x2 + nx * 2.2},${y2 + ny * 2.2} ${x1 + nx * 2.2},${y1 + ny * 2.2}"
          fill="rgba(54,41,32,0.12)"/>
        <!-- Main Wall Face -->
        <polygon points="${x1},${y1} ${x2},${y2} ${x2},${y2 - h} ${x1},${y1 - h}"
          fill="${faceFill}" stroke="${faceStroke}" stroke-width="1.5"/>
        ${baseBoard}
        ${glassMullions}
        ${topCap}
      </g>
    `;
  }

  // Potted Indoor Plant in Isometric View
  function renderPlant(x, y, scale = 1) {
    return `
      <g transform="translate(${x}, ${y}) scale(${scale})">
        <ellipse cx="0" cy="4" rx="14" ry="7" fill="rgba(54,41,32,0.16)"/>
        ${isoBox(0, 0, 11, 6, 14, { top: "#9a5b3c", left: "#c87d55", right: "#a6623e" })}
        <ellipse cx="0" cy="-14" rx="9" ry="4.5" fill="#4a3525"/>
        <path d="M0,-14 C-14,-28 -18,-36 -6,-38 C-2,-30 0,-22 0,-14 Z" fill="#4d7c5b"/>
        <path d="M0,-14 C14,-28 18,-36 6,-38 C2,-30 0,-22 0,-14 Z" fill="#3b6347"/>
        <path d="M0,-15 C-6,-34 0,-46 4,-44 C8,-34 4,-24 0,-15 Z" fill="#639a73"/>
        <path d="M0,-14 C-16,-18 -22,-24 -12,-28 C-6,-24 -2,-18 0,-14 Z" fill="#639a73"/>
        <path d="M0,-14 C16,-18 22,-24 12,-28 C6,-24 2,-18 0,-14 Z" fill="#4d7c5b"/>
      </g>
    `;
  }

  // Isometric Bookshelf
  function renderBookshelf(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="6" rx="34" ry="16" fill="rgba(54,41,32,0.14)"/>
        ${isoBox(0, 0, 32, 16, 68, { top: "#b88456", left: "#9c6b40", right: "#c99668" })}
        <polygon points="2,-46 28,-33 28,-21 2,-34" fill="#5c3d24"/>
        <polygon points="2,-24 28,-11 28,1 2,-12" fill="#5c3d24"/>
        <polygon points="5,-35 10,-32 10,-22 5,-25" fill="#e11d48"/>
        <polygon points="11,-32 16,-29 16,-19 11,-22" fill="#2563eb"/>
        <polygon points="17,-29 22,-26 22,-16 17,-19" fill="#d97706"/>
        <polygon points="6,-13 12,-10 12,0 6,-3" fill="#4d7c5b"/>
        <polygon points="14,-9 20,-6 20,4 14,1" fill="#7c3aed"/>
      </g>
    `;
  }

  // Warm Desk Lamp
  function renderLamp(x, y) {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="0" rx="6" ry="3" fill="#d97706"/>
        <line x1="0" y1="0" x2="-4" y2="-16" stroke="#78350f" stroke-width="2.5"/>
        <polygon points="-10,-15 4,-19 0,-26 -8,-23" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
        <ellipse cx="-3" cy="-14" rx="12" ry="6" fill="rgba(254, 240, 138, 0.35)"/>
      </g>
    `;
  }

  // Ergonomic Office Chair
  function renderChair(x, y, color = "#475569") {
    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="6" rx="14" ry="7" fill="rgba(54,41,32,0.18)"/>
        <line x1="0" y1="4" x2="0" y2="-6" stroke="#334155" stroke-width="3"/>
        ${isoBox(0, -6, 13, 7, 5, { top: color, left: "#334155", right: color })}
        ${isoBox(-6, -11, 5, 8, 18, { top: color, left: "#1e293b", right: color })}
      </g>
    `;
  }

  // Workstation Desk with Monitors & Accessories
  function renderWorkstation(x, y, options = {}) {
    const {
      dualMonitor = false,
      isArtDesk = false,
      isQADesk = false,
      isManager = false
    } = options;

    const deskTop = isManager ? "#c68b59" : "#ebd8be";
    const deskLeft = isManager ? "#9c663c" : "#cbb394";
    const deskRight = isManager ? "#b0774a" : "#dec7a8";

    let monitorsSVG = "";
    if (dualMonitor) {
      monitorsSVG = `
        ${isoBox(-14, -28, 12, 5, 16, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-24,-41 -4,-31 -4,-20 -24,-30" fill="#38bdf8"/>
        ${isoBox(10, -16, 12, 5, 16, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="0,-29 20,-19 20,-8 0,-18" fill="#818cf8"/>
      `;
    } else if (isArtDesk) {
      monitorsSVG = `
        ${isoBox(-8, -26, 13, 6, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-19,-40 3,-29 3,-17 -19,-28" fill="#f472b6"/>
        <polygon points="4,-14 22,-5 12,1 -6,-8" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
        <polygon points="6,-13 19,-6 11,-2 -2,-9" fill="#fde68a"/>
      `;
    } else if (isQADesk) {
      monitorsSVG = `
        ${isoBox(-12, -26, 13, 6, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-23,-40 -1,-29 -1,-17 -23,-28" fill="#4ade80"/>
        <polygon points="6,-15 20,-8 12,-3 -2,-10" fill="#0f172a"/>
        <polygon points="8,-14 17,-9 11,-5 2,-10" fill="#38bdf8"/>
      `;
    } else {
      monitorsSVG = `
        ${isoBox(-4, -24, 14, 6, 17, { top: "#334155", left: "#1e293b", right: "#0f172a" })}
        <polygon points="-16,-38 8,-26 8,-14 -16,-26" fill="#fbbf24"/>
      `;
    }

    return `
      <g transform="translate(${x}, ${y})">
        <ellipse cx="0" cy="8" rx="44" ry="22" fill="rgba(54,41,32,0.14)"/>
        <rect x="-34" y="-12" width="4" height="22" fill="#5c4033"/>
        <rect x="30" y="-12" width="4" height="22" fill="#5c4033"/>
        <rect x="-2" y="4" width="4" height="22" fill="#473127"/>
        ${isoBox(0, -14, 42, 22, 6, { top: deskTop, left: deskLeft, right: deskRight })}
        <polygon points="-8,-16 8,-8 2,-4 -14,-12" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/>
        <ellipse cx="22" cy="-12" rx="4" ry="2.5" fill="#ffffff" stroke="#d97706" stroke-width="1.2"/>
        ${monitorsSVG}
        ${renderLamp(-28, -22)}
      </g>
    `;
  }

  // Illustrated Isometric Employee Character
  function renderAgentCharacter(agent) {
    const { x, y } = agent.seatPos;
    const { skin, hair, hairStyle, shirt, pants, accent } = agent.appearance;

    let hairPath = `<path d="M-9,-46 C-9,-55 9,-55 9,-46 L9,-42 L-9,-42 Z" fill="${hair}"/>`;
    if (hairStyle === "bun") {
      hairPath += `<circle cx="-7" cy="-54" r="5" fill="${hair}"/>`;
    } else if (hairStyle === "long" || hairStyle === "bob") {
      hairPath += `<path d="M-10,-46 L-10,-33 L-5,-33 L-5,-42 L5,-42 L5,-33 L10,-33 L10,-46 Z" fill="${hair}"/>`;
    } else if (hairStyle === "ponytail") {
      hairPath += `<circle cx="10" cy="-47" r="4.5" fill="${hair}"/>`;
    } else if (hairStyle === "spiky" || hairStyle === "curly") {
      hairPath = `<path d="M-10,-45 L-8,-54 L-3,-51 L0,-56 L4,-51 L9,-54 L10,-45 Z" fill="${hair}"/>`;
    }

    return `
      <g class="interactive-agent" data-agent-id="${agent.id}" transform="translate(${x}, ${y})">
        <ellipse class="selection-ring" cx="0" cy="6" rx="22" ry="11" fill="rgba(217,119,6,0.18)" stroke="#d97706" stroke-width="3"/>
        <ellipse cx="0" cy="6" rx="15" ry="7.5" fill="rgba(54,41,32,0.22)"/>

        <g class="agent-body-bob">
          <rect x="-7" y="-14" width="6" height="16" rx="2" fill="${pants}"/>
          <rect x="1" y="-14" width="6" height="16" rx="2" fill="${pants}"/>
          <rect x="-10" y="-32" width="20" height="20" rx="5" fill="${shirt}" stroke="rgba(0,0,0,0.18)" stroke-width="1"/>
          <polygon points="-4,-32 4,-32 0,-26" fill="${accent}"/>
          <rect x="-13" y="-30" width="4" height="14" rx="2" fill="${skin}"/>
          <rect x="9" y="-30" width="4" height="14" rx="2" fill="${skin}"/>
          <circle cx="0" cy="-43" r="10" fill="${skin}" stroke="rgba(0,0,0,0.14)" stroke-width="1"/>
          <circle cx="-3.5" cy="-42" r="1.3" fill="#1e293b"/>
          <circle cx="3.5" cy="-42" r="1.3" fill="#1e293b"/>
          <path d="M-2.5,-38.5 Q0,-36.5 2.5,-38.5" fill="none" stroke="#7c2d12" stroke-width="1.2" stroke-linecap="round"/>
          ${hairPath}
        </g>

        <g transform="translate(0, -64)">
          <rect x="-36" y="-10" width="72" height="18" rx="9" fill="#fffdf9" stroke="#d8c8b0" stroke-width="1.2"/>
          <text x="0" y="2.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="#362920">${agent.name.split(" ")[0]}</text>
        </g>
      </g>
    `;
  }

  function renderOffice(containerEl, agents, zones) {
    const floorCx = 630;
    const floorCy = 430;
    const rx = 510;
    const ry = 265;
    const wallH = 118;

    const svg = `
      <svg class="office-svg" viewBox="0 0 1260 820" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="woodPlanks" width="48" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-27)">
            <rect width="48" height="24" fill="#dfbe96"/>
            <rect x="0" y="0" width="48" height="11" fill="#e6c7a1"/>
            <line x1="0" y1="12" x2="48" y2="12" stroke="#c8a276" stroke-width="1"/>
            <line x1="24" y1="0" x2="24" y2="12" stroke="#c8a276" stroke-width="1"/>
            <line x1="10" y1="12" x2="10" y2="24" stroke="#c8a276" stroke-width="1"/>
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

        <!-- Floor Slab Thickness -->
        <polygon points="${floorCx - rx},${floorCy} ${floorCx},${floorCy + ry} ${floorCx},${floorCy + ry + 24} ${floorCx - rx},${floorCy + 24}" fill="#b08962"/>
        <polygon points="${floorCx},${floorCy + ry} ${floorCx + rx},${floorCy} ${floorCx + rx},${floorCy + 24} ${floorCx},${floorCy + ry + 24}" fill="#8f6b47"/>

        <!-- Main Warm Wooden Floor -->
        <polygon points="${isoDiamond(floorCx, floorCy, rx, ry)}" fill="url(#woodPlanks)" stroke="#b08962" stroke-width="2.5"/>

        <!-- Back-Left & Back-Right Outer Studio Walls -->
        <polygon points="${floorCx - rx},${floorCy} ${floorCx},${floorCy - ry} ${floorCx},${floorCy - ry - wallH} ${floorCx - rx},${floorCy - wallH}" fill="url(#wallLeftGrad)" stroke="#d4c2a8" stroke-width="2"/>
        <polygon points="${floorCx},${floorCy - ry} ${floorCx + rx},${floorCy} ${floorCx + rx},${floorCy - wallH} ${floorCx},${floorCy - ry - wallH}" fill="url(#wallRightGrad)" stroke="#d4c2a8" stroke-width="2"/>

        <!-- Large Sunlit Studio Windows on Back-Left Wall -->
        <g>
          <polygon points="235,285 375,212 375,282 235,355" fill="#bae6fd" stroke="#9c7a54" stroke-width="4"/>
          <line x1="305" y1="248" x2="305" y2="318" stroke="#9c7a54" stroke-width="3"/>
          <polygon points="415,191 555,118 555,188 415,261" fill="#bae6fd" stroke="#9c7a54" stroke-width="4"/>
          <line x1="485" y1="154" x2="485" y2="224" stroke="#9c7a54" stroke-width="3"/>
          <polygon points="235,355 375,282 505,350 365,422" fill="rgba(254, 249, 195, 0.25)"/>
          <polygon points="415,261 555,188 685,256 545,328" fill="rgba(254, 249, 195, 0.22)"/>
        </g>

        <!-- Wall Decor: Presentation Screen in Meeting Room -->
        <g>
          <polygon points="730,145 875,220 875,282 730,207" fill="#1e293b" stroke="#64748b" stroke-width="3"/>
          <polygon points="738,155 867,222 867,272 738,205" fill="#0f172a"/>
          <polygon points="752,195 778,185 805,212 848,215" fill="none" stroke="#4ade80" stroke-width="2.5"/>
          <circle cx="848" cy="215" r="3.5" fill="#fbbf24"/>
        </g>

        <!-- Creative Pinboard on Back-Right Wall -->
        <g>
          <polygon points="915,242 1015,294 1015,346 915,294" fill="#d97706" stroke="#92400e" stroke-width="2.5"/>
          <polygon points="925,254 952,268 952,290 925,276" fill="#fef08a"/>
          <polygon points="962,273 995,290 995,314 962,297" fill="#fbcfe8"/>
        </g>

        <!-- ================= ZONE CARPETS ================= -->
        <g class="zone-hotspot" data-zone-id="manager">
          <polygon points="${isoDiamond(420, 275, 115, 62)}" fill="rgba(254, 243, 199, 0.72)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="meeting">
          <polygon points="${isoDiamond(790, 265, 130, 68)}" fill="rgba(204, 251, 241, 0.68)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="dev">
          <polygon points="${isoDiamond(585, 435, 155, 82)}" fill="rgba(219, 234, 254, 0.65)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="creative">
          <polygon points="${isoDiamond(795, 385, 155, 82)}" fill="rgba(252, 231, 243, 0.65)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="qa">
          <polygon points="${isoDiamond(645, 585, 125, 65)}" fill="rgba(220, 252, 231, 0.74)"/>
        </g>
        <g class="zone-hotspot" data-zone-id="lounge">
          <polygon points="${isoDiamond(975, 465, 115, 62)}" fill="rgba(243, 232, 255, 0.72)"/>
        </g>

        <!-- ================= BACK ARCHITECTURAL INTERIOR WALLS ================= -->
        <!-- Manager Office Back-Right Wall (Separating Manager Suite from Corridor) -->
        ${isoWallSegment(420, 213, 535, 275, 76, { wallColor: "#f7ede0", trimColor: "#d97706" })}

        <!-- Meeting Room Left Glass Wall (Separating Meeting Room from Main Corridor) -->
        ${isoWallSegment(790, 197, 660, 265, 76, { isGlass: true, trimColor: "#0d9488" })}

        <!-- ================= BACK FURNITURE & PROPS ================= -->
        ${renderBookshelf(605, 185)}
        ${renderPlant(205, 385, 1.05)}
        ${renderPlant(545, 232, 0.88)}

        <!-- Zone E: Manager Workstation -->
        ${renderChair(445, 252, "#d97706")}
        ${renderWorkstation(405, 282, { isManager: true })}

        <!-- Manager Suite Front Glass Partition (With Doorway Gap on Right) -->
        ${isoWallSegment(305, 275, 395, 323, 62, { isGlass: true, trimColor: "#d97706" })}
        <!-- Doorframe Post -->
        ${isoBox(398, 325, 4, 3, 66, { top: "#b45309", left: "#92400e", right: "#d97706" })}
        ${isoBox(434, 344, 4, 3, 66, { top: "#b45309", left: "#92400e", right: "#d97706" })}

        <!-- Zone C: Meeting Room Conference Table & Chairs -->
        <g class="zone-hotspot" data-zone-id="meeting">
          ${renderChair(755, 245, "#0d9488")}
          ${renderChair(825, 245, "#0d9488")}
          ${isoBox(790, 268, 62, 32, 7, { top: "#d4a373", left: "#a97c50", right: "#bc8a5f" })}
          ${renderChair(750, 295, "#0d9488")}
          ${renderChair(825, 295, "#0d9488")}
        </g>

        <!-- Meeting Room Front Glass Partition (With Wide Entryway) -->
        ${isoWallSegment(660, 265, 745, 310, 62, { isGlass: true, trimColor: "#0d9488" })}
        ${isoBox(748, 312, 4, 3, 66, { top: "#0f766e", left: "#115e59", right: "#0d9488" })}
        ${isoBox(805, 342, 4, 3, 66, { top: "#0f766e", left: "#115e59", right: "#0d9488" })}
        ${isoWallSegment(808, 343, 920, 285, 62, { isGlass: true, trimColor: "#0d9488" })}

        <!-- ================= DEPARTMENT DIVIDER WALL: DEV AREA vs. CREATIVE DESIGN ================= -->
        <!-- Acoustic Wood & Credenza Partition separating Main Dev Area from Creative Design -->
        ${isoWallSegment(635, 345, 745, 403, 36, { wallColor: "#efe2ce", trimColor: "#b08962", topColor: "#d4a373" })}
        ${renderPlant(630, 342, 0.82)}
        ${renderPlant(750, 405, 0.82)}

        <!-- Zone B: Creative Design Workstations (Agents 02, 05, 06) -->
        ${renderChair(690, 320, "#0ea5e9")}
        ${renderWorkstation(655, 345, { isArtDesk: true })}

        ${renderChair(800, 375, "#db2777")}
        ${renderWorkstation(765, 400, { isArtDesk: true })}

        ${renderChair(905, 430, "#ea580c")}
        ${renderWorkstation(870, 455, { dualMonitor: false })}

        <!-- Zone A: Main Development Workstations (Agents 03 & 04) -->
        ${renderWorkstation(580, 392, { dualMonitor: true })}
        ${renderChair(535, 412, "#2563eb")}

        ${renderWorkstation(700, 452, { dualMonitor: true })}
        ${renderChair(655, 472, "#7c3aed")}

        <!-- Divider Partition: Creative Design vs. Cozy Lounge -->
        ${isoWallSegment(955, 395, 875, 438, 44, { wallColor: "#f3e8ff", trimColor: "#9333ea", topColor: "#d8b4fe" })}
        ${renderPlant(1065, 430, 1.05)}

        <!-- Zone F: Cozy Lounge Sofa, Coffee Table & Espresso Bar -->
        <g class="zone-hotspot" data-zone-id="lounge">
          ${isoBox(995, 442, 42, 20, 14, { top: "#86efac", left: "#4ade80", right: "#22c55e" })}
          ${isoBox(1012, 432, 12, 22, 26, { top: "#4ade80", left: "#16a34a", right: "#22c55e" })}
          ${isoBox(955, 475, 24, 13, 8, { top: "#e6c7a1", left: "#b08962", right: "#c8a276" })}
          ${isoBox(1025, 495, 22, 14, 22, { top: "#f8fafc", left: "#cbd5e1", right: "#e2e8f0" })}
          ${isoBox(1025, 478, 12, 8, 14, { top: "#ef4444", left: "#b91c1c", right: "#dc2626" })}
        </g>

        <!-- Divider Partition: Main Dev Area vs. Testing & QA Lab -->
        ${isoWallSegment(520, 585, 625, 530, 34, { wallColor: "#dcfce7", trimColor: "#4d7c5b", topColor: "#86efac" })}
        ${isoWallSegment(685, 530, 770, 575, 34, { wallColor: "#dcfce7", trimColor: "#4d7c5b", topColor: "#86efac" })}
        ${renderPlant(515, 605, 0.92)}

        <!-- Zone D: Testing & QA Workstation (Agent 07) -->
        ${renderWorkstation(715, 572, { isQADesk: true })}
        ${renderChair(665, 592, "#4d7c5b")}

        <!-- ================= SEVEN AI STUDIO EMPLOYEES ================= -->
        <g id="agents-layer">
          ${agents.map(renderAgentCharacter).join("")}
        </g>

        <!-- ================= CLEAN ROOM & DEPARTMENT SIGNBOARDS ================= -->
        <g pointer-events="none" font-size="10.5" font-weight="800" fill="#362920">
          <!-- Manager Suite Sign -->
          <rect x="312" y="214" width="106" height="18" rx="9" fill="rgba(255,253,249,0.92)" stroke="#f59e0b" stroke-width="1.2"/>
          <text x="365" y="226" text-anchor="middle">MANAGER SUITE</text>

          <!-- Meeting Room Sign (Positioned cleanly below screen) -->
          <rect x="748" y="346" width="104" height="18" rx="9" fill="rgba(255,253,249,0.92)" stroke="#14b8a6" stroke-width="1.2"/>
          <text x="800" y="358" text-anchor="middle">MEETING ROOM</text>

          <!-- Main Dev Area Sign -->
          <rect x="462" y="484" width="106" height="18" rx="9" fill="rgba(255,253,249,0.92)" stroke="#3b82f6" stroke-width="1.2"/>
          <text x="515" y="496" text-anchor="middle">MAIN DEV AREA</text>

          <!-- Creative Design Sign -->
          <rect x="815" y="328" width="116" height="18" rx="9" fill="rgba(255,253,249,0.92)" stroke="#ec4899" stroke-width="1.2"/>
          <text x="873" y="340" text-anchor="middle">CREATIVE DESIGN</text>

          <!-- Testing & QA Sign -->
          <rect x="595" y="642" width="100" height="18" rx="9" fill="rgba(255,253,249,0.92)" stroke="#22c55e" stroke-width="1.2"/>
          <text x="645" y="654" text-anchor="middle">TESTING &amp; QA</text>

          <!-- Cozy Lounge Sign -->
          <rect x="945" y="534" width="96" height="18" rx="9" fill="rgba(255,253,249,0.92)" stroke="#a855f7" stroke-width="1.2"/>
          <text x="993" y="546" text-anchor="middle">COZY LOUNGE</text>
        </g>
      </svg>
    `;

    containerEl.innerHTML = svg;
  }

  return { renderOffice };
})();
