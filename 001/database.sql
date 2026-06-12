CREATE TABLE spbu_markers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_spbu VARCHAR(100) NOT NULL,
    no_wa VARCHAR(20) NOT NULL,
    status_operasional ENUM('Buka 24 Jam', 'Tidak 24 Jam') NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);