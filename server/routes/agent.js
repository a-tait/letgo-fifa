const router     = require('express').Router();
const Anthropic  = require('@anthropic-ai/sdk');
const { TEAMS, FIXTURES, GROUPS, LIVE_EVENTS } = require('../services/syntheticData');

const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'get_team_info',
    description: 'Get detailed info about a team: squad, ratings, form, sentiment, coach. Use when user asks about a team.',
    input_schema: {
      type: 'object',
      properties: {
        team_code: { type: 'string', description: 'Three-letter team code e.g. ARG, FRA, USA, ENG, BRA, ESP, GER, POR' }
      },
      required: ['team_code']
    }
  },
  {
    name: 'get_fixtures',
    description: 'Get upcoming and live fixtures, optionally filtered by team.',
    input_schema: {
      type: 'object',
      properties: {
        team_code: { type: 'string', description: 'Optional: filter by team code' },
        status: { type: 'string', enum: ['live', 'upcoming', 'final', 'all'], description: 'Filter by status' }
      }
    }
  },
  {
    name: 'get_standings',
    description: 'Get group stage standings for a specific group or all groups.',
    input_schema: {
      type: 'object',
      properties: {
        group: { type: 'string', description: 'Group letter e.g. A, B, C. Omit for all groups.' }
      }
    }
  },
  {
    name: 'get_live_events',
    description: 'Get live match events for a currently playing fixture.',
    input_schema: {
      type: 'object',
      properties: {
        fixture_id: { type: 'string', description: 'Fixture ID e.g. m1, m2' }
      },
      required: ['fixture_id']
    }
  },
  {
    name: 'compare_teams',
    description: 'Compare two teams head-to-head: ratings, key players, strengths/weaknesses.',
    input_schema: {
      type: 'object',
      properties: {
        team_a: { type: 'string', description: 'First team code' },
        team_b: { type: 'string', description: 'Second team code' }
      },
      required: ['team_a', 'team_b']
    }
  },
  // ── Simulation action tools (frontend executes these) ──────────────────────
  {
    name: 'set_team_fitness',
    description: 'Adjust a team\'s fitness/health factor in the simulation. 1.0 = 100% fit, 0.7 = heavily fatigued, 1.15 = peak condition.',
    input_schema: {
      type: 'object',
      properties: {
        side: { type: 'string', enum: ['home', 'away'], description: 'Which team in the current match' },
        value: { type: 'number', description: 'Fitness factor between 0.7 and 1.15' }
      },
      required: ['side', 'value']
    }
  },
  {
    name: 'set_team_skill',
    description: 'Adjust a team\'s skill/form boost in the simulation. 1.0 = normal, >1.0 = boosted (e.g. inspired), <1.0 = off form.',
    input_schema: {
      type: 'object',
      properties: {
        side: { type: 'string', enum: ['home', 'away'], description: 'Which team' },
        value: { type: 'number', description: 'Skill factor between 0.7 and 1.15' }
      },
      required: ['side', 'value']
    }
  },
  {
    name: 'make_substitution',
    description: 'Sub a player into the simulation for the current match.',
    input_schema: {
      type: 'object',
      properties: {
        side: { type: 'string', enum: ['home', 'away'] },
        sub_number: { type: 'number', description: 'Squad number of the substitute player to bring on' }
      },
      required: ['side', 'sub_number']
    }
  },
  {
    name: 'control_simulation',
    description: 'Control simulation playback: play, pause, reset, or change speed.',
    input_schema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['play', 'pause', 'reset'] },
        speed: { type: 'number', description: 'Optional: set speed multiplier (4=1×, 8=2×, 20=5×, 45=instant)' }
      },
      required: ['action']
    }
  },
  {
    name: 'navigate_to',
    description: 'Navigate the app to a specific screen.',
    input_schema: {
      type: 'object',
      properties: {
        screen: { type: 'string', enum: ['dashboard', 'sim', 'bracket'] }
      },
      required: ['screen']
    }
  }
];

