/* Sunbeam Indie Studio — Pixar-inspired procedural 3D character layer
 * Uses the existing SVG office and SimulationEngine as the source of truth.
 * Three.js r160 must be loaded before this file.
 */
(function () {
  "use strict";

  const THREE = window.THREE;
  if (!THREE) {
    console.error("[Sunbeam 3D] Three.js was not loaded. Check the CDN script in index.html.");
    return;
  }

  const Studio = window.Studio = window.Studio || {};
  const models = new Map();
  const latestStates = new Map();
  let renderer, scene, camera, canvas, stage, svg, frameId;
  let lastTime = 0;
  let pixelWidth = 0;
  let pixelHeight = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function material(color, roughness = 0.78) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });
  }

  function sphere(parent, name, color, position, scale, segments = 24) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, segments, Math.max(12, segments - 4)),
      material(color)
    );
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2] || 0);
    mesh.scale.set(scale[0], scale[1], scale[2] || scale[0]);
    parent.add(mesh);
    return mesh;
  }

  function capsule(parent, name, color, radius, length, position, rotation = [0, 0, 0]) {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(position[0], position[1], position[2] || 0);
    group.rotation.set(rotation[0], rotation[1], rotation[2]);
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length, 12),
      material(color)
    );
    group.add(shaft);
    const capA = sphere(group, "cap-a", color, [0, length / 2, 0], [radius, radius, radius], 12);
    const capB = sphere(group, "cap-b", color, [0, -length / 2, 0], [radius, radius, radius], 12);
    parent.add(group);
    return group;
  }

  function tube(parent, points, color, radius = 0.65) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2] || 0)));
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, Math.max(12, points.length * 5), radius, 7, false),
      material(color)
    );
    parent.add(mesh);
    return mesh;
  }

  function makeCharacter(agent) {
    const a = agent.appearance || {};
    const root = new THREE.Group();
    root.name = agent.id;
    root.userData.agentId = agent.id;

    const skin = material(a.skin || "#d8a47f");
    const shirt = a.shirt || "#0284c7";
    const pants = a.pants || "#334155";
    const shoes = a.shoes || "#1e293b";
    const hair = a.hair || "#292524";

    // Soft contact shadow, kept subtle so the existing selection ring remains visible.
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(11.5, 28),
      new THREE.MeshBasicMaterial({ color: "#1e293b", transparent: true, opacity: 0.16, depthWrite: false })
    );
    shadow.position.set(0, 1.2, -2);
    shadow.scale.set(1.15, 0.48, 1);
    root.add(shadow);

    // Legs and shoes.
    const leftLeg = capsule(root, "left-leg", pants, 3.1, 8.5, [-4.2, 10, 1]);
    const rightLeg = capsule(root, "right-leg", pants, 3.1, 8.5, [4.2, 10, 1]);
    sphere(root, "left-shoe", shoes, [-4.7, 3.2, 3], [4.1, 2.3, 3.4]);
    sphere(root, "right-shoe", shoes, [4.7, 3.2, 3], [4.1, 2.3, 3.4]);

    // Rounded torso and collar.
    const torso = sphere(root, "torso", shirt, [0, 23, 0], [9.4, 11.8, 6.8]);
    sphere(root, "collar", a.accent || "#f8fafc", [0, 31.2, 5.4], [3.8, 2.0, 1.2]);

    // Arms have pivot groups for walk / work animation.
    const leftArm = new THREE.Group();
    leftArm.position.set(-10, 29, 0);
    root.add(leftArm);
    capsule(leftArm, "upper-arm", a.skin || "#d8a47f", 2.4, 8.8, [0, -4.8, 0]);
    sphere(leftArm, "hand", a.skin || "#d8a47f", [0, -10, 0.5], [2.5, 2.7, 2.3]);

    const rightArm = new THREE.Group();
    rightArm.position.set(10, 29, 0);
    root.add(rightArm);
    capsule(rightArm, "upper-arm", a.skin || "#d8a47f", 2.4, 8.8, [0, -4.8, 0]);
    sphere(rightArm, "hand", a.skin || "#d8a47f", [0, -10, 0.5], [2.5, 2.7, 2.3]);

    // Neck and oversized friendly head.
    sphere(root, "neck", a.skin || "#d8a47f", [0, 35, 0], [3.5, 3.4, 3.2]);
    const head = new THREE.Group();
    head.position.set(0, 45, 1.2);
    root.add(head);
    sphere(head, "face", a.skin || "#d8a47f", [0, 0, 0], [10.8, 11.5, 8.2], 32);

    // Cheeks, eyes, pupils and a small curved smile.
    sphere(head, "cheek-left", "#e9a7a0", [-6.3, -2.5, 6.2], [2.1, 1.3, 0.6]);
    sphere(head, "cheek-right", "#e9a7a0", [6.3, -2.5, 6.2], [2.1, 1.3, 0.6]);
    sphere(head, "eye-left", "#ffffff", [-3.8, 1.8, 7.5], [2.0, 2.35, 1.05]);
    sphere(head, "eye-right", "#ffffff", [3.8, 1.8, 7.5], [2.0, 2.35, 1.05]);
    sphere(head, "pupil-left", "#1e293b", [-3.4, 1.6, 8.42], [0.88, 1.15, 0.55]);
    sphere(head, "pupil-right", "#1e293b", [4.2, 1.6, 8.42], [0.88, 1.15, 0.55]);
    sphere(head, "eye-glint-left", "#ffffff", [-3.65, 2.2, 8.9], [0.42, 0.48, 0.25]);
    sphere(head, "eye-glint-right", "#ffffff", [3.95, 2.2, 8.9], [0.42, 0.48, 0.25]);
    tube(head, [[-2.2, -4.1, 8.0], [-1.1, -5.1, 8.35], [0, -5.4, 8.45], [1.1, -5.1, 8.35], [2.2, -4.1, 8.0]], "#7c2d12", 0.48);

    // Hair cap and hairstyle silhouettes.
    sphere(head, "hair-cap", hair, [0, 8.3, -0.1], [10.9, 5.0, 8.4]);
    if (a.hairStyle === "spiky") {
      [-7, -2.5, 2.5, 7].forEach((x, i) => {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(2.6, 7 + (i % 2) * 2, 10), material(hair));
        spike.position.set(x, 13.2, 0);
        spike.rotation.z = (x / 7) * -0.25;
        head.add(spike);
      });
    } else if (a.hairStyle === "curly") {
      for (let i = 0; i < 9; i++) {
        const angle = (i / 8) * Math.PI;
        sphere(head, "curl-" + i, hair, [Math.cos(angle) * 8.3, 9 + Math.sin(angle) * 3.5, 1], [3.2, 3.1, 3.2], 16);
      }
    } else if (a.hairStyle === "long") {
      sphere(head, "long-hair-left", hair, [-9, -1.5, -0.5], [3.0, 9.0, 3.5]);
      sphere(head, "long-hair-right", hair, [9, -1.5, -0.5], [3.0, 9.0, 3.5]);
    } else if (a.hairStyle === "ponytail") {
      sphere(head, "ponytail", hair, [10.2, 3.2, -1], [3.4, 6.2, 3.2]);
    } else {
      sphere(head, "side-hair-left", hair, [-8.8, 3.2, 0], [2.6, 5.3, 3.4]);
      sphere(head, "side-hair-right", hair, [8.8, 3.2, 0], [2.6, 5.3, 3.4]);
    }

    // Character-specific accessories.
    if (a.accessory === "glasses") {
      const frame = material("#263445", 0.35);
      [-3.8, 3.8].forEach(x => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.48, 8, 24), frame);
        ring.position.set(x, 1.7, 8.9);
        head.add(ring);
      });
      tube(head, [[-1.1, 1.8, 9.0], [0, 2.0, 9.1], [1.1, 1.8, 9.0]], "#263445", 0.42);
    } else if (a.accessory === "headphones") {
      const band = new THREE.Mesh(new THREE.TorusGeometry(10.4, 1.0, 8, 28, Math.PI), material("#334155"));
      band.position.set(0, 2.4, -0.4);
      band.rotation.z = Math.PI;
      head.add(band);
      sphere(head, "earcup-left", "#475569", [-10.2, -0.5, 1.0], [2.3, 3.7, 2.4]);
      sphere(head, "earcup-right", "#475569", [10.2, -0.5, 1.0], [2.3, 3.7, 2.4]);
    } else if (a.accessory === "beret") {
      const beret = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), material("#9f1239"));
      beret.position.set(-2.0, 12.1, 0.2);
      beret.scale.set(10.0, 2.7, 7.5);
      beret.rotation.z = -0.18;
      head.add(beret);
    } else if (a.accessory === "lanyard") {
      tube(root, [[-2.5, 31, 6.2], [0, 25, 7.0], [2.5, 31, 6.2]], "#e2e8f0", 0.55);
      const badge = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 1.0), material("#f8fafc"));
      badge.position.set(0, 23.7, 7.2);
      root.add(badge);
    }

    root.userData.parts = { leftLeg, rightLeg, leftArm, rightArm, head, torso };
    root.userData.phase = Math.random() * Math.PI * 2;
    root.userData.agent = agent;
    root.scale.setScalar(1.0);
    return root;
  }

  function ensureModel(agent) {
    if (models.has(agent.id)) return models.get(agent.id);
    const model = makeCharacter(agent);
    scene.add(model);
    models.set(agent.id, model);
    return model;
  }

  function initRenderer() {
    stage = document.getElementById("iso-stage");
    svg = stage && stage.querySelector("svg.office-svg");
    if (!stage || !svg) return false;

    canvas = document.createElement("canvas");
    canvas.className = "character3d-canvas";
    canvas.setAttribute("aria-hidden", "true");
    stage.appendChild(canvas);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 1.55));
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(-160, 240, 420);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe5c4, 0.72);
    fill.position.set(180, 60, 260);
    scene.add(fill);

    resize();
    const agents = Studio.AGENTS || [];
    agents.forEach(ensureModel);

    // Keep the existing SVG names, speech bubbles and selection rings; replace only the tiny SVG bodies.
    stage.classList.add("has-3d-characters");
    return true;
  }

  function resize() {
    if (!renderer || !stage) return;
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    if (width !== pixelWidth || height !== pixelHeight) {
      pixelWidth = width;
      pixelHeight = height;
      renderer.setSize(width, height, false);
      camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 3000);
      camera.position.set(0, 0, 1200);
      camera.lookAt(0, 0, 0);
    }
  }

  function svgPointToCanvas(x, y) {
    if (!svg || !canvas) return null;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(x, y).matrixTransform(matrix);
    const rect = canvas.getBoundingClientRect();
    return { x: point.x - rect.left, y: point.y - rect.top };
  }

  function animateModel(model, state, time, delta) {
    const p = model.userData.parts;
    const phase = model.userData.phase;
    const walking = state && ["WALKING", "RETURNING_TO_DESK", "PEER_REVIEW"].includes(state.state);
    const working = state && state.state === "WORKING";
    const thinking = state && state.state === "THINKING";
    const idle = !walking && !working;

    const cycle = time * (walking ? 8.0 : working ? 4.2 : 1.7) + phase;
    const swing = Math.sin(cycle);
    const breath = Math.sin(time * 1.8 + phase) * 0.45;

    p.leftLeg.rotation.x = walking ? swing * 0.52 : 0;
    p.rightLeg.rotation.x = walking ? -swing * 0.52 : 0;
    p.leftArm.rotation.x = walking ? -swing * 0.38 : working ? -0.28 + Math.sin(cycle) * 0.12 : 0;
    p.rightArm.rotation.x = walking ? swing * 0.38 : working ? -0.28 + Math.cos(cycle) * 0.12 : 0;
    p.head.rotation.z = thinking ? Math.sin(time * 0.9 + phase) * 0.08 : Math.sin(time * 0.55 + phase) * 0.025;
    p.head.position.y = 45 + breath * (idle ? 1.0 : 0.45);
    p.torso.scale.y = 11.8 + breath * 0.12;

    model.position.z = 0;
    model.position.y += 0;
    if (walking) {
      model.position.y += Math.abs(swing) * 1.25;
    }
  }

  function renderFrame(timestamp) {
    frameId = requestAnimationFrame(renderFrame);
    if (!renderer || !camera) return;

    const time = timestamp / 1000;
    const delta = lastTime ? Math.min(0.05, (timestamp - lastTime) / 1000) : 0;
    lastTime = timestamp;
    resize();

    const agents = Studio.AGENTS || [];
    for (const agent of agents) {
      const model = ensureModel(agent);
      const state = latestStates.get(agent.id);
      const position = state ? svgPointToCanvas(state.x, state.y) : svgPointToCanvas(agent.seatPos.x, agent.seatPos.y);
      if (position) {
        model.position.x = position.x - pixelWidth / 2;
        model.position.y = pixelHeight / 2 - position.y;
      }
      animateModel(model, state, time, delta);
    }
    renderer.render(scene, camera);
  }

  function installBridge() {
    if (!Studio.OfficeRenderer || Studio.OfficeRenderer.__character3dWrapped) return;
    const originalRenderOffice = Studio.OfficeRenderer.renderOffice;
    const originalUpdate = Studio.OfficeRenderer.updateAgentVisuals;

    Studio.OfficeRenderer.renderOffice = function (...args) {
      const result = originalRenderOffice.apply(this, args);
      if (canvas && canvas.parentNode) canvas.remove();
      models.clear();
      if (renderer) {
        renderer.dispose();
        renderer = null;
      }
      scene = null;
      camera = null;
      canvas = null;
      stage = null;
      svg = null;
      initRenderer();
      return result;
    };

    Studio.OfficeRenderer.updateAgentVisuals = function (states, meetingInfo) {
      (states || []).forEach(st => latestStates.set(st.id, { ...st }));
      return originalUpdate.call(this, states, meetingInfo);
    };

    Studio.OfficeRenderer.__character3dWrapped = true;
    if (Studio.AGENTS && Studio.AGENTS.length) {
      Studio.AGENTS.forEach(ensureModel);
    }
  }

  function boot() {
    if (!initRenderer()) return false;
    installBridge();
    if (!frameId) frameId = requestAnimationFrame(renderFrame);
    window.addEventListener("resize", resize, { passive: true });
    return true;
  }

  // OfficeRenderer is loaded immediately before this file in index.html.
  if (!boot()) {
    let attempts = 0;
    const retry = window.setInterval(() => {
      attempts++;
      if (boot() || attempts > 40) window.clearInterval(retry);
    }, 100);
  }
})();
