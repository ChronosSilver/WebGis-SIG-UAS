# WebGIS Terintegrasi Kota Pontianak

Selamat datang di repositori **WebGIS Kota Pontianak**. Proyek ini merupakan aplikasi Sistem Informasi Geografis (SIG) berbasis web yang dirancang untuk memetakan dan mengelola berbagai infrastruktur spasial di wilayah Pontianak, seperti SPBU, Jaringan Jalan, dan Parsil Tanah. Proyek ini disusun secara khusus sebagai **Tugas/Proyek untuk Mata Kuliah Sistem Informasi Geografis (SIG)**.

Proyek ini dibangun secara iteratif (bertahap) dengan arsitektur terpusat, memungkinkan beberapa antarmuka (*interface*) berbeda untuk berbagi satu sumber *database* dan API yang sama.

---

## 👨‍💻 Identitas Pengembang

- **Nama**: Nelson Davey
- **NIM**: D1041231058
- **Instansi/Mata Kuliah**: Sistem Informasi Geografis (SIG)

---

## 🌟 Preview Fitur Utama

Aplikasi WebGIS ini dilengkapi dengan fitur-fitur pemetaan interaktif tingkat lanjut yang mencakup:
- **📍 Manajemen SPBU (Point)**: Penambahan *marker* SPBU dengan informasi status operasional (Buka 24 Jam / Tidak). Didukung oleh fitur *Reverse Geocoding* otomatis untuk membaca alamat riil berdasarkan pergeseran koordinat *marker* (*drag-and-drop*).
- **🛣️ Jaringan Jalan (Polyline)**: Penggambaran rute/ruas jalan secara presisi dengan kalkulator perhitungan jarak otomatis (dalam meter) serta pengelompokan berdasarkan status (Jalan Nasional, Provinsi, Kabupaten).
- **🟩 Pemetaan Parsil Tanah (Polygon)**: Pembuatan area bidang tanah interaktif yang dilengkapi algoritma perhitungan luas area matematis (m²) secara *real-time* dan klasifikasi status kepemilikan (SHM, HGB, HGU, HP).
- **🔍 Smart Filter & Layer Control**: Panel penyaringan visual (*layer control*) untuk mengisolasi dan menganalisis data spasial berdasarkan kategori spesifik tanpa menumpuk tampilan layar.
- **📡 Sistem CRUD Asinkron**: Modifikasi data spasial (Tambah, Edit, Hapus) menggunakan API *fetch* yang mulus dan instan tanpa proses pemuatan ulang halaman (*Seamless UI*).

---

## 🏗️ Arsitektur Proyek

Proyek ini menggunakan pendekatan **Centralized Backend & Modular Frontend**. Di mana fungsi-fungsi koneksi *database* dan API diletakkan di luar (akar direktori), sementara setiap versi/iterasi peta (`001`, `002`, `003`, `004`) bertindak sebagai "wajah" (antarmuka pengguna) yang saling independen namun tetap terhubung pada satu pusat otak data.

### Struktur Direktori Utama

Berikut adalah gambaran besar susunan *folder* dalam *project* ini:

```text
📦 webgis/
├── 📁 001/                  # Iterasi V1 (Peta dasar)
├── 📁 002/                  # Iterasi V2 (Peta murni tanpa filter)
├── 📁 003/                  # Iterasi V3 (Peta interaktif dengan filter)
├── 📁 004/                  # Iterasi V4 (Arsitektur lanjutan)
├── 📁 assets/               # Aset CSS & gambar terpusat
├── 📁 components/           # Komponen UI dapat dipakai ulang (Modals, file JSON)
├── 📁 otak_jalan/           # REST API terpusat untuk fungsi Jalan
├── 📁 otak_kemiskinan/      # REST API terpusat untuk fungsi Kemiskinan
├── 📁 otak_spbu/            # REST API terpusat untuk fungsi SPBU
├── 📁 otak_tanah/           # REST API terpusat untuk fungsi Tanah
├── 📄 koneksi.php           # Titik pusat koneksi ke Database
└── 📄 README.md             # Dokumentasi Proyek
```

