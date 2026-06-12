// ===================================================
// app.js - ARSITEKTUR WEBGIS V3 (SPBU + KEMISKINAN TERPADU)
// ===================================================

const state = {
    isMarkerMode: false, 
    isRoadMode: false, 
    isLandMode: false,
    isKemiskinanMode: false, 
    newMarkerType: 'ibadah', 
    
    isGhostLocked: false,
    
    tempRoadCoords: [], tempRoadLayer: null,
    tempLandCoords: [], tempLandLayer: null,
    
    filterSPBU: 'Semua',
    filterJalan: ['Jalan Nasional', 'Jalan Provinsi', 'Jalan Kabupaten'],
    filterTanah: ['SHM', 'HGB', 'HGU', 'HP'],
    
    garisKemiskinan: 500000 
};

const dataStore = { spbu: {}, jalan: {}, tanah: {}, ibadah: {}, penduduk: {} };
const mapLayers = { spbu: {}, jalan: {}, tanah: {}, ibadah: {}, penduduk: {}, radiusIbadah: {} };

const savedLat = parseFloat(localStorage.getItem('webgis_map_lat'));
const savedLng = parseFloat(localStorage.getItem('webgis_map_lng'));
const savedZoom = parseInt(localStorage.getItem('webgis_map_zoom'));

const startLat = !isNaN(savedLat) ? savedLat : -0.0227;
const startLng = !isNaN(savedLng) ? savedLng : 109.3366;
const startZoom = !isNaN(savedZoom) ? savedZoom : 15;

const map = L.map('map', { zoomControl: false }).setView([startLat, startLng], startZoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OSM' }).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);

function simpanPosisiPeta() {
    const center = map.getCenter();
    localStorage.setItem('webgis_map_lat', center.lat);
    localStorage.setItem('webgis_map_lng', center.lng);
    localStorage.setItem('webgis_map_zoom', map.getZoom());
}
map.on('moveend', simpanPosisiPeta);
map.on('zoomend', simpanPosisiPeta);

// ====================================================
// GHOST MARKER (EFEK KURSOR MENGIKUTI MOUSE)
// ====================================================
let ghostMarker = null;
map.on('mousemove', function(e) {
    if (state.isKemiskinanMode && !state.isGhostLocked) {
        let isIbadah = state.newMarkerType === 'ibadah';
        let pinColor = isIbadah ? 'var(--gold)' : 'var(--navy)';
        
        let iconHtml = isIbadah ? 
            `<div class="marker-wrapper" style="opacity:0.7; transform:scale(0.9)"><div class="marker-ibadah"></div><i class="marker-ibadah-dot"></i></div>` : 
            `<div class="marker-wrapper" style="opacity:0.7; transform:scale(0.9)"><div class="marker-pin" style="background-color: ${pinColor}; border-radius: 50%;"></div><i class="marker-dot"></i></div>`;
        
        if (!ghostMarker) {
            ghostMarker = L.marker(e.latlng, {
                icon: L.divIcon({ className: 'custom-div-icon', html: iconHtml, iconSize: [30, 42], iconAnchor: [15, 42] }),
                interactive: false 
            }).addTo(map);
        } else {
            ghostMarker.setLatLng(e.latlng);
            ghostMarker.setIcon(L.divIcon({ className: 'custom-div-icon', html: iconHtml, iconSize: [30, 42], iconAnchor: [15, 42] }));
        }
    } else if (!state.isKemiskinanMode) {
        if (ghostMarker) { map.removeLayer(ghostMarker); ghostMarker = null; }
    }
});

// ====================================================
// CORE UTILITIES: GEOCODING & TOAST
// ====================================================
async function dapatkanAlamat(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        return data.display_name || "Alamat tidak spesifik";
    } catch (error) { return "Gagal melacak alamat dari satelit"; }
}

