const express = require('express');
const path = require('path');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const errorHandler = require('./middleware/errorHandler');
const leaveRoutes = require('./routes/leaveRoutes');
const leavesCompatRoutes = require('./routes/leavesCompatRoutes');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Leave Request Service' });
});

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Expose Swagger spec for API Gateway aggregation
app.get('/api-spec', (req, res) => {
  res.json(swaggerDocument);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/leave', leaveRoutes);
app.use('/api/leaves', leavesCompatRoutes);

app.use(errorHandler);

module.exports = app;
