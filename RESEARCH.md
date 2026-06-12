# PITCH '26 — Data Sourcing & Architecture Research

> **Status:** Knowledge-based (assistant cutoff Jan 2026). Live web verification
> was unavailable in this environment, so **verify every price / rate-limit /
> 2026-coverage claim against the vendor's current page before relying on it.**

The app needs five data domains: (1) **live match events & fixtures**,
(2) **player attributes** for the simulation engine, (3) **xG / advanced stats**,
(4) **news**, (5) **fan sentiment**.

---

## 1. Live match events & fixtures

| Provider | What you get | Free tier | Scale / cost | Notes |
|---|---|---|---|---|
| **API-Football** (api-sports.io, also on RapidAPI) | Fixtures, live scores, in-play **events**, lineups, player stats, standings, odds, predictions | ~100 req/day free | Paid tiers from ~low tens USD/mo (thousands of req/day) | **Best starting point.** WC is a covered competition. Clean JSON. |
| **football-data.org** | Standings, fixtures, scorers, teams | Free token, ~10 req/min | Paid tier for more comps | Easiest to start, but **WC coverage often needs a paid tier — verify.** |
| **SportMonks** | Fixtures, lineups, **xG**, pressure index, predictions | Very limited free (2 leagues) | Paid; WC may be add-on | Good mid-tier production option. |
| **Opta / Stats Perform** | Broadcast-grade event granularity, official feeds | None | Enterprise contract, $$$$ | The gold standard; overkill unless funded. |
| **Sportradar** | Official-grade live data; **FIFA data partner** | None | Enterprise contract, $$$$ | What broadcasters use. Production-at-scale only. |
| **FIFA official** | — | — | — | **No public dev API.** FIFA licenses via partners (Sportradar et al.). |

**Pick:** API-Football free → API-Football paid or SportMonks for production →
Sportradar/Opta only if funded.

## 2. Player attributes (simulation engine inputs)

- **EA Sports FC ("FIFA") ratings** are the de-facto attribute set (PAC/SHO/PAS/DRI/DEF/PHY).
  ⚠️ **EA has no public API and their ToS prohibit scraping / commercial reuse.**
  **SoFIFA** mirrors them (also scraped). Fine for a **private demo**, a real legal
  risk in a shipped product.
- **Legally safer:** build your **own attribute model** from open performance data
  (FBref/StatsBomb) + **Kaggle "FIFA player" datasets** for historical/academic use.
- This mockup ships **fictional, hand-authored ratings** (`data.js`) to sidestep this entirely.

## 3. xG / advanced stats

- **StatsBomb Open Data** (free GitHub repo) — event-level data incl. xG for select
  competitions (some World Cups). Best free source; attribution required, check terms.
- **Understat** (`understat` py lib) — free xG, club leagues (not WC).
- **FBref** via **worldfootballR** (R) — broad, Opta-derived; respect rate limits.
- **Opta** — licensed gold standard.

## 4. News

- **Guardian Open Platform** — free key, generous, excellent football section. **Best free news source.**
- **NewsAPI.org** — free dev tier (non-commercial, 100 req/day, 24h delay).
- **GNews** — small free tier.

## 5. Fan sentiment

- **Reddit API** (r/soccer) — free tier exists (post-2023 pricing), OAuth + rate limited.
- **X/Twitter API** — paid only now (Basic ~$100+/mo); usually not worth it for a demo.
- **Sentiment model:** run a transformer locally (`cardiffnlp/twitter-roberta-base-sentiment`)
  or an LLM over fetched text — don't pay for a sentiment API.

---

## Recommended stacks

**Hackathon / mockup (all free, fast to wire):**
API-Football (free) · StatsBomb open data (xG) · Guardian API (news) ·
Reddit API (sentiment) · Kaggle FIFA dataset (sim demo only).

**Production:**
SportMonks or paid API-Football (live) — Sportradar/Opta if funded · Guardian +
NewsAPI paid (news) · LLM/transformer sentiment pipeline · **self-built ratings model**
on open/licensed performance data (avoid EA legal exposure).

## Simulation engine — modelling approach

The 3D sim in this mockup is driven by a lightweight **Poisson + team-strength**
model (see `sim.js`): each team's attack/defence strength is derived from the
selected XI's aggregated attributes, modified by the live "factors" sliders
(player health, skill, subs). Per-minute scoring chances are sampled and the goal
clock is animated. For production, upgrade to an **xG-based possession model**
(StatsBomb event sequences → shot probability per possession) or a learned model.
