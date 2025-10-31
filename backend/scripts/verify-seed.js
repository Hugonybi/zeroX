const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying seeded data...\n');

  const artists = await prisma.user.count({ where: { role: 'artist' } });
  const buyers = await prisma.user.count({ where: { role: 'buyer' } });
  const admins = await prisma.user.count({ where: { role: 'admin' } });
  const artworks = await prisma.artwork.findMany({
    include: {
      artist: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log('📊 Database Summary:');
  console.log(`   Artists: ${artists}`);
  console.log(`   Buyers: ${buyers}`);
  console.log(`   Admins: ${admins}`);
  console.log(`   Artworks: ${artworks.length}\n`);

  console.log('🎨 Artworks:\n');
  artworks.forEach((art, index) => {
    console.log(`${index + 1}. "${art.title}" by ${art.artist.name}`);
    console.log(`   Type: ${art.type} | Status: ${art.status}`);
    console.log(`   Price: ${(art.priceCents / 100).toLocaleString()} ${art.currency}`);
    console.log(`   Available: ${art.availableQuantity}/${art.totalQuantity}`);
    console.log(`   Image: ${art.mediaUrl.substring(0, 60)}...`);
    console.log('');
  });

  const published = artworks.filter((a) => a.status === 'published').length;
  const physical = artworks.filter((a) => a.type === 'physical').length;
  const digital = artworks.filter((a) => a.type === 'digital').length;

  console.log('📈 Statistics:');
  console.log(`   Published: ${published}`);
  console.log(`   Physical: ${physical}`);
  console.log(`   Digital: ${digital}\n`);

  console.log('✅ Verification complete!');
  console.log('🌐 View in Prisma Studio: http://localhost:5555\n');
}

verify()
  .catch((e) => {
    console.error('❌ Verification error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