- `koneksi.php`: Jantung aplikasi. Menghubungkan semua iterasi ke dalam satu *database* terpusat bernama `webgis_pontianak`.
- `assets/`: Berisi `style.css` global yang mengontrol seluruh desain antarmuka (UI) mulai dari tombol, *sidebar*, hingga animasi *popup*.
- `components/`: Berisi kumpulan kerangka HTML *reusable* (komponen yang bisa dipakai ulang) seperti `modals.php` dan data batas kecamatan (`Admin_Kecamatan.json`).
- **REST API Lokal (Otak Logika)**:
  - `otak_spbu/`: Menangani operasi *Create, Read, Update, Delete* (CRUD) serta Reverse Geocoding untuk data SPBU.
  - `otak_jalan/`: Menangani kalkulasi jarak *polyline* dan CRUD data Jaringan Jalan.
  - `otak_tanah/`: Menangani kalkulasi luas area *polygon* dan CRUD data Parsil Tanah.
  - `otak_kemiskinan/`: Menangani pendataan infrastruktur spasial tingkat lanjut.

### Iterasi Antarmuka (Versi Peta)

Repositori ini menyimpan beberapa rekam jejak pengembangan antarmuka pengguna:
1. **Folder `001`**: Iterasi paling awal. Menyajikan peta dasar dengan konektivitas awal ke *database* terpusat.
2. **Folder `002` (Pure Map View)**: Iterasi antarmuka yang difokuskan pada visualisasi murni. Memiliki fitur rendering SPBU, Jalan, dan Tanah, namun secara sengaja disetel **tanpa panel Filter Layer**, menjadikannya peta pameran data (*showcase*).
3. **Folder `003` (Interactive Filter Map)**: Iterasi ini memiliki kerangka kerja kontrol layer (*layer control*) penuh. Pengguna dapat secara interaktif menyaring SPBU berdasarkan status operasional (Buka/Tutup), dan menyaring garis jalan serta polygon tanah berdasarkan kepemilikannya.
4. **Folder `004` (Advanced Architecture)**: Pengembangan lanjutan dari iterasi sebelumnya. Berfungsi sebagai *bridge* (jembatan) untuk menopang struktur kompleks pemetaan tata letak secara dinamis.

*(Catatan: Direktori lingkungan kerja lanjutan seperti `Poverty_Mapping` sengaja dikecualikan dari repositori ini untuk menjaga kemurnian arsitektur inti).*

---

## 🚀 Panduan Instalasi dan Penggunaan

### Persyaratan Sistem
- Web Server Lokal (seperti XAMPP, Laragon, atau MAMP).
- PHP versi 7.4 atau lebih baru (direkomendasikan versi 8+).
- MySQL / MariaDB.

### Langkah-langkah
1. *Clone* atau unduh *repository* ini.
2. Pindahkan seluruh folder `webgis` ke dalam direktori server lokal Anda (misal: `C:\xampp\htdocs\webgis`).
3. Buka phpMyAdmin (http://localhost/phpmyadmin).
4. Buat *database* baru dengan nama persis: **`webgis_pontianak`**.
5. *Import file* SQL (*jika tersedia di paket backup Anda*) ke dalam *database* tersebut untuk mengisi tabel `spbu`, `jalan`, dan `tanah`.
6. Akses aplikasi melalui *browser* Anda:
   - Untuk versi visual murni: `http://localhost/webgis/002/`
   - Untuk versi interaktif dengan filter: `http://localhost/webgis/003/`

---

## 🛠️ Teknologi yang Digunakan
- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Modern Flexbox & CSS Variables).
- **Pemetaan (WebGIS)**: Leaflet.js (Librari Javascript *Open-Source* untuk peta interaktif).
- **Backend API**: PHP murni dengan PDO (PHP Data Objects) untuk keamanan *database*.
- **Database**: MySQL.
- **Geocoding**: Nominatim API (OpenStreetMap) untuk menerjemahkan koordinat lintang/bujur menjadi alamat riil.

---
*Dibuat untuk memenuhi tugas & pembelajaran pengembangan Sistem Informasi Geografis.*
