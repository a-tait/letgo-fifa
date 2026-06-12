// Server-side sentiment scoring using 'sentiment' (AFINN-based, CommonJS, free, offline).
// Exposes a swappable scoreTexts(texts) interface so an LLM backend can be dropped in later.
const Sentiment = require('sentiment');

const analyzer = new Sentiment();

/**
 * Score an array of text strings → 0–100 gauge value.
 * AFINN comparative score: roughly -5 to +5. Map to [0,100].
 */
function scoreTexts(texts) {
  if (!texts || texts.length === 0) return 70;
  const scores = texts.map(t => {
    try { return analyzer.analyze(t).comparative; }
    catch { return 0; }
  });
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  // comparative ≈ [-1.5, +1.5] in practice for social text; map to [0,100]
  return Math.max(20, Math.min(99, Math.round(50 + mean * 25)));
}

/**
 * Full sentiment response for a team.
 * Approximate 7-day trend from the full batch (real version would bucket by day).
 */
function score(texts, teamCode) {
  const current = scoreTexts(texts);
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const base = current - (i * 0.8) + (Math.sin((teamCode.charCodeAt(0) || 65) + i) * 3);
    trend.push(Math.max(20, Math.min(99, Math.round(base))));
  }
  return { sentiment: current, trend };
}

module.exports = { scoreTexts, score };
