// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const taxiRoutes = require('./routes/taxi');
const passengerRoutes = require('./routes/passenger');
const registerTaxiRoute = require('./routes/registerTaxi');
const lostReportsRoute = require('./routes/lostReports');

const app = express();
app.use(cors());
app.use(express.json());

// **Connect to MongoDB**
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// **Routes**

// 1) Authentication: register/login driver
app.use('/api/auth', authRoutes);

// 2) Taxi registration: public endpoint
//    POST /api/register-taxi
app.use('/api/register-taxi', registerTaxiRoute);

// 3) Taxi management: add/get taxi info (protected)
app.use('/api/taxi', taxiRoutes);

// 4) Passenger endpoints: register trip, report lost item (no token required)
app.use('/api/passenger', passengerRoutes);

// 5) LostReport endpoints: public endpoint
//      POST /api/lost-report
app.use('/api/lost-reports', lostReportsRoute);

// 6) Driver Dashboard: protected routes inside taxiRoutes
//    (e.g., GET /api/taxi/:taxiId/reports, etc.)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
