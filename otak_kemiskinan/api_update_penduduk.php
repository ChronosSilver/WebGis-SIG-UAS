<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nama)) {
    try {
        $query = "UPDATE rumah_penduduk SET 
                  nama_kk = :nama, 
                  agama = :agama, 
                  jml_tanggungan = :tanggungan, 
                  pengeluaran = :pengeluaran, 
                  pmt_lantai = :lantai, 
                  pmt_dinding = :dinding, 
                  pmt_sanitasi = :sanitasi, 
                  pmt_penerangan = :penerangan, 
                  pmt_air = :air, 
                  pmt_score = :score, 
                  status_kemiskinan = :status 
                  WHERE id = :id";
                  
        $stmt = $conn->prepare($query);
        
        $stmt->bindValue(':nama', htmlspecialchars(strip_tags($data->nama)));
        $stmt->bindValue(':agama', htmlspecialchars(strip_tags($data->agama)));
        $stmt->bindValue(':tanggungan', $data->tanggungan, PDO::PARAM_INT);
        $stmt->bindValue(':pengeluaran', $data->pengeluaran, PDO::PARAM_INT);
        
        $stmt->bindValue(':lantai', $data->pmt_lantai, PDO::PARAM_INT);
        $stmt->bindValue(':dinding', $data->pmt_dinding, PDO::PARAM_INT);
        $stmt->bindValue(':sanitasi', $data->pmt_sanitasi, PDO::PARAM_INT);
        $stmt->bindValue(':penerangan', $data->pmt_penerangan, PDO::PARAM_INT);
        $stmt->bindValue(':air', $data->pmt_air, PDO::PARAM_INT);
        
        $stmt->bindValue(':score', $data->pmt_score, PDO::PARAM_INT);
        $stmt->bindValue(':status', htmlspecialchars(strip_tags($data->status)));
        $stmt->bindValue(':id', $data->id, PDO::PARAM_INT);
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Data kemiskinan berhasil diperbarui."]);
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