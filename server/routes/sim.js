const router    = require('express').Router();
const simEngine = require('../services/simEngine');

// POST /api/sim  — server-side simulation (for bracket batch + persistence)
// body: { homeCode, awayCode, factors, overrides }
router.post('/', (req, res, next) => {
  try {
    const { homeCode, awayCode, factors = {}, overrides = {} } = req.body;
    if (!homeCode || !awayCode) {
      return res.status(400).json({ error: 'homeCode and awayCode required' });
    }
    const result = simEngine.run(homeCode, awayCode, factors, overrides);
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
