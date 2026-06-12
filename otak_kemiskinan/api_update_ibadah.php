<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nama)) {
    try {
        $query = "UPDATE rumah_ibadah SET 
                  nama = :nama, 
                  jenis = :jenis, 
                  radius_meter = :radius 
                  WHERE id = :id";
        $stmt = $conn->prepare($query);
        
        $stmt->bindValue(':nama', htmlspecialchars(strip_tags($data->nama)));
        $stmt->bindValue(':jenis', htmlspecialchars(strip_tags($data->jenis)));
        $stmt->bindValue(':radius', $data->radius, PDO::PARAM_INT);
        $stmt->bindValue(':id', $data->id, PDO::PARAM_INT);
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Data Rumah Ibadah berhasil diperbarui."]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Data krusial tidak lengkap."]);
}
?>