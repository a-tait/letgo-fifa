const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_PATH = path.join(__dirname, '../data/diadia.db');
// Ensure data dir exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Migrations — run on startup, idempotent
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saved_teams (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_code  TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, team_code)
  );

  CREATE TABLE IF NOT EXISTS sim_results (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id    TEXT,
    home_code   TEXT,
    away_code   TEXT,
    final_home  INTEGER,
    final_away  INTEGER,
    hxg         REAL,
    axg         REAL,
    poss_home   INTEGER,
    factors     TEXT,
    overrides   TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS prefs (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data    TEXT
  );
`);

module.exports = db;
