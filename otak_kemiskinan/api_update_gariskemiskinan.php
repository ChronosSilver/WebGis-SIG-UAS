<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nilai) && is_numeric($data->nilai)) {
    try {
        // Mengunci eksekusi agar jika satu gagal, semua dibatalkan (ACID Compliance)
        $conn->beginTransaction();

        // 1. Matikan semua standar historis lama
        $conn->exec("UPDATE garis_kemiskinan SET is_active = FALSE");

        // 2. Masukkan standar baru sebagai yang aktif
        $stmtConfig = $conn->prepare("INSERT INTO garis_kemiskinan (tahun, nilai_rupiah, is_active) VALUES (:tahun, :nilai, TRUE)");
        $stmtConfig->bindValue(':tahun', date("Y"), PDO::PARAM_INT);
        $stmtConfig->bindValue(':nilai', $data->nilai, PDO::PARAM_INT);
        $stmtConfig->execute();

        // 3. KALIBRASI ULANG MASSAL (Cascading Status Update)
        $updatePenduduk = "UPDATE rumah_penduduk SET status_kemiskinan = CASE
            WHEN pengeluaran > :nilai THEN 'Tidak Miskin'
            WHEN pmt_score >= 4 THEN 'Sangat Miskin'
            WHEN pmt_score >= 2 THEN 'Miskin'
            WHEN pmt_score = 1 THEN 'Rentan Miskin'
            ELSE 'Tidak Miskin'
        END";
        
        $stmtUpdate = $conn->prepare($updatePenduduk);
        $stmtUpdate->bindValue(':nilai', $data->nilai, PDO::PARAM_INT);
        $stmtUpdate->execute();

        $conn->commit();

        echo json_encode(["pesan" => "Garis kemiskinan diubah dan seluruh status penduduk telah dikalibrasi ulang!"]);
    } catch(PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Nilai garis kemiskinan tidak valid."]);
}
?>