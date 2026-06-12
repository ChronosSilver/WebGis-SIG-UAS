// ===================================================
// app.js - ARSITEKTUR WEBGIS V2 (KODE BERSIH & TERPUSAT)
// ===================================================

const state = {
    isMarkerMode: false, isRoadMode: false, isLandMode: false,
    tempRoadCoords: [], tempRoadLayer: null,
    tempLandCoords: [], tempLandLayer: null,
    filterSPBU: 'Semua',
    filterJalan: ['Jalan Nasional', 'Jalan Provinsi', 'Jalan Kabupaten'],
    filterTanah: ['SHM', 'HGB', 'HGU', 'HP']
};

const dataStore = { spbu: {}, jalan: {}, tanah: {} };
const mapLayers = { spbu: {}, jalan: {}, tanah: {} };

const latPontianak = -0.0227; const lngPontianak = 109.3366; const levelZoom = 13;

const savedLat = localStorage.getItem('mapCenterLat');
const savedLng = localStorage.getItem('mapCenterLng');
const savedZoom = localStorage.getItem('mapZoom');

const initialLat = savedLat ? parseFloat(savedLat) : latPontianak;
const initialLng = savedLng ? parseFloat(savedLng) : lngPontianak;
const initialZoom = savedZoom ? parseInt(savedZoom) : levelZoom;

const map = L.map('map', { zoomControl: false }).setView([initialLat, initialLng], initialZoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Menyimpan posisi peta saat bergeser atau zoom
map.on('moveend', function() {
    const center = map.getCenter();
    localStorage.setItem('mapCenterLat', center.lat);
    localStorage.setItem('mapCenterLng', center.lng);
});
map.on('zoomend', function() {
    localStorage.setItem('mapZoom', map.getZoom());
});


// ====================================================
// FITUR BARU: REVERSE GEOCODING (OSM NOMINATIM)
// ====================================================
async function dapatkanAlamat(lat, lng) {
    try {
        // Memanggil API Geocoding Gratis dari OpenStreetMap
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (!response.ok) throw new Error("Gagal mengambil alamat");
        const data = await response.json();
        return data.display_name || "Alamat detail tidak ditemukan di area ini";
    } catch (error) {
        console.error("Geocoding Error:", error);
        return "Gagal memuat alamat. Periksa koneksi internet.";
    }
}


// --- KOMPONEN UI & FILTERING ---
window.toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar-container');
    const btn = document.getElementById('toggle-sidebar');
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    btn.innerHTML = isCollapsed ? '&#10095;' : '&#10094;';
    
    // Simpan status sidebar ke memori browser
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    
    setTimeout(() => map.invalidateSize(), 300); 
};

// Mengembalikan status sidebar saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        const sidebar = document.getElementById('sidebar-container');
        const btn = document.getElementById('toggle-sidebar');
        if(sidebar && btn) {
            sidebar.classList.add('collapsed');
            btn.innerHTML = '&#10095;';
        }
    }
    
    // Khusus 001: Sembunyikan seluruh filter bar (layer jalan/tanah & filter SPBU)
    const filterBar = document.getElementById('filter-bar');
    if (filterBar) filterBar.style.display = 'none';
});

window.bukaModalFilterLayer = () => document.getElementById('modal-filter-layer').style.display = 'flex';
window.bukaModalFilterSPBU = () => document.getElementById('modal-filter-spbu').style.display = 'flex';

const RightToolbar = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function() {
        const container = L.DomUtil.create('div', 'custom-leaflet-toolbar');
        container.innerHTML = `
            <button class="tool-btn" id="btn-tool-marker" title="Mode Marker" onclick="toggleMarkerMode()">📍</button>
        `;
        L.DomEvent.disableClickPropagation(container);
        return container;
    }
});
map.addControl(new RightToolbar());

window.terapkanFilterSPBU = () => {
    state.filterSPBU = document.querySelector('input[name="rad-spbu"]:checked').value;
    document.getElementById('modal-filter-spbu').style.display = 'none';
    renderSPBU(); 
};

window.terapkanFilterLayer = () => {
    state.filterJalan = Array.from(document.querySelectorAll('.cb-jalan:checked')).map(cb => cb.value);
    state.filterTanah = Array.from(document.querySelectorAll('.cb-tanah:checked')).map(cb => cb.value);
    document.getElementById('modal-filter-layer').style.display = 'none';
    renderJalan(); renderTanah(); 
};


