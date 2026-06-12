/* ============================================================
   api.js — DAI DAI frontend API client
   Populates window.WC from the Express backend (/api/*).
   Falls back to the pre-loaded window.WC from data.js if
   the backend is unreachable.
   ============================================================ */
window.API = (() => {
  // When served by our Express server (same origin), use ''. When opening index.html
  // directly from the filesystem, point to the dev server.
  const base = window.location.protocol === 'file:' ? 'http://localhost:3001' : '';

  async function get(path) {
    const r = await fetch(base + path, { credentials: 'include' });
    if (!r.ok) throw new Error(`${r.status} ${path}`);
    return r.json();
  }

  async function post(path, body) {
    const r = await fetch(base + path, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`${r.status} ${path}`);
    return r.json();
  }

  /**
   * Core bootstrap — fetches teams + fixtures + bracket groups in parallel,
   * assembles window.WC. News/sentiment/live are lazy-loaded per team to save quota.
   */
  async function bootstrapWC() {
    const [teams, fixtures, bracket] = await Promise.all([
      get('/api/teams'),
      get('/api/fixtures'),
      get('/api/bracket'),
    ]);
    window.WC = {
      TEAMS:          teams,
      FIXTURES:       fixtures,
      GROUPS:         bracket.groups || {},
      NEWS:           {},
      SENTIMENT_TREND:{},
      LIVE_EVENTS:    {},
    };
    // Pre-load news/sentiment for any currently live fixture teams
    const liveTeams = new Set(
      fixtures.filter(f => f.status === 'live').flatMap(f => [f.home, f.away])
    );
    await Promise.all([...liveTeams].map(code => loadTeamExtras(code).catch(() => {})));
    return window.WC;
  }

  /**
   * Lazy-load per-team extras (news + sentiment + live events).
   * Called when a team becomes active in the dashboard.
   */
  async function loadTeamExtras(code) {
    const [news, sent] = await Promise.all([
      get(`/api/news/${code}`).catch(() => []),
      get(`/api/sentiment/${code}`).catch(() => ({ sentiment: 70, trend: [70,70,70,70,70,70,70] })),
    ]);
    if (!window.WC) return;
    window.WC.NEWS[code]           = news;
    window.WC.SENTIMENT_TREND[code]= sent.trend;
    if (window.WC.TEAMS[code]) window.WC.TEAMS[code].sentiment = sent.sentiment;

    // Load live events for any live fixtures involving this team
    const liveFixtures = (window.WC.FIXTURES || [])
      .filter(f => f.status === 'live' && (f.home === code || f.away === code));
    await Promise.all(liveFixtures.map(async f => {
      const events = await get(`/api/live/${f.id}`).catch(() => null);
      if (events) window.WC.LIVE_EVENTS[f.id] = events.events || events;
    }));
  }

  /** Auth helpers */
  async function register(email, password) {
    return post('/api/auth/register', { email, password });
  }
  async function login(email, password) {
    return post('/api/auth/login', { email, password });
  }
  async function logout() {
    return post('/api/auth/logout', {});
  }
  async function getMe() {
    return get('/api/me').catch(() => null);
  }

  /** Persistence helpers */
  async function saveTeams(selected) {
    return post('/api/me/teams', { selected }).catch(() => {});
  }
  async function loadTeams() {
    const r = await get('/api/me/teams').catch(() => null);
    return r?.selected || null;
  }
  async function saveSimResult(result) {
    return post('/api/me/results', result).catch(() => {});
  }

  return {
    get, post,
    bootstrapWC, loadTeamExtras,
    register, login, logout, getMe,
    saveTeams, loadTeams, saveSimResult,
  };
})();
