<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div id="toast-notification">Peringatan: Data SPBU berhasil dihapus!</div>

    <div id="modal-spbu" class="modal-overlay">
        <div class="modal-content">
            <h3 id="spbu-modal-title" class="modal-header">Form Data SPBU</h3>
            
            <input type="hidden" id="spbu-id">
            <input type="hidden" id="spbu-lat">
            <input type="hidden" id="spbu-lng">
            
            <div class="form-group">
                <label for="spbu-nama">Nama SPBU:</label>
                <input type="text" id="spbu-nama" placeholder="Misal: SPBU Ahmad Yani">
            </div>
            
            <div class="form-group">
                <label for="spbu-status">Status Operasional:</label>
                <select id="spbu-status">
                    <option value="Buka 24 Jam">Buka 24 Jam</option>
                    <option value="Tidak 24 Jam">Tidak 24 Jam</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="spbu-telp">No. Telepon:</label>
                <input type="tel" id="spbu-telp" placeholder="Misal: 0561xxxxxx">
            </div>
            
            <div class="form-group">
                <label for="spbu-alamat">Alamat (Otomatis dari Koordinat):</label>
                <textarea id="spbu-alamat" rows="3" readonly class="readonly-input" placeholder="Mengambil data lokasi..."></textarea>
            </div>

            <div id="spbu-action-wrapper">
                </div>
        </div>
    </div>

    <div id="modal-jalan" class="modal-overlay">
        <div class="modal-content">
            <h3 id="jalan-modal-title" class="modal-header">Form Data Jalan</h3>
            
            <input type="hidden" id="jalan-id">
            <input type="hidden" id="jalan-koordinat">
            
            <div class="form-group">
                <label for="jalan-nama">Nama Jalan:</label>
                <input type="text" id="jalan-nama" placeholder="Misal: Jl. Jenderal Sudirman">
            </div>
            
            <!-- Dropdown dengan id khusus untuk dimanipulasi oleh JS -->
            <div class="form-group">
                <label for="jalan-status">Status Jalan:</label>
                <select id="jalan-status" class="dynamic-select">
                    <option value="Jalan Nasional">Jalan Nasional</option>
                    <option value="Jalan Provinsi">Jalan Provinsi</option>
                    <option value="Jalan Kabupaten">Jalan Kabupaten</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="jalan-jarak">Jarak (Meter):</label>
                <input type="text" id="jalan-jarak" readonly class="readonly-input">
            </div>
            
            <div id="jalan-action-wrapper" style="display: flex; gap: 10px; margin-top: 25px;">
                <!-- Dinamis oleh JS -->
            </div>
        </div>
    </div>

    <div id="modal-tanah" class="modal-overlay">
        <div class="modal-content">
            <h3 id="tanah-modal-title" class="modal-header">Form Parsil Tanah</h3>
            
            <input type="hidden" id="tanah-id">
            <input type="hidden" id="tanah-koordinat">
            
            <div class="form-group">
                <label for="tanah-nama">Nama Pemilik/Area:</label>
                <input type="text" id="tanah-nama" placeholder="Misal: Tanah Budi / Area 1">
            </div>
            
            <div class="form-group">
                <label for="tanah-status">Status Kepemilikan:</label>
                <select id="tanah-status" class="dynamic-select">
                    <option value="SHM">Sertifikat Hak Milik (SHM)</option>
                    <option value="HGB">Sertifikat Hak Guna Bangunan (HGB)</option>
                    <option value="HGU">Sertifikat Hak Guna Usaha (HGU)</option>
                    <option value="HP">Sertifikat Hak Pakai (HP)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="tanah-luas">Luas (m²):</label>
                <input type="text" id="tanah-luas" readonly class="readonly-input">
            </div>
            
            <div id="tanah-action-wrapper" style="display: flex; gap: 10px; margin-top: 25px;">
                <!-- Dinamis oleh JS -->
            </div>
        </div>
    </div>

    <div id="modal-filter-layer" class="modal-overlay">
        <div class="modal-content filter-modal">
            <h3 class="modal-header">Filter Layer Peta</h3>
            
            <div class="filter-section">
                <label class="filter-section-title">Status Jalan:</label>
                <div class="filter-grid">
                    <label class="custom-checkbox-wrapper">
                        <input type="checkbox" class="cb-jalan" value="Jalan Nasional" checked>
                        <span class="custom-checkmark"></span>
                        <span class="filter-text">Jalan Nasional</span>
                        <span class="color-dot" style="background-color: #E53E3E;"></span>
                    </label>
                    <label class="custom-checkbox-wrapper">
                        <input type="checkbox" class="cb-jalan" value="Jalan Provinsi" checked>
                        <span class="custom-checkmark"></span>
                        <span class="filter-text">Jalan Provinsi</span>
                        <span class="color-dot" style="background-color: #3182CE;"></span>
                    </label>
                    <label class="custom-checkbox-wrapper">
                        <input type="checkbox" class="cb-jalan" value="Jalan Kabupaten" checked>
                        <span class="custom-checkmark"></span>
                        <span class="filter-text">Jalan Kabupaten</span>
                        <span class="color-dot" style="background-color: #38A169;"></span>
                    </label>
                </div>
            </div>

            <div class="filter-section">
                <label class="filter-section-title">Status Tanah:</label>
                <div class="filter-grid">
                    <label class="custom-checkbox-wrapper">
                        <input type="checkbox" class="cb-tanah" value="SHM" checked>
                        <span class="custom-checkmark"></span>
                        <span class="filter-text">SHM</span>
                        <span class="color-dot" style="background-color: #38A169;"></span>
                    </label>
                    <label class="custom-checkbox-wrapper">
                        <input type="checkbox" class="cb-tanah" value="HGB" checked>
                        <span class="custom-checkmark"></span>
                        <span class="filter-text">HGB</span>
                        <span class="color-dot" style="background-color: #DD6B20;"></span>
                    </label>
                    <label class="custom-checkbox-wrapper">
                        <input type="checkbox" class="cb-tanah" value="HGU" checked>
                        <span class="custom-checkmark"></span>
                        <span class="filter-text">HGU</span>
                        <span class="color-dot" style="background-color: #3182CE;"></span>
                    </label>
                    <label class="custom-checkbox-wrapper">
                        <input type="checkbox" class="cb-tanah" value="HP" checked>
                        <span class="custom-checkmark"></span>
                        <span class="filter-text">HP</span>
                        <span class="color-dot" style="background-color: #718096;"></span>
                    </label>
                </div>
            </div>

            <div class="btn-group" style="margin-top: 20px;">
                <button class="btn btn-save" onclick="terapkanFilterLayer()">Terapkan Filter</button>
                <button class="btn btn-cancel" onclick="document.getElementById('modal-filter-layer').style.display='none'">Batal</button>
            </div>
        </div>
    </div>

    <div id="modal-filter-spbu" class="modal-overlay">
        <div class="modal-content filter-modal">
            <h3 class="modal-header">Filter Status SPBU</h3>
            
            <div class="filter-section">
                <label class="filter-section-title">Pilih Operasional:</label>
                <div class="filter-grid">
                    <!-- Kita menggunakan struktur custom radio button -->
                    <label class="custom-radio-wrapper">
                        <input type="radio" name="rad-spbu" value="Semua" checked>
                        <span class="custom-radiomark"></span>
                        <span class="filter-text">Semua SPBU</span>
                    </label>
                    <label class="custom-radio-wrapper">
                        <input type="radio" name="rad-spbu" value="Buka 24 Jam">
                        <span class="custom-radiomark"></span>
                        <span class="filter-text">Buka 24 Jam</span>
                        <span class="color-dot" style="background-color: #38A169;"></span>
                    </label>
                    <label class="custom-radio-wrapper">
                        <input type="radio" name="rad-spbu" value="Tidak 24 Jam">
                        <span class="custom-radiomark"></span>
                        <span class="filter-text">Tidak 24 Jam</span>
                        <span class="color-dot" style="background-color: #E53E3E;"></span>
                    </label>
                </div>
            </div>

            <div class="btn-group" style="margin-top: 20px;">
                <button class="btn btn-save" onclick="terapkanFilterSPBU()">Terapkan Filter</button>
                <button class="btn btn-cancel" onclick="document.getElementById('modal-filter-spbu').style.display='none'">Batal</button>
            </div>
        </div>
    </div>

    <!-- MODAL INTERAKTIF RUMAH PENDUDUK & PMT -->
    <div id="modal-penduduk" class="modal-overlay">
        <div class="modal-content">
            <h3 id="penduduk-modal-title" class="modal-header">Formulir Data Penduduk</h3>
            
            <input type="hidden" id="penduduk-id">
            <input type="hidden" id="penduduk-lat">
            <input type="hidden" id="penduduk-lng">
            
            <div class="form-group">
                <label>Nama Kepala Keluarga (KK):</label>
                <input type="text" id="penduduk-kk" placeholder="Misal: Budi Santoso">
            </div>
            
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Agama:</label>
                    <select id="penduduk-agama">
                        <option value="Islam">Islam</option><option value="Kristen">Kristen</option>
                        <option value="Katolik">Katolik</option><option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option><option value="Konghucu">Konghucu</option>
                    </select>
                </div>
                <div class="form-group" style="width:100px;">
                    <label>Tanggungan:</label>
                    <input type="number" id="penduduk-tanggungan" value="0" min="0">
                </div>
            </div>

            <div class="form-group">
                <label>Pengeluaran Bulanan (Rp):</label>
                <input type="number" id="penduduk-pengeluaran" placeholder="Misal: 1500000">
            </div>

            <hr style="border: 0; border-bottom: 1px dashed var(--border); margin: 15px 0;">
            <h4 style="margin:0 0 10px 0; color:var(--navy); font-size:0.9rem;">Penilaian PMT (0 = Layak, 1 = Buruk)</h4>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Lantai</label>
                    <select class="pmt-score-input" id="pmt-lantai">
                        <option value="0">0 - Bagus/Semen</option><option value="1">1 - Tanah/Bambu</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Dinding</label>
                    <select class="pmt-score-input" id="pmt-dinding">
                        <option value="0">0 - Tembok/Kayu Baik</option><option value="1">1 - Rumbia/Bambu</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sanitasi (BAB)</label>
                    <select class="pmt-score-input" id="pmt-sanitasi">
                        <option value="0">0 - Toilet Sendiri</option><option value="1">1 - Umum/Sungai</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Listrik/Penerangan</label>
                    <select class="pmt-score-input" id="pmt-penerangan">
                        <option value="0">0 - PLN Resmi</option><option value="1">1 - Numpang/Pelita</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sumber Air</label>
                    <select class="pmt-score-input" id="pmt-air">
                        <option value="0">0 - Leding/Sumur Bor</option><option value="1">1 - Sungai/Hujan</option>
                    </select>
                </div>
            </div>

            <div class="form-group" style="margin-top: 10px;">
                <label>Alamat Otomatis:</label>
                <textarea id="penduduk-alamat" rows="2" readonly class="readonly-input"></textarea>
            </div>
            
            <div id="penduduk-action-wrapper" class="btn-group"></div>
        </div>
    </div>

    <template id="template-popup-ibadah">
        <div class="popup-form">
            <h4>Form Rumah Ibadah</h4>
            <div class="form-group">
                <label>Nama Ibadah:</label>
                <input type="text" id="pop-ib-nama" placeholder="Cth: Masjid At-Taqwa">
            </div>
            <div class="form-group">
                <label>Jenis:</label>
                <select id="pop-ib-jenis">
                    <option value="Masjid">Masjid</option>
                    <option value="Gereja">Gereja</option>
                    <option value="Vihara">Vihara</option>
                    <option value="Pura">Pura</option>
                    <option value="Klenteng">Klenteng</option>
                </select>
            </div>
            <div class="form-group">
                <label>Radius Efektif (m): <span id="pop-ib-rad-val">100</span>m</label>
                <input type="range" id="pop-ib-rad" min="50" max="3000" step="50" value="100" oninput="document.getElementById('pop-ib-rad-val').innerText=this.value">
            </div>
            <textarea id="pop-ib-alamat" readonly rows="2" style="font-size:0.75rem; color:#718096">Sedang melacak alamat dari satelit...</textarea>
            <button class="btn btn-save" style="width:100%; margin-top:10px;" id="btn-pop-simpan" disabled>Tunggu...</button>
        </div>
    </template>

    <template id="template-popup-penduduk">
        <div class="popup-form">
            <h4>Form Rumah Penduduk</h4>
            <div class="form-group">
                <label>Nama KK:</label>
                <input type="text" id="pop-pd-kk" placeholder="Cth: Budi Santoso">
            </div>
            <div style="display:flex; gap:6px;">
                <div class="form-group" style="flex:1">
                    <label>Agama:</label>
                    <select id="pop-pd-agama">
                        <option>Islam</option><option>Kristen</option><option>Katolik</option>
                        <option>Hindu</option><option>Buddha</option><option>Konghucu</option>
                    </select>
                </div>
                <div class="form-group" style="width:80px">
                    <label>Tanggungan:</label>
                    <input type="number" id="pop-pd-tanggungan" value="0" min="0">
                </div>
            </div>
            <div class="form-group">
                <label>Pengeluaran (Rp):</label>
                <input type="number" id="pop-pd-pengeluaran" placeholder="Cth: 1500000">
            </div>
            
            <label style="font-size:0.85rem; font-weight:bold; color:var(--navy); border-bottom:1px dashed #A0AEC0; display:block; padding-bottom:4px; margin-top:12px; margin-bottom: 8px;">Indikator Fisik (0=Layak, 1=Buruk)</label>
            
            <div class="pmt-grid">
                <div class="form-group">
                    <label>Lantai:</label>
                    <select id="pop-pmt-lantai"><option value="0">0 - Bagus</option><option value="1">1 - Tanah</option></select>
                </div>
                <div class="form-group">
                    <label>Dinding:</label>
                    <select id="pop-pmt-dinding"><option value="0">0 - Tembok</option><option value="1">1 - Rumbia</option></select>
                </div>
                <div class="form-group">
                    <label>Sanitasi/WC:</label>
                    <select id="pop-pmt-sanitasi"><option value="0">0 - Sendiri</option><option value="1">1 - Umum</option></select>
                </div>
                <div class="form-group">
                    <label>Listrik:</label>
                    <select id="pop-pmt-listrik"><option value="0">0 - PLN</option><option value="1">1 - Numpang</option></select>
                </div>
                <div class="form-group" style="grid-column: span 2;">
                    <label>Sumber Air:</label>
                    <select id="pop-pmt-air"><option value="0">0 - PDAM/Bor</option><option value="1">1 - Sungai/Hujan</option></select>
                </div>
            </div>
            <textarea id="pop-pd-alamat" readonly rows="2" style="font-size:0.75rem; color:#718096; margin-top:8px;">Sedang melacak alamat dari satelit...</textarea>
            <button class="btn btn-save" style="width:100%; margin-top:10px;" id="btn-pop-simpan" disabled>Tunggu...</button>
        </div>
    </template>

    <template id="template-popup-read-penduduk">
        <div class="pop-read-only">
            <h3 class="pop-read-title" id="read-pd-nama">Nama Keluarga</h3>
            
            <div class="pop-read-meta">
                <span id="read-pd-agama">Agama: -</span>
                <span id="read-pd-anggota">Anggota/Tanggungan: - Jiwa</span>
            </div>

            <p class="pop-read-alamat" id="read-pd-alamat">Alamat lengkap...</p>
            
            <div class="pop-badge-container">
                <span class="pop-badge" id="read-pd-badge">Status</span>
            </div>

            <div id="read-pd-naungan" class="pop-naungan">Tidak berada di bawah wewenang rumah ibadah manapun</div>

            <hr class="pop-divider">

            <div class="pop-action-main">
                <button class="btn btn-success" id="btn-pd-bantuan" style="width:100%; padding: 12px; margin-bottom: 8px;">Catat Log Bantuan</button>
            </div>

            <div class="accordion-wrapper">
                <button class="btn btn-accordion" id="btn-pd-opsi">Opsi Lainnya</button>
                
                <div class="accordion-content" id="acc-pd-content">
                    <hr class="pop-divider-sub">
                    <button class="btn btn-success" id="btn-pd-riwayat-pelatihan" style="width:100%; margin-bottom:8px; padding: 10px;">Lihat Log Pelatihan</button>
                    <button class="btn btn-success" id="btn-pd-riwayat-musibah" style="width:100%; margin-bottom:8px; padding: 10px;">Lihat Laporan Musibah</button>
                    <button class="btn btn-success" id="btn-pd-riwayat-bantuan" style="width:100%; margin-bottom:8px; padding: 10px;">Lihat Log Bantuan</button>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-warning" id="btn-pd-edit">Edit Data</button>
                        <button class="btn btn-danger" id="btn-pd-hapus">Hapus</button>
                    </div>
                </div>
            </div>
        </div>
    </template>

    <template id="template-popup-read-ibadah">
        <div class="pop-read-only">
            <h3 class="pop-read-title" id="read-ib-nama">Nama Rumah Ibadah</h3>
            
            <div class="pop-read-meta">
                <span id="read-ib-jenis">Jenis: -</span>
                <span id="read-ib-radius">Radius Jangkauan: - m</span>
                <span id="read-ib-naungan" style="color: var(--navy); font-weight: bold;">Keluarga dalam radius: 0 KK</span>
            </div>

            <p class="pop-read-alamat" id="read-ib-alamat">Alamat lengkap...</p>
            
            <hr class="pop-divider">

            <div style="display:flex; gap:8px;">
                <button class="btn btn-warning" id="btn-ib-edit">Edit Data</button>
                <button class="btn btn-danger" id="btn-ib-hapus">Hapus</button>
            </div>
        </div>
    </template>

    <div id="modal-log-bantuan" class="modal-overlay">
        <div class="modal-content">
            <h3 id="log-modal-title" class="modal-header">Catat Bantuan Diberikan</h3>
            <p style="font-size: 0.85rem; color: #4A5568; margin-top: -10px; margin-bottom: 15px;">Penerima: <span id="log-nama-penerima" style="font-weight: bold; color: var(--navy);"></span></p>
            
            <input type="hidden" id="log-id-penduduk">
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Beras (Kg):</label>
                    <input type="number" id="log-beras" value="0" min="0">
                </div>
                <div class="form-group">
                    <label>Minyak (Liter):</label>
                    <input type="number" id="log-minyak" value="0" min="0">
                </div>
                <div class="form-group">
                    <label>Gula (Kg):</label>
                    <input type="number" id="log-gula" value="0" min="0">
                </div>
                <div class="form-group">
                    <label>Telur (Kg):</label>
                    <input type="number" id="log-telur" value="0" min="0">
                </div>
                <div class="form-group">
                    <label>Susu (Kaleng):</label>
                    <input type="number" id="log-susu" value="0" min="0">
                </div>
                <div class="form-group">
                    <label>Uang Tunai (Rp):</label>
                    <input type="number" id="log-tunai" value="0" min="0" step="50000">
                </div>
            </div>

            <div class="form-group" style="margin-top: 5px;">
                <label>Catatan / Keterangan (Opsional):</label>
                <textarea id="log-catatan" rows="2" placeholder="Misal: Bantuan paket Idul Fitri"></textarea>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-save" onclick="eksekusiSimpanLogBantuan()">Simpan Catatan</button>
                <button class="btn btn-cancel" onclick="document.getElementById('modal-log-bantuan').style.display='none'">Batal</button>
            </div>
        </div>
    </div>

    <div id="modal-riwayat-bantuan" class="modal-overlay">
        <div class="modal-content" style="width: 850px; max-width: 95vw;">
            <h3 class="modal-header">Riwayat Penerimaan Bantuan</h3>
            <p style="font-size: 0.85rem; color: #4A5568; margin-top: -10px; margin-bottom: 15px;">Keluarga: <span id="riwayat-nama-penerima" style="font-weight: bold; color: var(--navy);"></span></p>
            
            <div class="table-responsive">
                <table class="riwayat-table" id="tabel-riwayat-bantuan">
                    <thead>
                        <tr>
                            <th>Waktu Log</th>
                            <th>Beras (Kg)</th>
                            <th>Minyak (L)</th>
                            <th>Gula (Kg)</th>
                            <th>Telur (Kg)</th>
                            <th>Susu (Klg)</th>
                            <th>Tunai (Rp)</th>
                            <th>Catatan</th>
                        </tr>
                    </thead>
                    <tbody id="riwayat-tbody">
                        <!-- Data disuntikkan secara dinamis via app.js -->
                    </tbody>
                </table>
            </div>
            
            <div class="btn-group" style="margin-top: 20px;">
                <button class="btn btn-cancel" onclick="document.getElementById('modal-riwayat-bantuan').style.display='none'">Tutup Riwayat</button>
            </div>
        </div>
    </div>

    <div id="modal-musibah" class="modal-overlay">
        <div class="modal-content">
            <h3 class="modal-header" style="color: var(--red-danger);">Lapor Darurat Musibah</h3>
            <p style="font-size: 0.85rem; color: #4A5568; margin-top: -10px; margin-bottom: 15px;">
                Keluarga: <span id="musibah-nama" style="font-weight: bold; color: var(--navy);"></span>
            </p>
            
            <input type="hidden" id="musibah-id-penduduk">
            
            <div class="form-group">
                <label>Tanggal Lapor</label>
                <!-- Dikunci (readonly) karena sistem JS yang akan mengisi secara otomatis -->
                <input type="date" id="musibah-tgl" readonly style="background: #EDF2F7; cursor: not-allowed; color: #718096;">
            </div>
            
            <div class="form-group">
                <label>Jenis Musibah</label>
                <select id="musibah-jenis" class="modern-select">
                    <option value="Kecelakaan">Kecelakaan</option>
                    <option value="Kematian">Kematian</option>
                    <option value="Sakit Keras">Sakit Keras</option>
                    <option value="Kebakaran">Kebakaran</option>
                    <option value="Bencana Alam">Bencana Alam</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Deskripsi Kerusakan / Kondisi</label>
                <textarea id="musibah-deskripsi" rows="3" placeholder="Jelaskan kondisi darurat secara ringkas..."></textarea>
            </div>
            
            <div class="form-group">
                <label>Status Penanganan Awal</label>
                <select id="musibah-status" class="modern-select">
                    <option value="Belum Ditangani">Belum Ditangani</option>
                    <option value="Sudah Ditangani">Sudah Ditangani</option>
                </select>
            </div>
            
            <div class="btn-group" style="margin-top: 20px;">
                <button class="btn btn-danger" onclick="simpanMusibah()">Kirim Laporan</button>
                <button class="btn btn-cancel" onclick="document.getElementById('modal-musibah').style.display='none'">Batal</button>
            </div>
        </div>
    </div>

    <!-- MODAL PROGRAM PELATIHAN -->
    <div id="modal-master-pelatihan" class="modal-overlay">
        <div class="modal-content" style="width: 500px;">
            <h3 class="modal-header">Buat Program Pelatihan Baru</h3>
            <div class="form-group"><label>Nama Pelatihan</label><input type="text" id="latih-nama"></div>
            <div class="form-group"><label>Instansi Penyelenggara</label><input type="text" id="latih-instansi"></div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;"><label>Tanggal Mulai</label><input type="date" id="latih-mulai"></div>
                <div class="form-group" style="flex:1;"><label>Tanggal Selesai</label><input type="date" id="latih-selesai"></div>
            </div>
            <div class="form-group"><label>Deskripsi</label><textarea id="latih-deskripsi" rows="2"></textarea></div>
            <div class="btn-group">
                <button class="btn btn-save" onclick="eksekusiSimpanPelatihan()">Simpan Program</button>
                <button class="btn btn-cancel" onclick="document.getElementById('modal-master-pelatihan').style.display='none'">Tutup</button>
            </div>
        </div>
    </div>

    <!-- MODAL DETAIL KELUARGA (ANGGOTA) -->
    <div id="modal-detail-keluarga" class="modal-overlay">
        <div class="modal-content" style="width: 950px; max-width: 95vw;">
            <h3 class="modal-header">Detail Anggota Keluarga</h3>
            <p style="font-size: 0.85rem; margin-bottom: 15px;">Keluarga: <span id="detail-keluarga-nama" style="font-weight:bold; color: var(--navy);"></span></p>
            
            <input type="hidden" id="detail-id-penduduk">
            <input type="hidden" id="detail-is-bernaung"> <!-- Hidden State untuk Auto-Refresh -->
            
            <div class="table-responsive" style="margin-bottom:20px; max-height: 350px;">
                <table class="riwayat-table">
                    <thead>
                        <tr>
                            <th>NIK</th>
                            <th>Nama Lengkap</th>
                            <th>Usia</th>
                            <th>Pendidikan</th>
                            <th>Pekerjaan</th>
                            <th>Status Pelatihan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-anggota-keluarga">
                        <!-- Data ditarik oleh Fetch JS -->
                    </tbody>
                </table>
            </div>

            <h4 style="border-bottom:1px solid var(--border); padding-bottom:5px; color: var(--navy);">Tambah Anggota Baru</h4>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                <div class="form-group"><label>NIK</label><input type="text" id="anggota-nik" placeholder="16 Digit NIK"></div>
                <div class="form-group"><label>Nama Lengkap</label><input type="text" id="anggota-nama"></div>
                <div class="form-group"><label>Tanggal Lahir</label><input type="date" id="anggota-lahir"></div>
                <div class="form-group"><label>Pendidikan</label>
                    <select id="anggota-pendidikan">
                        <option value="Tidak Sekolah">Tidak Sekolah</option>
                        <option value="SD">SD</option><option value="SMP">SMP</option>
                        <option value="SMA/SMK">SMA/SMK</option><option value="D3">D3</option><option value="S1">S1</option>
                    </select>
                </div>
                <div class="form-group"><label>Pekerjaan (Kosongkan jika nganggur)</label><input type="text" id="anggota-pekerjaan" placeholder="Contoh: Petani"></div>
                <div class="form-group" style="display:flex; align-items:flex-end;">
                    <button class="btn btn-success" style="width:100%; padding: 10px;" onclick="eksekusiSimpanAnggota()">Tambah Anggota</button>
                </div>
            </div>
            
            <div class="btn-group" style="margin-top:20px;">
                <button class="btn btn-cancel" onclick="document.getElementById('modal-detail-keluarga').style.display='none'">Tutup Jendela</button>
            </div>
        </div>
    </div>

    <div id="modal-riwayat-pelatihan" class="modal-overlay">
        <div class="modal-content" style="width: 850px; max-width: 95vw;">
            <h3 class="modal-header">Riwayat Mengikuti Pelatihan</h3>
            <p style="font-size: 0.85rem; color: #4A5568; margin-top: -10px; margin-bottom: 15px;">Keluarga: <span id="riwayat-pelatihan-nama-penerima" style="font-weight: bold; color: var(--navy);"></span></p>
            <div class="table-responsive">
                <table class="riwayat-table">
                    <thead>
                        <tr><th>Tgl Daftar</th><th>NIK</th><th>Nama Anggota</th><th>Program Pelatihan</th><th>Instansi</th></tr>
                    </thead>
                    <tbody id="riwayat-pelatihan-tbody"></tbody>
                </table>
            </div>
            <div class="btn-group" style="margin-top: 20px;">
                <button class="btn btn-cancel" onclick="document.getElementById('modal-riwayat-pelatihan').style.display='none'">Tutup Riwayat</button>
            </div>
        </div>
    </div>

    <!-- MODAL RIWAYAT MUSIBAH -->
    <div id="modal-riwayat-musibah" class="modal-overlay">
        <div class="modal-content" style="width: 850px; max-width: 95vw;">
            <h3 class="modal-header">Riwayat Pelaporan Musibah</h3>
            <p style="font-size: 0.85rem; color: #4A5568; margin-top: -10px; margin-bottom: 15px;">Keluarga: <span id="riwayat-musibah-nama-penerima" style="font-weight: bold; color: var(--navy);"></span></p>
            <div class="table-responsive">
                <table class="riwayat-table">
                    <thead>
                        <tr><th>Tgl Lapor</th><th>Jenis Musibah</th><th>Deskripsi</th><th>Status</th></tr>
                    </thead>
                    <tbody id="riwayat-musibah-tbody"></tbody>
                </table>
            </div>
            <div class="btn-group" style="margin-top: 20px;">
                <button class="btn btn-cancel" onclick="document.getElementById('modal-riwayat-musibah').style.display='none'">Tutup Riwayat</button>
            </div>
        </div>
    </div>



</body>
</html>