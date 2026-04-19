// Part 3: server.js (user routes, DB config)
app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 8001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user-service';
