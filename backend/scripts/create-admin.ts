import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../src/models/User';
import { hashPassword } from '../src/utils/hash';

const createAdmin = async () => {
  // Get admin credentials from environment variables or command line arguments
  const args = process.argv.slice(2);
  let email = process.env.ADMIN_EMAIL || '';
  let password = process.env.ADMIN_PASSWORD || '';
  let name = process.env.ADMIN_NAME || 'Admin';

  // Command line arguments override environment variables
  for (const arg of args) {
    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1];
    } else if (arg.startsWith('--password=')) {
      password = arg.split('=')[1];
    } else if (arg.startsWith('--name=')) {
      name = arg.split('=')[1];
    }
  }

  if (!email || !password) {
    console.error('Admin credentials not found!');
    console.error('\nOption 1: Set environment variables in .env file:');
    console.error('  ADMIN_EMAIL=admin@example.com');
    console.error('  ADMIN_PASSWORD=YourSecurePassword123');
    console.error('  ADMIN_NAME=Admin (optional)');
    console.error('\nOption 2: Pass as command line arguments:');
    console.error('  npx tsx scripts/create-admin.ts --email=admin@example.com --password=YourPassword123 [--name="Admin Name"]');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters');
    process.exit(1);
  }

  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.error(`Error: User with email ${email} already exists`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
      mustChangePassword: true, // Force password change on first login
    });

    console.log('\n✅ Admin created successfully!');
    console.log('----------------------------');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Must change password: Yes`);
    console.log('----------------------------');
    console.log('\n⚠️  Admin must change password on first login!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();