function triggerToastNotification(pesan) {
    const toast = document.getElementById('toast-notification');
    toast.innerText = pesan; toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ====================================================
// MANAJEMEN UI PERSISTENT (LOCAL STORAGE)
// ====================================================
window.toggleSidebar = () => {
    const s = document.getElementById('sidebar-container'); 
    const b = document.getElementById('toggle-sidebar');
    s.classList.toggle('collapsed'); 
    const isCollapsed = s.classList.contains('collapsed');
    b.innerHTML = isCollapsed ? '&#10095;' : '&#10094;';
    localStorage.setItem('webgis_sidebar_collapsed', isCollapsed);
    setTimeout(() => map.invalidateSize(), 300); 
};

window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const targetBtn = document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`);
    const targetContent = document.getElementById(tabId);
    if (targetBtn && targetContent) {
        targetBtn.classList.add('active'); targetContent.classList.add('active');
        localStorage.setItem('webgis_active_tab', tabId);
    }
};

function pulihkanIngatanUI() {
    const isCollapsed = localStorage.getItem('webgis_sidebar_collapsed') === 'true';
    if (isCollapsed) {
        const s = document.getElementById('sidebar-container'); const b = document.getElementById('toggle-sidebar');
        if (s && b) { s.classList.add('collapsed'); b.innerHTML = '&#10095;'; }
    }
    const savedTab = localStorage.getItem('webgis_active_tab');
    if (savedTab) switchTab(savedTab);
}

window.lokasiSaya = () => {
    triggerToastNotification("Mencari lokasi GPS..."); map.locate({enableHighAccuracy: true});
};
map.on('locationfound', function(e) { map.setView(e.latlng, 16); triggerToastNotification("Lokasi GPS ditemukan."); });
map.on('locationerror', function(e) { triggerToastNotification("Gagal mendeteksi lokasi GPS. Periksa izin browser Anda."); });

window.bukaModalFilterLayer = () => document.getElementById('modal-filter-layer').style.display = 'flex';
window.bukaModalFilterSPBU = () => document.getElementById('modal-filter-spbu').style.display = 'flex';

window.terapkanFilterSPBU = () => {
    state.filterSPBU = document.querySelector('input[name="rad-spbu"]:checked').value;
    document.getElementById('modal-filter-spbu').style.display = 'none'; renderSPBU(); 
};
window.terapkanFilterLayer = () => {
    state.filterJalan = Array.from(document.querySelectorAll('.cb-jalan:checked')).map(cb => cb.value);
    state.filterTanah = Array.from(document.querySelectorAll('.cb-tanah:checked')).map(cb => cb.value);
    document.getElementById('modal-filter-layer').style.display = 'none'; renderJalan(); renderTanah(); 
};

const setupDropdownColor = (idSelect, colorMap) => {
    const select = document.getElementById(idSelect);
    if(select) { select.addEventListener('change', () => select.style.borderLeftColor = colorMap[select.value] || '#CBD5E0'); }
};
setupDropdownColor('jalan-status', { 'Jalan Nasional': '#E53E3E', 'Jalan Provinsi': '#3182CE', 'Jalan Kabupaten': '#38A169' });
setupDropdownColor('tanah-status', { 'SHM': '#38A169', 'HGB': '#DD6B20', 'HGU': '#3182CE', 'HP': '#718096' });

// ====================================================
// MANAJEMEN MODE ALAT PETA (CROSS-LOCKING)
// ====================================================
const resetAllModes = () => {
    state.isMarkerMode = false; document.getElementById('btn-tool-marker')?.classList.remove('active');
    state.isRoadMode = false; document.getElementById('btn-tool-jalan')?.classList.remove('active');
    state.isLandMode = false; document.getElementById('btn-tool-tanah')?.classList.remove('active');
    state.isKemiskinanMode = false; document.getElementById('btn-add-kemiskinan')?.classList.remove('active');
    
    state.isGhostLocked = false;
    map.getContainer().style.cursor = '';
    if (ghostMarker) { map.removeLayer(ghostMarker); ghostMarker = null; }
    map.closePopup(); 
    
    Object.values(mapLayers.spbu).forEach(m => m.dragging?.disable());
    batalGambarJalan(); batalGambarTanah();
    
    const btnKemiskinan = document.getElementById('btn-add-kemiskinan');
    if(btnKemiskinan) btnKemiskinan.innerHTML = `<span class="icon">+</span> Aktifkan Kursor Marker`;
};

window.toggleMarkerMode = () => {
    const wasActive = state.isMarkerMode; resetAllModes();
    if (!wasActive) { state.isMarkerMode = true; document.getElementById('btn-tool-marker').classList.add('active'); map.getContainer().style.cursor = 'crosshair'; Object.values(mapLayers.spbu).forEach(m => m.dragging?.enable()); }
};
window.toggleRoadMode = () => {
    const wasActive = state.isRoadMode; resetAllModes();
    if (!wasActive) { state.isRoadMode = true; document.getElementById('btn-tool-jalan').classList.add('active'); map.getContainer().style.cursor = 'crosshair'; }
};
window.toggleLandMode = () => {
    const wasActive = state.isLandMode; resetAllModes();
    if (!wasActive) { state.isLandMode = true; document.getElementById('btn-tool-tanah').classList.add('active'); map.getContainer().style.cursor = 'crosshair'; }
};
window.toggleKemiskinanMode = () => {
    const wasActive = state.isKemiskinanMode; resetAllModes();
    if (!wasActive) { 
        state.isKemiskinanMode = true; const btn = document.getElementById('btn-add-kemiskinan');
        btn.classList.add('active'); btn.innerHTML = `<span class="icon">📍</span> Mode Penempatan Aktif`;
        map.getContainer().style.cursor = 'none'; 
    }
};

document.getElementById('pilihan-marker-baru')?.addEventListener('change', function(e) { state.newMarkerType = e.target.value; });

const RightToolbar = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function() {
        const c = L.DomUtil.create('div', 'custom-leaflet-toolbar');
        c.innerHTML = `<button class="tool-btn" id="btn-tool-marker" title="SPBU" onclick="toggleMarkerMode()">📍</button><button class="tool-btn" id="btn-tool-jalan" title="Jalan" onclick="toggleRoadMode()">🛣️</button><button class="tool-btn" id="btn-tool-tanah" title="Tanah" onclick="toggleLandMode()">🟩</button>`;
        L.DomEvent.disableClickPropagation(c); return c;
    }
});
map.addControl(new RightToolbar());

// ====================================================
// EVENT LISTENER ROUTER (KLIK PETA UTAMA)
// ====================================================
function bukaGembokForm(prefix) {
    const nama = document.getElementById(`${prefix}-nama`);
    const status = document.getElementById(`${prefix}-status`);
    const telp = document.getElementById(`${prefix}-telp`);
    
    if (nama) { nama.readOnly = false; nama.removeAttribute('readonly'); }
    if (status) { status.disabled = false; status.removeAttribute('disabled'); }
    if (telp) { telp.readOnly = false; telp.removeAttribute('readonly'); }
}

function resetFormModal() {
    document.getElementById('spbu-id').value = ""; 
    document.getElementById('spbu-nama').value = "";
    document.getElementById('spbu-telp').value = ""; 
    document.getElementById('spbu-status').value = "Buka 24 Jam";
    if(document.getElementById('spbu-alamat')) document.getElementById('spbu-alamat').value = "";
    bukaGembokForm('spbu');
}

map.on('click', async function(e) {
    if (state.isMarkerMode) {
        resetFormModal();
        document.getElementById('spbu-modal-title').innerText = "Tambah SPBU Baru";
        document.getElementById('spbu-lat').value = e.latlng.lat; 
        document.getElementById('spbu-lng').value = e.latlng.lng;
        
        const alamatInput = document.getElementById('spbu-alamat');
        if(alamatInput) alamatInput.value = "Sedang melacak alamat dari satelit...";
        
        document.getElementById('spbu-action-wrapper').innerHTML = `<button class="btn btn-save" id="btn-eksekusi-spbu" onclick="eksekusiSimpanBaru()" disabled>Tunggu Alamat...</button><button class="btn btn-cancel" onclick="document.getElementById('modal-spbu').style.display='none'">Batal</button>`;
        document.getElementById('modal-spbu').style.display = 'flex';
        
        setTimeout(() => { const input = document.getElementById('spbu-nama'); if(input) input.focus(); }, 100);

        const alamatDitemukan = await dapatkanAlamat(e.latlng.lat, e.latlng.lng);
        if(alamatInput) alamatInput.value = alamatDitemukan;
        const btnSimpan = document.getElementById('btn-eksekusi-spbu');
        if(btnSimpan) { btnSimpan.innerText = "Simpan Lokasi"; btnSimpan.disabled = false; }
    } 
    else if (state.isRoadMode) {
        state.tempRoadCoords.push([e.latlng.lat, e.latlng.lng]);
        if (state.tempRoadLayer) map.removeLayer(state.tempRoadLayer);
        state.tempRoadLayer = L.polyline(state.tempRoadCoords, { color: '#1A365D', weight: 4, dashArray: '5, 8' }).addTo(map);
        const btn = document.getElementById('btn-selesai-jalan'); 
        if (btn && state.tempRoadCoords.length >= 2) btn.style.display = 'block';
    }
    else if (state.isLandMode) {
        state.tempLandCoords.push([e.latlng.lat, e.latlng.lng]);
        if (state.tempLandLayer) map.removeLayer(state.tempLandLayer);
        state.tempLandLayer = L.polygon(state.tempLandCoords, { color: '#D69E2E', fillColor: '#D69E2E', fillOpacity: 0.4, weight: 3, dashArray: '5, 8' }).addTo(map);
        const btn = document.getElementById('btn-selesai-tanah'); 
        if (btn && state.tempLandCoords.length >= 3) btn.style.display = 'block';
    }
    else if (state.isKemiskinanMode) {
        if (state.isGhostLocked) {
            triggerToastNotification("Selesaikan atau tutup formulir yang sedang terbuka terlebih dahulu.");
            return; 
        }

        state.isGhostLocked = true;
        triggerToastNotification("Menganalisis satelit...");
        
        let popupContent = "";
        if (state.newMarkerType === 'ibadah') {
            const tmpl = document.getElementById('template-popup-ibadah');
            if(tmpl) popupContent = tmpl.innerHTML;
        } else {
            const tmpl = document.getElementById('template-popup-penduduk');
            if(tmpl) popupContent = tmpl.innerHTML;
        }

        const popup = L.popup({ closeOnClick: false, autoClose: false })
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map);
            
        popup.on('remove', function() {
            state.isGhostLocked = false;
        });

        const alamatDitemukan = await dapatkanAlamat(e.latlng.lat, e.latlng.lng);
        
        const elAlamatIb = document.getElementById('pop-ib-alamat');
        const elAlamatPd = document.getElementById('pop-pd-alamat');
        
        if (elAlamatIb) {
            elAlamatIb.value = alamatDitemukan;
            const btnSimpan = document.getElementById('btn-pop-simpan');
            if(btnSimpan) {
                btnSimpan.innerText = "Simpan Ibadah";
                btnSimpan.disabled = false;
                btnSimpan.onclick = () => simpanIbadahPopup(e.latlng.lat, e.latlng.lng, popup);
            }
        } else if (elAlamatPd) {
            elAlamatPd.value = alamatDitemukan;
            const btnSimpan = document.getElementById('btn-pop-simpan');
            if(btnSimpan) {
                btnSimpan.innerText = "Simpan Penduduk";
                btnSimpan.disabled = false;
                btnSimpan.onclick = () => simpanPendudukPopup(e.latlng.lat, e.latlng.lng, popup);
            }
        }
    }
});

// ====================================================
// DECISION SUPPORT SYSTEM (DSS) KEMISKINAN (SKOR 0-5)
// ====================================================
function kalkulasiDSS(pengeluaran, pmtScore) {
    if (pengeluaran > state.garisKemiskinan) return "Tidak Miskin";
    
    if (pmtScore >= 4) return "Sangat Miskin"; 
    if (pmtScore >= 2) return "Miskin";        
    if (pmtScore === 1) return "Rentan Miskin"; 
    return "Tidak Miskin"; 
}

function kalkulasiBantuan(status) {
    if (status === 'Sangat Miskin') return { beras: 15, minyak: 3, gula: 2, telur: 2, susu: 4, tunai: 300000 };
    if (status === 'Miskin') return { beras: 10, minyak: 2, gula: 1, telur: 1, susu: 2, tunai: 150000 };
    if (status === 'Rentan Miskin') return { beras: 5, minyak: 1, gula: 1, telur: 0, susu: 0, tunai: 0 };
    return { beras: 0, minyak: 0, gula: 0, telur: 0, susu: 0, tunai: 0 };
}

// ====================================================
// DECOUPLED RENDERING ENGINE (PENGGAMBAR TUNGGAL)
// ====================================================

const agamaToIbadahMap = {
    'Islam': 'Masjid',
    'Kristen': 'Gereja',
    'Katolik': 'Gereja',
    'Hindu': 'Pura',
    'Buddha': 'Vihara',
    'Konghucu': 'Klenteng'
};

function renderSPBU() {
    const cardContainer = document.getElementById('card-container');
    if(cardContainer) cardContainer.innerHTML = ''; 
    Object.values(mapLayers.spbu).forEach(m => map.removeLayer(m)); mapLayers.spbu = {};

    Object.values(dataStore.spbu).forEach(d => {
        if (state.filterSPBU !== 'Semua' && d.status_operasional !== state.filterSPBU) return;
        
        const lat = parseFloat(d.latitude);
        const lng = parseFloat(d.longitude);
        if (isNaN(lat) || isNaN(lng)) return; 

        const isBuka = d.status_operasional === 'Buka 24 Jam';
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-wrapper"><div class="marker-pin" style="background-color: ${isBuka ? '#28a745' : '#dc3545'};"></div><i class="marker-dot"></i></div>`,
            iconSize: [30, 42], iconAnchor: [15, 42]
        });

        const marker = L.marker([lat, lng], { icon: customIcon, draggable: state.isMarkerMode }).addTo(map);
        marker.bindTooltip(`<b>${d.nama_spbu}</b>`, { direction: 'top', offset: [0, -35], className: 'spbu-tooltip' });
        
        marker.on('click', () => {
            if (state.isMarkerMode || state.isRoadMode || state.isLandMode || state.isKemiskinanMode) return; 
            document.getElementById('spbu-id').value = d.id; document.getElementById('spbu-nama').value = d.nama_spbu;
            document.getElementById('spbu-telp').value = d.no_telp; document.getElementById('spbu-status').value = d.status_operasional;
            
            if(document.getElementById('spbu-alamat')) document.getElementById('spbu-alamat').value = d.alamat || "Alamat belum direkam";
            
            bukaGembokForm('spbu');
            
            document.getElementById('spbu-modal-title').innerText = "Detail & Kelola SPBU";
            document.getElementById('spbu-action-wrapper').innerHTML = `<button class="btn btn-warning" onclick="eksekusiUpdate(${d.id})">Simpan Perubahan</button><button class="btn btn-danger" onclick="eksekusiHapus(${d.id})">Hapus Marker</button><button class="btn btn-cancel" onclick="document.getElementById('modal-spbu').style.display='none'">Tutup</button>`;
            document.getElementById('modal-spbu').style.display = 'flex';
        });
        
        marker.on('dragend', async function(e) {
            const pos = e.target.getLatLng();
            triggerToastNotification("⏳ Menganalisis alamat baru...");
            const alamatBaru = await dapatkanAlamat(pos.lat, pos.lng);
            fetch('../otak_spbu/api_update_coords.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: d.id, lat: pos.lat, lng: pos.lng, alamat: alamatBaru })
            }).then(res => res.ok ? res.json() : Promise.reject(res)).then(res => {
                dataStore.spbu[d.id].latitude = pos.lat; dataStore.spbu[d.id].longitude = pos.lng; dataStore.spbu[d.id].alamat = alamatBaru;
                triggerToastNotification("📍 Koordinat & Alamat berhasil digeser!"); renderSPBU(); 
            }).catch(err => { alert("Gagal."); e.target.setLatLng([dataStore.spbu[d.id].latitude, dataStore.spbu[d.id].longitude]); });
        });

        mapLayers.spbu[d.id] = marker;
        const alamatRingkas = d.alamat ? (d.alamat.substring(0, 45) + '...') : 'Alamat belum direkam';
        if(cardContainer) cardContainer.innerHTML += `<div class="spbu-card ${isBuka ? 'status-buka' : 'status-tutup'}" onclick="lihatSpbuDariCard(${d.id})"><h4>${d.nama_spbu}</h4><p style="font-weight:bold; margin-bottom:4px;">${d.status_operasional}</p><p style="font-size:0.75rem; color:#718096; line-height:1.2;">${alamatRingkas}</p></div>`;
    });
}

