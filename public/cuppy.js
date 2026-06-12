/* ============================================================
   cuppy.js — Agent Cuppy ⚽ floating chat widget
   Sends context (screen, match, factors) with every message.
   Receives reply text + actions[], executes sim actions live.
   ============================================================ */
(function () {

  // ─── State ────────────────────────────────────────────────────────────────
  const history = [];   // [{role, content}] sent to the backend
  let open = false;

  // ─── Inject styles ───────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #cuppy-btn {
      position:fixed; bottom:28px; right:28px; z-index:1000;
      width:58px; height:58px; border-radius:16px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#00e6a8,#3b82f6 55%,#ff2d78);
      box-shadow:0 8px 30px rgba(0,230,168,.45);
      font-size:26px; display:grid; place-items:center;
      transition:.2s; animation:cuppyPulse 3s infinite;
    }
    #cuppy-btn:hover { transform:scale(1.08) translateY(-2px); }
    @keyframes cuppyPulse { 0%,90%,100%{box-shadow:0 8px 30px rgba(0,230,168,.45)} 95%{box-shadow:0 8px 40px rgba(0,230,168,.8)} }

    #cuppy-panel {
      position:fixed; bottom:98px; right:28px; z-index:1000;
      width:380px; max-height:580px;
      background:#0c1222; border:1px solid #22304f; border-radius:20px;
      box-shadow:0 24px 80px rgba(0,0,0,.7);
      display:flex; flex-direction:column; overflow:hidden;
      transform:scale(.94) translateY(10px); opacity:0; pointer-events:none;
      transition:.22s cubic-bezier(.4,0,.2,1);
    }
    #cuppy-panel.open { transform:scale(1) translateY(0); opacity:1; pointer-events:all; }

    .cuppy-head {
      padding:14px 18px; display:flex; align-items:center; gap:12px;
      border-bottom:1px solid #22304f;
      background:linear-gradient(90deg,rgba(0,230,168,.08),transparent);
    }
    .cuppy-avatar {
      width:36px; height:36px; border-radius:10px;
      background:linear-gradient(135deg,#00e6a8,#3b82f6);
      display:grid; place-items:center; font-size:18px; flex-shrink:0;
    }
    .cuppy-head-text h4 { font-family:"Press Start 2P",monospace; font-size:10px; color:#eaf0ff; }
    .cuppy-head-text p  { font-size:11px; color:#8a9bc4; margin-top:3px; }
    .cuppy-close { margin-left:auto; background:none; border:none; color:#5b6c93; cursor:pointer; font-size:18px; line-height:1; }
    .cuppy-close:hover { color:#eaf0ff; }

    .cuppy-msgs {
      flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px;
      scroll-behavior:smooth;
    }
    .cuppy-msgs::-webkit-scrollbar { width:4px; }
    .cuppy-msgs::-webkit-scrollbar-track { background:transparent; }
    .cuppy-msgs::-webkit-scrollbar-thumb { background:#22304f; border-radius:4px; }

    .cmsg { max-width:88%; display:flex; flex-direction:column; gap:3px; }
    .cmsg.user  { align-self:flex-end; }
    .cmsg.agent { align-self:flex-start; }
    .cmsg .bubble {
      padding:10px 13px; border-radius:13px; font-size:13px; line-height:1.5;
      word-break:break-word;
    }
    .cmsg.user  .bubble { background:#3b82f6; color:#fff; border-bottom-right-radius:4px; }
    .cmsg.agent .bubble { background:#111a30; color:#eaf0ff; border:1px solid #22304f; border-bottom-left-radius:4px; }
    .cmsg .sender { font-size:10px; color:#5b6c93; padding:0 4px; }
    .cmsg.user .sender { text-align:right; }

    .cmsg.agent .bubble.typing { color:#5b6c93; }
    .typing-dots span {
      display:inline-block; width:6px; height:6px; background:#00e6a8;
      border-radius:50%; margin:0 2px; animation:typingDot 1.2s infinite;
    }
    .typing-dots span:nth-child(2) { animation-delay:.2s; }
    .typing-dots span:nth-child(3) { animation-delay:.4s; }
    @keyframes typingDot { 0%,80%,100%{transform:scale(0.6);opacity:.4} 40%{transform:scale(1);opacity:1} }

    .cuppy-actions-bar {
      padding:8px 14px; border-top:1px solid #22304f; display:flex; gap:6px; flex-wrap:wrap;
    }
    .cuppy-chip {
      font-size:10px; font-weight:700; padding:5px 10px; border-radius:999px;
      border:1px solid #22304f; background:#111a30; color:#8a9bc4; cursor:pointer;
      white-space:nowrap; transition:.15s;
    }
    .cuppy-chip:hover { border-color:#00e6a8; color:#00e6a8; }

    .cuppy-input-row {
      padding:12px 14px; border-top:1px solid #22304f; display:flex; gap:8px; align-items:flex-end;
    }
    #cuppy-input {
      flex:1; resize:none; background:#070a14; color:#eaf0ff; border:1px solid #22304f;
      border-radius:10px; padding:10px 12px; font-family:"Outfit",sans-serif; font-size:13px;
      line-height:1.4; outline:none; max-height:100px; overflow-y:auto;
    }
    #cuppy-input:focus { border-color:#3b82f6; }
    #cuppy-input::placeholder { color:#5b6c93; }
    #cuppy-send {
      width:38px; height:38px; border-radius:10px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#00e6a8,#3b82f6); font-size:16px;
      display:grid; place-items:center; flex-shrink:0; transition:.15s;
    }
    #cuppy-send:hover { transform:scale(1.08); }
    #cuppy-send:disabled { opacity:.4; cursor:not-allowed; transform:none; }

    .action-badge {
      display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700;
      padding:3px 8px; border-radius:6px; background:rgba(0,230,168,.12);
      color:#00e6a8; border:1px solid rgba(0,230,168,.25); margin-top:5px;
    }
  `;
  document.head.appendChild(style);

  // ─── Build DOM ───────────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'cuppy-btn';
  btn.title = 'Chat with Cuppy';
  btn.textContent = '⚽';

  const panel = document.createElement('div');
  panel.id = 'cuppy-panel';
  panel.innerHTML = `
    <div class="cuppy-head">
      <div class="cuppy-avatar">⚽</div>
      <div class="cuppy-head-text">
        <h4>CUPPY</h4>
        <p>WC26 AI · Ask me anything</p>
      </div>
      <button class="cuppy-close" id="cuppy-close">✕</button>
    </div>
    <div class="cuppy-msgs" id="cuppy-msgs">
      <div class="cmsg agent">
        <span class="sender">Cuppy</span>
        <div class="bubble">Hey! I'm Cuppy ⚽ — your World Cup AI. I can answer questions about teams, fixtures, and standings, <b>and take actions in the simulation</b> like adjusting fitness, making subs, or playing the match. What do you want to know?</div>
      </div>
    </div>
    <div class="cuppy-actions-bar" id="cuppy-chips"></div>
    <div class="cuppy-input-row">
      <textarea id="cuppy-input" placeholder="Ask about teams, or say 'boost Argentina fitness'…" rows="1"></textarea>
      <button id="cuppy-send">➤</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  // ─── Quick-action chips (update based on screen) ─────────────────────────
  const CHIPS_DEFAULT = [
    'Compare ARG vs FRA',
    'Who are the favourites?',
    'Show live scores',
  ];
  const CHIPS_SIM = [
    'Boost home team fitness',
    'Make a sub for away team',
    'Play the match',
    'Reset simulation',
  ];

  function updateChips() {
    const screen = window.App?.state?.screen || 'dashboard';
    const chips = screen === 'sim' ? CHIPS_SIM : CHIPS_DEFAULT;
    document.getElementById('cuppy-chips').innerHTML = chips
      .map(c => `<button class="cuppy-chip" onclick="CuppyWidget.send(${JSON.stringify(c)})">${c}</button>`)
      .join('');
  }
  updateChips();

  // ─── Toggle panel ────────────────────────────────────────────────────────
  function toggle() { open = !open; panel.classList.toggle('open', open); if (open) { updateChips(); document.getElementById('cuppy-input').focus(); } }
  btn.addEventListener('click', toggle);
  document.getElementById('cuppy-close').addEventListener('click', toggle);

  // ─── Render a message bubble ─────────────────────────────────────────────
  function addMsg(role, html, badges = []) {
    const msgs = document.getElementById('cuppy-msgs');
    const div = document.createElement('div');
    div.className = `cmsg ${role}`;
    const sender = role === 'agent' ? 'Cuppy' : 'You';
    const badgeHtml = badges.map(b => `<span class="action-badge">⚡ ${b}</span>`).join('');
    div.innerHTML = `<span class="sender">${sender}</span><div class="bubble">${html}</div>${badgeHtml}`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function showTyping() {
    const msgs = document.getElementById('cuppy-msgs');
    const div = document.createElement('div');
    div.className = 'cmsg agent';
    div.id = 'cuppy-typing';
    div.innerHTML = `<span class="sender">Cuppy</span><div class="bubble typing"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function removeTyping() { document.getElementById('cuppy-typing')?.remove(); }

  // ─── Build context from current app state ────────────────────────────────
  function getContext() {
    const app = window.App;
    if (!app) return {};
    const s = app.state;
    const ctx = {
      screen:     s?.activeScreen || document.querySelector('#sim:not(.hide)') ? 'sim'
                : document.querySelector('#dashboard:not(.hide)') ? 'dashboard'
                : document.querySelector('#bracket:not(.hide)') ? 'bracket' : 'onboard',
      activeTeam: s?.activeTeam,
    };
    // Sim state — exposed by app.js
    if (typeof window._simClock !== 'undefined') ctx.simClock = window._simClock;
    if (typeof window._simScore !== 'undefined') ctx.score = window._simScore;
    if (s?.simMatch) ctx.simMatch = s.simMatch;
    if (s?.factors)  ctx.factors  = s.factors;
    // Home/away teams of current sim match
    if (s?.simMatch && window.WC?.FIXTURES) {
      const f = window.WC.FIXTURES.find(x => x.id === s.simMatch);
      if (f) { ctx.homeTeam = f.home; ctx.awayTeam = f.away; }
    }
    return ctx;
  }

  // ─── Execute frontend sim actions returned by Cuppy ──────────────────────
  function executeActions(actions) {
    if (!actions?.length || !window.App) return [];
    const badges = [];
    for (const a of actions) {
      try {
        switch (a.tool) {
          case 'set_team_fitness':
            window.App.setFactor(a.input.side === 'home' ? 'healthHome' : 'healthAway',
              Math.round(a.input.value * 100));
            badges.push(`${a.input.side} fitness → ${Math.round(a.input.value * 100)}%`);
            break;
          case 'set_team_skill':
            window.App.setFactor(a.input.side === 'home' ? 'skillHome' : 'skillAway',
              Math.round(a.input.value * 100));
            badges.push(`${a.input.side} skill → ${Math.round(a.input.value * 100)}%`);
            break;
          case 'make_substitution':
            window.App.makeSub(a.input.side, a.input.sub_number);
            badges.push(`Sub #${a.input.sub_number} on (${a.input.side})`);
            break;
          case 'control_simulation':
            if (a.input.speed) window.App.setSpeed(a.input.speed);
            if (a.input.action === 'play')  window.App.playSim();
            if (a.input.action === 'pause') window.App.pauseSim();
            if (a.input.action === 'reset') window.App.resetSim();
            badges.push(`Sim ${a.input.action}${a.input.speed ? ` @ ${a.input.speed}×` : ''}`);
            break;
          case 'navigate_to':
            window.App.go(a.input.screen);
            badges.push(`Navigated → ${a.input.screen}`);
            break;
        }
      } catch (e) { console.warn('[Cuppy] action failed:', a.tool, e); }
    }
    return badges;
  }

  // ─── Send a message ───────────────────────────────────────────────────────
  async function send(text) {
    if (!text?.trim()) return;
    addMsg('user', escHtml(text));
    history.push({ role: 'user', content: text });

    const input = document.getElementById('cuppy-input');
    const sendBtn = document.getElementById('cuppy-send');
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;
    showTyping();

    try {
      const base = window.location.protocol === 'file:' ? 'http://localhost:3001' : '';
      const res = await fetch(`${base}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context: getContext() }),
      });

      removeTyping();

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        addMsg('agent', `⚠️ ${err.error || 'Something went wrong'}`);
        return;
      }

      const data = await res.json();
      const badges = executeActions(data.actions);
      addMsg('agent', markdownToHtml(data.reply), badges);
      history.push({ role: 'assistant', content: data.reply });

    } catch (e) {
      removeTyping();
      addMsg('agent', `⚠️ Couldn't reach the server. Make sure it's running on port 3001.`);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  // ─── Input handlers ───────────────────────────────────────────────────────
  const inputEl = document.getElementById('cuppy-input');
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inputEl.value.trim()); }
  });
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
  });
  document.getElementById('cuppy-send').addEventListener('click', () => send(inputEl.value.trim()));

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function markdownToHtml(md) {
    return md
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
      .replace(/\*(.+?)\*/g,'<i>$1</i>')
      .replace(/`(.+?)`/g,'<code style="background:#070a14;padding:1px 4px;border-radius:4px;font-size:11px">$1</code>')
      .replace(/\n/g,'<br>');
  }

  window.CuppyWidget = { send, toggle };
})();
