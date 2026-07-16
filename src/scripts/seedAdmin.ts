import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../db/mongo.js';
import { User } from '../modules/users/user.model.js';

const seedAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const adminExists = await User.findOne({ isAdmin: true });

    if (!adminExists) {
      console.log('No admin found. Creating default admin...');
      
      await User.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        userCode:"Admin01",
        phone: '0000000000',
        password: 'admin', // This will be hashed automatically by the pre-save hook
      });

      console.log('Default admin created successfully.');
      console.log('Email: admin@example.com');
      console.log('Password: admin');
    } else {
      console.log('Admin already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
