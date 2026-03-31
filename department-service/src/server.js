const express = require('express');
const dotenv = require('dotenv');

// Load environment variables immediately
dotenv.config();

const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const departmentRoutes = require('./routes/departmentRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Connect to Database
connectDB();

const app = express();

// Swagger Setup
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.get('/api-spec', (req, res) => {
    res.json(swaggerDocument);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/departments', departmentRoutes);

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
    console.log(`Department Service running on port ${PORT}`);
});
