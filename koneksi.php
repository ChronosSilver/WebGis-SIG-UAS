<?php
// koneksi.php (Terpusat untuk semua versi)

$host = getenv('DB_HOST') ?: 'localhost';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$db   = getenv('DB_NAME') ?: 'webgis_pontianak';

try {
    // Membangun koneksi PDO
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    
    // Mengatur PDO agar melempar Exception jika terjadi error
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch(PDOException $e) {
    // Jika koneksi gagal, hentikan eksekusi dan kirim pesan error format JSON
    die(json_encode(["error" => "Koneksi Database Gagal: " . $e->getMessage()]));
}
?>
