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
CREATE TABLE rumah_ibadah (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    jenis ENUM('Masjid', 'Gereja', 'Vihara', 'Pura', 'Klenteng') NOT NULL,
    radius_meter INT NOT NULL,
    alamat TEXT,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rumah_penduduk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kk VARCHAR(100) NOT NULL,
    agama VARCHAR(50),
    jml_tanggungan INT DEFAULT 0,
    pengeluaran INT NOT NULL,
    pmt_lantai INT DEFAULT 0,
    pmt_dinding INT DEFAULT 0,
    pmt_sanitasi INT DEFAULT 0,
    pmt_penerangan INT DEFAULT 0,
    pmt_air INT DEFAULT 0,
    pmt_score INT NOT NULL,
    status_kemiskinan ENUM('Sangat Miskin', 'Miskin', 'Rentan Miskin', 'Tidak Miskin') NOT NULL,
    alamat TEXT,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE log_bantuan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_penduduk INT NOT NULL,
    beras_kg INT DEFAULT 0,
    minyak_l INT DEFAULT 0,
    gula_kg INT DEFAULT 0,
    telur_kg INT DEFAULT 0,
    susu_kaleng INT DEFAULT 0,
    tunai_rp INT DEFAULT 0,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_penduduk) REFERENCES rumah_penduduk(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS garis_kemiskinan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tahun YEAR NOT NULL,
    nilai_rupiah INT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO garis_kemiskinan (tahun, nilai_rupiah, is_active) 
VALUES (2026, 700000, TRUE);