const express = require('express');
const morgan = require('morgan');
const YAML = require('yamljs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const approvalRoutes = require('./routes/approvalRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Approval Service',
    docs: '/api-docs'
  });
});

app.use('/api/approvals', approvalRoutes);

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Expose Swagger spec for API Gateway aggregation
app.get('/api-spec', (req, res) => {
  res.json(swaggerDocument);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

module.exports = app;
