const bcrypt = require('bcryptjs');
const prisma = require('../src/config/db');

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = args[0] || process.env.INITIAL_SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = args[1] || process.env.INITIAL_SUPERADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const fullName = args[2] || 'System Administrator';

  if (!email || !password) {
    console.log('Usage: node scripts/create-admin.js <email> <password> [fullName]');
    console.log('Or set INITIAL_SUPERADMIN_EMAIL and INITIAL_SUPERADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'SUPERADMIN',
      fullName,
      isEmailVerified: true
    },
    create: {
      email,
      fullName,
      passwordHash,
      role: 'SUPERADMIN',
      collegeName: 'Karnataka State Law University Campus',
      isEmailVerified: true
    }
  });

  console.log(`Successfully provisioned Superadministrator: ${admin.email} (Role: ${admin.role})`);
  await prisma.$disconnect();
}

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
