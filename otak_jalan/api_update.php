<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nama) && !empty($data->status)) {
    try {
        $query = "UPDATE jalan_polylines SET nama_jalan = :nama, status_jalan = :status WHERE id = :id";
        $stmt = $conn->prepare($query);
        
        $stmt->bindValue(':nama', htmlspecialchars(strip_tags($data->nama)));
        $stmt->bindValue(':status', htmlspecialchars(strip_tags($data->status)));
        $stmt->bindValue(':id', $data->id, PDO::PARAM_INT);
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Data Jalan berhasil diperbarui."]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>