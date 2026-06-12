const router  = require('express').Router();
const { FIXTURES } = require('../services/syntheticData');

router.get('/', (req, res) => res.json(FIXTURES));

router.get('/:id', (req, res) => {
  const f = FIXTURES.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: 'Fixture not found' });
  res.json(f);
});

module.exports = router;
