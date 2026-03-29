const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Expose Swagger spec for API Gateway aggregation
app.get('/api-spec', (req, res) => {
  res.json(swaggerDocument);
});

// Serve Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use(errorHandler);

module.exports = app;
