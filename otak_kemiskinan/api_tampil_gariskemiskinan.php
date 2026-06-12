<?php
header("Content-Type: application/json; charset=UTF-8");
require_once '../koneksi.php';

try {
    // Hanya ambil yang sedang aktif
    $stmt = $conn->query("SELECT nilai_rupiah FROM garis_kemiskinan WHERE is_active = TRUE LIMIT 1");
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($data) {
        echo json_encode($data);
    } else {
        // Fallback darurat jika tabel kosong
        echo json_encode(["nilai_rupiah" => 700000]); 
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Gagal mengambil data: " . $e->getMessage()]);
}
?>