// --- LOGIKA ALAT PETA ---
window.toggleMarkerMode = () => {
    if (state.isRoadMode) toggleRoadMode(); if (state.isLandMode) toggleLandMode();
    state.isMarkerMode = !state.isMarkerMode;
    const btn = document.getElementById('btn-tool-marker');
    if (state.isMarkerMode) {
        btn.classList.add('active'); map.getContainer().style.cursor = 'crosshair';
        Object.values(mapLayers.spbu).forEach(m => m.dragging.enable());
    } else {
        btn.classList.remove('active'); map.getContainer().style.cursor = '';
        Object.values(mapLayers.spbu).forEach(m => m.dragging.disable());
    }
};

window.toggleRoadMode = () => {
    if (state.isMarkerMode) toggleMarkerMode(); if (state.isLandMode) toggleLandMode();
    state.isRoadMode = !state.isRoadMode;
    const btn = document.getElementById('btn-tool-jalan');
    if (state.isRoadMode) {
        btn.classList.add('active'); map.getContainer().style.cursor = 'crosshair';
    } else {
        btn.classList.remove('active'); map.getContainer().style.cursor = ''; batalGambarJalan(); 
    }
};

window.toggleLandMode = () => {
    if (state.isMarkerMode) toggleMarkerMode(); if (state.isRoadMode) toggleRoadMode();
    state.isLandMode = !state.isLandMode;
    const btn = document.getElementById('btn-tool-tanah');
    if (state.isLandMode) {
        btn.classList.add('active'); map.getContainer().style.cursor = 'crosshair';
    } else {
        btn.classList.remove('active'); map.getContainer().style.cursor = ''; batalGambarTanah(); 
    }
};

map.on('click', async function(e) {
    if (state.isMarkerMode) {
        resetFormModal();
        document.getElementById('spbu-modal-title').innerText = "Tambah SPBU Baru";
        document.getElementById('spbu-lat').value = e.latlng.lat; 
        document.getElementById('spbu-lng').value = e.latlng.lng;
        
        // Atur state loading untuk alamat
        const alamatInput = document.getElementById('spbu-alamat');
        alamatInput.value = "Sedang melacak alamat dari satelit...";
        
        document.getElementById('spbu-action-wrapper').innerHTML = `
            <button class="btn btn-save" id="btn-eksekusi-spbu" onclick="eksekusiSimpanBaru()" disabled>Tunggu Alamat...</button>
            <button class="btn btn-cancel" onclick="tutupModalSpbu()">Batal</button>`;
        bukaModalSpbu();

        // KUNCI: Tarik alamat secara asinkron lalu buka kunci tombol simpan
        const alamatDitemukan = await dapatkanAlamat(e.latlng.lat, e.latlng.lng);
        alamatInput.value = alamatDitemukan;
        
        const btnSimpan = document.getElementById('btn-eksekusi-spbu');
        if(btnSimpan) {
            btnSimpan.innerText = "Simpan Lokasi";
            btnSimpan.disabled = false;
        }

    } 
    else if (state.isRoadMode) {
        state.tempRoadCoords.push([e.latlng.lat, e.latlng.lng]);
        if (state.tempRoadLayer) map.removeLayer(state.tempRoadLayer);
        state.tempRoadLayer = L.polyline(state.tempRoadCoords, { color: '#1A365D', weight: 4, dashArray: '5, 8' }).addTo(map);
        const btnSelesai = document.getElementById('btn-selesai-jalan');
        if (btnSelesai && state.tempRoadCoords.length >= 2) btnSelesai.style.display = 'block';
    }
    else if (state.isLandMode) {
        state.tempLandCoords.push([e.latlng.lat, e.latlng.lng]);
        if (state.tempLandLayer) map.removeLayer(state.tempLandLayer);
        state.tempLandLayer = L.polygon(state.tempLandCoords, { color: '#D69E2E', fillColor: '#D69E2E', fillOpacity: 0.4, weight: 3, dashArray: '5, 8' }).addTo(map);
        const btnSelesai = document.getElementById('btn-selesai-tanah');
        if (btnSelesai && state.tempLandCoords.length >= 3) btnSelesai.style.display = 'block';
    }
});


