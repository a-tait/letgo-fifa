/**
 * Server-side simulation engine — xG/possession-sequence model.
 * Return shape FROZEN: {events, finalHome, finalAway, hxg, axg, possHome}
 */
const { TEAMS } = require('./syntheticData');

const XG_DIST = { meanXg: 0.11, sdXg: 0.09, chanceRate: 0.28 };

function makeRng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function sampleXg(rng, mean, sd) {
  const u1 = Math.max(1e-9, rng()), u2 = rng();
  const n  = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0.01, Math.min(0.85, mean + n * sd));
}

function teamStrength(players, factors, side) {
  const health = (side === 'home' ? factors.healthHome : factors.healthAway) || 1;
  const skill  = (side === 'home' ? factors.skillHome  : factors.skillAway)  || 1;
  let atk = 0, def = 0;
  for (const p of players) {
    const w = ((p.health || 90) / 100) * health;
    atk += (p.sho * 0.5 + p.dri * 0.3 + p.pas * 0.2) * w;
    def += (p.def * 0.6 + p.phy * 0.4) * w;
  }
  return { atk: (atk / players.length) * skill, def: def / players.length };
}

function pickScorer(players, rng) {
  const outfield = players.filter(p => p.pos !== 'GK');
  const weights  = outfield.map(p => Math.pow(p.sho || 70, 2) *
    (['ST','RW','LW','CAM'].includes(p.pos) ? 2 : 0.6));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < outfield.length; i++) { r -= weights[i]; if (r <= 0) return outfield[i].n || 'Unknown'; }
  return outfield[0]?.n || 'Unknown';
}

function buildTimeline(homePlayers, awayPlayers, factors = {}) {
  const seed = Math.round(
    ((factors.healthHome || 1) + (factors.skillHome || 1)) * 50000 +
    ((factors.healthAway || 1) + (factors.skillAway || 1)) * 3000
  );
  const rng = makeRng(seed);
  const hS  = teamStrength(homePlayers, factors, 'home');
  const aS  = teamStrength(awayPlayers, factors, 'away');

  const midRatio = hS.atk / (hS.atk + aS.atk);
  const possHome = Math.round(Math.max(30, Math.min(70, midRatio * 100)));
  const total    = 100 + Math.round(rng() * 10);
  const hPoss    = Math.round(total * (possHome / 100));
  const aPoss    = total - hPoss;

  const timeline = [];
  for (let i = 0; i < hPoss; i++)
    timeline.push({ min: Math.min(90, Math.round((i / hPoss) * 90) + 1 + Math.round(rng() * 3)), side: 'home' });
  for (let i = 0; i < aPoss; i++)
    timeline.push({ min: Math.min(90, Math.round((i / aPoss) * 90) + 1 + Math.round(rng() * 3)), side: 'away' });
  timeline.sort((a, b) => a.min - b.min);

  const events = [];
  let hs = 0, as = 0, hxg = 0, axg = 0;

  for (const poss of timeline) {
    const isHome = poss.side === 'home';
    const atkStr = isHome ? hS.atk : aS.atk;
    const defStr = isHome ? aS.def : hS.def;
    const shotP  = Math.min(0.55, XG_DIST.chanceRate * (atkStr / defStr));
    if (rng() < shotP) {
      const xg = sampleXg(rng, XG_DIST.meanXg * (atkStr / 82), XG_DIST.sdXg);
      if (isHome) hxg += xg; else axg += xg;
      if (rng() < xg) {
        const scorer = pickScorer(isHome ? homePlayers : awayPlayers, rng);
        if (isHome) hs++; else as++;
        events.push({ min: poss.min, team: poss.side, type: 'goal', scorer });
      } else if (xg > 0.2) {
        events.push({ min: poss.min, team: poss.side, type: 'chance' });
      }
    }
  }
  for (let m = 1; m <= 90; m++)
    if (rng() < 0.010) events.push({ min: m, team: rng() < 0.5 ? 'home' : 'away', type: 'yellow' });

  events.sort((a, b) => a.min - b.min);
  return { events, finalHome: hs, finalAway: as, hxg: hxg.toFixed(2), axg: axg.toFixed(2), possHome };
}

function getXI(code, side, overrides = {}) {
  const team = TEAMS[code];
  if (!team) return Array(11).fill({ pac:75, sho:75, pas:75, dri:75, def:75, phy:75, health:90, pos:'CM', n:'Player' });
  const xi = team.players.map(p => ({ ...p }));
  Object.entries(overrides[side] || {}).forEach(([outNum, sub]) => {
    const idx = xi.findIndex(p => p.num == outNum);
    if (idx >= 0) xi[idx] = { ...sub };
  });
  return xi.slice(0, 11);
}

function run(homeCode, awayCode, factors = {}, overrides = {}) {
  return buildTimeline(getXI(homeCode, 'home', overrides), getXI(awayCode, 'away', overrides), factors);
}

function simulateBracket(bracket) {
  const resolved = JSON.parse(JSON.stringify(bracket));
  for (const round of resolved.rounds || []) {
    for (const match of round.matches) {
      if (!match.home || !match.away || match.winner) continue;
      const result = run(match.home, match.away);
      match.hs     = result.finalHome;
      match.as     = result.finalAway;
      match.winner = result.finalHome >= result.finalAway ? match.home : match.away;
    }
  }
  return resolved;
}

module.exports = { buildTimeline, run, simulateBracket };
