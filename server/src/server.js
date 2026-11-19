const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const leadRoutes = require('./routes/leadRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const aiRoutes = require('./routes/aiRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const automationRoutes = require('./routes/automationRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const taskRoutes = require('./routes/taskRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const teamRoutes = require('./routes/teamRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:', '*'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        connectSrc: ["'self'", 'https:', 'http:', 'ws:', 'wss:', '*']
      }
    },
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EstateFlow AI Real Estate WhatsApp CRM Backend',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/settings', settingsRoutes);

// Static frontend serving if client/dist exists
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized Error Handler
app.use(errorHandler);

// Database & Server Startup
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed Initial Demo Company & Team Users if DB is empty
    const User = require('./models/User');
    const Company = require('./models/Company');
    const { seedFullRealEstateData } = require('./utils/seedData');

    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({
        name: 'EstateFlow Luxury Realty',
        email: 'contact@estateflow.io',
        phone: '+919876543210'
      });
    }

    const defaultUsers = [
      {
        firstName: 'Vikram',
        lastName: 'Malhotra',
        email: 'superadmin@estateflow.io',
        phone: '+919811001122',
        password: 'Admin@12345',
        role: 'Super Admin'
      },
      {
        firstName: 'Aarav',
        lastName: 'Singhania',
        email: 'admin@estateflow.io',
        phone: '+919876543210',
        password: 'Admin@12345',
        role: 'Company Admin'
      },
      {
        firstName: 'Neha',
        lastName: 'Kapoor',
        email: 'manager@estateflow.io',
        phone: '+919822334455',
        password: 'Admin@12345',
        role: 'Real Estate Manager'
      },
      {
        firstName: 'Rohan',
        lastName: 'Verma',
        email: 'broker@estateflow.io',
        phone: '+919833445566',
        password: 'Admin@12345',
        role: 'Property Broker'
      },
      {
        firstName: 'Pooja',
        lastName: 'Sharma',
        email: 'agent@estateflow.io',
        phone: '+919844556677',
        password: 'Admin@12345',
        role: 'Sales Agent'
      },
      {
        firstName: 'Sameer',
        lastName: 'Khan',
        email: 'support@estateflow.io',
        phone: '+919855667788',
        password: 'Admin@12345',
        role: 'Customer Support Agent'
      }
    ];

    let primaryAdmin = null;
    for (const u of defaultUsers) {
      let existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        existingUser = await User.create({
          companyId: company._id,
          ...u,
          lastLogin: new Date()
        });
        console.log(`✅ Seeded user: ${u.email} (${u.role})`);
      }
      if (u.email === 'admin@estateflow.io') {
        primaryAdmin = existingUser;
      }
    }

    // Populate rich demo properties, customers, leads, appointments, bookings if needed
    const Property = require('./models/Property');
    const existingProps = await Property.countDocuments({ companyId: company._id });
    if (existingProps === 0 && primaryAdmin) {
      await seedFullRealEstateData(company._id, primaryAdmin._id);
      console.log('✅ Complete real estate seed data successfully populated.');
    }

    server.listen(env.PORT, () => {
      console.log(`🚀 EstateFlow CRM Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`🔗 Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