function renderJalan() {
    Object.values(mapLayers.jalan).forEach(m => map.removeLayer(m)); mapLayers.jalan = {};
    Object.values(dataStore.jalan).forEach(d => {
        if (!state.filterJalan.includes(d.status_jalan)) return;
        
        try {
            const coords = JSON.parse(d.koordinat);
            if (!Array.isArray(coords) || coords.length < 2) return; 
            
            let lineColor = '#38A169', lineWeight = 4;        
            if (d.status_jalan === 'Jalan Nasional') { lineColor = '#E53E3E'; lineWeight = 8; } else if (d.status_jalan === 'Jalan Provinsi') { lineColor = '#3182CE'; lineWeight = 6; }
            const polyline = L.polyline(coords, { color: lineColor, weight: lineWeight, opacity: 0.8 }).addTo(map);
            polyline.bindTooltip(`<b>${d.nama_jalan}</b><br>${d.jarak_meter} meter`, { direction: 'auto', className: 'spbu-tooltip' });
            polyline.on('click', () => { handleRoadClick(d.id); });
            mapLayers.jalan[d.id] = polyline;
        } catch(e) { console.warn("Data jalan korup dilewati:", d.id); }
    });
}

function renderTanah() {
    Object.values(mapLayers.tanah).forEach(m => map.removeLayer(m)); mapLayers.tanah = {};
    Object.values(dataStore.tanah).forEach(d => {
        if (!state.filterTanah.includes(d.status_kepemilikan)) return;
        
        try {
            const coords = JSON.parse(d.koordinat);
            if (!Array.isArray(coords) || coords.length < 3) return; 
            
            let fillColor = '#38A169'; 
            if (d.status_kepemilikan === 'HGB') fillColor = '#DD6B20'; else if (d.status_kepemilikan === 'HGU') fillColor = '#3182CE'; else if (d.status_kepemilikan === 'HP') fillColor = '#718096'; 
            const polygon = L.polygon(coords, { color: fillColor, fillColor: fillColor, fillOpacity: 0.4, weight: 2 }).addTo(map);
            polygon.bindTooltip(`<b>${d.nama_pemilik}</b><br>${d.luas_meter} m²`, { direction: 'auto', className: 'spbu-tooltip' });
            polygon.on('click', () => { handleLandClick(d.id); });
            mapLayers.tanah[d.id] = polygon;
        } catch(e) { console.warn("Data tanah korup dilewati:", d.id); }
    });
}

