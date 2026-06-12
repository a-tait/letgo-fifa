/**
 * Map API-Football /fixtures/events response → LIVE_EVENTS[id][] shape.
 *
 * API-Football event object:
 * { time:{elapsed}, team:{id,name}, player:{id,name}, assist:{...}, type, detail, comments }
 */

function mapEvent(raw) {
  const type = normaliseType(raw.type, raw.detail);
  const team = raw.team?.name || '';
  const text = buildText(raw);
  return { min: raw.time?.elapsed || 0, type, team, text };
}

function normaliseType(t, detail) {
  const type = (t || '').toLowerCase();
  if (type === 'goal')      return (detail === 'Own Goal') ? 'goal' : 'goal';
  if (type === 'card')      return (detail || '').toLowerCase().includes('yellow') ? 'yellow' : 'red';
  if (type === 'subst')     return 'sub';
  if (type === 'var')       return 'var';
  return 'chance';
}

function buildText(e) {
  const p  = e.player?.name || '';
  const tm = e.team?.name   || '';
  const t  = (e.type  || '').toLowerCase();
  const d  = e.detail || '';
  if (t === 'goal')  return `GOAL! ${p} (${tm}) — ${d}`;
  if (t === 'card')  return `${d} — ${p} (${tm})`;
  if (t === 'subst') return `Substitution — ${p} ON, ${e.assist?.name || '?'} OFF (${tm})`;
  if (t === 'var')   return `VAR: ${d}`;
  return `${d} — ${p}`;
}

function map(rawArray) {
  return {
    events: rawArray.map(mapEvent).sort((a, b) => b.min - a.min),
  };
}

module.exports = { map, mapEvent };
