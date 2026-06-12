/* ============================================================
   bracket.js — WC26 knockout bracket UI + sim-to-advance
   Requires: window.WC (teams/fixtures), window.App (simFor)
   ============================================================ */
(function() {
  const ROUND_LABELS = { R32: 'Round of 32', QF: 'Quarter-Finals', SF: 'Semi-Finals', F: 'Final' };

  function teamInfo(code) {
    if (!code || !window.WC?.TEAMS) return { flag: '🏳️', name: code || '?' };
    return window.WC.TEAMS[code] || { flag: '🏳️', name: code };
  }

  function matchCardHTML(m, roundId) {
    const h = teamInfo(m.home), a = teamInfo(m.away);
    const done = m.winner || m.status === 'final';
    const isLive = m.status === 'live';
    const hWin = m.winner === m.home;
    const aWin = m.winner === m.away;
    return `
      <div class="bracket-match" id="bm_${m.id}" style="background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:14px;min-width:200px">
        <div class="bm-team" style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;${hWin?'color:var(--accent);font-weight:800':''}">
          <span>${h.flag} ${h.name || m.home}</span>
          ${done ? `<span style="font-family:var(--pixel);font-size:12px">${m.hs ?? ''}</span>` : ''}
        </div>
        <div style="height:1px;background:var(--line);margin:2px 0"></div>
        <div class="bm-team" style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;${aWin?'color:var(--accent);font-weight:800':''}">
          <span>${a.flag} ${a.name || m.away}</span>
          ${done ? `<span style="font-family:var(--pixel);font-size:12px">${m.as ?? ''}</span>` : ''}
        </div>
        ${!done && m.home && m.away ? `
          <button onclick="App.simFor('${m.id}')" style="width:100%;margin-top:10px;font-size:10px;font-weight:700;padding:7px;border-radius:8px;border:1px solid var(--accent);background:transparent;color:var(--accent);cursor:pointer">▶ Simulate</button>
        ` : ''}
        ${isLive ? '<div class="livebadge" style="margin-top:8px"><span class="d"></span>LIVE</div>' : ''}
        ${m.venue ? `<div style="font-size:9px;color:var(--dim);margin-top:6px">${m.venue}</div>` : ''}
      </div>`;
  }

  function groupStandingsHTML(groups) {
    if (!groups) return '';
    const codes = Object.keys(groups).sort();
    return `
      <div style="margin-bottom:24px">
        <div class="eyebrow">▸ GROUP STAGE</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-top:12px">
          ${codes.map(g => `
            <div class="card">
              <h3>Group ${g}</h3>
              <table class="stand" style="font-size:12px">
                <tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>
                ${(groups[g] || []).map(r => {
                  const t = teamInfo(r.t);
                  const isMe = (window.App?.state?.selected || []).includes(r.t);
                  return `<tr${isMe?' class="me"':''}>
                    <td><span>${t.flag}</span> ${t.name || r.t}</td>
                    <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd}</td><td class="pts">${r.pts}</td>
                  </tr>`;
                }).join('')}
              </table>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderBracket() {
    const el = document.getElementById('bracketContent');
    if (!el) return;
    const wc   = window.WC;
    if (!wc) { el.innerHTML = '<p style="color:var(--muted)">Loading bracket...</p>'; return; }

    const fixtures = wc.FIXTURES || [];
    const groups   = wc.GROUPS   || {};
    const roundIds = ['R32', 'QF', 'SF', 'F'];
    const selected = window.App?.state?.selected || [];

    const roundsHtml = roundIds.map(id => {
      const matches = fixtures.filter(f => f.group === id);
      if (!matches.length) return '';
      return `
        <div style="margin-bottom:30px">
          <div class="eyebrow">▸ ${ROUND_LABELS[id] || id}</div>
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:12px">
            ${matches.map(m => {
              // Highlight if user's team is involved
              const mine = selected.includes(m.home) || selected.includes(m.away);
              return `<div style="${mine ? 'box-shadow:0 0 0 2px var(--accent)' : ''};border-radius:14px">${matchCardHTML(m, id)}</div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');

    el.innerHTML = groupStandingsHTML(groups) + roundsHtml;
  }

  // Re-render bracket after a sim completes (called by App after finalWhistle)
  function refreshBracket() {
    if (document.getElementById('bracket')?.classList.contains('hide')) return;
    renderBracket();
  }

  window.BracketUI = { renderBracket, refreshBracket };
})();
