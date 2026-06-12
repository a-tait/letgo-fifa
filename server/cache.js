const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const mem = new NodeCache({ useClones: false });
const CACHE_DIR = path.join(__dirname, '../data/cache');
const SNAP_DIR  = path.join(__dirname, '../data/snapshots');

// Ensure cache dir exists at startup
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function diskPath(key) {
  return path.join(CACHE_DIR, key.replace(/[^a-z0-9_-]/gi, '_') + '.json');
}
function snapPath(file) {
  return path.join(SNAP_DIR, file);
}

function readDisk(key) {
  try {
    const p = diskPath(key);
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {}
  return null;
}
function writeDisk(key, data) {
  try { fs.writeFileSync(diskPath(key), JSON.stringify(data)); } catch {}
}
function readSnap(file) {
  try {
    const p = snapPath(file);
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {}
  return null;
}

/**
 * Wrap a fetch function with memory + disk caching and a snapshot fallback.
 * @param {string} key         - cache key
 * @param {number} ttl         - TTL in seconds
 * @param {Function} fetchFn   - async () => data
 * @param {string} [snapFile]  - filename in data/snapshots/ to fall back to
 */
async function wrap(key, ttl, fetchFn, snapFile) {
  const hit = mem.get(key);
  if (hit !== undefined) return hit;

  try {
    const data = await fetchFn();
    if (data !== null && data !== undefined) {
      mem.set(key, data, ttl);
      writeDisk(key, data);
      return data;
    }
  } catch (err) {
    console.warn(`[cache] fetch failed for "${key}": ${err.message}`);
  }

  // Fallbacks: disk cache → committed snapshot
  const disk = readDisk(key);
  if (disk) { mem.set(key, disk, ttl); return disk; }
  if (snapFile) {
    const snap = readSnap(snapFile);
    if (snap) { mem.set(key, snap, ttl); return snap; }
  }
  return null;
}

function invalidate(key) { mem.del(key); }

module.exports = { wrap, invalidate, readSnap, writeDisk };
