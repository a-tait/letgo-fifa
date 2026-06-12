/**
 * Map API-Football /fixtures response → FIXTURES[] shape.
 *
 * API-Football fixture object (v3):
 * { fixture: {id, date, status:{short,elapsed}}, league:{...}, teams:{home:{id,name,code},away:{...}}, goals:{home,away} }
 */

function statusMap(short) {
  if (['1H', '2H', 'HT', 'ET', 'P'].includes(short)) return 'live';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'final';
  return 'upcoming';
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function mapFixture(raw) {
  const f   = raw.fixture || raw;
  const st  = f.status?.short || 'NS';
  return {
    id:     String(f.id),
    home:   (raw.teams?.home?.code || raw.homeTeam?.code || '').toUpperCase(),
    away:   (raw.teams?.away?.code || raw.awayTeam?.code || '').toUpperCase(),
    group:  raw.league?.round || 'Group Stage',
    date:   formatDate(f.date),
    time:   formatTime(f.date),
    venue:  f.venue?.name || raw.venue || '',
    status: statusMap(st),
    hs:     raw.goals?.home ?? 0,
    as:     raw.goals?.away ?? 0,
    minute: f.status?.elapsed || 0,
  };
}

function mapAll(rawArray) {
  return rawArray.map(mapFixture);
}

module.exports = { mapFixture, mapAll };
