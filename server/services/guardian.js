const config = require('../config');

// Team name → Guardian search query
const TEAM_QUERIES = {
  ARG: 'Argentina football',
  FRA: 'France football',
  BRA: 'Brazil football',
  ENG: 'England football',
  ESP: 'Spain football',
  USA: 'USA soccer',
  POR: 'Portugal football',
  GER: 'Germany football',
};

// Maps Guardian content API item → NEWS[code][] shape
function mapItem(item) {
  return {
    src: 'The Guardian',
    time: relativeTime(item.webPublicationDate),
    tag: item.sectionName || 'Football',
    title: item.webTitle,
    senti: 'neu',  // sentiment overlaid by sentiment service
    url: item.webUrl,
  };
}

function relativeTime(isoDate) {
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 3600)  return Math.round(diff / 60) + 'm';
  if (diff < 86400) return Math.round(diff / 3600) + 'h';
  return Math.round(diff / 86400) + 'd';
}

async function getTeamNews(teamCode) {
  if (!config.guardian.key) {
    console.warn('[guardian] No API key — returning empty news');
    return [];
  }
  const q = encodeURIComponent((TEAM_QUERIES[teamCode] || teamCode) + ' World Cup 2026');
  const url = `${config.guardian.baseUrl}/search?q=${q}&section=football&page-size=5&api-key=${config.guardian.key}&show-fields=headline,thumbnail,byline`;
  try {
    const res  = await fetch(url);
    const json = await res.json();
    return (json.response?.results || []).map(mapItem);
  } catch (err) {
    console.error('[guardian]', err.message);
    return [];
  }
}

module.exports = { getTeamNews };
