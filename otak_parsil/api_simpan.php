<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nama) && !empty($data->status) && !empty($data->koordinat)) {
    try {
        $query = "INSERT INTO tanah_polygons (nama_pemilik, status_kepemilikan, luas_meter, koordinat) 
                  VALUES (:nama, :status, :luas, :koordinat)";
        $stmt = $conn->prepare($query);
        
        $stmt->bindValue(':nama', htmlspecialchars(strip_tags($data->nama)));
        $stmt->bindValue(':status', htmlspecialchars(strip_tags($data->status)));
        $stmt->bindValue(':luas', $data->luas, PDO::PARAM_INT);
        $stmt->bindValue(':koordinat', $data->koordinat);
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Data tanah berhasil ditambahkan."]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Data tidak lengkap."]);
}
?>