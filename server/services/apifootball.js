const config = require('../config');
const fs     = require('fs');
const path   = require('path');

const QUOTA_FILE = path.join(__dirname, '../../data/cache/apifootball_quota.json');

function loadQuota() {
  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const q = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf8'));
      if (q.date === new Date().toISOString().slice(0, 10)) return q;
    }
  } catch {}
  return { date: new Date().toISOString().slice(0, 10), remaining: config.apifootball.dailyQuota };
}
function saveQuota(q) {
  try {
    fs.mkdirSync(path.dirname(QUOTA_FILE), { recursive: true });
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(q));
  } catch {}
}

async function apiFetch(endpoint) {
  if (!config.apifootball.key) {
    console.warn('[apifootball] No API key set — using snapshots only');
    return null;
  }
  const quota = loadQuota();
  if (quota.remaining <= 0) {
    console.warn('[apifootball] Daily quota exhausted — falling back to snapshot');
    return null;
  }

  const url = `${config.apifootball.baseUrl}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'x-apisports-key': config.apifootball.key,
      'x-apisports-host': 'v3.football.api-sports.io',
    },
  });

  // Track remaining quota from response header
  const remaining = parseInt(res.headers.get('x-ratelimit-requests-remaining') || quota.remaining - 1);
  saveQuota({ date: quota.date, remaining });

  if (!res.ok) {
    console.error(`[apifootball] ${res.status} for ${endpoint}`);
    return null;
  }
  const json = await res.json();
  return json.response || null;
}

async function getTeams() {
  return apiFetch(`/teams?league=${config.apifootball.wc26LeagueId}&season=2026`);
}
async function getFixtures() {
  return apiFetch(`/fixtures?league=${config.apifootball.wc26LeagueId}&season=2026`);
}
async function getSquad(teamId) {
  return apiFetch(`/players/squads?team=${teamId}`);
}
async function getLiveEvents(fixtureId) {
  return apiFetch(`/fixtures/events?fixture=${fixtureId}`);
}
async function getStandings() {
  return apiFetch(`/standings?league=${config.apifootball.wc26LeagueId}&season=2026`);
}

module.exports = { getTeams, getFixtures, getSquad, getLiveEvents, getStandings };
