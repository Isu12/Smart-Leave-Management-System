const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const policyRoutes = require('./routes/policyRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

app.use(express.json());

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Expose Swagger spec for API Gateway aggregation
app.get('/api-spec', (req, res) => {
  res.json(swaggerDocument);
});

// Serve Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/policies', policyRoutes);

app.use(errorHandler);

module.exports = app;
