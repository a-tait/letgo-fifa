const config = require('../config');

let tokenCache = null;

const TEAM_NAMES = {
  ARG: ['Argentina', 'Messi', 'La Albiceleste'],
  FRA: ['France', 'Mbappé', 'Mbappe', 'Les Bleus'],
  BRA: ['Brazil', 'Brasil', 'Vinicius', 'Seleção'],
  ENG: ['England', 'Three Lions', 'Bellingham'],
  ESP: ['Spain', 'La Roja', 'Yamal'],
  USA: ['USA', 'USMNT', 'Pulisic'],
  POR: ['Portugal', 'Ronaldo', 'Bernardo'],
  GER: ['Germany', 'Deutschland', 'Musiala'],
};

async function getToken() {
  if (tokenCache && tokenCache.expires > Date.now()) return tokenCache.token;
  if (!config.reddit.clientId) return null;

  const creds = Buffer.from(`${config.reddit.clientId}:${config.reddit.clientSecret}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'User-Agent': config.reddit.userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const json = await res.json();
  tokenCache = { token: json.access_token, expires: Date.now() + (json.expires_in - 60) * 1000 };
  return tokenCache.token;
}

async function fetchTeamMentions(teamCode) {
  const names = TEAM_NAMES[teamCode] || [teamCode];
  const q     = encodeURIComponent(names[0] + ' World Cup');
  const token = await getToken();
  if (!token) return [];

  try {
    const res  = await fetch(
      `https://oauth.reddit.com/r/soccer/search?q=${q}&restrict_sr=1&sort=new&t=week&limit=50`,
      { headers: { 'Authorization': `bearer ${token}`, 'User-Agent': config.reddit.userAgent } }
    );
    const json = await res.json();
    return (json.data?.children || []).map(c => c.data.title + ' ' + (c.data.selftext || ''));
  } catch (err) {
    console.error('[reddit]', err.message);
    return [];
  }
}

module.exports = { fetchTeamMentions };
