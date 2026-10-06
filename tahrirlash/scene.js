/* Hero 3D scene (three.js r128): a faceted core, orbiting HTML / CSS / JS / PY cubes, rings and drifting particles. */
(function () {
  var canvas = document.getElementById("scene");
  var stage = document.getElementById("stage");
  if (!canvas || !stage) return;

  function fail() { stage.classList.add("no-3d"); }
  if (typeof THREE === "undefined") { fail(); return; }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) { fail(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.3, 12.5);

  var root = new THREE.Group();
  scene.add(root);

  function cssColor(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  /* lights */
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  var key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(4, 5, 6);
  scene.add(key);
  var fill = new THREE.PointLight(0x8fa2ff, 1.3, 30);
  fill.position.set(-5, -2, 4);
  scene.add(fill);

  /* core */
  var coreMat = new THREE.MeshStandardMaterial({ color: 0x4a60f0, metalness: 0.35, roughness: 0.28, flatShading: true });
  var core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 1), coreMat);
  root.add(core);

  var wireMat = new THREE.LineBasicMaterial({ color: 0x8fa2ff, transparent: true, opacity: 0.55 });
  var wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.75, 1)), wireMat);
  root.add(wire);

  /* rings */
  var ringMat = new THREE.MeshBasicMaterial({ color: 0x8fa2ff, transparent: true, opacity: 0.45 });
  var ringA = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.012, 8, 180), ringMat);
  ringA.rotation.x = 1.25;
  root.add(ringA);
  var ringB = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.012, 8, 180), ringMat);
  ringB.rotation.set(0.5, 0.2, 0.9);
  root.add(ringB);

  /* labelled cubes */
  function label(text, bg, fg) {
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var g = c.getContext("2d");
    g.fillStyle = bg;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "rgba(255,255,255,0.4)";
    g.lineWidth = 8;
    g.strokeRect(12, 12, 232, 232);
    g.fillStyle = fg;
    g.font = "bold " + (text.length > 2 ? 70 : 104) + "px 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 128, 136);
    var t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }
  var specs = [
    { t: "HTML", bg: "#f2b84b", fg: "#3a2600", r: 2.9, tilt: [1.25, 0, 0], sp: 0.32, ph: 0.0 },
    { t: "CSS", bg: "#4a60f0", fg: "#ffffff", r: 3.5, tilt: [0.5, 0.2, 0.9], sp: -0.26, ph: 2.1 },
    { t: "JS", bg: "#4ade9e", fg: "#06382a", r: 2.9, tilt: [1.25, 0, 0], sp: 0.32, ph: 3.14 },
    { t: "PY", bg: "#e6ebf5", fg: "#0f1b2d", r: 3.5, tilt: [0.5, 0.2, 0.9], sp: -0.26, ph: 5.2 }
  ];
  var orbiters = [];
  specs.forEach(function (s) {
    var pivot = new THREE.Object3D();
    pivot.rotation.set(s.tilt[0], s.tilt[1], s.tilt[2]);
    var cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.86, 0.86),
      new THREE.MeshStandardMaterial({ map: label(s.t, s.bg, s.fg), roughness: 0.4, metalness: 0.1 })
    );
    var holder = new THREE.Object3D();
    holder.add(cube);
    holder.position.set(s.r, 0, 0);
    var spin = new THREE.Group();
    spin.add(holder);
    spin.rotation.z = s.ph;
    pivot.add(spin);
    root.add(pivot);
    orbiters.push({ spin: spin, cube: cube, sp: s.sp });
  });

  /* particles */
  var N = 280, pos = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) {
    var r = 4.2 + Math.random() * 3.2, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.8;
    pos[i * 3 + 2] = r * Math.cos(ph);
  }
  var pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  var pMat = new THREE.PointsMaterial({ color: 0x8fa2ff, size: 0.07, transparent: true, opacity: 0.75, sizeAttenuation: true });
  var dust = new THREE.Points(pg, pMat);
  scene.add(dust);

  function applyTheme() {
    var a = cssColor("--accent", "#4a60f0");
    var dark = document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.getAttribute("data-theme") && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
    coreMat.color.set(dark ? "#5b72ff" : "#2740e8");
    wireMat.color.set(a);
    ringMat.color.set(a);
    pMat.color.set(a);
    fill.color.set(dark ? 0x8fa2ff : 0x7d90ff);
    if (reduce) draw();
  }

  /* sizing */
  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 420 ? 15 : 12.5;
    camera.updateProjectionMatrix();
    if (reduce) draw();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  window.addEventListener("resize", resize);

  /* input */
  var tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener("pointermove", function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  var visible = true;
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(stage);
  }

  var clock = new THREE.Clock(), running = false;
  function draw() {
    renderer.render(scene, camera);
  }
  function frame() {
    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;
    core.rotation.y += dt * 0.35;
    core.rotation.x += dt * 0.15;
    wire.rotation.y -= dt * 0.18;
    wire.rotation.z += dt * 0.1;
    orbiters.forEach(function (o) {
      o.spin.rotation.z += dt * o.sp;
      o.cube.rotation.x += dt * 0.6;
      o.cube.rotation.y += dt * 0.8;
    });
    dust.rotation.y += dt * 0.02;
    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;
    root.rotation.y = cx * 0.55;
    root.rotation.x = cy * 0.3 + Math.min(window.scrollY, 800) * 0.0008;
    root.position.y = Math.sin(t * 0.9) * 0.12;
    draw();
  }
  function loop() {
    if (running || reduce) return;
    running = true;
    clock.getDelta();
    (function tick() {
      if (!visible || document.hidden) { running = false; return; }
      frame();
      requestAnimationFrame(tick);
    })();
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && visible) loop(); });
  document.addEventListener("themechange", applyTheme);

  applyTheme();
  resize();
  if (reduce) { draw(); } else { loop(); }
})();
