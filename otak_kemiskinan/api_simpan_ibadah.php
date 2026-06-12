<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nama) && isset($data->latitude) && isset($data->longitude)) {
    try {
        $query = "INSERT INTO rumah_ibadah (nama, jenis, radius_meter, alamat, latitude, longitude) 
                  VALUES (:nama, :jenis, :radius, :alamat, :lat, :lng)";
        
        $stmt = $conn->prepare($query);
        
        $stmt->bindValue(':nama', htmlspecialchars(strip_tags($data->nama)));
        $stmt->bindValue(':jenis', htmlspecialchars(strip_tags($data->jenis)));
        $stmt->bindValue(':radius', $data->radius_meter, PDO::PARAM_INT);
        $stmt->bindValue(':alamat', htmlspecialchars(strip_tags($data->alamat)));
        $stmt->bindValue(':lat', $data->latitude);
        $stmt->bindValue(':lng', $data->longitude);
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Pusat radius ibadah berhasil diarsipkan."]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Data rumah ibadah tidak lengkap."]);
}
?>