// --- UTILITAS & KOSMETIK MODAL ---
function triggerToastNotification(pesan = "Aksi berhasil dieksekusi!") {
    const toast = document.getElementById('toast-notification');
    toast.innerText = pesan; toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

const setupDropdownColor = (idSelect, colorMap) => {
    const select = document.getElementById(idSelect);
    if(select) {
        const update = () => { select.style.borderLeftColor = colorMap[select.value] || '#CBD5E0'; };
        select.addEventListener('change', update);
    }
};
setupDropdownColor('jalan-status', { 'Jalan Nasional': '#E53E3E', 'Jalan Provinsi': '#3182CE', 'Jalan Kabupaten': '#38A169' });
setupDropdownColor('tanah-status', { 'SHM': '#38A169', 'HGB': '#DD6B20', 'HGU': '#3182CE', 'HP': '#718096' });

function bukaModalSpbu() { document.getElementById('modal-spbu').style.display = 'flex'; }
window.tutupModalSpbu = function() { 
    document.getElementById('modal-spbu').style.display = 'none'; 
    document.getElementById('spbu-nama').readOnly = false; document.getElementById('spbu-telp').readOnly = false; document.getElementById('spbu-status').disabled = false;
};
function resetFormModal() {
    document.getElementById('spbu-id').value = ""; document.getElementById('spbu-nama').value = "";
    document.getElementById('spbu-telp').value = ""; document.getElementById('spbu-status').value = "Buka 24 Jam";
    document.getElementById('spbu-alamat').value = "";
}

window.handleMarkerClick = function(id) {
    if (state.isMarkerMode || state.isRoadMode || state.isLandMode) return; 
    if (!dataStore.spbu[id]) return; 
    const d = dataStore.spbu[id];
    document.getElementById('spbu-id').value = d.id; 
    document.getElementById('spbu-nama').value = d.nama_spbu;
    document.getElementById('spbu-telp').value = d.no_telp; 
    document.getElementById('spbu-status').value = d.status_operasional;
    document.getElementById('spbu-alamat').value = d.alamat || "Alamat belum direkam";
    
    document.getElementById('spbu-modal-title').innerText = "Detail & Kelola SPBU";
    document.getElementById('spbu-action-wrapper').innerHTML = `
        <button class="btn btn-warning" onclick="eksekusiUpdate(${id})">Simpan Perubahan</button>
        <button class="btn btn-danger" onclick="eksekusiHapus(${id})">Hapus Marker</button>
        <button class="btn btn-cancel" onclick="tutupModalSpbu()">Tutup</button>`;
    bukaModalSpbu();
};

window.lihatSpbuDariCard = function(id) {
    if (!dataStore.spbu[id]) return; const d = dataStore.spbu[id];
    document.getElementById('spbu-id').value = d.id; 
    document.getElementById('spbu-nama').value = d.nama_spbu;
    document.getElementById('spbu-telp').value = d.no_telp; 
    document.getElementById('spbu-status').value = d.status_operasional;
    document.getElementById('spbu-alamat').value = d.alamat || "Alamat belum direkam";

    document.getElementById('spbu-nama').readOnly = true; 
    document.getElementById('spbu-telp').readOnly = true; 
    document.getElementById('spbu-status').disabled = true;
    
    document.getElementById('spbu-modal-title').innerText = "Informasi SPBU (Read-Only)";
    document.getElementById('spbu-action-wrapper').innerHTML = `<button class="btn btn-cancel" style="width:100%" onclick="tutupModalSpbu()">Kembali</button>`;
    bukaModalSpbu();
};

// ... JALAN & TANAH UI FUNCTIONS (TETAP SAMA SEPERTI SEBELUMNYA) ...
window.selesaiGambarJalan = function() {
    if (state.tempRoadCoords.length < 2) return;
    let totalJarak = 0;
    for (let i = 0; i < state.tempRoadCoords.length - 1; i++) totalJarak += map.distance(L.latLng(state.tempRoadCoords[i]), L.latLng(state.tempRoadCoords[i+1]));
    document.getElementById('jalan-id').value = ""; document.getElementById('jalan-nama').value = ""; document.getElementById('jalan-status').value = "Jalan Kabupaten";
    document.getElementById('jalan-status').dispatchEvent(new Event('change')); 
    document.getElementById('jalan-jarak').value = Math.round(totalJarak); document.getElementById('jalan-koordinat').value = JSON.stringify(state.tempRoadCoords);
    document.getElementById('jalan-modal-title').innerText = "Simpan Data Jalan";
    document.getElementById('jalan-action-wrapper').innerHTML = `
        <button class="btn btn-save" onclick="eksekusiSimpanJalan()">Simpan Jalan</button>
        <button class="btn btn-cancel" onclick="batalGambarJalan()">Batal</button>`;
    document.getElementById('modal-jalan').style.display = 'flex'; document.getElementById('btn-selesai-jalan').style.display = 'none';
};
window.batalGambarJalan = function() {
    state.tempRoadCoords = []; if (state.tempRoadLayer) map.removeLayer(state.tempRoadLayer); state.tempRoadLayer = null;
    const btn = document.getElementById('btn-selesai-jalan'); if (btn) btn.style.display = 'none'; document.getElementById('modal-jalan').style.display = 'none';
};
window.handleRoadClick = function(id) {
    if (state.isRoadMode || state.isMarkerMode || state.isLandMode || !dataStore.jalan[id]) return; 
    const d = dataStore.jalan[id];
    document.getElementById('jalan-id').value = d.id; document.getElementById('jalan-nama').value = d.nama_jalan;
    document.getElementById('jalan-status').value = d.status_jalan; document.getElementById('jalan-jarak').value = d.jarak_meter;
    document.getElementById('jalan-status').dispatchEvent(new Event('change')); 
    document.getElementById('jalan-nama').readOnly = false; document.getElementById('jalan-status').disabled = false;
    document.getElementById('jalan-modal-title').innerText = "Detail & Kelola Jalan";
    document.getElementById('jalan-action-wrapper').innerHTML = `
        <button class="btn btn-warning" onclick="eksekusiUpdateJalan(${id})">Simpan Perubahan</button>
        <button class="btn btn-danger" onclick="eksekusiHapusJalan(${id})">Hapus Jalan</button>
        <button class="btn btn-cancel" onclick="document.getElementById('modal-jalan').style.display='none'">Tutup</button>`;
    document.getElementById('modal-jalan').style.display = 'flex';
};

window.selesaiGambarTanah = function() {
    if (state.tempLandCoords.length < 3) return;
    let area = 0, R = 6378137; 
    const ll = state.tempLandCoords.map(c => L.latLng(c[0], c[1]));
    for (let i = 0; i < ll.length; i++) {
        let p1 = ll[i], p2 = ll[(i + 1) % ll.length];
        area += (p2.lng - p1.lng) * Math.PI / 180 * (2 + Math.sin(p1.lat * Math.PI / 180) + Math.sin(p2.lat * Math.PI / 180));
    }
    document.getElementById('tanah-id').value = ""; document.getElementById('tanah-nama').value = ""; document.getElementById('tanah-status').value = "SHM";
    document.getElementById('tanah-status').dispatchEvent(new Event('change')); 
    document.getElementById('tanah-luas').value = Math.round(Math.abs(area * R * R / 2.0)); document.getElementById('tanah-koordinat').value = JSON.stringify(state.tempLandCoords);
    document.getElementById('tanah-modal-title').innerText = "Simpan Data Parsil Tanah";
    document.getElementById('tanah-action-wrapper').innerHTML = `
        <button class="btn btn-save" onclick="eksekusiSimpanTanah()">Simpan Area</button>
        <button class="btn btn-cancel" onclick="batalGambarTanah()">Batal</button>`;
    document.getElementById('modal-tanah').style.display = 'flex'; document.getElementById('btn-selesai-tanah').style.display = 'none';
};
window.batalGambarTanah = function() {
    state.tempLandCoords = []; if (state.tempLandLayer) map.removeLayer(state.tempLandLayer); state.tempLandLayer = null;
    const btn = document.getElementById('btn-selesai-tanah'); if (btn) btn.style.display = 'none'; document.getElementById('modal-tanah').style.display = 'none';
};
window.handleLandClick = function(id) {
    if (state.isRoadMode || state.isMarkerMode || state.isLandMode || !dataStore.tanah[id]) return; 
    const d = dataStore.tanah[id];
    document.getElementById('tanah-id').value = d.id; document.getElementById('tanah-nama').value = d.nama_pemilik;
    document.getElementById('tanah-status').value = d.status_kepemilikan; document.getElementById('tanah-luas').value = d.luas_meter;
    document.getElementById('tanah-status').dispatchEvent(new Event('change')); 
    document.getElementById('tanah-modal-title').innerText = "Detail & Kelola Tanah";
    document.getElementById('tanah-action-wrapper').innerHTML = `
        <button class="btn btn-warning" onclick="eksekusiUpdateTanah(${id})">Simpan Perubahan</button>
        <button class="btn btn-danger" onclick="eksekusiHapusTanah(${id})">Hapus Tanah</button>
        <button class="btn btn-cancel" onclick="document.getElementById('modal-tanah').style.display='none'">Tutup</button>`;
    document.getElementById('modal-tanah').style.display = 'flex';
};


// ====================================================
// DECOUPLED RENDERING ENGINE (LOGIKA PENGGAMBARAN)
// ====================================================

function renderSPBU() {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = ''; 
    Object.values(mapLayers.spbu).forEach(m => map.removeLayer(m));
    mapLayers.spbu = {};

    Object.values(dataStore.spbu).forEach(d => {
        if (state.filterSPBU !== 'Semua' && d.status_operasional !== state.filterSPBU) return;
        const isBuka = d.status_operasional === 'Buka 24 Jam';
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-wrapper"><div class="marker-pin" style="background-color: ${isBuka ? '#28a745' : '#dc3545'};"></div><i class="marker-dot"></i></div>`,
            iconSize: [30, 42], iconAnchor: [15, 42]
        });

        const marker = L.marker([d.latitude, d.longitude], { icon: customIcon, draggable: state.isMarkerMode }).addTo(map);
        marker.bindTooltip(`<b>${d.nama_spbu}</b>`, { direction: 'top', offset: [0, -35], className: 'spbu-tooltip' });
        marker.on('click', () => handleMarkerClick(d.id));
        
        // KUNCI: Reverse Geocoding saat Drag-and-Drop
        marker.on('dragend', async function(e) {
            const pos = e.target.getLatLng();
            triggerToastNotification("⏳ Menganalisis alamat baru...");
            
            // Tunggu alamat baru dari satelit sebelum dikirim ke database
            const alamatBaru = await dapatkanAlamat(pos.lat, pos.lng);

            fetch('otak_spbu/api_update_coords.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ id: d.id, lat: pos.lat, lng: pos.lng, alamat: alamatBaru })
            }).then(res => res.ok ? res.json() : Promise.reject(res)).then(res => {
                dataStore.spbu[d.id].latitude = pos.lat; 
                dataStore.spbu[d.id].longitude = pos.lng;
                dataStore.spbu[d.id].alamat = alamatBaru;
                triggerToastNotification("📍 Koordinat & Alamat berhasil digeser!");
                renderSPBU(); // Gambar ulang untuk update text di Sidebar
            }).catch(err => {
                alert("Gagal menyimpan posisi."); e.target.setLatLng([dataStore.spbu[d.id].latitude, dataStore.spbu[d.id].longitude]);
            });
        });

        mapLayers.spbu[d.id] = marker;
        
        // Menampilkan Alamat yang terpotong rapi di Sidebar Card
        const statusClass = isBuka ? 'status-buka' : 'status-tutup';
        const alamatRingkas = d.alamat ? (d.alamat.substring(0, 45) + '...') : 'Alamat belum direkam';
        cardContainer.innerHTML += `
            <div class="spbu-card ${statusClass}" onclick="lihatSpbuDariCard(${d.id})">
                <h4>${d.nama_spbu}</h4>
                <p style="font-weight:bold; margin-bottom:4px;">${d.status_operasional} | ${d.no_telp || '-'}</p>
                <p style="font-size:0.75rem; color:#718096; line-height:1.2;">${alamatRingkas}</p>
            </div>`;
    });
}

