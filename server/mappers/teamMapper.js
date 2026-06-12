/**
 * Map API-Football /teams response → window.WC TEAMS shape.
 *
 * API-Football team object (v3):
 * { team: {id, name, code, country, logo}, venue: {...} }
 *
 * Squad (from /players/squads): [{ team, players: [{id, name, age, number, position, ...}] }]
 *
 * We merge in squad data separately (loaded by snapshot-teams.js).
 */

const FLAG_MAP = {
  Argentina:'🇦🇷', France:'🇫🇷', Brazil:'🇧🇷', England:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', Spain:'🇪🇸',
  'United States':'🇺🇸', USA:'🇺🇸', Portugal:'🇵🇹', Germany:'🇩🇪',
  Netherlands:'🇳🇱', Italy:'🇮🇹', Belgium:'🇧🇪', Croatia:'🇭🇷', Uruguay:'🇺🇾',
  Mexico:'🇲🇽', Colombia:'🇨🇴', Morocco:'🇲🇦', Senegal:'🇸🇳', Japan:'🇯🇵',
  'South Korea':'🇰🇷', Australia:'🇦🇺', Ecuador:'🇪🇨', Canada:'🇨🇦',
  Switzerland:'🇨🇭', Denmark:'🇩🇰', Poland:'🇵🇱', Serbia:'🇷🇸',
  Cameroon:'🇨🇲', Ghana:'🇬🇭', Tunisia:'🇹🇳', 'Saudi Arabia':'🇸🇦',
  Qatar:'🇶🇦', Iran:'🇮🇷', 'Costa Rica':'🇨🇷', Wales:'🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'New Zealand':'🇳🇿', Panama:'🇵🇦', Honduras:'🇭🇳', Jamaica:'🇯🇲',
};

const COLOR_MAP = {
  ARG: { primary: '#6CA8DC', secondary: '#FFFFFF', accent: '#F4C430' },
  FRA: { primary: '#1E3A8A', secondary: '#FFFFFF', accent: '#EF4444' },
  BRA: { primary: '#FCD116', secondary: '#009C3B', accent: '#002776' },
  ENG: { primary: '#FFFFFF', secondary: '#CE1124', accent: '#1E3A8A' },
  ESP: { primary: '#C60B1E', secondary: '#FFC400', accent: '#1E3A8A' },
  USA: { primary: '#0A3161', secondary: '#FFFFFF', accent: '#B31942' },
  POR: { primary: '#006600', secondary: '#FF0000', accent: '#FFD700' },
  GER: { primary: '#000000', secondary: '#DD0000', accent: '#FFCE00' },
};

function posNormalize(apiPos) {
  const p = (apiPos || '').toLowerCase();
  if (p.includes('goalkeeper'))  return 'GK';
  if (p.includes('centre-back') || p.includes('center back')) return 'CB';
  if (p.includes('back'))        return p.includes('right') ? 'RB' : 'LB';
  if (p.includes('defensive') && p.includes('midfield')) return 'CDM';
  if (p.includes('attacking') && p.includes('midfield')) return 'CAM';
  if (p.includes('midfield'))    return 'CM';
  if (p.includes('right winger') || p.includes('right wing')) return 'RW';
  if (p.includes('left winger')  || p.includes('left wing'))  return 'LW';
  if (p.includes('attacker') || p.includes('forward') || p.includes('striker')) return 'ST';
  return 'CM';
}

function mapPlayer(p) {
  return {
    n:      p.name || p.player?.name || 'Unknown',
    pos:    posNormalize(p.position || p.player?.position),
    num:    p.number || p.player?.number || 0,
    age:    p.age   || p.player?.age || 25,
    // ratings filled in by ratings service — defaults prevent crashes
    ovr: 78, pac: 75, sho: 72, pas: 74, dri: 74, def: 70, phy: 74, health: 90,
  };
}

function mapTeam(raw, squadPlayers = []) {
  const t    = raw.team || raw;
  const code = t.code || t.tla || '';
  const colors = COLOR_MAP[code] || { primary: '#3b82f6', secondary: '#ffffff', accent: '#ffd23f' };
  return {
    code,
    name:      t.name,
    flag:      FLAG_MAP[t.name] || FLAG_MAP[t.country] || '🏳️',
    group:     t.group || 'A',
    primary:   colors.primary,
    secondary: colors.secondary,
    accent:    colors.accent,
    rank:      t.rank || 20,
    rating:    78,
    form:      ['W', 'D', 'W', 'W', 'D'],
    nickname:  t.nickname || t.name,
    coach:     t.coach || 'TBC',
    titles:    t.titles || 0,
    sentiment: 75,
    players:   squadPlayers.slice(0, 11).map(mapPlayer),
    subs:      squadPlayers.slice(11, 18).map(mapPlayer),
  };
}

function mapAll(rawArray) {
  const result = {};
  for (const item of rawArray) {
    const team = mapTeam(item);
    if (team.code) result[team.code] = team;
  }
  return result;
}

module.exports = { mapTeam, mapAll, mapPlayer, posNormalize };
