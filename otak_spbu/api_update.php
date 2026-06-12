<?php
// otak_spbu/api_update_spbu.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nama) && !empty($data->status)) {
    try {
        $query = "UPDATE spbu_markers SET nama_spbu = :nama, status_operasional = :status, no_telp = :telp WHERE id = :id";
        $stmt = $conn->prepare($query);
        
        $stmt->bindValue(':nama', htmlspecialchars(strip_tags($data->nama)));
        $stmt->bindValue(':status', htmlspecialchars(strip_tags($data->status)));
        $stmt->bindValue(':telp', htmlspecialchars(strip_tags($data->telp)));
        $stmt->bindValue(':id', $data->id, PDO::PARAM_INT);
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Data SPBU berhasil diperbarui."]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>