const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@seminar.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@seminar.com',
        password: 'admin', // In a real app, use a strong password
        role: 'admin',
        isVerified: true
      });
      console.log('[Seed] Default admin account created: admin@seminar.com / admin');
    } else {
      console.log('[Seed] Admin account already exists');
    }
  } catch (error) {
    console.error('[Seed] Error seeding admin:', error.message);
  }
};

module.exports = seedAdmin;
