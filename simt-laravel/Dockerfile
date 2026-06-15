FROM php:8.2-fpm-alpine AS base

RUN apk add --no-cache \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    linux-headers \
    git \
    bash

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo_mysql \
    mysqli \
    zip \
    intl \
    mbstring \
    xml \
    opcache \
    pcntl \
    bcmath

RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

RUN addgroup -g 1000 -S www && \
    adduser -u 1000 -S www -G www

COPY --chown=www:www . /var/www/html

USER www

EXPOSE 9000

CMD ["php-fpm"]


FROM node:20-alpine AS frontend-build

WORKDIR /var/www/html

COPY --chown=node:node . /var/www/html

RUN if [ -f "package.json" ]; then \
    npm ci && npm run build; \
    fi


FROM base AS production

USER root

COPY --from=frontend-build --chown=www:www /var/www/html/public/build /var/www/html/public/build

COPY --chown=www:www . /var/www/html

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist \
    && php artisan config:clear \
    && php artisan route:clear \
    && php artisan view:clear

RUN chown -R www:www /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

USER www

EXPOSE 9000

CMD ["php-fpm"]


FROM php:8.2-cli-alpine AS scheduler

RUN apk add --no-cache \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    linux-headers \
    git \
    bash

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo_mysql \
    mysqli \
    zip \
    intl \
    mbstring \
    xml \
    opcache \
    pcntl \
    bcmath

RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY --chown=www-data:www-data . /var/www/html

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

CMD ["php", "artisan", "schedule:work"]


FROM php:8.2-cli-alpine AS worker

RUN apk add --no-cache \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    linux-headers \
    git \
    bash

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo_mysql \
    mysqli \
    zip \
    intl \
    mbstring \
    xml \
    opcache \
    pcntl \
    bcmath

RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY --chown=www-data:www-data . /var/www/html

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

CMD ["php", "artisan", "queue:work", "redis", "--tries=3", "--max-time=3600"]