function renderKemiskinan() {
    const listContainer = document.getElementById('kemiskinan-card-container');
    if(listContainer) listContainer.innerHTML = '';

    Object.values(mapLayers.ibadah).forEach(m => map.removeLayer(m)); mapLayers.ibadah = {};
    Object.values(mapLayers.radiusIbadah).forEach(m => map.removeLayer(m)); mapLayers.radiusIbadah = {};
    Object.values(mapLayers.penduduk).forEach(m => map.removeLayer(m)); mapLayers.penduduk = {};

    const naunganCounter = {}; 
    Object.keys(dataStore.ibadah).forEach(id => naunganCounter[id] = 0);

    const pendudukDiproses = [];
    Object.values(dataStore.penduduk).forEach(p => {
        const pLat = parseFloat(p.latitude); const pLng = parseFloat(p.longitude);
        if (isNaN(pLat) || isNaN(pLng)) return;
        const pos = L.latLng(pLat, pLng); 
        
        let adaNaungan = false;
        let jarakTerdekat = Infinity;
        let idIbadahTerpilih = null;
        let teksNaungan = "Tidak berada di bawah wewenang rumah ibadah manapun";
        
        if (p.status_kemiskinan !== 'Tidak Miskin') {
            const jenisIbadahDicari = agamaToIbadahMap[p.agama];

            if (jenisIbadahDicari) {
                Object.values(dataStore.ibadah).forEach(ib => {
                    if (ib.jenis === jenisIbadahDicari) { 
                        const ibLat = parseFloat(ib.latitude); const ibLng = parseFloat(ib.longitude);
                        if (!isNaN(ibLat) && !isNaN(ibLng)) {
                            const jarakM = map.distance(pos, L.latLng(ibLat, ibLng));
                            if (jarakM <= ib.radius_meter && jarakM < jarakTerdekat) {
                                jarakTerdekat = jarakM;
                                idIbadahTerpilih = ib.id;
                                adaNaungan = true;
                                
                                let namaIb = ib.nama;
                                if (!namaIb.toLowerCase().startsWith(ib.jenis.toLowerCase())) {
                                    namaIb = `${ib.jenis} ${ib.nama}`;
                                }
                                teksNaungan = `Bernaung di bawah wewenang: ${namaIb}`;
                            }
                        }
                    }
                });
            }
        }

        if (adaNaungan && idIbadahTerpilih) {
            naunganCounter[idIbadahTerpilih]++;
        }

        pendudukDiproses.push({ dataMentah: p, lat: pLat, lng: pLng, bernaung: adaNaungan, teksNaungan: teksNaungan });
    });

    Object.values(dataStore.ibadah).forEach(d => {
        const lat = parseFloat(d.latitude); const lng = parseFloat(d.longitude);
        if (isNaN(lat) || isNaN(lng)) return;
        
        let judulIbadah = d.nama;
        const jenisLower = d.jenis.toLowerCase();
        if (!judulIbadah.toLowerCase().startsWith(jenisLower)) {
            judulIbadah = `${d.jenis} ${d.nama}`;
        }
        
        const circle = L.circle([lat, lng], { color: '#D69E2E', fillColor: '#D69E2E', fillOpacity: 0.15, radius: d.radius_meter, weight: 1 }).addTo(map);
        mapLayers.radiusIbadah[d.id] = circle;

        const icon = L.divIcon({ className: 'custom-div-icon', html: `<div class="marker-wrapper"><div class="marker-ibadah"></div><i class="marker-ibadah-dot"></i></div>`, iconSize: [30, 42], iconAnchor: [15, 42] });
        const marker = L.marker([lat, lng], { icon: icon }).addTo(map);
        marker.bindTooltip(`<b>${judulIbadah}</b><br>Radius: ${d.radius_meter}m<br>Naungan: ${naunganCounter[d.id]} KK`, { direction: 'top', className: 'spbu-tooltip' });
        
        marker.on('click', () => {
            if (state.isMarkerMode || state.isRoadMode || state.isLandMode || state.isKemiskinanMode) return;
            
            const tmpl = document.getElementById('template-popup-read-ibadah');
            if(!tmpl) return;
            
            const clone = tmpl.content.cloneNode(true);
            
            clone.querySelector('#read-ib-nama').innerText = judulIbadah;
            clone.querySelector('#read-ib-jenis').innerText = `Jenis: ${d.jenis}`;
            clone.querySelector('#read-ib-radius').innerText = `Radius Jangkauan: ${d.radius_meter} Meter`;
            clone.querySelector('#read-ib-naungan').innerText = `Keluarga dalam radius: ${naunganCounter[d.id]} KK`; 
            clone.querySelector('#read-ib-alamat').innerText = d.alamat || "Alamat tidak direkam";
            
            const wrapper = document.createElement('div');
            wrapper.appendChild(clone);
            
            const popup = L.popup({ minWidth: 260 })
                .setLatLng([lat, lng])
                .setContent(wrapper)
                .openOn(map);
                
            const btnEdit = wrapper.querySelector('#btn-ib-edit');
            if(btnEdit) btnEdit.onclick = () => {
                map.closePopup(popup);
                bukaFormEditIbadah(d, d.nama); 
            };
            
            const btnHapus = wrapper.querySelector('#btn-ib-hapus');
            if(btnHapus) btnHapus.onclick = () => {
                if(confirm(`Yakin ingin menghapus permanen ${judulIbadah}?`)) {
                    map.closePopup(popup);
                    eksekusiHapusIbadah(d.id);
                }
            };
        });

        mapLayers.ibadah[d.id] = marker;

        if(listContainer) listContainer.innerHTML += `<div class="spbu-card card-ibadah"><h4>🕌 ${judulIbadah}</h4><p>${d.jenis} | ${d.radius_meter}m | ${naunganCounter[d.id]} KK</p></div>`;
    });

    pendudukDiproses.forEach(item => {
        const p = item.dataMentah;
        
        let pinColor = item.bernaung ? '#3182CE' : '#805AD5'; 

        const icon = L.divIcon({ className: 'custom-div-icon', html: `<div class="marker-wrapper"><div class="marker-pin" style="background-color: ${pinColor}; border-radius: 50%;"></div><i class="marker-dot"></i></div>`, iconSize: [30, 42], iconAnchor: [15, 42] });
        const marker = L.marker([item.lat, item.lng], { icon: icon }).addTo(map);
        marker.bindTooltip(`<b>KK: ${p.nama_kk}</b><br>PMT: ${p.pmt_score} | ${p.status_kemiskinan}`, { direction: 'top', className: 'spbu-tooltip' });
        
        marker.on('click', () => {
            if (state.isMarkerMode || state.isRoadMode || state.isLandMode || state.isKemiskinanMode) return;
            
            const tmpl = document.getElementById('template-popup-read-penduduk');
            if(!tmpl) return;
            
            const clone = tmpl.content.cloneNode(true);
            
            clone.querySelector('#read-pd-nama').innerText = `Keluarga ${p.nama_kk}`;
            clone.querySelector('#read-pd-alamat').innerText = p.alamat || "Alamat tidak direkam";
            
            const elAgama = clone.querySelector('#read-pd-agama');
            if(elAgama) elAgama.innerText = `Agama: ${p.agama || '-'}`;
            
            const elAnggota = clone.querySelector('#read-pd-anggota');
            if(elAnggota) {
                const totalJiwa = parseInt(p.jml_tanggungan) || 0;
                elAnggota.innerText = `Anggota/Tanggungan: ${totalJiwa} Jiwa`;
            }
            
            const badge = clone.querySelector('#read-pd-badge');
            badge.innerText = p.status_kemiskinan;
            
            if (p.status_kemiskinan === 'Sangat Miskin') badge.className = 'pop-badge badge-sangat-miskin';
            else if (p.status_kemiskinan === 'Miskin') badge.className = 'pop-badge badge-miskin';
            else if (p.status_kemiskinan === 'Rentan Miskin') badge.className = 'pop-badge badge-rentan';
            else badge.className = 'pop-badge badge-aman';
            
            const elNaungan = clone.querySelector('#read-pd-naungan');
            if(elNaungan) {
                elNaungan.innerText = item.teksNaungan;
                elNaungan.className = item.bernaung ? 'pop-naungan naungan-aktif' : 'pop-naungan naungan-pasif';
            }
            
            const btnOpsi = clone.querySelector('#btn-pd-opsi');
            const accContent = clone.querySelector('#acc-pd-content');
            
            const wrapper = document.createElement('div');
            wrapper.appendChild(clone);
            
            const popup = L.popup({ minWidth: 260 })
                .setLatLng([item.lat, item.lng])
                .setContent(wrapper)
                .openOn(map);
                
            if(btnOpsi && accContent) {
                btnOpsi.onclick = () => {
                    accContent.classList.toggle('show');
                    btnOpsi.innerText = accContent.classList.contains('show') ? 'Tutup Opsi' : 'Opsi Lainnya';
                    popup.update();
                };
            }
            
            const btnBantuan = wrapper.querySelector('#btn-pd-bantuan');
            if(btnBantuan) {
                if(!item.bernaung) {
                    btnBantuan.style.display = 'none';
                } else {
                    btnBantuan.onclick = () => {
                        bukaFormLogBantuan(p);
                    };
                }
            }

            const btnRiwayatBantuan = wrapper.querySelector('#btn-pd-riwayat-bantuan');
            if(btnRiwayatBantuan) {
                btnRiwayatBantuan.onclick = () => {
                    bukaFormRiwayatBantuan(p);
                };
            }
            
            const btnEdit = wrapper.querySelector('#btn-pd-edit');
            if(btnEdit) btnEdit.onclick = () => {
                map.closePopup(popup);
                bukaFormEditPenduduk(p);
            };
            
            const btnHapus = wrapper.querySelector('#btn-pd-hapus');
            if(btnHapus) btnHapus.onclick = () => {
                if(confirm(`Anda yakin ingin menghapus permanen data keluarga ${p.nama_kk}?`)) {
                    map.closePopup(popup);
                    eksekusiHapusPenduduk(p.id);
                }
            };
        });
        
        mapLayers.penduduk[p.id] = marker;

        let cls = 'card-penduduk-rentan';
        if(p.status_kemiskinan === 'Sangat Miskin' || p.status_kemiskinan === 'Miskin') cls = 'card-penduduk-miskin';
        if(p.status_kemiskinan === 'Tidak Miskin') cls = 'card-penduduk-aman';

        if(listContainer) listContainer.innerHTML += `<div class="spbu-card ${cls}"><h4>🏠 Kel. ${p.nama_kk}</h4><p>PMT: ${p.pmt_score}/5 | Rp${p.pengeluaran}</p></div>`;
    });
}


