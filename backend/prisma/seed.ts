import { PrismaClient, ArtworkType, ArtworkStatus, UserRole, KycStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo artists
  const artistPassword = await bcrypt.hash('Artist123!', 10);
  
  const artist1 = await prisma.user.upsert({
    where: { email: 'artist1@zerox.art' },
    update: {},
    create: {
      email: 'artist1@zerox.art',
      passwordHash: artistPassword,
      role: UserRole.artist,
      name: 'Sarah Mitchell',
      bio: 'Contemporary abstract artist exploring the intersection of color, form, and emotion. Based in Lagos, Nigeria.',
      kycStatus: KycStatus.verified,
    },
  });

  const artist2 = await prisma.user.upsert({
    where: { email: 'artist2@zerox.art' },
    update: {},
    create: {
      email: 'artist2@zerox.art',
      passwordHash: artistPassword,
      role: UserRole.artist,
      name: 'David Chen',
      bio: 'Digital artist and NFT creator specializing in surreal landscapes and sci-fi inspired compositions.',
      kycStatus: KycStatus.verified,
    },
  });

  const artist3 = await prisma.user.upsert({
    where: { email: 'artist3@zerox.art' },
    update: {},
    create: {
      email: 'artist3@zerox.art',
      passwordHash: artistPassword,
      role: UserRole.artist,
      name: 'Amara Okafor',
      bio: 'Mixed media artist celebrating African heritage through vibrant colors and traditional motifs.',
      kycStatus: KycStatus.verified,
    },
  });

  console.log('✅ Demo artists created');

  // Create demo artworks with beautiful placeholder images
  const artworks = [
    // Sarah Mitchell's works
    {
      artistId: artist1.id,
      title: 'Sunset Dreams',
      description: 'A vibrant abstract piece capturing the ethereal beauty of a tropical sunset. This work explores the emotional resonance of color transitions and fluid forms.',
      type: ArtworkType.physical,
      mediaUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=1600&fit=crop',
      medium: 'Acrylic on Canvas',
      category: 'Abstract',
      tags: ['abstract', 'colorful', 'sunset', 'modern'],
      yearCreated: 2024,
      dimensionHeight: 120,
      dimensionWidth: 90,
      dimensionUnit: 'cm',
      priceCents: 250000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: true,
      totalQuantity: 1,
      availableQuantity: 1,
      serialNumber: 'SM-2024-001',
    },
    {
      artistId: artist1.id,
      title: 'Ocean Whispers',
      description: 'Deep blues and turquoise swirls evoke the mystery and tranquility of ocean depths. Each layer reveals new textures and hidden patterns.',
      type: ArtworkType.physical,
      mediaUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=1200&h=1600&fit=crop',
      medium: 'Oil on Canvas',
      category: 'Abstract',
      tags: ['abstract', 'blue', 'ocean', 'textured'],
      yearCreated: 2024,
      dimensionHeight: 100,
      dimensionWidth: 80,
      dimensionUnit: 'cm',
      priceCents: 350000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: true,
      totalQuantity: 1,
      availableQuantity: 1,
      serialNumber: 'SM-2024-002',
    },
    {
      artistId: artist1.id,
      title: 'Golden Hour',
      description: 'Warm golden tones dance across the canvas in this meditation on light and time. A celebration of fleeting moments.',
      type: ArtworkType.physical,
      mediaUrl: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=1200&h=1600&fit=crop',
      medium: 'Mixed Media',
      category: 'Abstract',
      tags: ['abstract', 'gold', 'warm', 'contemporary'],
      yearCreated: 2024,
      dimensionHeight: 90,
      dimensionWidth: 90,
      dimensionUnit: 'cm',
      priceCents: 180000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: false,
      edition: 1,
      totalQuantity: 5,
      availableQuantity: 5,
      serialNumber: 'SM-2024-003-LE',
    },

    // David Chen's works
    {
      artistId: artist2.id,
      title: 'Neon Metropolis',
      description: 'A cyberpunk vision of future cities, where neon lights pierce through the digital fog. This piece explores themes of technology and humanity.',
      type: ArtworkType.digital,
      mediaUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&h=1600&fit=crop',
      medium: 'Digital Art',
      category: 'Digital',
      tags: ['digital', 'cyberpunk', 'neon', 'futuristic', 'city'],
      yearCreated: 2024,
      priceCents: 85000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: false,
      edition: 1,
      totalQuantity: 10,
      availableQuantity: 10,
      serialNumber: 'DC-2024-NFT-001',
    },
    {
      artistId: artist2.id,
      title: 'Cosmic Portal',
      description: 'Journey through dimensions with this mind-bending digital creation. Inspired by theoretical physics and the mysteries of space-time.',
      type: ArtworkType.digital,
      mediaUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=1600&fit=crop',
      medium: 'Digital Art',
      category: 'Digital',
      tags: ['digital', 'space', 'portal', 'cosmic', 'abstract'],
      yearCreated: 2024,
      priceCents: 95000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: true,
      totalQuantity: 1,
      availableQuantity: 1,
      serialNumber: 'DC-2024-NFT-002',
    },
    {
      artistId: artist2.id,
      title: 'Digital Dreams',
      description: 'Where reality meets imagination in a cascade of pixels and light. A celebration of the digital age.',
      type: ArtworkType.digital,
      mediaUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&h=1600&fit=crop',
      medium: 'Digital Art',
      category: 'Digital',
      tags: ['digital', 'colorful', 'abstract', 'modern'],
      yearCreated: 2024,
      priceCents: 75000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: false,
      edition: 1,
      totalQuantity: 15,
      availableQuantity: 15,
      serialNumber: 'DC-2024-NFT-003',
    },

    // Amara Okafor's works
    {
      artistId: artist3.id,
      title: 'Ancestral Echoes',
      description: 'Traditional Adinkra symbols reimagined through a contemporary lens. This piece honors African heritage while embracing modern aesthetics.',
      type: ArtworkType.physical,
      mediaUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=1200&h=1600&fit=crop',
      medium: 'Acrylic and Fabric on Canvas',
      category: 'Cultural',
      tags: ['cultural', 'african', 'traditional', 'contemporary', 'heritage'],
      yearCreated: 2024,
      dimensionHeight: 150,
      dimensionWidth: 100,
      dimensionUnit: 'cm',
      priceCents: 450000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: true,
      totalQuantity: 1,
      availableQuantity: 1,
      serialNumber: 'AO-2024-001',
    },
    {
      artistId: artist3.id,
      title: 'Market Day',
      description: 'Vibrant colors capture the energy and joy of a bustling West African marketplace. Each detail tells a story of community and connection.',
      type: ArtworkType.physical,
      mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=1600&fit=crop',
      medium: 'Mixed Media',
      category: 'Cultural',
      tags: ['cultural', 'colorful', 'market', 'african', 'vibrant'],
      yearCreated: 2024,
      dimensionHeight: 120,
      dimensionWidth: 120,
      dimensionUnit: 'cm',
      priceCents: 380000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: true,
      totalQuantity: 1,
      availableQuantity: 1,
      serialNumber: 'AO-2024-002',
    },
    {
      artistId: artist3.id,
      title: 'Rhythms of Life',
      description: 'A celebration of music, dance, and cultural expression. This limited edition print brings the spirit of celebration into your space.',
      type: ArtworkType.physical,
      mediaUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=1600&fit=crop',
      medium: 'Giclee Print',
      category: 'Cultural',
      tags: ['cultural', 'music', 'dance', 'celebration', 'print'],
      yearCreated: 2024,
      dimensionHeight: 70,
      dimensionWidth: 50,
      dimensionUnit: 'cm',
      priceCents: 65000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: false,
      edition: 1,
      totalQuantity: 20,
      availableQuantity: 20,
      serialNumber: 'AO-2024-003-LE',
    },

    // More diverse artworks
    {
      artistId: artist1.id,
      title: 'Urban Symphony',
      description: 'The chaos and beauty of city life rendered in bold strokes and striking colors. A love letter to metropolitan energy.',
      type: ArtworkType.physical,
      mediaUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&h=1600&fit=crop',
      medium: 'Acrylic on Canvas',
      category: 'Abstract',
      tags: ['abstract', 'urban', 'colorful', 'contemporary'],
      yearCreated: 2023,
      dimensionHeight: 110,
      dimensionWidth: 85,
      dimensionUnit: 'cm',
      priceCents: 295000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: true,
      totalQuantity: 1,
      availableQuantity: 1,
      serialNumber: 'SM-2023-015',
    },
    {
      artistId: artist2.id,
      title: 'Quantum Realm',
      description: 'Exploring the invisible forces that shape our universe. A digital masterpiece inspired by quantum mechanics and string theory.',
      type: ArtworkType.digital,
      mediaUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=1600&fit=crop',
      medium: 'Digital Art',
      category: 'Digital',
      tags: ['digital', 'science', 'quantum', 'abstract', 'futuristic'],
      yearCreated: 2024,
      priceCents: 125000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: false,
      edition: 1,
      totalQuantity: 7,
      availableQuantity: 7,
      serialNumber: 'DC-2024-NFT-008',
    },
    {
      artistId: artist3.id,
      title: 'Threads of Tradition',
      description: 'Intricate textile patterns woven into a visual narrative. Each thread carries the wisdom of generations.',
      type: ArtworkType.physical,
      mediaUrl: 'https://images.unsplash.com/photo-1582201957988-0d58c1635a57?w=1200&h=1600&fit=crop',
      medium: 'Mixed Media and Textile',
      category: 'Cultural',
      tags: ['cultural', 'textile', 'traditional', 'african', 'handcraft'],
      yearCreated: 2024,
      dimensionHeight: 90,
      dimensionWidth: 70,
      dimensionUnit: 'cm',
      priceCents: 320000,
      currency: 'NGN',
      status: ArtworkStatus.published,
      isUnique: true,
      totalQuantity: 1,
      availableQuantity: 1,
      serialNumber: 'AO-2024-007',
    },
  ];

  for (const artwork of artworks) {
    await prisma.artwork.create({
      data: artwork,
    });
  }

  console.log(`✅ Created ${artworks.length} demo artworks`);

  // Create a demo buyer
  const buyerPassword = await bcrypt.hash('Buyer123!', 10);
  await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      passwordHash: buyerPassword,
      role: UserRole.buyer,
      name: 'Demo Buyer',
      bio: 'Art enthusiast and collector',
      kycStatus: KycStatus.none,
    },
  });

  console.log('✅ Demo buyer created');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@zerox.art' },
    update: {},
    create: {
      email: 'admin@zerox.art',
      passwordHash: adminPassword,
      role: UserRole.admin,
      name: 'Admin User',
      bio: 'Platform administrator',
      kycStatus: KycStatus.verified,
    },
  });

  console.log('✅ Admin user created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Demo Users:');
  console.log('  Artists:');
  console.log('    - artist1@zerox.art / Artist123!');
  console.log('    - artist2@zerox.art / Artist123!');
  console.log('    - artist3@zerox.art / Artist123!');
  console.log('  Buyer:');
  console.log('    - buyer@example.com / Buyer123!');
  console.log('  Admin:');
  console.log('    - admin@zerox.art / Admin123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
