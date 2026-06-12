<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && isset($data->lat) && isset($data->lng)) {
    try {
        // Alamat ikut di-update saat marker digeser
        $stmt = $conn->prepare("UPDATE spbu_markers SET latitude = :lat, longitude = :lng, alamat = :alamat WHERE id = :id");
        $stmt->bindValue(':lat', $data->lat);
        $stmt->bindValue(':lng', $data->lng);
        $stmt->bindValue(':alamat', htmlspecialchars(strip_tags($data->alamat)));
        $stmt->bindValue(':id', $data->id, PDO::PARAM_INT);
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Koordinat dan alamat diperbarui."]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>