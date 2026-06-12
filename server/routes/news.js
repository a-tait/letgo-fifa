const router  = require('express').Router();
const { NEWS } = require('../services/syntheticData');

router.get('/:team', (req, res) => {
  const code = req.params.team.toUpperCase();
  res.json(NEWS[code] || []);
});

module.exports = router;
