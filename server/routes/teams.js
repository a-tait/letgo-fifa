const router  = require('express').Router();
const { TEAMS } = require('../services/syntheticData');

router.get('/', (req, res) => res.json(TEAMS));

router.get('/:code', (req, res) => {
  const t = TEAMS[req.params.code.toUpperCase()];
  if (!t) return res.status(404).json({ error: 'Team not found' });
  res.json(t);
});

module.exports = router;
