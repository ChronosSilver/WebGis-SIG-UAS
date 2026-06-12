<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGIS Pontianak V3</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
    <link rel="stylesheet" href="../assets/style.css">
</head>
<body>

    <div id="sidebar-container">
        <div id="sidebar-header">
            WebGis-Pontianak
        </div>
        
        <div id="filter-bar">
            <button class="filter-tool-btn" id="btn-filter-layer" title="Filter Layer" onclick="bukaModalFilterLayer()">⚙️</button>
            <span class="filter-label">Status SPBU:</span>
            <button class="filter-tool-btn" id="btn-filter-spbu" title="Filter SPBU" onclick="bukaModalFilterSPBU()">🔍</button>
        </div>

        <div id="card-container" class="card-list-area">
            
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