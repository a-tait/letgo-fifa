const router = require('express').Router();
const db     = require('../db');
const auth   = require('../auth');

router.use(auth.requireAuth);

// GET /api/me
router.get('/', (req, res) => {
  const user  = db.prepare('SELECT id, email FROM users WHERE id = ?').get(req.userId);
  const prefs = db.prepare('SELECT data FROM prefs WHERE user_id = ?').get(req.userId);
  res.json({ user, prefs: prefs ? JSON.parse(prefs.data) : {} });
});

// GET /api/me/teams
router.get('/teams', (req, res) => {
  const rows = db.prepare(
    'SELECT team_code FROM saved_teams WHERE user_id = ? ORDER BY sort_order'
  ).all(req.userId);
  res.json({ selected: rows.map(r => r.team_code) });
});

// PUT /api/me/teams  — body: { selected: string[] }
router.put('/teams', (req, res) => {
  const { selected = [] } = req.body;
  const del = db.prepare('DELETE FROM saved_teams WHERE user_id = ?');
  const ins = db.prepare('INSERT INTO saved_teams (user_id, team_code, sort_order) VALUES (?,?,?)');
  db.transaction(() => {
    del.run(req.userId);
    selected.forEach((code, i) => ins.run(req.userId, code, i));
  })();
  res.json({ selected });
});

// GET /api/me/results
router.get('/results', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM sim_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.userId);
  res.json(rows.map(r => ({ ...r, factors: JSON.parse(r.factors || '{}'), overrides: JSON.parse(r.overrides || '{}') })));
});

// POST /api/me/results — body: sim result object
router.post('/results', (req, res) => {
  const { match_id, home_code, away_code, final_home, final_away, hxg, axg, poss_home, factors, overrides } = req.body;
  const { lastInsertRowid } = db.prepare(`
    INSERT INTO sim_results (user_id, match_id, home_code, away_code, final_home, final_away, hxg, axg, poss_home, factors, overrides)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(req.userId, match_id, home_code, away_code, final_home, final_away, hxg, axg, poss_home,
      JSON.stringify(factors || {}), JSON.stringify(overrides || {}));
  res.status(201).json({ id: lastInsertRowid });
});

// PUT /api/me/prefs — body: prefs object
router.put('/prefs', (req, res) => {
  db.prepare('INSERT OR REPLACE INTO prefs (user_id, data) VALUES (?,?)').run(req.userId, JSON.stringify(req.body));
  res.json({ ok: true });
});

module.exports = router;
