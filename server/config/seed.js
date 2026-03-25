import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from './database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@swachhai.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91-9999999999'
    });

    // Create sample employee
    const employee = await User.create({
      name: 'John Employee',
      email: 'employee@swachhai.com',
      password: 'employee123',
      role: 'employee',
      phone: '+91-8888888888'
    });

    // Create sample NGO
    const ngo = await User.create({
      name: 'Green Earth NGO',
      email: 'ngo@swachhai.com',
      password: 'ngo123',
      role: 'ngo',
      phone: '+91-7777777777'
    });

    // Create sample citizen
    const citizen = await User.create({
      name: 'Jane Citizen',
      email: 'citizen@swachhai.com',
      password: 'citizen123',
      role: 'citizen',
      phone: '+91-6666666666'
    });

    console.log('Data seeded successfully!');
    console.log('Admin:', { email: adminUser.email, password: 'admin123' });
    console.log('Employee:', { email: employee.email, password: 'employee123' });
    console.log('NGO:', { email: ngo.email, password: 'ngo123' });
    console.log('Citizen:', { email: citizen.email, password: 'citizen123' });

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();