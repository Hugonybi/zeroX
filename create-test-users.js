#!/usr/bin/env node

/**
 * Create test users for development
 */

const BASE_URL = 'http://localhost:4000';

async function createTestUser(role, name, email, password) {
  console.log(`Creating ${role}: ${email}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role
      }),
    });

    if (response.ok) {
      console.log(`✅ ${role} created successfully`);
    } else {
      const error = await response.json();
      if (error.message?.includes('already exists')) {
        console.log(`ℹ️  ${role} already exists`);
      } else {
        console.log(`❌ Failed to create ${role}:`, error.message);
      }
    }
  } catch (error) {
    console.log(`❌ Error creating ${role}:`, error.message);
  }
}

async function main() {
  console.log('🔧 Creating test users...\n');

  await createTestUser('buyer', 'Test Buyer', 'buyer@test.com', 'Test1234!');
  await createTestUser('artist', 'Test Artist', 'artist@test.com', 'Test1234!');
  await createTestUser('admin', 'Test Admin', 'admin@test.com', 'Test1234!');

  console.log('\n✅ Test users setup complete!');
  console.log('\nYou can now log in with:');
  console.log('  Buyer: buyer@test.com / Test1234!');
  console.log('  Artist: artist@test.com / Test1234!');
  console.log('  Admin: admin@test.com / Test1234!');
}

main().catch(console.error);