// ====================================================
// GEOMETRY BUILDER HELPERS (Jalan & Tanah Selesai)
// ====================================================

window.lihatSpbuDariCard = function(id) {
    if (!dataStore.spbu[id]) return; const d = dataStore.spbu[id];
    document.getElementById('spbu-id').value = d.id; document.getElementById('spbu-nama').value = d.nama_spbu;
    document.getElementById('spbu-telp').value = d.no_telp; document.getElementById('spbu-status').value = d.status_operasional;
    
    if(document.getElementById('spbu-alamat')) document.getElementById('spbu-alamat').value = d.alamat || "Alamat belum direkam";

    document.getElementById('spbu-nama').readOnly = true; document.getElementById('spbu-telp').readOnly = true; document.getElementById('spbu-status').disabled = true;
    document.getElementById('spbu-modal-title').innerText = "Informasi SPBU (Read-Only)";
    document.getElementById('spbu-action-wrapper').innerHTML = `<button class="btn btn-cancel" style="width:100%" onclick="document.getElementById('modal-spbu').style.display='none'">Kembali</button>`;
    document.getElementById('modal-spbu').style.display = 'flex';
};

window.selesaiGambarJalan = function() {
    if (state.tempRoadCoords.length < 2) return;
    let totalJarak = 0;
    for (let i = 0; i < state.tempRoadCoords.length - 1; i++) {
        totalJarak += map.distance(L.latLng(state.tempRoadCoords[i]), L.latLng(state.tempRoadCoords[i+1]));
    }
    document.getElementById('jalan-id').value = ""; document.getElementById('jalan-nama').value = ""; document.getElementById('jalan-status').value = "Jalan Kabupaten"; document.getElementById('jalan-status').dispatchEvent(new Event('change')); 
    document.getElementById('jalan-jarak').value = Math.round(totalJarak);
    document.getElementById('jalan-koordinat').value = JSON.stringify(state.tempRoadCoords);
    
    bukaGembokForm('jalan');
    
    document.getElementById('jalan-action-wrapper').innerHTML = `<button class="btn btn-save" onclick="eksekusiSimpanJalan()">Simpan Jalan</button><button class="btn btn-cancel" onclick="batalGambarJalan()">Batal</button>`;
    document.getElementById('modal-jalan').style.display = 'flex'; document.getElementById('btn-selesai-jalan').style.display = 'none';
};

window.batalGambarJalan = function() {
    state.tempRoadCoords = []; if (state.tempRoadLayer) map.removeLayer(state.tempRoadLayer); state.tempRoadLayer = null;
    const btn = document.getElementById('btn-selesai-jalan'); if (btn) btn.style.display = 'none'; 
    if(document.getElementById('modal-jalan')) document.getElementById('modal-jalan').style.display = 'none';
};

