<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGIS Pontianak V1</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
    <link rel="stylesheet" href="../assets/style.css">
</head>
<body>

    <div id="sidebar-container">
        <div id="sidebar-header">
            WebGis-Pontianak
        </div>
        
        <div id="card-container" class="card-list-area">
            
        </div>
        <button id="toggle-sidebar" onclick="toggleSidebar()">&#10094;</button>
    </div>
    <?php include '../components/modals.php'; ?>
    
    <div id="map"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
    <script src="app.js?v=<?= time(); ?>"></script>
</body>
</html>