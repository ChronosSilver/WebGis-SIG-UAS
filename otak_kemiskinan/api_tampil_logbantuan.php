<?php
header("Content-Type: application/json; charset=UTF-8");
require_once '../koneksi.php';

// Menangkap ID Penduduk dari URL (GET Request)
$id_penduduk = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id_penduduk > 0) {
    try {
        // Asumsi tabel Anda memiliki kolom created_at atau minimal id yang Auto Increment
        $stmt = $conn->prepare("SELECT * FROM log_bantuan WHERE id_penduduk = :id ORDER BY id DESC");
        $stmt->bindValue(':id', $id_penduduk, PDO::PARAM_INT);
        $stmt->execute();
        
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Parameter ID Penduduk tidak ditemukan."]);
}
?>