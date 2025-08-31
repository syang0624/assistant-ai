#!/bin/bash

# Assistant AI Production Deployment Script
set -e

echo "🚀 Starting Assistant AI Production Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "⚠️  .env.prod file not found. Creating from example..."
    cp env.prod.example .env.prod
    echo "📝 Please edit .env.prod with your production values before continuing."
    echo "   - Set SECRET_KEY to a secure random string"
    echo "   - Update VITE_API_BASE_URL if needed"
    read -p "Press Enter after editing .env.prod..."
fi

# Build and start production services
echo "🔨 Building production Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "🔄 Stopping any existing containers..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Checking logs..."
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 Health Check: http://localhost/health"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   Restart services: docker-compose -f docker-compose.prod.yml restart"
