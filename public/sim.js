/* ============================================================
   sim.js — Match simulation engine + 3D pixel-pitch renderer
   - Engine: team strength derived from selected XI attributes,
     modified by live factor sliders. Poisson-style minute-by-minute
     chance sampling produces a realistic-feeling scoreline + events.
   - Renderer: Three.js, low-poly "pixel" players that move toward
     the ball; goal bursts and a running scoreboard.
   No build step — Three.js is loaded from a CDN <script> in index.html.
   ============================================================ */

(function () {
  // ---- 1. Team strength from attributes + factors ----------------------
  // factors: { healthHome, healthAway, skillHome, skillAway } each 0.7..1.15
  function teamStrength(team, factors, side) {
    const xi = team._xi || team.players.slice(0, 11);
    const health = side === "home" ? factors.healthHome : factors.healthAway;
    const skill  = side === "home" ? factors.skillHome  : factors.skillAway;

    let atk = 0, def = 0;
    for (const p of xi) {
      const w = (p.health / 100) * health; // injury / fatigue weighting
      atk += (p.sho * 0.5 + p.dri * 0.3 + p.pas * 0.2) * w;
      def += (p.def * 0.6 + p.phy * 0.4) * w;
    }
    atk = (atk / xi.length) * skill;
    def = def / xi.length;
    return { atk, def };
  }

  // Expected goals for a side given both strengths.
  function expectedGoals(self, opp) {
    const base = 1.35; // league-average-ish goals/match
    const ratio = self.atk / opp.def;
    return Math.max(0.2, base * Math.pow(ratio, 1.6) * (self.atk / 82));
  }

  // Deterministic-ish RNG so a given config replays similarly within a run.
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // Pre-compute a full match event timeline (90'+) we then animate live.
  function buildTimeline(home, away, factors) {
    const seed = Math.floor((factors.healthHome + factors.skillHome) * 100000 +
                            (factors.healthAway + factors.skillAway) * 7000) + 13;
    const rng = makeRng(seed);
    const hS = teamStrength(home, factors, "home");
    const aS = teamStrength(away, factors, "away");
    const hxg = expectedGoals(hS, aS) * 1.08; // small home edge
    const axg = expectedGoals(aS, hS);

    const events = [];
    let hs = 0, as = 0;
    const pHomeMin = hxg / 90, pAwayMin = axg / 90;

    for (let m = 1; m <= 90; m++) {
      if (rng() < pHomeMin) {
        hs++;
        events.push({ min: m, team: "home", type: "goal", scorer: pickScorer(home, rng) });
      }
      if (rng() < pAwayMin) {
        as++;
        events.push({ min: m, team: "away", type: "goal", scorer: pickScorer(away, rng) });
      }
      // colour events
      if (rng() < 0.018) events.push({ min: m, team: rng() < 0.5 ? "home" : "away", type: "chance" });
      if (rng() < 0.010) events.push({ min: m, team: rng() < 0.5 ? "home" : "away", type: "yellow" });
    }
    events.sort((a, b) => a.min - b.min);
    return { events, finalHome: hs, finalAway: as, hxg: hxg.toFixed(2), axg: axg.toFixed(2),
             possHome: Math.round(50 + (hS.atk - aS.atk) * 0.7) };
  }

  function pickScorer(team, rng) {
    const xi = (team._xi || team.players.slice(0, 11)).filter(p => p.pos !== "GK");
    // weight by shooting + attacking position
    const weights = xi.map(p => Math.pow(p.sho, 2) * (p.pos.includes("ST") || p.pos.includes("W") || p.pos.includes("CAM") ? 2 : 0.6));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    for (let i = 0; i < xi.length; i++) { r -= weights[i]; if (r <= 0) return xi[i].n; }
    return xi[0].n;
  }

  // ---- 2. Three.js pixel-pitch renderer --------------------------------
  function Renderer(canvas, home, away) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 60, 140);

    const W = () => canvas.clientWidth, H = () => canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 500);
    camera.position.set(0, 58, 62);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H(), false);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(20, 60, 30); scene.add(key);
    const rim = new THREE.DirectionalLight(0x4488ff, 0.5);
    rim.position.set(-30, 20, -40); scene.add(rim);

    const PL = 80, PW = 50; // pitch dims

    // Pitch with mowed stripes
    const pitch = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(PL / 10, PW),
        new THREE.MeshStandardMaterial({ color: i % 2 ? 0x1f8a3b : 0x1a7a34 })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.x = -PL / 2 + PL / 20 + i * (PL / 10);
      pitch.add(stripe);
    }
    scene.add(pitch);

    // White lines (thin boxes)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    function line(w, l, x, z) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, l), lineMat);
      m.position.set(x, 0.06, z); pitch.add(m);
    }
    line(0.4, PW, 0, 0);                 // halfway
    line(PL, 0.4, 0, PW / 2);            // touchlines
    line(PL, 0.4, 0, -PW / 2);
    line(0.4, PW, PL / 2, 0);
    line(0.4, PW, -PL / 2, 0);
    line(0.4, 18, PL / 2 - 9, 0);        // boxes
    line(18, 0.4, PL / 2 - 9, 9); line(18, 0.4, PL / 2 - 9, -9);
    line(0.4, 18, -PL / 2 + 9, 0);
    line(18, 0.4, -PL / 2 + 9, 9); line(18, 0.4, -PL / 2 + 9, -9);
    const circle = new THREE.Mesh(new THREE.RingGeometry(8.6, 9, 48), lineMat);
    circle.rotation.x = -Math.PI / 2; circle.position.y = 0.06; pitch.add(circle);

    // Goals
    function goal(x) {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const post = new THREE.BoxGeometry(0.5, 5, 0.5);
      const p1 = new THREE.Mesh(post, mat); p1.position.set(x, 2.5, 4);
      const p2 = new THREE.Mesh(post, mat); p2.position.set(x, 2.5, -4);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 8.5), mat); bar.position.set(x, 5, 0);
      g.add(p1, p2, bar); scene.add(g);
    }
    goal(PL / 2); goal(-PL / 2);

    // Pixel player = chunky low-poly box "minifig"
    function makePlayer(color) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 1.0),
        new THREE.MeshStandardMaterial({ color }));
      body.position.y = 1.6;
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0),
        new THREE.MeshStandardMaterial({ color: 0xf1c27d }));
      head.position.y = 3.1;
      g.add(body, head);
      scene.add(g);
      return g;
    }

    const homeColor = parseInt((home.primary || "#6CA8DC").replace("#", "0x"));
    const awayColor = parseInt((away.primary || "#ffffff").replace("#", "0x"));
    // ensure contrast vs pitch/each other
    const awayCol = awayColor === 0xFFFFFF ? 0xeef2f7 : awayColor;

    // Formation slots (x along length, z across width). Mirror for away.
    const FORM = [
      [-36, 0],                                            // GK
      [-26, -16], [-26, -5], [-26, 5], [-26, 16],          // back 4
      [-10, -12], [-10, 0], [-10, 12],                     // mid 3
      [4, -16], [6, 0], [4, 16],                            // front 3
    ];
    const homeMen = [], awayMen = [], homeHome = [], awayHome = [];
    for (let i = 0; i < 11; i++) {
      const hp = makePlayer(homeColor); hp.position.set(FORM[i][0], 0, FORM[i][1]);
      homeMen.push(hp); homeHome.push([FORM[i][0], FORM[i][1]]);
      const ap = makePlayer(awayCol);  ap.position.set(-FORM[i][0], 0, FORM[i][1]);
      awayMen.push(ap); awayHome.push([-FORM[i][0], FORM[i][1]]);
    }

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x222222 }));
    ball.position.set(0, 0.7, 0); scene.add(ball);

    // Goal flash plane
    const flash = new THREE.Mesh(new THREE.PlaneGeometry(PL, PW),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
    flash.rotation.x = -Math.PI / 2; flash.position.y = 0.2; scene.add(flash);

    // animation state
    let ballTarget = new THREE.Vector3(0, 0.7, 0);
    let flashV = 0, t = 0;

    function setBallTowards(side) {
      // move ball toward attacking goal of `side`
      const gx = side === "home" ? PL / 2 - 6 : -PL / 2 + 6;
      ballTarget.set(gx + (Math.random() - 0.5) * 8, 0.7, (Math.random() - 0.5) * 20);
    }
    function wander() {
      ballTarget.set((Math.random() - 0.5) * PL * 0.7, 0.7, (Math.random() - 0.5) * PW * 0.7);
    }
    function goalBurst() { flashV = 1; }

    function resize() {
      camera.aspect = W() / H(); camera.updateProjectionMatrix();
      renderer.setSize(W(), H(), false);
    }

    function frame(dt) {
      t += dt;
      // ball easing
      ball.position.lerp(ballTarget, Math.min(1, dt * 2.2));
      ball.position.y = 0.7 + Math.abs(Math.sin(t * 4)) * 0.8;

      // players drift toward home slot + lean toward ball
      function updateTeam(men, homes) {
        for (let i = 0; i < men.length; i++) {
          const m = men[i];
          const hx = homes[i][0], hz = homes[i][1];
          // bias toward ball for outfielders, GK stays
          const pull = i === 0 ? 0.04 : 0.20;
          const tx = hx + (ball.position.x - hx) * pull + Math.sin(t * 1.3 + i) * 1.2;
          const tz = hz + (ball.position.z - hz) * pull + Math.cos(t * 1.1 + i) * 1.2;
          m.position.x += (tx - m.position.x) * Math.min(1, dt * 1.6);
          m.position.z += (tz - m.position.z) * Math.min(1, dt * 1.6);
          m.position.y = Math.abs(Math.sin(t * 6 + i)) * 0.25; // little bounce
        }
      }
      updateTeam(homeMen, homeHome);
      updateTeam(awayMen, awayHome);

      if (flashV > 0) { flashV -= dt * 1.5; flash.material.opacity = Math.max(0, flashV) * 0.6; }

      // gentle camera sway
      camera.position.x = Math.sin(t * 0.15) * 6;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    return { frame, resize, setBallTowards, wander, goalBurst,
             dispose: () => renderer.dispose() };
  }

  window.SIM = { buildTimeline, teamStrength, Renderer };
})();
