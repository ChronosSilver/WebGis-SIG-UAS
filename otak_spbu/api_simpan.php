<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nama) && !empty($data->status) && isset($data->lat) && isset($data->lng)) {
    try {
        $query = "INSERT INTO spbu_markers (nama_spbu, status_operasional, no_telp, alamat, latitude, longitude) 
                  VALUES (:nama, :status, :telp, :alamat, :lat, :lng)";
        $stmt = $conn->prepare($query);
        
        $stmt->bindValue(':nama', htmlspecialchars(strip_tags($data->nama)));
        $stmt->bindValue(':status', htmlspecialchars(strip_tags($data->status)));
        $stmt->bindValue(':telp', htmlspecialchars(strip_tags($data->telp)));
        // Alamat dimasukkan
        $stmt->bindValue(':alamat', htmlspecialchars(strip_tags($data->alamat))); 
        $stmt->bindValue(':lat', $data->lat);
        $stmt->bindValue(':lng', $data->lng);
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "SPBU berhasil ditambahkan."]);
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