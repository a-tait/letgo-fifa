const router  = require('express').Router();
const { SENTIMENT_TREND, TEAMS } = require('../services/syntheticData');

router.get('/:team', (req, res) => {
  const code = req.params.team.toUpperCase();
  const trend = SENTIMENT_TREND[code] || [70,70,70,70,70,70,70];
  const current = trend[trend.length - 1] || (TEAMS[code]?.sentiment || 70);
  res.json({ sentiment: current, trend });
});

module.exports = router;
