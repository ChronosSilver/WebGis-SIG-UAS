CREATE TABLE spbu_markers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_spbu VARCHAR(100) NOT NULL,
    status_operasional ENUM('Buka 24 Jam', 'Tidak 24 Jam') NOT NULL,
    no_telp VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE jalan_polylines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_jalan VARCHAR(100) NOT NULL,
    status_jalan ENUM('Jalan Nasional', 'Jalan Provinsi', 'Jalan Kabupaten') NOT NULL,
    jarak_meter INT NOT NULL,
    koordinat JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE tanah_polygons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_pemilik VARCHAR(100) NOT NULL,
    status_kepemilikan ENUM('SHM', 'HGB', 'HGU', 'HP') NOT NULL,
    luas_meter INT NOT NULL,
    koordinat JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE spbu_markers 
ADD COLUMN alamat TEXT AFTER no_telp;