#!/usr/bin/env bash
set -e

# Run migrations (works for both SQLite and PostgreSQL)
php artisan migrate --force

# Cache config for production (uses env vars from Render)
php artisan config:cache
php artisan route:cache

# Serve on PORT (Render sets this)
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
