const db = require("../config/database");

// GET /api/riwayat — arsip transaksi selesai
const getRiwayat = async (req, res, next) => {
  try {
    const { dari, sampai, q } = req.query;
    let query = `
            SELECT r.selesai_at, t.*, p.nama AS pelanggan_nama, p.no_hp AS pelanggan_hp,
                   u.username AS kasir_nama
            FROM riwayat r
            JOIN transaksi t ON r.transaksi_id = t.id
            LEFT JOIN pelanggan p ON t.pelanggan_id = p.id
            LEFT JOIN users u ON t.created_by = u.id
            WHERE 1=1
        `;
    const params = [];
    if (dari) {
      query += " AND DATE(r.selesai_at) >= ?";
      params.push(dari);
    }
    if (sampai) {
      query += " AND DATE(r.selesai_at) <= ?";
      params.push(sampai);
    }
    if (q) {
      query += " AND p.nama LIKE ?";
      params.push(`%${q}%`);
    }
    query += " ORDER BY r.selesai_at DESC";
    const [rows] = await db.execute(query, params);
    return res.status(200).json({ message: "OK", data: rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRiwayat };
