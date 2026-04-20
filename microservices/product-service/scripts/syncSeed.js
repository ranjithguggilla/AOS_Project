/**
 * One-shot: sync MongoDB from seed.js (same as server startup) then exit.
 * Usage: node scripts/syncSeed.js
 * Env: MONGO_URI — must match product-service (Docker Compose uses mongodb://mongo:27017/ProductDB).
 *
 * If you run MongoDB on the host on :27017 as well as Docker, `localhost` may hit the wrong
 * instance. For the stack in docker-compose.yml, copy seed + this file into the container and run:
 *   docker cp ./seed.js <product-service-container>:/app/seed.js
 *   docker cp ./scripts/syncSeed.js <product-service-container>:/app/scripts/syncSeed.js
 *   docker exec <product-service-container> node /app/scripts/syncSeed.js
 */
const DEFAULT_URI = 'mongodb://127.0.0.1:27017/ProductDB';
const mongoose = require('mongoose');
const seed = require('../seed');

const MONGO_URI = process.env.MONGO_URI || DEFAULT_URI;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    await seed();
    await mongoose.disconnect();
    console.log('syncSeed done');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