function renderJalan() {
    Object.values(mapLayers.jalan).forEach(m => map.removeLayer(m));
    mapLayers.jalan = {};

    Object.values(dataStore.jalan).forEach(d => {
        if (!state.filterJalan.includes(d.status_jalan)) return;
        let lineColor = '#38A169', lineWeight = 4;        
        if (d.status_jalan === 'Jalan Nasional') { lineColor = '#E53E3E'; lineWeight = 8; } 
        else if (d.status_jalan === 'Jalan Provinsi') { lineColor = '#3182CE'; lineWeight = 6; }
        
        const polyline = L.polyline(JSON.parse(d.koordinat), { color: lineColor, weight: lineWeight, opacity: 0.8 }).addTo(map);
        polyline.bindTooltip(`<b>${d.nama_jalan}</b><br>${d.jarak_meter} meter`, { direction: 'auto', className: 'spbu-tooltip' });
        polyline.on('mouseover', function(e) { this.setStyle({ weight: lineWeight + 3, opacity: 1 }); });
        polyline.on('mouseout', function(e) { this.setStyle({ weight: lineWeight, opacity: 0.8 }); });
        polyline.on('click', () => handleRoadClick(d.id));
        mapLayers.jalan[d.id] = polyline;
    });
}

function renderTanah() {
    Object.values(mapLayers.tanah).forEach(m => map.removeLayer(m));
    mapLayers.tanah = {};

    Object.values(dataStore.tanah).forEach(d => {
        if (!state.filterTanah.includes(d.status_kepemilikan)) return;
        let fillColor = '#38A169'; 
        if (d.status_kepemilikan === 'HGB') fillColor = '#DD6B20'; 
        else if (d.status_kepemilikan === 'HGU') fillColor = '#3182CE'; 
        else if (d.status_kepemilikan === 'HP') fillColor = '#718096'; 
        
        const polygon = L.polygon(JSON.parse(d.koordinat), { color: fillColor, fillColor: fillColor, fillOpacity: 0.4, weight: 2 }).addTo(map);
        polygon.bindTooltip(`<b>${d.nama_pemilik}</b><br>${d.luas_meter} m² (${d.status_kepemilikan})`, { direction: 'auto', className: 'spbu-tooltip' });
        polygon.on('mouseover', function(e) { this.setStyle({ fillOpacity: 0.7, weight: 4 }); });
        polygon.on('mouseout', function(e) { this.setStyle({ fillOpacity: 0.4, weight: 2 }); });
        polygon.on('click', () => handleLandClick(d.id));
        mapLayers.tanah[d.id] = polygon;
    });
}


