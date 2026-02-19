# Stage 1: Build frontend assets
FROM node:20-slim AS frontend
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
COPY resources ./resources
COPY public ./public
COPY vite.config.js ./
COPY tailwind.config.js postcss.config.js ./
RUN npm run build

# Stage 2: Laravel app
FROM php:8.2-cli
WORKDIR /var/www/html

# Install system deps + PHP extensions Laravel needs
RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip libzip-dev libpng-dev libonig-dev libpq-dev \
    && docker-php-ext-install pdo pdo_sqlite pdo_pgsql zip mbstring exif pcntl bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Copy app
COPY . .

# Install PHP dependencies (no dev for production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy built frontend assets from stage 1
COPY --from=frontend /app/public/build ./public/build

# Create SQLite file if using SQLite (harmless if using PostgreSQL)
RUN touch database/database.sqlite 2>/dev/null || true

# Writable dirs for Laravel
RUN chmod -R 775 storage bootstrap/cache

# Start script: migrate then serve (Render sets PORT)
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
