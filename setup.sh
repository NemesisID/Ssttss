#!/bin/bash
set -e

echo "========================================="
echo "  Setup Pendaftaran ISCOM - UPN Veteran  "
echo "========================================="
echo ""

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker belum terinstall. Install dulu: https://docs.docker.com/engine/install/"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "Docker Compose belum terinstall."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js belum terinstall. Install dulu: https://nodejs.org"; exit 1; }

# Generate .env if not exists
if [ ! -f .env ]; then
  echo "[1/7] Generating .env file..."
  cp .env.example .env

  NEXTAUTH_SECRET=$(openssl rand -hex 32)
  ENCRYPTION_KEY=$(openssl rand -hex 32)

  sed -i "s/generate-random-secret-here/$NEXTAUTH_SECRET/" .env
  sed -i "s/generate-32-byte-hex-key-here/$ENCRYPTION_KEY/" .env

  echo "  .env created with generated secrets."
  echo "  EDIT .env untuk isi Google Sheets credentials & domain!"
  echo ""
else
  echo "[1/7] .env sudah ada, skip."
fi

# Start database & redis
echo "[2/7] Starting MySQL & Redis..."
docker compose up -d db redis
echo "  Waiting for MySQL to be ready..."
sleep 10
until docker compose exec db mysqladmin ping -h localhost --silent 2>/dev/null; do
  sleep 2
done
echo "  MySQL ready."

# Install dependencies
echo "[3/7] Installing dependencies..."
npm install

# Push database schema
echo "[4/7] Pushing database schema..."
npx prisma db push

# Generate Prisma client
echo "[5/7] Generating Prisma client..."
npx prisma generate

# Seed database
echo "[6/7] Seeding database..."
npm run db:seed

# Build app
echo "[7/7] Building Next.js app..."
npm run build

echo ""
echo "========================================="
echo "  Setup selesai!"
echo "========================================="
echo ""
echo "Langkah selanjutnya:"
echo "  1. Edit .env → isi Google Sheets credentials"
echo "  2. Jalankan: npm start (atau docker compose up -d --build)"
echo "  3. Login admin: http://localhost:3000/admin/login"
echo "     Username: admin"
echo "     Password: admin123"
echo "  4. Di admin Settings → paste string QRIS"
echo "  5. Di admin Grup WA → tambahkan link grup per divisi"
echo ""
echo "Untuk production dengan Docker:"
echo "  docker compose up -d --build"
echo ""
