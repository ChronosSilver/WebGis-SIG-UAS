<?php
// koneksi.php (Terpusat untuk semua versi)

$host = 'localhost';
$user = 'root';
$pass = ''; // Kosongkan jika menggunakan XAMPP default
$db   = 'webgis_pontianak'; // Database bersama

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
