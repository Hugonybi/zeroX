#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user account for accessing the admin panel.
 * Run with: npm run create:admin
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔧 Creating admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@zerox.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin user with email ${adminEmail} already exists.`);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'admin' }
        });
        console.log(`✅ Updated existing user ${adminEmail} to admin role.`);
      } else {
        console.log(`✅ User ${adminEmail} already has admin role.`);
      }
      
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash: hashedPassword,
        role: 'admin',
        kycStatus: 'verified', // Admin users are pre-verified
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin User Details:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('');
    console.log('🔐 Login Instructions:');
    console.log('   1. Go to http://localhost:5173/login');
    console.log(`   2. Enter email: ${adminUser.email}`);
    console.log(`   3. Enter password: ${adminPassword}`);
    console.log('   4. After login, navigate to http://localhost:5173/admin');
    console.log('');
    console.log('⚠️  SECURITY NOTE: Change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'P2002') {
      console.log('💡 This error usually means the user already exists.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const customEmail = args.find(arg => arg.startsWith('--email='))?.split('=')[1];
const customPassword = args.find(arg => arg.startsWith('--password='))?.split('=')[1];
const customName = args.find(arg => arg.startsWith('--name='))?.split('=')[1];

if (customEmail) process.env.ADMIN_EMAIL = customEmail;
if (customPassword) process.env.ADMIN_PASSWORD = customPassword;
if (customName) process.env.ADMIN_NAME = customName;

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log('Create Admin User Script');
  console.log('');
  console.log('Usage:');
  console.log('  npm run create:admin');
  console.log('  npm run create:admin -- --email=admin@example.com --password=mypassword --name="My Admin"');
  console.log('');
  console.log('Options:');
  console.log('  --email=EMAIL      Admin email (default: admin@zerox.com)');
  console.log('  --password=PASS    Admin password (default: admin123)');
  console.log('  --name=NAME        Admin name (default: Admin User)');
  console.log('  --help, -h         Show this help message');
  console.log('');
  console.log('Environment Variables:');
  console.log('  ADMIN_EMAIL        Admin email');
  console.log('  ADMIN_PASSWORD     Admin password');
  console.log('  ADMIN_NAME         Admin name');
  process.exit(0);
}

// Run the script
createAdminUser().catch(console.error);