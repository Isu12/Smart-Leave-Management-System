const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const errorHandler = require('./middleware/errorHandler');
const leaveRoutes = require('./routes/leaveRoutes');
const leavesCompatRoutes = require('./routes/leavesCompatRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/leave', leaveRoutes);
app.use('/leaves', leavesCompatRoutes);

app.use(errorHandler);

module.exports = app;
