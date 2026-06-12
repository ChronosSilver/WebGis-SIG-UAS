<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGIS Kota Pontianak - Portal Utama</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #2B6CB0;
            --secondary: #2C5282;
            --accent: #4FD1C5;
            --dark: #1A202C;
            --light: #F7FAFC;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--light);
            overflow-x: hidden;
            padding: 2rem;
        }

        /* Latar Belakang Animasi Geometris */
        .bg-pattern {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background-image: radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px);
            background-size: 30px 30px;
            z-index: -1;
            opacity: 0.5;
        }

        /* Tekstur Kertas Elegan */
        .paper-texture {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background-image: url('https://www.transparenttextures.com/patterns/paper.png');
            opacity: 0.4;
            z-index: -2;
            pointer-events: none;
        }

        .header-container {
            text-align: center;
            margin-bottom: 3rem;
            animation: fadeInDown 1s ease-out;
        }

        .header-container h1 {
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(90deg, #63B3ED, #4FD1C5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            letter-spacing: -1px;
        }

        .header-container p {
            font-size: 1.2rem;
            color: #A0AEC0;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            width: 100%;
            max-width: 1100px;
            perspective: 1000px;
        }

        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 2rem;
            text-decoration: none;
            color: var(--light);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: fadeInUp 0.8s ease-out backwards;
        }

        /* Staggered animation */
        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }
        .card:nth-child(4) { animation-delay: 0.4s; }

        .card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
            z-index: 0;
        }

        .card:hover {
            transform: translateY(-10px) scale(1.02) rotateX(2deg);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            border-color: var(--accent);
            background: rgba(255, 255, 255, 0.1);
        }

        .card-content {
            position: relative;
            z-index: 1;
            flex-grow: 1;
        }

        .card-number {
            font-size: 4rem;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.05);
            position: absolute;
            top: -20px;
            right: -10px;
            transition: color 0.4s;
        }

        .card:hover .card-number {
            color: rgba(79, 209, 197, 0.2);
        }

        .card h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .card p {
            color: #CBD5E0;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 1.5rem;
        }

        .card-btn {
            margin-top: auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 1px;
            transition: all 0.3s;
            border: none;
            width: fit-content;
        }

        .card:hover .card-btn {
            background: linear-gradient(90deg, var(--accent), #319795);
            box-shadow: 0 4px 15px rgba(79, 209, 197, 0.4);
            transform: translateX(5px);
        }

        .footer {
            margin-top: 4rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 2rem;
            width: 100%;
            max-width: 800px;
            animation: fadeIn 1s ease-out 1s backwards;
        }

        .footer p {
            color: #A0AEC0;
            font-size: 0.9rem;
            margin-bottom: 5px;
        }

        .footer .highlight {
            color: var(--accent);
            font-weight: 600;
        }

        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

    </style>
</head>
<body>

    <div class="paper-texture"></div>
    <div class="bg-pattern"></div>

    <div class="header-container">
        <h1>WebGIS Pontianak</h1>
        <p>Evolusi Pemetaan Infrastruktur Spasial Terpusat. Silakan pilih iterasi arsitektur di bawah ini untuk memulai eksplorasi peta.</p>
    </div>

    <div class="grid-container">
        
        <!-- Versi 001 -->
        <a href="001/" class="card">
            <span class="card-number">01</span>
            <div class="card-content">
                <h2><i class="fa-solid fa-map-location-dot" style="color: var(--accent);"></i> Iterasi V1</h2>
                <p>Versi pondasi awal pemetaan dasar. Menampilkan integrasi map dengan data SPBU sederhana menggunakan arsitektur lawas.</p>
                <div class="card-btn">Buka Peta</div>
            </div>
        </a>

        <!-- Versi 002 -->
        <a href="002/" class="card">
            <span class="card-number">02</span>
            <div class="card-content">
                <h2><i class="fa-solid fa-eye" style="color: var(--accent);"></i> Iterasi V2</h2>
                <p>Fokus pada visualisasi murni. Menampilkan SPBU, Jaringan Jalan, dan Parsil Tanah secara keseluruhan tanpa distraksi fitur filter.</p>
                <div class="card-btn">Buka Peta</div>
            </div>
        </a>

        <!-- Versi 003 -->
        <a href="003/" class="card">
            <span class="card-number">03</span>
            <div class="card-content">
                <h2><i class="fa-solid fa-layer-group" style="color: var(--accent);"></i> Iterasi V3</h2>
                <p>Memperkenalkan <i>Smart Filter</i> & <i>Layer Control</i>. Berinteraksi dengan data spasial dengan cara menyaring status secara real-time.</p>
                <div class="card-btn">Buka Peta</div>
            </div>
        </a>

        <!-- Versi 004 -->
        <a href="004/" class="card">
            <span class="card-number">04</span>
            <div class="card-content">
                <h2><i class="fa-solid fa-cubes" style="color: var(--accent);"></i> Iterasi V4</h2>
                <p>Arsitektur Lanjutan. Dilengkapi dengan infrastruktur navigasi terpusat dan pemisahan logika backend API secara modular.</p>
                <div class="card-btn">Buka Peta</div>
            </div>
        </a>

    </div>

    <div class="footer">
        <p>Proyek Akhir Mata Kuliah Sistem Informasi Geografis (SIG)</p>
        <p>Dikembangkan oleh <span class="highlight">Nelson Davey</span> | NIM: <span class="highlight">D1041231058</span></p>
    </div>

</body>
</html>
