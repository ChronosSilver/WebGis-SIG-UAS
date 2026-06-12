<?php
// otak_spbu/api_tampil_spbu.php
header("Content-Type: application/json; charset=UTF-8");
require_once '../koneksi.php';

try {
    $stmt = $conn->query("SELECT * FROM spbu_markers ORDER BY created_at DESC");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($data);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Gagal mengambil data: " . $e->getMessage()]);
}
?>