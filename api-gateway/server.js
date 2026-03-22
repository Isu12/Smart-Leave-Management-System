const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(morgan('dev')); // Logging middleware

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'API Gateway is online and active' });
});

/**
 * Proxy Routes Configuration
 * `target` maps the route to the specific microservice.
 * `changeOrigin: true` changes the origin of the host header to the target URI.
 */

// Route to Auth & User Service (Running on 5000 by default)
app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' }, // This ensures /api/auth maps accurately
}));

app.use('/api/users', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' },
}));

// Route to Leave Balance Service (Assuming port 5001)
app.use('/api/balances', createProxyMiddleware({
    target: process.env.LEAVE_BALANCE_SERVICE_URL || 'http://localhost:5001',
    changeOrigin: true,
}));

// Route to Approval Service (Assuming port 5002)
app.use('/api/approvals', createProxyMiddleware({
    target: process.env.APPROVAL_SERVICE_URL || 'http://localhost:5002',
    changeOrigin: true,
}));

// Route to Leave Request Service (Assuming port 5003)
app.use('/api/leaves', createProxyMiddleware({
    target: process.env.LEAVE_REQUEST_SERVICE_URL || 'http://localhost:5003',
    changeOrigin: true,
}));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running successfully on Port ${PORT}`);
    console.log(`Routes mapped:`);
    console.log(` - /api/auth     -> Auth & User Service`);
    console.log(` - /api/users    -> Auth & User Service`);
    console.log(` - /api/balances -> Leave Balance Service`);
    console.log(` - /api/approvals-> Approval Service`);
    console.log(` - /api/leaves   -> Leave Request Service`);
});