window.handleRoadClick = function(id) {
    if (state.isRoadMode || state.isMarkerMode || state.isLandMode || !dataStore.jalan[id]) return; 
    const d = dataStore.jalan[id];
    document.getElementById('jalan-id').value = d.id; document.getElementById('jalan-nama').value = d.nama_jalan;
    document.getElementById('jalan-status').value = d.status_jalan; document.getElementById('jalan-jarak').value = d.jarak_meter;
    document.getElementById('jalan-status').dispatchEvent(new Event('change')); 
    
    bukaGembokForm('jalan');
    
    document.getElementById('jalan-modal-title').innerText = "Detail & Kelola Jalan";
    document.getElementById('jalan-action-wrapper').innerHTML = `<button class="btn btn-warning" onclick="eksekusiUpdateJalan(${id})">Simpan Perubahan</button><button class="btn btn-danger" onclick="eksekusiHapusJalan(${id})">Hapus Jalan</button><button class="btn btn-cancel" onclick="document.getElementById('modal-jalan').style.display='none'">Tutup</button>`;
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
    document.getElementById('tanah-id').value = ""; document.getElementById('tanah-nama').value = ""; document.getElementById('tanah-status').value = "SHM"; document.getElementById('tanah-status').dispatchEvent(new Event('change')); 
    document.getElementById('tanah-luas').value = Math.round(Math.abs(area * R * R / 2.0));
    document.getElementById('tanah-koordinat').value = JSON.stringify(state.tempLandCoords);
    
    bukaGembokForm('tanah');
    
    document.getElementById('tanah-action-wrapper').innerHTML = `<button class="btn btn-save" onclick="eksekusiSimpanTanah()">Simpan Area</button><button class="btn btn-cancel" onclick="batalGambarTanah()">Batal</button>`;
    document.getElementById('modal-tanah').style.display = 'flex'; document.getElementById('btn-selesai-tanah').style.display = 'none';
};

window.batalGambarTanah = function() {
    state.tempLandCoords = []; if (state.tempLandLayer) map.removeLayer(state.tempLandLayer); state.tempLandLayer = null;
    const btn = document.getElementById('btn-selesai-tanah'); if (btn) btn.style.display = 'none'; 
    if(document.getElementById('modal-tanah')) document.getElementById('modal-tanah').style.display = 'none';
};

window.handleLandClick = function(id) {
    if (state.isRoadMode || state.isMarkerMode || state.isLandMode || !dataStore.tanah[id]) return; 
    const d = dataStore.tanah[id];
    document.getElementById('tanah-id').value = d.id; document.getElementById('tanah-nama').value = d.nama_pemilik;
    document.getElementById('tanah-status').value = d.status_kepemilikan; document.getElementById('tanah-luas').value = d.luas_meter;
    document.getElementById('tanah-status').dispatchEvent(new Event('change')); 
    
    bukaGembokForm('tanah');
    
    document.getElementById('tanah-modal-title').innerText = "Detail & Kelola Tanah";
    document.getElementById('tanah-action-wrapper').innerHTML = `<button class="btn btn-warning" onclick="eksekusiUpdateTanah(${id})">Simpan Perubahan</button><button class="btn btn-danger" onclick="eksekusiHapusTanah(${id})">Hapus Tanah</button><button class="btn btn-cancel" onclick="document.getElementById('modal-tanah').style.display='none'">Tutup</button>`;
    document.getElementById('modal-tanah').style.display = 'flex';
};


// ====================================================
// API FETCH MANAGER & CRUD OPERATION
// ====================================================
const safeFetch = async (url, payload = null) => {
    const options = payload ? { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) } : {};
    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    } catch(err) {
        console.error("Gagal melakukan permintaan ke:", url, err);
        throw err;
    }
};

window.eksekusiUpdateGaris = () => {
    const val = document.getElementById('input-garis-kemiskinan').value;
    if(!val || val <= 0) return alert("Masukkan nilai rupiah yang valid!");

    if(!confirm(`PERINGATAN: Mengubah garis kemiskinan menjadi Rp${val} akan mengkalibrasi ulang status miskin/tidak miskin seluruh penduduk di database saat ini.\n\nLanjutkan?`)) return;

    triggerToastNotification("⏳ Mengkalibrasi ulang seluruh data penduduk...");

    safeFetch('../otak_kemiskinan/api_update_gariskemiskinan.php', { nilai: parseInt(val) })
        .then(res => {
            triggerToastNotification("✅ " + res.pesan);
            document.getElementById('input-garis-kemiskinan').value = ""; 
            muatDataSemua(); 
        })
        .catch(err => alert("Gagal memperbarui: " + err));
};

// --- SPBU CRUD ---
window.eksekusiSimpanBaru = () => {
    const payload = { nama: document.getElementById('spbu-nama').value, status: document.getElementById('spbu-status').value, telp: document.getElementById('spbu-telp').value, alamat: document.getElementById('spbu-alamat') ? document.getElementById('spbu-alamat').value : "", lat: document.getElementById('spbu-lat').value, lng: document.getElementById('spbu-lng').value };
    safeFetch('../otak_spbu/api_simpan.php', payload)
        .then(() => { document.getElementById('modal-spbu').style.display='none'; triggerToastNotification("✅ SPBU ditambahkan!"); muatDataSemua(); })
        .catch(err => alert(`Gagal menyimpan data.\nAlasan: ${err.message}\nPastikan nama dan lokasi file PHP Anda benar.`));
};
window.eksekusiUpdate = (id) => {
    const payload = { id: id, nama: document.getElementById('spbu-nama').value, status: document.getElementById('spbu-status').value, telp: document.getElementById('spbu-telp').value };
    safeFetch('../otak_spbu/api_update.php', payload)
        .then(() => { document.getElementById('modal-spbu').style.display='none'; triggerToastNotification("✅ SPBU diperbarui!"); muatDataSemua(); })
        .catch(err => alert(err));
};
window.eksekusiHapus = (id) => {
    if(!confirm("Hapus SPBU ini?")) return;
    safeFetch('../otak_spbu/api_hapus.php', { id: id })
        .then(() => { document.getElementById('modal-spbu').style.display='none'; triggerToastNotification("🗑️ SPBU dihapus."); muatDataSemua(); })
        .catch(err => alert(err));
};

// --- JALAN CRUD ---
window.eksekusiSimpanJalan = () => {
    const payload = { nama: document.getElementById('jalan-nama').value, status: document.getElementById('jalan-status').value, jarak: document.getElementById('jalan-jarak').value, koordinat: document.getElementById('jalan-koordinat').value };
    safeFetch('../otak_jalan/api_simpan.php', payload)
        .then(() => { batalGambarJalan(); triggerToastNotification("✅ Jalan ditambahkan!"); muatDataSemua(); })
        .catch(err => alert(err));
};
window.eksekusiUpdateJalan = (id) => {
    const payload = { id: id, nama: document.getElementById('jalan-nama').value, status: document.getElementById('jalan-status').value };
    safeFetch('../otak_jalan/api_update.php', payload)
        .then(() => { document.getElementById('modal-jalan').style.display='none'; triggerToastNotification("✅ Jalan diperbarui!"); muatDataSemua(); })
        .catch(err => alert(err));
};
window.eksekusiHapusJalan = (id) => {
    if(!confirm("Hapus jalur ini?")) return;
    safeFetch('../otak_jalan/api_hapus.php', { id: id })
        .then(() => { document.getElementById('modal-jalan').style.display='none'; triggerToastNotification("🗑️ Jalan dihapus."); muatDataSemua(); })
        .catch(err => alert(err));
};

