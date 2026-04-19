// Part 4: server.js (seed admin, mongoose connect)
async function seedAdmin() {
  const existing = await User.findOne({ email: 'admin@maker.local' });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'Admin',
      email: 'admin@maker.local',
      password: hashedPassword,
      isAdmin: true,
    });
    console.log('Admin user seeded');
  }
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin();
    app.listen(PORT, () => console.log(`user-service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
