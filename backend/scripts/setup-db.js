// Database setup and synchronization helper
// Handles Neon / PostgreSQL for production and staging, and SQLite for zero-config local development

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // If no .env exists, create a default local one with SQLite for immediate development
  const defaultEnv = `PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="kslu_circle_dev_secret_jwt_key_at_least_32_characters_long"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
CLIENT_URL="http://localhost:5173"
UPLOAD_STORAGE="local"
UPLOAD_DIR="./uploads"
`;
  fs.writeFileSync(envPath, defaultEnv);
  dotenv.config({ path: envPath });
  console.log('Created default backend/.env configured for local development');
}

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const isSqlite = dbUrl.startsWith('file:');
const targetProvider = isSqlite ? 'sqlite' : 'postgresql';

const currentProviderMatch = schemaContent.match(/provider\s*=\s*"([^"]+)"\s*\n\s*url\s*=\s*env\("DATABASE_URL"\)/);
const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;

if (currentProvider !== targetProvider) {
  console.log(`Adapting Prisma datasource provider from "${currentProvider}" to "${targetProvider}"...`);
  schemaContent = schemaContent.replace(
    /provider\s*=\s*"[^"]+"\s*(\r?\n\s*url\s*=\s*env\("DATABASE_URL"\))/,
    `provider = "${targetProvider}"$1`
  );
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
}

console.log(`Setting up database with provider: ${targetProvider}`);

try {
  console.log('Running: npx prisma generate');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

  console.log('Running: npx prisma db push --skip-generate');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

  console.log('Database synchronization completed successfully!');
} catch (err) {
  console.error('Error synchronizing database schema:', err.message);
  process.exit(1);
}
