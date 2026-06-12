const router  = require('express').Router();
const { LIVE_EVENTS } = require('../services/syntheticData');

router.get('/:id', (req, res) => {
  const events = LIVE_EVENTS[req.params.id];
  if (!events) return res.status(404).json({ error: 'No live events for this fixture' });
  res.json({ events });
});

module.exports = router;
