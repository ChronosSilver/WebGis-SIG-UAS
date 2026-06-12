<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id_penduduk)) {
    try {
        $query = "INSERT INTO log_bantuan (id_penduduk, beras_kg, minyak_l, gula_kg, telur_kg, susu_kaleng, tunai_rp, catatan) 
                  VALUES (:id, :beras, :minyak, :gula, :telur, :susu, :tunai, :catatan)";
        $stmt = $conn->prepare($query);
        
        $stmt->bindValue(':id', $data->id_penduduk, PDO::PARAM_INT);
        $stmt->bindValue(':beras', $data->beras, PDO::PARAM_INT);
        $stmt->bindValue(':minyak', $data->minyak, PDO::PARAM_INT);
        $stmt->bindValue(':gula', $data->gula, PDO::PARAM_INT);
        $stmt->bindValue(':telur', $data->telur, PDO::PARAM_INT);
        $stmt->bindValue(':susu', $data->susu, PDO::PARAM_INT);
        $stmt->bindValue(':tunai', $data->tunai, PDO::PARAM_INT);
        $stmt->bindValue(':catatan', htmlspecialchars(strip_tags($data->catatan)));
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Catatan penyaluran bantuan berhasil disimpan."]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "ID Keluarga Penerima tidak valid."]);
}
?>