// ====================================================
// API FETCH MANAGER (KOMUNIKASI DATABASE)
// ====================================================
const safeFetch = async (url, payload = null) => {
    const options = payload ? { method: 'POST', body: JSON.stringify(payload) } : {};
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
};

// --- SPBU ---
window.muatDataSPBU = () => {
    return safeFetch('../otak_spbu/api_tampil.php').then(data => {
        dataStore.spbu = {}; data.forEach(d => { dataStore.spbu[d.id] = d; }); renderSPBU();
    });
};
window.eksekusiSimpanBaru = () => {
    // Alamat ikut ditangkap dan dikirim
    const payload = { 
        nama: document.getElementById('spbu-nama').value, 
        status: document.getElementById('spbu-status').value, 
        telp: document.getElementById('spbu-telp').value, 
        alamat: document.getElementById('spbu-alamat').value,
        lat: document.getElementById('spbu-lat').value, 
        lng: document.getElementById('spbu-lng').value 
    };
    safeFetch('../otak_spbu/api_simpan.php', payload).then(() => { tutupModalSpbu(); triggerToastNotification("✅ SPBU ditambahkan!"); muatDataSPBU(); }).catch(err => alert(err));
};
window.eksekusiUpdate = (id) => {
    const payload = { id: id, nama: document.getElementById('spbu-nama').value, status: document.getElementById('spbu-status').value, telp: document.getElementById('spbu-telp').value };
    safeFetch('../otak_spbu/api_update.php', payload).then(() => { tutupModalSpbu(); triggerToastNotification("✅ SPBU diperbarui!"); muatDataSPBU(); }).catch(err => alert(err));
};
window.eksekusiHapus = (id) => {
    if(!confirm("Hapus SPBU ini?")) return;
    safeFetch('../otak_spbu/api_hapus.php', { id: id }).then(() => { tutupModalSpbu(); triggerToastNotification("🗑️ SPBU dihapus."); muatDataSPBU(); }).catch(err => alert(err));
};

