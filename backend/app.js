const express = require('express');
const cors = require('cors');
const listRoutes = require('./routes/listRoutes');
const contactRoutes = require('./routes/contactRoutes');
const importRoutes = require('./routes/importRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
// Imports can carry a large array of contacts, so allow a generous JSON body.
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/lists', listRoutes);
app.use('/api', contactRoutes);
app.use('/api', importRoutes);

// Anything that fell through the routes above is an unknown endpoint.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error-handling middleware must be registered last.
app.use(errorHandler);

module.exports = app;
