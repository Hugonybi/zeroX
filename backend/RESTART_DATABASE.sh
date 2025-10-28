#!/bin/bash
# Script to restart database with new password
# Run this with: sudo bash RESTART_DATABASE.sh

echo "🔄 Stopping existing Docker containers..."
docker-compose -f docker-compose.infrastructure.yml down -v

echo "🚀 Starting containers with new password..."
docker-compose -f docker-compose.infrastructure.yml up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo "✅ Database restarted! You can now run migrations:"
echo "   npm run prisma:migrate:dev"
