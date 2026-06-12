const fs   = require('fs');
const path = require('path');

const RATINGS_FILE = path.join(__dirname, '../../data/ratings.json');

let _ratings = null;
function loadRatings() {
  if (_ratings) return _ratings;
  try {
    if (fs.existsSync(RATINGS_FILE)) {
      _ratings = JSON.parse(fs.readFileSync(RATINGS_FILE, 'utf8'));
      return _ratings;
    }
  } catch {}
  return {};
}

// Position-median fallbacks (if a player has no rating in ratings.json)
const POSITION_DEFAULTS = {
  GK:  { pac: 57, sho: 25, pas: 74, dri: 62, def: 84, phy: 80, ovr: 80, health: 90 },
  CB:  { pac: 76, sho: 42, pas: 74, dri: 70, def: 83, phy: 82, ovr: 80, health: 90 },
  FB:  { pac: 82, sho: 58, pas: 76, dri: 76, def: 78, phy: 78, ovr: 78, health: 90 },
  RB:  { pac: 82, sho: 58, pas: 76, dri: 76, def: 78, phy: 78, ovr: 78, health: 90 },
  LB:  { pac: 82, sho: 58, pas: 76, dri: 76, def: 78, phy: 78, ovr: 78, health: 90 },
  CM:  { pac: 74, sho: 72, pas: 82, dri: 78, def: 74, phy: 78, ovr: 78, health: 90 },
  CDM: { pac: 72, sho: 68, pas: 80, dri: 76, def: 82, phy: 82, ovr: 78, health: 90 },
  CAM: { pac: 76, sho: 78, pas: 84, dri: 82, def: 58, phy: 70, ovr: 80, health: 90 },
  W:   { pac: 88, sho: 76, pas: 78, dri: 84, def: 42, phy: 68, ovr: 78, health: 90 },
  RW:  { pac: 88, sho: 76, pas: 78, dri: 84, def: 42, phy: 68, ovr: 78, health: 90 },
  LW:  { pac: 88, sho: 76, pas: 78, dri: 84, def: 42, phy: 68, ovr: 78, health: 90 },
  ST:  { pac: 80, sho: 82, pas: 72, dri: 76, def: 42, phy: 76, ovr: 78, health: 90 },
};

function lookupKey(teamCode, playerName) {
  return `${teamCode}|${playerName}`;
}
function posDefault(pos) {
  const p = (pos || '').toUpperCase();
  return POSITION_DEFAULTS[p] || POSITION_DEFAULTS.CM;
}

function mergePlayer(player, teamCode) {
  const ratings = loadRatings();
  const key  = lookupKey(teamCode, player.n || player.name || '');
  const base = ratings[key] || posDefault(player.pos);
  return { ...base, health: 90, ...player, ...base };  // ratings override fallback; player fields (n/pos/num) kept
}

function mergeOne(team) {
  if (!team || !team.players) return team;
  return {
    ...team,
    players: team.players.map(p => mergePlayer(p, team.code)),
    subs:    (team.subs || []).map(p => mergePlayer(p, team.code)),
  };
}

function mergeAll(teams) {
  const result = {};
  for (const [code, team] of Object.entries(teams)) {
    result[code] = mergeOne(team);
  }
  return result;
}

module.exports = { mergeOne, mergeAll };
