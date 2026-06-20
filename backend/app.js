const express = require('express');
const cors = require('cors');
const listRoutes = require('./routes/listRoutes');
const contactRoutes = require('./routes/contactRoutes');
const importRoutes = require('./routes/importRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' })); // imports can be large

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/lists', listRoutes);
app.use('/api', contactRoutes);
app.use('/api', importRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
