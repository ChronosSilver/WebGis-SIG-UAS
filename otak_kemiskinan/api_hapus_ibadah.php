<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        $stmt = $conn->prepare("DELETE FROM rumah_ibadah WHERE id = :id");
        $stmt->bindValue(':id', $data->id, PDO::PARAM_INT);
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Rumah Ibadah berhasil dihapus secara permanen."]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "ID tidak ditemukan."]);
}
?>