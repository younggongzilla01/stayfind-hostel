require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'API is running' }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/hostels', require('./routes/hostel.routes'));
app.use('/api/owner', require('./routes/owner.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Serve Frontend in Production / local dev
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all route to serve the React/vanilla HTML app for client-side routing
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(__dirname, '../public/index.html'));
    }
    next();
});

// Connect Database and launch server
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
