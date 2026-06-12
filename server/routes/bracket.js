const router  = require('express').Router();
const { GROUPS, FIXTURES, TEAMS } = require('../services/syntheticData');
const simEngine = require('../services/simEngine');

function buildBracket() {
  const rounds = [
    {id:'R32', label:'Round of 32', matches: FIXTURES.filter(f => f.group === 'R32')},
    {id:'QF',  label:'Quarter-Finals', matches: FIXTURES.filter(f => f.group === 'QF')},
    {id:'SF',  label:'Semi-Finals', matches: FIXTURES.filter(f => f.group === 'SF')},
    {id:'F',   label:'Final', matches: FIXTURES.filter(f => f.group === 'F')},
  ];
  return { groups: GROUPS, rounds };
}

router.get('/', (req, res) => res.json(buildBracket()));

router.post('/sim', (req, res, next) => {
  try {
    const bracket = buildBracket();
    const resolved = simEngine.simulateBracket(bracket);
    res.json(resolved);
  } catch (err) { next(err); }
});

module.exports = router;
