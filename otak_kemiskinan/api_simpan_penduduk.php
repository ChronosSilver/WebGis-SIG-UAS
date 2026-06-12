<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

// Validasi ketat: Nama, lat, dan lng adalah harga mati
if (!empty($data->nama) && isset($data->lat) && isset($data->lng)) {
    try {
        $query = "INSERT INTO rumah_penduduk 
                  (nama_kk, agama, jml_tanggungan, pengeluaran, pmt_lantai, pmt_dinding, pmt_sanitasi, pmt_penerangan, pmt_air, pmt_score, status_kemiskinan, alamat, latitude, longitude) 
                  VALUES 
                  (:nama, :agama, :tanggungan, :pengeluaran, :lantai, :dinding, :sanitasi, :penerangan, :air, :score, :status, :alamat, :lat, :lng)";
        
        $stmt = $conn->prepare($query);
        
        // Membersihkan input dari potensi XSS Attack
        $stmt->bindValue(':nama', htmlspecialchars(strip_tags($data->nama)));
        $stmt->bindValue(':agama', htmlspecialchars(strip_tags($data->agama)));
        $stmt->bindValue(':tanggungan', $data->tanggungan, PDO::PARAM_INT);
        $stmt->bindValue(':pengeluaran', $data->pengeluaran, PDO::PARAM_INT);
        
        // Penilaian 5 Kriteria PMT Biner
        $stmt->bindValue(':lantai', $data->pmt_lantai, PDO::PARAM_INT);
        $stmt->bindValue(':dinding', $data->pmt_dinding, PDO::PARAM_INT);
        $stmt->bindValue(':sanitasi', $data->pmt_sanitasi, PDO::PARAM_INT);
        $stmt->bindValue(':penerangan', $data->pmt_penerangan, PDO::PARAM_INT);
        $stmt->bindValue(':air', $data->pmt_air, PDO::PARAM_INT);
        
        // Hasil Analisis DSS
        $stmt->bindValue(':score', $data->pmt_score, PDO::PARAM_INT);
        $stmt->bindValue(':status', htmlspecialchars(strip_tags($data->status)));
        $stmt->bindValue(':alamat', htmlspecialchars(strip_tags($data->alamat)));
        $stmt->bindValue(':lat', $data->lat);
        $stmt->bindValue(':lng', $data->lng);
        
        if($stmt->execute()) {
            echo json_encode(["pesan" => "Data kemiskinan berhasil diarsipkan."]);
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