// --- JALAN ---
window.muatDataJalan = () => {
    return safeFetch('../otak_jalan/api_tampil.php').then(data => {
        dataStore.jalan = {}; data.forEach(d => { dataStore.jalan[d.id] = d; }); renderJalan();
    });
};
window.eksekusiSimpanJalan = () => {
    const payload = { nama: document.getElementById('jalan-nama').value, status: document.getElementById('jalan-status').value, jarak: document.getElementById('jalan-jarak').value, koordinat: document.getElementById('jalan-koordinat').value };
    safeFetch('../otak_jalan/api_simpan.php', payload).then(() => { batalGambarJalan(); triggerToastNotification("✅ Jalan ditambahkan!"); muatDataJalan(); }).catch(err => alert(err));
};
window.eksekusiUpdateJalan = (id) => {
    const payload = { id: id, nama: document.getElementById('jalan-nama').value, status: document.getElementById('jalan-status').value };
    safeFetch('../otak_jalan/api_update.php', payload).then(() => { document.getElementById('modal-jalan').style.display='none'; triggerToastNotification("✅ Jalan diperbarui!"); muatDataJalan(); }).catch(err => alert(err));
};
window.eksekusiHapusJalan = (id) => {
    if(!confirm("Hapus jalur ini?")) return;
    safeFetch('../otak_jalan/api_hapus.php', { id: id }).then(() => { document.getElementById('modal-jalan').style.display='none'; triggerToastNotification("🗑️ Jalan dihapus."); muatDataJalan(); }).catch(err => alert(err));
};