// --- KEMISKINAN CRUD ---
window.simpanPendudukPopup = (lat, lng, popupRef) => {
    const payload = {
        nama: document.getElementById('pop-pd-kk').value,
        agama: document.getElementById('pop-pd-agama').value,
        tanggungan: parseInt(document.getElementById('pop-pd-tanggungan').value) || 0,
        pengeluaran: parseInt(document.getElementById('pop-pd-pengeluaran').value) || 0,
        lat: lat, lng: lng, alamat: document.getElementById('pop-pd-alamat').value,
        pmt_lantai: parseInt(document.getElementById('pop-pmt-lantai').value),
        pmt_dinding: parseInt(document.getElementById('pop-pmt-dinding').value),
        pmt_sanitasi: parseInt(document.getElementById('pop-pmt-sanitasi').value),
        pmt_penerangan: parseInt(document.getElementById('pop-pmt-listrik').value),
        pmt_air: parseInt(document.getElementById('pop-pmt-air').value)
    };
    
    if (!payload.nama) return alert("Nama Kepala Keluarga wajib diisi!");
    
    payload.pmt_score = payload.pmt_lantai + payload.pmt_dinding + payload.pmt_sanitasi + payload.pmt_penerangan + payload.pmt_air;
    payload.status = kalkulasiDSS(payload.pengeluaran, payload.pmt_score);

    safeFetch('../otak_kemiskinan/api_simpan_penduduk.php', payload)
        .then(() => {
            map.closePopup(popupRef); 
            resetAllModes();
            triggerToastNotification(`DSS Dieksekusi: ${payload.status} (Skor: ${payload.pmt_score}/5)`);
            muatDataSemua(); 
        })
        .catch(err => alert("Gagal menyimpan data: " + err));
};

window.bukaFormEditPenduduk = (p) => {
    state.isGhostLocked = true; 

    let popupContent = "";
    const tmpl = document.getElementById('template-popup-penduduk');
    if(tmpl) popupContent = tmpl.innerHTML;

    const popup = L.popup({ closeOnClick: false, autoClose: false })
        .setLatLng([parseFloat(p.latitude), parseFloat(p.longitude)])
        .setContent(popupContent)
        .openOn(map);
        
    popup.on('remove', function() {
        state.isGhostLocked = false;
    });

    setTimeout(() => {
        document.getElementById('pop-pd-kk').value = p.nama_kk;
        document.getElementById('pop-pd-agama').value = p.agama;
        document.getElementById('pop-pd-tanggungan').value = p.jml_tanggungan;
        document.getElementById('pop-pd-pengeluaran').value = p.pengeluaran;
        
        document.getElementById('pop-pmt-lantai').value = p.pmt_lantai;
        document.getElementById('pop-pmt-dinding').value = p.pmt_dinding;
        document.getElementById('pop-pmt-sanitasi').value = p.pmt_sanitasi;
        document.getElementById('pop-pmt-listrik').value = p.pmt_penerangan;
        document.getElementById('pop-pmt-air').value = p.pmt_air;
        
        document.getElementById('pop-pd-alamat').value = p.alamat;

        const btnSimpan = document.getElementById('btn-pop-simpan');
        if(btnSimpan) {
            btnSimpan.innerText = "Update Data Keluarga";
            btnSimpan.disabled = false;
            btnSimpan.onclick = () => updatePendudukPopup(p.id, popup);
        }
    }, 50);
};

window.updatePendudukPopup = (id, popupRef) => {
    const payload = {
        id: id,
        nama: document.getElementById('pop-pd-kk').value,
        agama: document.getElementById('pop-pd-agama').value,
        tanggungan: parseInt(document.getElementById('pop-pd-tanggungan').value) || 0,
        pengeluaran: parseInt(document.getElementById('pop-pd-pengeluaran').value) || 0,
        pmt_lantai: parseInt(document.getElementById('pop-pmt-lantai').value),
        pmt_dinding: parseInt(document.getElementById('pop-pmt-dinding').value),
        pmt_sanitasi: parseInt(document.getElementById('pop-pmt-sanitasi').value),
        pmt_penerangan: parseInt(document.getElementById('pop-pmt-listrik').value),
        pmt_air: parseInt(document.getElementById('pop-pmt-air').value)
    };

    if (!payload.nama) return alert("Nama Kepala Keluarga wajib diisi!");

    payload.pmt_score = payload.pmt_lantai + payload.pmt_dinding + payload.pmt_sanitasi + payload.pmt_penerangan + payload.pmt_air;
    payload.status = kalkulasiDSS(payload.pengeluaran, payload.pmt_score);

    safeFetch('../otak_kemiskinan/api_update_penduduk.php', payload)
        .then(() => {
            map.closePopup(popupRef);
            resetAllModes();
            triggerToastNotification(`Data Diperbarui: ${payload.status} (Skor: ${payload.pmt_score}/5)`);
            muatDataSemua();
        })
        .catch(err => alert("Gagal mengupdate data: " + err));
};

window.eksekusiHapusPenduduk = (id) => {
    safeFetch('../otak_kemiskinan/api_hapus_penduduk.php', { id: id })
        .then(() => {
            triggerToastNotification("🗑️ Data Penduduk dihapus permanen.");
            muatDataSemua();
        })
        .catch(err => alert(err));
};

// --- LOG BANTUAN ---
window.bukaFormLogBantuan = (p) => {
    document.getElementById('log-modal-title').innerText = "Catat Penyaluran Bantuan";
    document.getElementById('log-nama-penerima').innerText = `Keluarga ${p.nama_kk}`;
    document.getElementById('log-id-penduduk').value = p.id;
    
    const rekomendasi = kalkulasiBantuan(p.status_kemiskinan);
    
    document.getElementById('log-beras').value = rekomendasi.beras;
    document.getElementById('log-minyak').value = rekomendasi.minyak;
    document.getElementById('log-gula').value = rekomendasi.gula;
    document.getElementById('log-telur').value = rekomendasi.telur;
    document.getElementById('log-susu').value = rekomendasi.susu;
    document.getElementById('log-tunai').value = rekomendasi.tunai;
    document.getElementById('log-catatan').value = "";
    
    document.getElementById('modal-log-bantuan').style.display = 'flex';
};

window.eksekusiSimpanLogBantuan = () => {
    const payload = {
        id_penduduk: document.getElementById('log-id-penduduk').value,
        beras: parseInt(document.getElementById('log-beras').value) || 0,
        minyak: parseInt(document.getElementById('log-minyak').value) || 0,
        gula: parseInt(document.getElementById('log-gula').value) || 0,
        telur: parseInt(document.getElementById('log-telur').value) || 0,
        susu: parseInt(document.getElementById('log-susu').value) || 0,
        tunai: parseInt(document.getElementById('log-tunai').value) || 0,
        catatan: document.getElementById('log-catatan').value
    };

    safeFetch('../otak_kemiskinan/api_simpan_logbantuan.php', payload)
        .then(() => {
            document.getElementById('modal-log-bantuan').style.display = 'none';
            triggerToastNotification("✅ Log bantuan berhasil dicatat.");
        })
        .catch(err => alert("Gagal menyimpan log bantuan: " + err));
};

