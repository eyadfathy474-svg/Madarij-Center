require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const halqatRoutes = require('./routes/halqat');
const sessionRoutes = require('./routes/sessions');
const financialRoutes = require('./routes/financial');
const classroomRoutes = require('./routes/classrooms');
const dashboardRoutes = require('./routes/dashboard');
const onboardingRoutes = require('./routes/onboarding');
const notificationRoutes = require('./routes/notifications');
const communicationRoutes = require('./routes/communication');
const fridayRoutes = require('./routes/friday');

const path = require('path');

const app = express();

// Middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/halqat', halqatRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/friday', fridayRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'مركز مدارج API يعمل بنجاح' });
});

// Serve frontend in production (Only if not on Vercel as Vercel handles this via vercel.json)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'المسار غير موجود' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📚 مركز مدارج لتعليم القرآن الكريم`);
    });
}

module.exports = app;
