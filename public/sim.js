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

    // ── Player card hover overlay ──────────────────────────────────────
    const card = document.createElement('div');
    card.id = 'sim-player-card';
    card.style.cssText = `
      position:absolute;pointer-events:none;z-index:20;
      background:#0c1222;border:1px solid #22304f;border-radius:14px;
      padding:14px 16px;min-width:190px;
      box-shadow:0 12px 40px rgba(0,0,0,.7);
      opacity:0;transition:opacity .15s;
      font-family:"Outfit",system-ui,sans-serif;color:#eaf0ff;
    `;
    canvas.parentElement.style.position = 'relative';
    canvas.parentElement.appendChild(card);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999);
    // Map from mesh uuid → { playerData, side }
    const meshPlayerMap = new Map();

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
    function makePlayer(color, playerData, side) {
      const g = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 1.0), bodyMat);
      body.position.y = 1.6;
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0),
        new THREE.MeshStandardMaterial({ color: 0xf1c27d }));
      head.position.y = 3.1;
      // Number label plane on shirt
      g.add(body, head);
      scene.add(g);
      // Register both body and head meshes for raycasting
      meshPlayerMap.set(body.uuid, { playerData, side, bodyMat });
      meshPlayerMap.set(head.uuid, { playerData, side, bodyMat });
      g._bodyMat = bodyMat;
      return g;
    }

    const homeColor = parseInt((home.primary || "#6CA8DC").replace("#", "0x"));
    const awayColor = parseInt((away.primary || "#ffffff").replace("#", "0x"));
    // ensure contrast vs pitch/each other
    const awayCol = awayColor === 0xFFFFFF ? 0xeef2f7 : awayColor;

    const homePlayers = home._xi || home.players || [];
    const awayPlayers = away._xi || away.players || [];

    // Formation slots (x along length, z across width). Mirror for away.
    const FORM = [
      [-36, 0],                                            // GK
      [-26, -16], [-26, -5], [-26, 5], [-26, 16],          // back 4
      [-10, -12], [-10, 0], [-10, 12],                     // mid 3
      [4, -16], [6, 0], [4, 16],                            // front 3
    ];
    const homeMen = [], awayMen = [], homeHome = [], awayHome = [];
    for (let i = 0; i < 11; i++) {
      const hp = makePlayer(homeColor, homePlayers[i] || {}, 'home');
      hp.position.set(FORM[i][0], 0, FORM[i][1]);
      homeMen.push(hp); homeHome.push([FORM[i][0], FORM[i][1]]);
      const ap = makePlayer(awayCol, awayPlayers[i] || {}, 'away');
      ap.position.set(-FORM[i][0], 0, FORM[i][1]);
      awayMen.push(ap); awayHome.push([-FORM[i][0], FORM[i][1]]);
    }

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x222222 }));
    ball.position.set(0, 0.7, 0); scene.add(ball);

    // Goal flash plane
    const flash = new THREE.Mesh(new THREE.PlaneGeometry(PL, PW),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
    flash.rotation.x = -Math.PI / 2; flash.position.y = 0.2; scene.add(flash);

    // ── Hover / raycasting ─────────────────────────────────────────────
    let hoveredEntry = null;

    function statBar(val, max = 99) {
      const pct = Math.round((val / max) * 100);
      const col = val >= 87 ? '#00e6a8' : val >= 80 ? '#ffd23f' : '#8a9bc4';
      return `<div style="display:flex;align-items:center;gap:6px">
        <div style="flex:1;height:5px;background:#22304f;border-radius:3px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${col};border-radius:3px"></div>
        </div>
        <span style="font-family:'Press Start 2P',monospace;font-size:9px;color:${col};min-width:20px;text-align:right">${val}</span>
      </div>`;
    }

    function showCard(entry, px, py) {
      const p = entry.playerData;
      if (!p || !p.n) { card.style.opacity = '0'; return; }
      const teamColor = entry.side === 'home' ? (home.primary || '#6CA8DC') : (away.primary || '#ff2d78');
      const team = entry.side === 'home' ? home : away;
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <div style="width:36px;height:36px;border-radius:9px;background:${teamColor};display:grid;place-items:center;
               font-family:'Press Start 2P',monospace;font-size:11px;color:#fff;flex-shrink:0">${p.num || '?'}</div>
          <div>
            <div style="font-weight:800;font-size:14px;line-height:1.2">${p.n}</div>
            <div style="font-size:11px;color:#8a9bc4;margin-top:2px">${p.pos || ''} · ${team.flag || ''} ${team.name || ''}</div>
          </div>
          <div style="margin-left:auto;font-family:'Press Start 2P',monospace;font-size:18px;
               color:${p.ovr >= 87 ? '#00e6a8' : p.ovr >= 82 ? '#ffd23f' : '#8a9bc4'}">${p.ovr || '?'}</div>
        </div>
        <div style="display:grid;gap:6px">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#5b6c93;margin-bottom:2px">
            <span>PAC</span><span>SHO</span><span>PAS</span><span>DRI</span><span>DEF</span><span>PHY</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px">
            ${[['PAC',p.pac],['SHO',p.sho],['PAS',p.pas],['DRI',p.dri],['DEF',p.def],['PHY',p.phy]].map(([,v]) =>
              `<div style="text-align:center;font-family:'Press Start 2P',monospace;font-size:10px;
                color:${(v||0)>=87?'#00e6a8':(v||0)>=80?'#ffd23f':'#8a9bc4'}">${v||'?'}</div>`
            ).join('')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px">
            ${[p.pac,p.sho,p.pas,p.dri,p.def,p.phy].map(v =>
              `<div style="height:4px;background:#22304f;border-radius:2px;overflow:hidden">
                <div style="width:${Math.round(((v||0)/99)*100)}%;height:100%;
                  background:${(v||0)>=87?'#00e6a8':(v||0)>=80?'#ffd23f':'#8a9bc4'}"></div>
              </div>`
            ).join('')}
          </div>
        </div>
        ${p.health != null ? `<div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#8a9bc4">
          <span>Fitness</span>
          <span style="color:${p.health>=90?'#00e6a8':p.health>=75?'#ffd23f':'#ff2d78'};font-weight:700">${p.health}%</span>
        </div>` : ''}
      `;
      // Position card near cursor, keep within canvas bounds
      const rect = canvas.parentElement.getBoundingClientRect();
      const cx = px - rect.left, cy = py - rect.top;
      const cw = card.offsetWidth || 210, ch = card.offsetHeight || 200;
      const lx = cx + 16 + cw > canvas.clientWidth  ? cx - cw - 10 : cx + 16;
      const ly = cy - ch / 2 < 0 ? 10 : cy + ch / 2 > canvas.clientHeight ? canvas.clientHeight - ch - 10 : cy - ch / 2;
      card.style.left  = lx + 'px';
      card.style.top   = ly + 'px';
      card.style.opacity = '1';
    }

    function hideCard() { card.style.opacity = '0'; hoveredEntry = null; }

    // Highlight hovered player body
    function setHighlight(entry, on) {
      if (!entry?.bodyMat) return;
      entry.bodyMat.emissive = on ? new THREE.Color(0x446644) : new THREE.Color(0x000000);
    }

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / canvas.clientWidth)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / canvas.clientHeight) * 2 + 1;
      // Store raw px for card positioning
      canvas._mouseRawX = e.clientX;
      canvas._mouseRawY = e.clientY;
    });
    canvas.addEventListener('mouseleave', hideCard);

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

      // Raycast for player hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      let hit = null;
      for (const ix of intersects) {
        const entry = meshPlayerMap.get(ix.object.uuid);
        if (entry) { hit = entry; break; }
      }
      if (hit !== hoveredEntry) {
        setHighlight(hoveredEntry, false);
        setHighlight(hit, true);
        hoveredEntry = hit;
      }
      if (hit) {
        showCard(hit, canvas._mouseRawX || 0, canvas._mouseRawY || 0);
      } else {
        card.style.opacity = '0';
      }
    }

    return { frame, resize, setBallTowards, wander, goalBurst,
             dispose: () => { renderer.dispose(); card.remove(); } };
  }

  window.SIM = { buildTimeline, teamStrength, Renderer };
})();