// ─── Tool execution (server-side read tools) ────────────────────────────────
function executeTool(name, input) {
  switch (name) {
    case 'get_team_info': {
      const t = TEAMS[input.team_code?.toUpperCase()];
      if (!t) return { error: `Team ${input.team_code} not found. Available: ${Object.keys(TEAMS).join(', ')}` };
      return {
        code: t.code, name: t.name, flag: t.flag, group: t.group,
        rank: t.rank, rating: t.rating, form: t.form.join(''),
        coach: t.coach, titles: t.titles, sentiment: t.sentiment,
        nickname: t.nickname,
        squad: t.players.map(p => ({ name: p.n, pos: p.pos, num: p.num, ovr: p.ovr, health: p.health })),
        subs: t.subs.map(p => ({ name: p.n, pos: p.pos, num: p.num, ovr: p.ovr })),
        top_player: t.players.reduce((a, b) => b.ovr > a.ovr ? b : a),
      };
    }
    case 'get_fixtures': {
      let fixtures = FIXTURES;
      if (input.team_code) {
        const c = input.team_code.toUpperCase();
        fixtures = fixtures.filter(f => f.home === c || f.away === c);
      }
      if (input.status && input.status !== 'all') {
        fixtures = fixtures.filter(f => f.status === input.status);
      }
      return fixtures.map(f => ({
        id: f.id, home: f.home, away: f.away, group: f.group,
        date: f.date, time: f.time, venue: f.venue,
        status: f.status, score: f.status !== 'upcoming' ? `${f.hs}-${f.as}` : null,
        minute: f.minute || null
      }));
    }
    case 'get_standings': {
      if (input.group) {
        const g = GROUPS[input.group.toUpperCase()];
        return g ? { [input.group.toUpperCase()]: g } : { error: 'Group not found' };
      }
      return GROUPS;
    }
    case 'get_live_events': {
      const events = LIVE_EVENTS[input.fixture_id];
      if (!events) return { error: `No live events for fixture ${input.fixture_id}` };
      return events;
    }
    case 'compare_teams': {
      const a = TEAMS[input.team_a?.toUpperCase()];
      const b = TEAMS[input.team_b?.toUpperCase()];
      if (!a) return { error: `Team ${input.team_a} not found` };
      if (!b) return { error: `Team ${input.team_b} not found` };
      const avgAttr = (t, attr) => Math.round(t.players.reduce((s, p) => s + (p[attr] || 0), 0) / t.players.length);
      return {
        [a.code]: {
          name: a.name, rank: a.rank, rating: a.rating, form: a.form.join(''),
          avg_attack: avgAttr(a, 'sho'), avg_defence: avgAttr(a, 'def'),
          avg_pace: avgAttr(a, 'pac'), sentiment: a.sentiment,
          key_player: a.players.reduce((x, y) => y.ovr > x.ovr ? y : x).n
        },
        [b.code]: {
          name: b.name, rank: b.rank, rating: b.rating, form: b.form.join(''),
          avg_attack: avgAttr(b, 'sho'), avg_defence: avgAttr(b, 'def'),
          avg_pace: avgAttr(b, 'pac'), sentiment: b.sentiment,
          key_player: b.players.reduce((x, y) => y.ovr > x.ovr ? y : x).n
        },
        verdict: a.rating > b.rating
          ? `${a.name} are rated higher (${a.rating} vs ${b.rating})`
          : `${b.name} are rated higher (${b.rating} vs ${a.rating})`
      };
    }
    // Sim action tools return as frontend actions — server just echoes them
    default:
      return { action_dispatched: true };
  }
}

// ─── POST /api/agent ─────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not set in .env' });
  }

  try {
    const { messages, context = {} } = req.body;

    // Build context string from current app state
    const ctxLines = [];
    if (context.screen)      ctxLines.push(`Current screen: ${context.screen}`);
    if (context.activeTeam)  ctxLines.push(`Active team: ${context.activeTeam}`);
    if (context.simMatch)    ctxLines.push(`Sim match: ${context.simMatch}`);
    if (context.simClock != null) ctxLines.push(`Sim clock: ${Math.floor(context.simClock)}'`);
    if (context.score)       ctxLines.push(`Current score: ${context.score}`);
    if (context.factors)     ctxLines.push(`Sim factors: ${JSON.stringify(context.factors)}`);
    if (context.homeTeam)    ctxLines.push(`Home team: ${context.homeTeam}`);
    if (context.awayTeam)    ctxLines.push(`Away team: ${context.awayTeam}`);

    const systemPrompt = `You are Cuppy ⚽, the AI assistant for PITCH '26 — the FIFA World Cup 2026 live tracker and match simulator. You're enthusiastic, knowledgeable about football, and concise.

You can:
- Answer questions about any WC26 team, player, stats, fixtures, standings, and live events
- Compare teams and predict match outcomes
- Take direct actions in the simulation: adjust team fitness/skill, make substitutions, control playback, navigate screens

${ctxLines.length ? `\n## Current app state\n${ctxLines.join('\n')}\n` : ''}

Always be concise. For sim actions, do them immediately without asking for confirmation unless the action would be destructive. Use emoji sparingly but effectively. When you take an action, briefly confirm what you did.`;

    // Agentic loop
    let apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
    const frontendActions = [];

    let response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages: apiMessages,
    });

    // Loop while model wants to use tools
    while (response.stop_reason === 'tool_use') {
      const toolUses = response.content.filter(b => b.type === 'tool_use');
      const toolResults = [];

      for (const toolUse of toolUses) {
        const isSimAction = ['set_team_fitness','set_team_skill','make_substitution','control_simulation','navigate_to'].includes(toolUse.name);

        let result;
        if (isSimAction) {
          // These are executed by the frontend
          frontendActions.push({ tool: toolUse.name, input: toolUse.input });
          result = { dispatched: true, tool: toolUse.name, input: toolUse.input };
        } else {
          result = executeTool(toolUse.name, toolUse.input);
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      // Continue the agentic loop
      apiMessages = [
        ...apiMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];

      response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        tools: TOOLS,
        messages: apiMessages,
      });
    }

    const text = response.content.find(b => b.type === 'text')?.text || '';
    res.json({ reply: text, actions: frontendActions });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