// --- TANAH ---
window.muatDataTanah = () => {
    return safeFetch('../otak_parsil/api_tampil.php').then(data => {
        dataStore.tanah = {}; data.forEach(d => { dataStore.tanah[d.id] = d; }); renderTanah();
    });
};
window.eksekusiSimpanTanah = () => {
    const payload = { nama: document.getElementById('tanah-nama').value, status: document.getElementById('tanah-status').value, luas: document.getElementById('tanah-luas').value, koordinat: document.getElementById('tanah-koordinat').value };
    safeFetch('../otak_parsil/api_simpan.php', payload).then(() => { batalGambarTanah(); triggerToastNotification("✅ Tanah ditambahkan!"); muatDataTanah(); }).catch(err => alert(err));
};
window.eksekusiUpdateTanah = (id) => {
    const payload = { id: id, nama: document.getElementById('tanah-nama').value, status: document.getElementById('tanah-status').value };
    safeFetch('../otak_parsil/api_update.php', payload).then(() => { document.getElementById('modal-tanah').style.display='none'; triggerToastNotification("✅ Tanah diperbarui!"); muatDataTanah(); }).catch(err => alert(err));
};
window.eksekusiHapusTanah = (id) => {
    if(!confirm("Hapus parsil ini?")) return;
    safeFetch('../otak_parsil/api_hapus.php', { id: id }).then(() => { document.getElementById('modal-tanah').style.display='none'; triggerToastNotification("🗑️ Tanah dihapus."); muatDataTanah(); }).catch(err => alert(err));
};


// ====================================================
// LIFECYCLE AWAL (PROMISE ALL MANAGEMENT)
// ====================================================
setTimeout(() => { 
    map.invalidateSize(); 
    console.log("Menghubungkan ke Database untuk penarikan data masal...");
    
    Promise.all([
        muatDataSPBU()
    ]).then(() => {
        console.log("✅ Sistem WebGIS V2 Siap dan Data Tersinkronisasi Penuh.");
    }).catch(err => {
        console.error("Kegagalan Fatal Jaringan:", err);
    });
}, 500);

// ====================================================
// RENDER LAYER GEOJSON (BATAS WILAYAH)
// ====================================================
fetch('../components/Admin_Kecamatan.json')
    .then(response => {
        if (!response.ok) throw new Error("File GeoJSON tidak ditemukan.");
        return response.json();
    })
    .then(data => {
        L.geoJSON(data, {
            style: function(feature) {
                return {
                    color: "#000000",      // Warna garis batas (Hitam)
                    weight: 2,             // Ketebalan garis
                    opacity: 0.7,
                    fillColor: "#0056b3",  // Warna isi wilayah
                    fillOpacity: 0.1       // Transparansi agar peta di bawahnya tetap terlihat
                };
            },
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.KECAMATAN) {
                    layer.bindPopup(`<b>Wilayah:</b> ${feature.properties.KECAMATAN}`);
                }
            }
        }).addTo(map);
        console.log("Layer GeoJSON Batas Wilayah berhasil dimuat.");
    })
    .catch(error => console.error("Gagal memuat layer wilayah:", error));