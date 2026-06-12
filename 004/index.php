<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGIS Pontianak V4</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
    <link rel="stylesheet" href="../assets/style.css">
</head>
<body>

    <div id="sidebar-container">
        <div id="sidebar-header">WebGis-Pontianak</div>
        <!-- Tab Navigasi -->
        <div class="sidebar-tabs">
            <button class="tab-btn active" onclick="switchTab('tab-kemiskinan')">Pemetaan</button>
            <button class="tab-btn" onclick="switchTab('tab-filter')">Filter Map</button>
        </div>
        <!-- TAB 1: KEMISKINAN (BARU) -->
        <div id="tab-kemiskinan" class="tab-content active">
            <div class="control-panel">
                <button class="btn-gps" onclick="lokasiSaya()">📍 Arahkan ke Lokasi Saya</button>
                <!-- Input Garis Kemiskinan -->
                <div class="add-marker-box" style="margin-bottom: 0; padding: 10px 12px;">
                    <label>Batas Garis Kemiskinan (Rp):</label>
                    <div style="display:flex; gap:8px; margin-top:5px;">
                        <input type="number" id="input-garis-kemiskinan" placeholder="Loading..." class="modern-input">
                        <button class="btn btn-save" onclick="eksekusiUpdateGaris()" style="padding:8px 12px;">Simpan</button>
                    </div>
                </div>
                <!-- Tombol Kelola Program Pelatihan -->
                <button class="btn btn-warning" onclick="bukaModalPelatihan()" style="margin-bottom: 10px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span style="font-size: 1.2rem;">📋</span> Kelola Program Pelatihan
                </button>
                <!-- Tombol Tambah Marker Modern -->
                <div class="modern-action-box">
                    <label>Mode Penambahan Data:</label>
                    <select id="pilihan-marker-baru" class="modern-select">
                        <option value="ibadah">🕌 Pusat Radius (Rumah Ibadah)</option>
                        <option value="penduduk">🏠 Data Keluarga (Penduduk)</option>
                    </select>
                    <button class="btn-modern-add" id="btn-add-kemiskinan" onclick="toggleKemiskinanMode()">
                        <span class="icon">+</span> Aktifkan Kursor Marker
                    </button>
                </div>
                <!-- Legenda Peta -->
                <div class="map-legend">
                    <h4 class="legend-title">Keterangan Marker</h4>
                    <div class="legend-item"><span class="legend-color" style="background-color: var(--gold); border-radius:4px;"></span> Pusat Radius Ibadah</div>
                    <div class="legend-item"><span class="legend-color" style="background-color: #3182CE;"></span> Keluarga Bernaung</div>
                    <div class="legend-item"><span class="legend-color" style="background-color: #805AD5;"></span> Keluarga Luar Naungan</div>
                    <div class="legend-item"><span class="legend-color" style="background-color: #E53E3E;"></span> Kondisi Darurat (Musibah)</div>
                </div>
            </div>
            <div id="kemiskinan-card-container" class="card-list-area"></div>
        </div>

        <!-- TAB 2: FILTER & SPBU (LAMA) -->
        <div id="tab-filter" class="tab-content">
            <div id="filter-bar">
                <button class="filter-tool-btn" onclick="bukaModalFilterLayer()">⚙️</button>
                <span class="filter-label">Status SPBU:</span>
                <button class="filter-tool-btn" onclick="bukaModalFilterSPBU()">🔍</button>
            </div>
            <div id="card-container" class="card-list-area"></div>
        </div>

        <button id="toggle-sidebar" onclick="toggleSidebar()">&#10094;</button>
    </div>

    <?php include '../components/modals.php'; ?>

    <button id="btn-selesai-jalan" onclick="selesaiGambarJalan()">✓ Selesai Gambar Jalan</button>
    <button id="btn-selesai-tanah" onclick="selesaiGambarTanah()">✓ Selesai Area Tanah</button>
    
    <div id="map"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
    <script src="app.js?v=<?= time(); ?>"></script>
</body>
</html>