/* ============================================================
   app.js — PITCH '26 application controller
   Screens: onboard → dashboard → sim. Pure vanilla JS.
   ============================================================ */
// TEAMS, FIXTURES, etc. are read lazily via window.WC (populated by api.js bootstrap)
const WC = () => window.WC;
const TEAMS          = new Proxy({}, { get: (_, k) => window.WC?.TEAMS?.[k] });
const FIXTURES = new Proxy([], {
  get: (_, k) => {
    const f = window.WC?.FIXTURES || [];
    if (k === 'filter') return f.filter.bind(f);
    if (k === 'find')   return f.find.bind(f);
    if (k === 'length') return f.length;
    if (!isNaN(k))      return f[k];
    return f[k];
  }
});
const LIVE_EVENTS    = new Proxy({}, { get: (_, k) => window.WC?.LIVE_EVENTS?.[k] });
const NEWS           = new Proxy({}, { get: (_, k) => window.WC?.NEWS?.[k] });
const SENTIMENT_TREND= new Proxy({}, { get: (_, k) => window.WC?.SENTIMENT_TREND?.[k] });
const GROUPS         = new Proxy({}, { get: (_, k) => window.WC?.GROUPS?.[k] });

const App = (() => {
  const state = {
    selected: [],        // chosen team codes
    activeTeam: null,    // dashboard focus
    simMatch: null,      // current sim fixture id
    factors: { healthHome: 1, healthAway: 1, skillHome: 1, skillAway: 1 },
    overrides: { home: {}, away: {} }, // subs applied per side
  };
  let sim = null; // running sim instance

  // ---------- navigation ----------
  function go(screen) {
    ["onboard", "dashboard", "sim", "bracket"].forEach(s => {
      const el = document.getElementById(s);
      if (el) el.classList.toggle("hide", s !== screen);
    });
    document.getElementById("nav").style.display = screen === "onboard" ? "none" : "flex";
    document.querySelectorAll("#nav .chip").forEach(c =>
      c.classList.toggle("active", c.dataset.screen === screen));
    if (screen === "sim") setupSim();
    if (screen !== "sim" && sim) stopSim();
    if (screen === "bracket" && window.BracketUI) window.BracketUI.renderBracket();
    window.scrollTo(0, 0);
  }

  // ---------- onboarding ----------
  function renderTeamGrid() {
    const grid = document.getElementById("teamgrid");
    grid.innerHTML = Object.values(TEAMS).map(t => `
      <div class="tcard" data-code="${t.code}" onclick="App.toggle('${t.code}')">
        <div class="fl">${t.flag}</div>
        <div class="nm">${t.name}</div>
        <div class="rk">FIFA #${t.rank} · OVR ${t.rating}</div>
        <div class="bar"><i style="width:${t.rating}%"></i></div>
      </div>`).join("");
  }
  function toggle(code) {
    const i = state.selected.indexOf(code);
    if (i >= 0) state.selected.splice(i, 1);
    else state.selected.push(code);
    document.querySelectorAll(".tcard").forEach(c =>
      c.classList.toggle("sel", state.selected.includes(c.dataset.code)));
    document.getElementById("startBtn").disabled = state.selected.length === 0;
    document.getElementById("startBtn").textContent =
      state.selected.length > 1 ? `Build my dashboard (${state.selected.length} teams) →`
                                 : "Build my dashboard →";
  }
  async function start() {
    state.activeTeam = state.selected[0];
    renderMyTeams();
    renderTeamTabs();
    // Save selection to backend (non-blocking)
    if (window.API) window.API.saveTeams(state.selected).catch(() => {});
    // Lazy-load news/sentiment for all selected teams
    if (window.API) await Promise.all(state.selected.map(c => window.API.loadTeamExtras(c).catch(() => {})));
    renderDashboard();
    go("dashboard");
  }

  function renderMyTeams() {
    document.getElementById("myteams").innerHTML =
      state.selected.map(c => `<span class="f" title="${TEAMS[c].name}" onclick="App.focus('${c}')">${TEAMS[c].flag}</span>`).join("");
  }
  function renderTeamTabs() {
    document.getElementById("teamtabs").innerHTML = state.selected.map(c => `
      <div class="tt ${c === state.activeTeam ? "active" : ""}" onclick="App.focus('${c}')">
        <span class="f">${TEAMS[c].flag}</span>${TEAMS[c].name}</div>`).join("");
  }
  async function focus(code) {
    state.activeTeam = code;
    renderTeamTabs();
    if (window.API) await window.API.loadTeamExtras(code).catch(() => {});
    renderDashboard();
    go("dashboard");
  }

  // ---------- dashboard ----------
  function renderDashboard() {
    const t = TEAMS[state.activeTeam];
    const grid = document.getElementById("dashGrid");
    const trend = SENTIMENT_TREND[t.code] || [70, 72, 74, 76, 78, 80, t.sentiment];
    const myMatches = FIXTURES.filter(f => f.home === t.code || f.away === t.code);
    const liveOne = myMatches.find(m => m.status === "live");
    const grp = GROUPS[t.group] ? t.group : Object.keys(GROUPS).find(g => GROUPS[g].some(r => r.t === t.code));

    grid.innerHTML = `
      <!-- HERO BANNER -->
      <div class="hbanner" style="background:linear-gradient(120deg,${hex(t.primary,.18)},var(--panel))">
        <div class="glow" style="background:${t.primary}"></div>
        <div class="bigflag">${t.flag}</div>
        <div class="info">
          <div class="nk">${t.nickname.toUpperCase()}</div>
          <h2>${t.name}</h2>
          <div class="meta">Coach: ${t.coach} · ${t.titles} World Cup title${t.titles !== 1 ? "s" : ""} · Group ${t.group}</div>
        </div>
        <div class="statline">
          <div class="s"><b style="color:var(--accent)">#${t.rank}</b><span>FIFA Rank</span></div>
          <div class="s"><b style="color:var(--gold)">${t.rating}</b><span>Squad OVR</span></div>
          <div class="s"><b>Form</b><div class="form">${t.form.map(f => `<i class="${f}">${f}</i>`).join("")}</div></div>
        </div>
      </div>

      <!-- LEFT COLUMN -->
      <div style="display:flex;flex-direction:column;gap:18px">
        <div class="card">
          <h3>${liveOne ? `<span class="dot"></span>Live Now` : "Your Fixtures"}</h3>
          <div class="matchrow">${myMatches.map(matchCardHTML).join("")}</div>
        </div>
        <div class="card">
          <h3>📰 ${t.name} News</h3>
          <div class="news">${(NEWS[t.code] || []).map(newsHTML).join("")}</div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div style="display:flex;flex-direction:column;gap:18px">
        ${liveOne ? `
        <div class="card">
          <h3><span class="dot"></span>Live Event Feed</h3>
          <div class="ticker">${(LIVE_EVENTS[liveOne.id] || []).map(eventHTML).join("")}</div>
        </div>` : ""}
        <div class="card">
          <h3>💬 Fan Sentiment</h3>
          <div class="gauge">
            <div class="ring" style="--v:${t.sentiment};position:relative">
              <b>${t.sentiment}</b>
            </div>
            <div style="flex:1">
              <div style="font-size:12px;color:var(--muted);margin-bottom:8px">7-day mood trend</div>
              <div class="spark">${trend.map(v => `<i style="height:${v}%"></i>`).join("")}</div>
            </div>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:14px;line-height:1.5">
            ${sentimentBlurb(t.sentiment)} <span style="color:var(--dim)">· sampled from r/soccer + X</span>
          </div>
        </div>
        <div class="card">
          <h3>🏆 Group ${grp}</h3>
          <table class="stand">
            <tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>
            ${(GROUPS[grp] || []).map(r => `
              <tr class="${r.t === t.code ? "me" : ""}">
                <td><span class="f">${TEAMS[r.t] ? TEAMS[r.t].flag : "🏳️"}</span>${TEAMS[r.t] ? TEAMS[r.t].name : r.t}</td>
                <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd}</td><td class="pts">${r.pts}</td>
              </tr>`).join("")}
          </table>
        </div>
        <div class="card">
          <h3>⭐ Squad Ratings</h3>
          <div class="squad">${t.players.map(squadHTML).join("")}</div>
        </div>
      </div>`;
  }

  function matchCardHTML(m) {
    const h = TEAMS[m.home], a = TEAMS[m.away];
    const live = m.status === "live", final = m.status === "final";
    const showScore = live || final;
    return `<div class="match">
      <div class="side"><span class="f">${h.flag}</span>${h.name}</div>
      <div class="mid">
        ${showScore ? `<div class="score">${m.hs} - ${m.as}</div>` : `<div class="score">vs</div>`}
        ${live ? `<div class="livebadge"><span class="d"></span>LIVE ${m.minute}'</div>`
               : `<div class="when">${m.date} · ${m.time}</div>`}
        ${m.status === "upcoming" ? `<span class="simlink" onclick="App.simFor('${m.id}')">▶ Simulate</span>` : ""}
      </div>
      <div class="side away">${a.name}<span class="f">${a.flag}</span></div>
    </div>`;
  }
  function newsHTML(n) {
    return `<div class="nitem">
      <div class="top"><span class="src"><span class="senti ${n.senti}"></span>${n.src} · ${n.time}</span>
        <span class="tag">${n.tag}</span></div>
      <div class="ti">${n.title}</div></div>`;
  }
  function eventHTML(e) {
    const ic = { goal: "⚽", yellow: "🟨", sub: "🔁", chance: "🎯", corner: "🚩", kickoff: "🟢" }[e.type] || "•";
    return `<div class="ev ${e.type === "goal" ? "goal" : ""}">
      <span class="m">${e.min}'</span><span class="ic">${ic}</span><span class="tx">${e.text}</span></div>`;
  }
  function squadHTML(p) {
    const cls = p.ovr >= 87 ? "hi" : p.ovr >= 83 ? "mid" : "";
    return `<div class="prow">
      <span class="pn">${String(p.num).padStart(2, "0")}</span>
      <span class="nm">${p.n} <span class="pos">${p.pos}</span></span>
      <span class="ov ${cls}">${p.ovr}</span></div>`;
  }
  function sentimentBlurb(s) {
    if (s >= 88) return "🔥 Fans are euphoric — title-favourite energy across socials.";
    if (s >= 80) return "😀 Strongly positive — optimism is high heading into the next match.";
    if (s >= 72) return "🙂 Cautiously optimistic — supporters want to see more.";
    return "😬 Mixed mood — pressure is building on the squad.";
  }

  // ---------- SIM ----------
  function simFor(matchId) { state.simMatch = matchId; go("sim"); }

  function setupSim() {
    // default to a relevant upcoming fixture
    if (!state.simMatch) {
      const up = FIXTURES.find(f => f.status === "upcoming" &&
        (state.selected.includes(f.home) || state.selected.includes(f.away)))
        || FIXTURES.find(f => f.status === "upcoming");
      state.simMatch = up.id;
    }
    renderMatchPick();
    loadSimMatch();
  }
  function renderMatchPick() {
    const up = FIXTURES.filter(f => f.status !== "live");
    document.getElementById("matchpick").innerHTML = up.map(m => {
      const h = TEAMS[m.home], a = TEAMS[m.away];
      return `<div class="mpick ${m.id === state.simMatch ? "active" : ""}" onclick="App.pickSim('${m.id}')">
        <span class="f">${h.flag}</span>${h.code} <span style="color:var(--dim)">vs</span> ${a.code}<span class="f">${a.flag}</span>
        <span style="color:var(--dim);font-size:10px">· ${m.group}</span></div>`;
    }).join("");
  }
  function pickSim(id) {
    state.simMatch = id;
    state.overrides = { home: {}, away: {} };
    state.factors = { healthHome: 1, healthAway: 1, skillHome: 1, skillAway: 1 };
    renderMatchPick();
    loadSimMatch();
  }

  let speed = 8;        // sim minutes per real second
  let raf = null, simClock = 0, timeline = null, evIdx = 0, running = false;
  let curHome = 0, curAway = 0;

  function loadSimMatch() {
    stopSim();
    const m = FIXTURES.find(f => f.id === state.simMatch);
    const home = applyXI(TEAMS[m.home], "home");
    const away = applyXI(TEAMS[m.away], "away");
    renderControls(home, away, m);
    initRenderer(home, away);
    computeTimeline(home, away);
    drawBoard(home, away, 0, 0, 0);
  }

  // Build effective XI from base players + sub overrides
  function applyXI(team, side) {
    const ov = state.overrides[side];
    const xi = team.players.map(p => ({ ...p }));
    Object.entries(ov).forEach(([outNum, sub]) => {
      const idx = xi.findIndex(p => p.num == outNum);
      if (idx >= 0) xi[idx] = { ...sub };
    });
    const clone = { ...team, _xi: xi };
    return clone;
  }

  function computeTimeline(home, away) {
    timeline = window.SIM.buildTimeline(home, away, state.factors);
    updatePrediction(home, away);
  }

  function updatePrediction(home, away) {
    // crude win-prob from expected goals diff
    const diff = parseFloat(timeline.hxg) - parseFloat(timeline.axg);
    let ph = 40 + diff * 18, pd = 26 - Math.abs(diff) * 6;
    pd = Math.max(12, pd); ph = Math.max(8, Math.min(82, ph));
    let pa = 100 - ph - pd; if (pa < 8) { pa = 8; ph = 100 - pd - pa; }
    const el = document.getElementById("predbar");
    if (el) {
      el.querySelector(".ph").style.width = ph + "%";
      el.querySelector(".pd").style.width = pd + "%";
      el.querySelector(".pa").style.width = pa + "%";
      el.querySelector(".ph").textContent = Math.round(ph) + "%";
      el.querySelector(".pd").textContent = "D";
      el.querySelector(".pa").textContent = Math.round(pa) + "%";
    }
    const meta = document.getElementById("xgmeta");
    if (meta) meta.innerHTML = `<span>xG <b>${timeline.hxg}</b></span><span>Poss <b>${clampPoss(timeline.possHome)}%</b></span><span><b>${timeline.axg}</b> xG</span>`;
  }
  const clampPoss = v => Math.max(28, Math.min(72, v));

  function renderControls(home, away, m) {
    const subRows = (team, side) => {
      const ov = state.overrides[side];
      return team.subs.map(s => `
        <div class="subrow">
          <span><span class="nm">${s.n}</span> <span class="pos">${s.pos} · ${s.ovr}</span></span>
          <button onclick="App.makeSub('${side}','${s.num}')">${isOn(side, s.num) ? "ON ✓" : "Sub in"}</button>
        </div>`).join("");
    };
    const fctl = (label, key, side) => {
      const v = state.factors[key];
      return `<div class="fctl">
        <label>${label} <b id="lbl_${key}">${Math.round(v * 100)}%</b></label>
        <input type="range" min="70" max="115" value="${Math.round(v * 100)}"
          oninput="App.setFactor('${key}',this.value)"></div>`;
    };
    document.getElementById("simcontrol").innerHTML = `
      <h3><span class="dot" style="background:var(--accent2);box-shadow:0 0 10px var(--accent2)"></span>Win Probability</h3>
      <div class="predbar" id="predbar"><i class="ph"></i><i class="pd"></i><i class="pa"></i></div>
      <div class="simmeta" id="xgmeta"></div>

      <h3 style="margin-top:6px">⚙️ Match Factors</h3>
      <div class="fgroup">
        <div style="font-size:11px;color:var(--accent);font-family:var(--pixel)">${home.flag} ${home.code}</div>
        ${fctl("Team fitness", "healthHome", "home")}
        ${fctl("Skill / form boost", "skillHome", "home")}
        <div style="font-size:11px;color:var(--accent2);font-family:var(--pixel);margin-top:4px">${away.flag} ${away.code}</div>
        ${fctl("Team fitness", "healthAway", "away")}
        ${fctl("Skill / form boost", "skillAway", "away")}
      </div>

      <h3 style="margin-top:6px">🔁 Substitutions — ${home.code}</h3>
      <div class="subctl">${subRows(home, "home")}</div>
      <h3>🔁 Substitutions — ${away.code}</h3>
      <div class="subctl">${subRows(away, "away")}</div>

      <h3 style="margin-top:6px">⏱️ Speed</h3>
      <div class="speedsel">
        <button data-s="4" onclick="App.setSpeed(4)">1×</button>
        <button data-s="8" class="on" onclick="App.setSpeed(8)">2×</button>
        <button data-s="20" onclick="App.setSpeed(20)">5×</button>
        <button data-s="45" onclick="App.setSpeed(45)">Instant</button>
      </div>
      <div class="simbtns">
        <button class="btn" id="playBtn" onclick="App.playSim()">▶ Kick off</button>
        <button class="btn ghost" onclick="App.resetSim()">↺ Reset</button>
      </div>
      <div style="font-size:11px;color:var(--dim);line-height:1.5">
        Engine derives attack/defence strength from the selected XI's attributes, then samples
        minute-by-minute chances. Change a factor or sub to re-roll the projection.
      </div>`;
    updateSpeedUI();
  }
  function isOn(side, num) {
    return Object.values(state.overrides[side]).some(s => s.num == num);
  }
  function makeSub(side, subNum) {
    const m = FIXTURES.find(f => f.id === state.simMatch);
    const team = TEAMS[side === "home" ? m.home : m.away];
    const sub = team.subs.find(s => s.num == subNum);
    const ov = state.overrides[side];
    // toggle off if already in
    const existing = Object.keys(ov).find(k => ov[k].num == subNum);
    if (existing) { delete ov[existing]; }
    else {
      // sub for a same-position-ish starter (or lowest OVR outfielder)
      const xi = team.players;
      let target = xi.find(p => p.pos === sub.pos && !ov[p.num] && p.pos !== "GK");
      if (!target) target = xi.filter(p => p.pos !== "GK" && !ov[p.num]).sort((a, b) => a.ovr - b.ovr)[0];
      if (target) ov[target.num] = sub;
    }
    refreshSim();
  }
  function setFactor(key, val) {
    state.factors[key] = val / 100;
    const lbl = document.getElementById("lbl_" + key);
    if (lbl) lbl.textContent = val + "%";
    refreshSim();
  }
  function refreshSim() {
    const m = FIXTURES.find(f => f.id === state.simMatch);
    const home = applyXI(TEAMS[m.home], "home");
    const away = applyXI(TEAMS[m.away], "away");
    // re-render only the controls' sub buttons + recompute timeline/prediction
    renderControls(home, away, m);
    computeTimeline(home, away);
    if (!running) drawBoard(home, away, simClock, curHome, curAway);
  }

  function setSpeed(s) { speed = s; updateSpeedUI(); }
  function updateSpeedUI() {
    document.querySelectorAll(".speedsel button").forEach(b =>
      b.classList.toggle("on", +b.dataset.s === speed));
  }

  // --- renderer lifecycle ---
  let lastTs = 0;
  function initRenderer(home, away) {
    const canvas = document.getElementById("pitch");
    if (sim) { sim.dispose(); }
    sim = window.SIM.Renderer(canvas, home, away);
    sim.resize();
    // idle render loop so the pitch is alive even before kickoff
    cancelAnimationFrame(raf);
    lastTs = 0;
    const loop = (ts) => {
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;
      if (running) advanceClock(dt);
      sim.frame(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function playSim() {
    const m = FIXTURES.find(f => f.id === state.simMatch);
    const home = applyXI(TEAMS[m.home], "home");
    const away = applyXI(TEAMS[m.away], "away");
    if (simClock >= 90) resetSim();
    running = true;
    document.getElementById("playBtn").textContent = "⏸ Pause";
    document.getElementById("playBtn").onclick = App.pauseSim;
    // if instant speed, fast-forward
  }
  function pauseSim() {
    running = false;
    const b = document.getElementById("playBtn");
    if (b) { b.textContent = "▶ Resume"; b.onclick = App.playSim; }
  }
  function resetSim() {
    running = false; simClock = 0; evIdx = 0; curHome = 0; curAway = 0;
    const b = document.getElementById("playBtn");
    if (b) { b.textContent = "▶ Kick off"; b.onclick = App.playSim; }
    const m = FIXTURES.find(f => f.id === state.simMatch);
    drawBoard(TEAMS[m.home], TEAMS[m.away], 0, 0, 0);
  }

  function advanceClock(dt) {
    simClock += dt * speed;
    if (simClock >= 90) { simClock = 90; pauseSim(); finalWhistle(); }
    // fire events up to current minute
    while (evIdx < timeline.events.length && timeline.events[evIdx].min <= simClock) {
      const e = timeline.events[evIdx++];
      handleEvent(e);
    }
    // ball behaviour: drift toward whichever side is "pressing" (random-ish by minute)
    if (Math.floor(simClock * 2) % 3 === 0) {
      const m = FIXTURES.find(f => f.id === state.simMatch);
      sim.setBallTowards(Math.sin(simClock) > 0 ? "home" : "away");
    }
    const m = FIXTURES.find(f => f.id === state.simMatch);
    drawBoard(TEAMS[m.home], TEAMS[m.away], simClock, curHome, curAway);
  }

  function handleEvent(e) {
    if (e.type === "goal") {
      if (e.team === "home") curHome++; else curAway++;
      sim.setBallTowards(e.team);
      sim.goalBurst();
      showGoalPop(e);
    } else if (e.type === "chance") {
      sim.setBallTowards(e.team);
    }
  }

  function showGoalPop(e) {
    const m = FIXTURES.find(f => f.id === state.simMatch);
    const team = TEAMS[e.team === "home" ? m.home : m.away];
    const pop = document.getElementById("goalpop");
    pop.innerHTML = `<b>GOAL! ${team.flag}<br><span style="font-size:18px">${e.scorer || ""} ${e.min}'</span></b>`;
    pop.classList.remove("show"); void pop.offsetWidth; pop.classList.add("show");
  }

  function finalWhistle() {
    const pop = document.getElementById("goalpop");
    const res = curHome > curAway ? "HOME WIN" : curAway > curHome ? "AWAY WIN" : "DRAW";
    pop.innerHTML = `<b>FULL TIME<br><span style="font-size:20px">${curHome} - ${curAway} · ${res}</span></b>`;
    pop.classList.remove("show"); void pop.offsetWidth; pop.classList.add("show");
  }

  function drawBoard(home, away, clock, hs, as) {
    const board = document.getElementById("simboard");
    if (!board) return;
    const min = clock <= 0 ? "0'" : clock >= 90 ? "FT" : Math.floor(clock) + "'";
    board.innerHTML = `
      <div class="team"><span class="f">${home.flag}</span>${home.code}</div>
      <div class="sc">${hs}</div>
      <div class="clock">${min}</div>
      <div class="sc">${as}</div>
      <div class="team">${away.code}<span class="f">${away.flag}</span></div>`;
  }

  function stopSim() {
    running = false;
    cancelAnimationFrame(raf);
    if (sim) { sim.dispose(); sim = null; }
  }

  function hex(h, a) {
    const c = h.replace("#", "");
    const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  window.addEventListener("resize", () => { if (sim) sim.resize(); });

  function init() { renderTeamGrid(); }

  async function simulateTournament() {
    try {
      const result = await window.API.post('/api/bracket/sim', {});
      // Merge simulated results back into WC fixtures
      if (result.rounds && window.WC) {
        for (const round of result.rounds) {
          for (const match of round.matches) {
            const f = (window.WC.FIXTURES || []).find(x => x.id === match.id);
            if (f) { f.hs = match.hs; f.as = match.as; f.status = match.winner ? 'final' : f.status; }
          }
        }
      }
      if (window.BracketUI) window.BracketUI.renderBracket();
    } catch (e) { alert('Simulation failed: ' + e.message); }
  }

  return { go, toggle, start, focus, simFor, pickSim, makeSub, setFactor, setSpeed,
           playSim, pauseSim, resetSim, init, simulateTournament, state };
})();
