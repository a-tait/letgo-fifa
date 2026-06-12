const express = require('express');
const path    = require('path');
const cookieParser = require('cookie-parser');
const config  = require('./config');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Serve the frontend from public/
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/teams',     require('./routes/teams'));
app.use('/api/fixtures',  require('./routes/fixtures'));
app.use('/api/live',      require('./routes/live'));
app.use('/api/news',      require('./routes/news'));
app.use('/api/sentiment', require('./routes/sentiment'));
app.use('/api/sim',       require('./routes/sim'));
app.use('/api/bracket',   require('./routes/bracket'));
app.use('/api/agent',     require('./routes/agent'));
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/me',        require('./routes/me'));

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// SPA fallback — serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(config.port, () => {
  console.log(`⚽ PITCH '26 running at http://localhost:${config.port}`);
});
