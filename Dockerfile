# Menggunakan image resmi PHP dengan Apache
FROM php:8.2-apache

# Install ekstensi database (PDO MySQL & MySQLi)
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Mengaktifkan mod_rewrite Apache
RUN a2enmod rewrite

# Menyalin seluruh file proyek ke dalam folder publik web server container
COPY . /var/www/html/

# Memberikan hak akses standar web server
RUN chown -R www-data:www-data /var/www/html/ \
    && chmod -R 755 /var/www/html/

# Mengekspos port 80 untuk lalu lintas web HTTP
EXPOSE 80
