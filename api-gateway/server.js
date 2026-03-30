const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(morgan('dev')); // Logging middleware

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        message: 'API Gateway is online and active (v2)',
        timestamp: new Date().toISOString()
    });
});

// --- Aggregated Swagger Documentation Setup ---
const gatewaySwaggerSpec = YAML.load(path.join(__dirname, 'swagger.yaml'));

const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        urls: [
            { url: '/api-spec', name: 'Main API Gateway' },
            { url: '/specs/auth', name: 'Auth & User Service' },
            { url: '/specs/balance', name: 'Leave Balance & Reporting Service' },
            { url: '/specs/approval', name: 'Approval Service' },
            { url: '/specs/leave', name: 'Leave Request Service' }
        ]
    }
};

// Expose Gateway's own spec for aggregation
app.get('/api-spec', (req, res) => {
    res.json(gatewaySwaggerSpec);
});

// Proxy individual service Swagger specs to their respective microservices
app.use(createProxyMiddleware({
    pathFilter: '/specs/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: { '^/specs/auth': '/api-spec' }
}));

app.use(createProxyMiddleware({
    pathFilter: '/specs/balance',
    target: process.env.LEAVE_BALANCE_SERVICE_URL || 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: { '^/specs/balance': '/api-spec' }
}));

app.use(createProxyMiddleware({
    pathFilter: '/specs/approval',
    target: process.env.APPROVAL_SERVICE_URL || 'http://localhost:5002',
    changeOrigin: true,
    pathRewrite: { '^/specs/approval': '/api-spec' }
}));

app.use(createProxyMiddleware({
    pathFilter: '/specs/leave',
    target: process.env.LEAVE_REQUEST_SERVICE_URL || 'http://localhost:5003',
    changeOrigin: true,
    pathRewrite: { '^/specs/leave': '/api-spec' }
}));

// Host the main Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(gatewaySwaggerSpec, swaggerOptions));
// ----------------------------------------------

/**
 * Proxy Routes Configuration
 * `target` maps the route to the specific microservice.
 * `changeOrigin: true` changes the origin of the host header to the target URI.
 * `pathRewrite` strips the gateway prefix so the downstream service sees its own path.
 */

// Route to Auth & User Service (port 5000)
// /api/auth -> /auth
app.use('/api/auth', createProxyMiddleware({
    target: (process.env.AUTH_SERVICE_URL || 'http://localhost:5010') + '/api/auth',
    changeOrigin: true,
}));

// /api/users -> /users
app.use('/api/users', createProxyMiddleware({
    target: (process.env.AUTH_SERVICE_URL || 'http://localhost:5010') + '/api/users',
    changeOrigin: true,
}));

// /api/policies -> /api/policies
app.use('/api/policies', createProxyMiddleware({
    target: (process.env.AUTH_SERVICE_URL || 'http://localhost:5010') + '/api/policies',
    changeOrigin: true,
}));

// Route to Leave Balance & Reporting Service (port 5001)
// /api/balances -> /api/balance
app.use('/api/balances', createProxyMiddleware({
    target: (process.env.LEAVE_BALANCE_SERVICE_URL || 'http://localhost:5001') + '/api/balance',
    changeOrigin: true,
}));

// /api/reports -> /api/reports
app.use('/api/reports', createProxyMiddleware({
    target: (process.env.LEAVE_BALANCE_SERVICE_URL || 'http://localhost:5001') + '/api/reports',
    changeOrigin: true,
}));

// Route to Approval Service (port 5002)
// /api/approvals -> /api/approvals
app.use('/api/approvals', createProxyMiddleware({
    target: (process.env.APPROVAL_SERVICE_URL || 'http://localhost:5002') + '/api/approvals',
    changeOrigin: true,
}));

// Route to Leave Request Service (port 5003)
// /api/leaves -> /leave
app.use('/api/leaves', createProxyMiddleware({
    target: (process.env.LEAVE_REQUEST_SERVICE_URL || 'http://localhost:5003') + '/api/leaves',
    changeOrigin: true,
}));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running successfully on Port ${PORT}`);
    console.log(`Routes mapped:`);
    console.log(` - /api/auth      -> Auth & User Service (5010) [/api/auth]`);
    console.log(` - /api/users     -> Auth & User Service (5010) [/api/users]`);
    console.log(` - /api/policies  -> Auth & User Service (5010) [/api/policies]`);
    console.log(` - /api/balances  -> Leave Balance & Reporting Service (5001) [/api/balance]`);
    console.log(` - /api/reports   -> Leave Balance & Reporting Service (5001) [/api/reports]`);
    console.log(` - /api/approvals -> Approval Service (5002) [/api/approvals]`);
    console.log(` - /api/leaves    -> Leave Request Service (5003) [/api/leaves]`);
});
