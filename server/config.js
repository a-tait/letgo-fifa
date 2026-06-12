require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

module.exports = {
  port: parseInt(process.env.PORT || '3000'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  apifootball: {
    key: process.env.APIFOOTBALL_KEY || '',
    baseUrl: 'https://v3.football.api-sports.io',
    wc26LeagueId: parseInt(process.env.WC26_LEAGUE_ID || '1'),
    dailyQuota: 100,
  },
  guardian: {
    key: process.env.GUARDIAN_KEY || '',
    baseUrl: 'https://content.guardianapis.com',
  },
  reddit: {
    clientId: process.env.REDDIT_CLIENT_ID || '',
    clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    userAgent: process.env.REDDIT_USER_AGENT || 'diadia/0.1',
  },
  ttl: {
    teams:     86400,  // 24h — served from snapshot
    fixtures:  3600,   // 1h
    live:      45,     // 45s — only while live
    news:      7200,   // 2h
    sentiment: 21600,  // 6h
    bracket:   3600,   // 1h
  },
};