window.bukaFormRiwayatBantuan = (p) => {
    document.getElementById('riwayat-nama-penerima').innerText = p.nama_kk;
    document.getElementById('modal-riwayat-bantuan').style.display = 'flex';
    
    const tbody = document.getElementById('riwayat-tbody');
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">Mengambil data dari satelit...</td></tr>`;
    
    fetch(`otak_kemiskinan/api_tampil_logbantuan.php?id=${p.id}`)
        .then(res => res.json())
        .then(data => {
            if(data.error) throw new Error(data.error);
            
            if(data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">Belum ada riwayat penerimaan logistik untuk keluarga ini.</td></tr>`;
                return;
            }
            
            let html = '';
            data.forEach(log => {
                const tgl = log.created_at || log.waktu || log.tanggal || '-';
                
                html += `<tr>
                    <td><b>${tgl}</b></td>
                    <td>${log.beras_kg}</td>
                    <td>${log.minyak_l}</td>
                    <td>${log.gula_kg}</td>
                    <td>${log.telur_kg}</td>
                    <td>${log.susu_kaleng}</td>
                    <td style="color:var(--green-safe); font-weight:bold;">Rp${parseInt(log.tunai_rp).toLocaleString('id-ID')}</td>
                    <td>${log.catatan || '-'}</td>
                </tr>`;
            });
            tbody.innerHTML = html;
        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red; padding: 20px;">Gagal memuat histori: ${err.message}</td></tr>`;
        });
};

// --- CRUD IBADAH ---
window.simpanIbadahPopup = (lat, lng, popupRef) => {
    const payload = {
        nama: document.getElementById('pop-ib-nama').value,
        jenis: document.getElementById('pop-ib-jenis').value,
        radius_meter: parseInt(document.getElementById('pop-ib-rad').value),
        latitude: lat, longitude: lng,
        alamat: document.getElementById('pop-ib-alamat').value
    };
    
    if(!payload.nama) return alert("Nama wajib diisi!");

    safeFetch('../otak_kemiskinan/api_simpan_ibadah.php', payload)
        .then(() => {
            map.closePopup(popupRef); 
            resetAllModes();
            triggerToastNotification("✅ Rumah Ibadah berhasil ditambahkan!");
            muatDataSemua(); 
        })
        .catch(err => alert("Gagal menyimpan data: " + err));
};

window.bukaFormEditIbadah = (d, judulIbadahAsliMentah) => {
    state.isGhostLocked = true; 

    let popupContent = "";
    const tmpl = document.getElementById('template-popup-ibadah');
    if(tmpl) popupContent = tmpl.innerHTML;

    const popup = L.popup({ closeOnClick: false, autoClose: false })
        .setLatLng([parseFloat(d.latitude), parseFloat(d.longitude)])
        .setContent(popupContent)
        .openOn(map);
        
    popup.on('remove', function() {
        state.isGhostLocked = false;
    });

    setTimeout(() => {
        document.getElementById('pop-ib-nama').value = judulIbadahAsliMentah; 
        document.getElementById('pop-ib-jenis').value = d.jenis;
        
        const radInput = document.getElementById('pop-ib-rad');
        const radVal = document.getElementById('pop-ib-rad-val');
        if(radInput) {
            radInput.value = d.radius_meter;
            if(radVal) radVal.innerText = d.radius_meter;
        }
        
        document.getElementById('pop-ib-alamat').value = d.alamat;

        const btnSimpan = document.getElementById('btn-pop-simpan');
        if(btnSimpan) {
            btnSimpan.innerText = "Update Rumah Ibadah";
            btnSimpan.disabled = false;
            btnSimpan.onclick = () => updateIbadahPopup(d.id, popup);
        }
    }, 50);
};

window.updateIbadahPopup = (id, popupRef) => {
    const payload = {
        id: id,
        nama: document.getElementById('pop-ib-nama').value,
        jenis: document.getElementById('pop-ib-jenis').value,
        radius: parseInt(document.getElementById('pop-ib-rad').value)
    };

    if (!payload.nama) return alert("Nama wajib diisi!");

    safeFetch('../otak_kemiskinan/api_update_ibadah.php', payload)
        .then(() => {
            map.closePopup(popupRef);
            resetAllModes();
            triggerToastNotification("✅ Data Rumah Ibadah berhasil diperbarui.");
            muatDataSemua();
        })
        .catch(err => alert("Gagal mengupdate data: " + err));
};

window.eksekusiHapusIbadah = (id) => {
    safeFetch('../otak_kemiskinan/api_hapus_ibadah.php', { id: id })
        .then(() => {
            triggerToastNotification("🗑️ Rumah Ibadah dihapus permanen.");
            muatDataSemua();
        })
        .catch(err => alert(err));
};


// ====================================================
// LIFECYCLE AWAL (PROMISE ALL & PEMULIHAN STATE)
// ====================================================
window.muatDataSemua = () => {
    Promise.all([
        safeFetch('../otak_spbu/api_tampil.php').then(d => { dataStore.spbu = {}; d.forEach(x => dataStore.spbu[x.id] = x); renderSPBU(); }).catch(e => console.warn("API SPBU Offline / Bermasalah")),
        safeFetch('../otak_jalan/api_tampil.php').then(d => { dataStore.jalan = {}; d.forEach(x => dataStore.jalan[x.id] = x); renderJalan(); }).catch(e => console.warn("API Jalan Offline / Bermasalah")),
        safeFetch('../otak_tanah/api_tampil.php').then(d => { dataStore.tanah = {}; d.forEach(x => dataStore.tanah[x.id] = x); renderTanah(); }).catch(e => console.warn("API Tanah Offline / Bermasalah")),
        safeFetch('../otak_kemiskinan/api_tampil_ibadah.php').then(d => { dataStore.ibadah = {}; d.forEach(x => dataStore.ibadah[x.id] = x); }).catch(e => console.warn("API Ibadah Offline / Bermasalah")),
        safeFetch('../otak_kemiskinan/api_tampil_penduduk.php').then(d => { dataStore.penduduk = {}; d.forEach(x => dataStore.penduduk[x.id] = x); }).catch(e => console.warn("API Penduduk Offline / Bermasalah")),
        
        safeFetch('../otak_kemiskinan/api_tampil_gariskemiskinan.php').then(d => { 
            if(d && d.nilai_rupiah) {
                state.garisKemiskinan = parseInt(d.nilai_rupiah);
                const inputGaris = document.getElementById('input-garis-kemiskinan');
                if(inputGaris) {
                    inputGaris.placeholder = `Saat ini: Rp${state.garisKemiskinan}`;
                }
            }
        }).catch(e => console.warn("API Garis Kemiskinan Offline"))
    ]).then(() => {
        renderKemiskinan();
        console.log("✅ Sistem WebGIS V3 Siap dan Data Tersinkronisasi Penuh.");
    });
};

setTimeout(() => { 
    map.invalidateSize(); 
    console.log("Menghidupkan Mesin & Memulihkan Ingatan UI...");
    pulihkanIngatanUI();
    muatDataSemua();
}, 500);
