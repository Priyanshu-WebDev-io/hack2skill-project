const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seminar = require('./src/models/Seminar');
const seedAdmin = require('./src/seedAdmin');

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hack2skill_project';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  await Seminar.deleteMany({});
  const seminar = await Seminar.create({
    _id: '64a1f5a5e4b0a1b2c3d4e5f6', // Hardcoded for demo
    title: 'Upcoming Tech Seminar',
    weekNumber: 1,
    date: new Date('2026-10-15T10:00:00Z'),
    zoomLink: 'https://zoom.us/j/123456789',
    registrationOpen: true,
  });

  console.log('Seeded Seminar:', seminar);
  
  // Seed the admin
  await seedAdmin();

  process.exit(0);
}

seed().catch(console.error);
