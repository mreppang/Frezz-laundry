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

// GET /api/laporan/dashboard — dashboard owner
const getDashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [[{ totalTransaksi }]] = await db.execute(
      "SELECT COUNT(*) AS totalTransaksi FROM transaksi",
    );
    const [[{ totalPendapatan }]] = await db.execute(
      "SELECT COALESCE(SUM(total_harga),0) AS totalPendapatan FROM transaksi WHERE status='selesai'",
    );
    const [[{ aktif }]] = await db.execute(
      "SELECT COUNT(*) AS aktif FROM transaksi WHERE status != 'selesai'",
    );
    const [[{ selesai }]] = await db.execute(
      "SELECT COUNT(*) AS selesai FROM transaksi WHERE status='selesai'",
    );
    const [[{ hariIni }]] = await db.execute(
      "SELECT COUNT(*) AS hariIni FROM transaksi WHERE DATE(tanggal_masuk)=?",
      [today],
    );

    // Chart 7 hari
    const [chartData] = await db.execute(`
            SELECT DATE(selesai_at) AS tanggal,
                   COUNT(*) AS jumlah,
                   SUM(t.total_harga) AS pendapatan
            FROM riwayat r JOIN transaksi t ON r.transaksi_id=t.id
            WHERE selesai_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(selesai_at)
            ORDER BY tanggal ASC
        `);

    // 5 transaksi terbaru
    const [recent] = await db.execute(`
            SELECT t.*, p.nama AS pelanggan_nama, u.username AS kasir_nama
            FROM transaksi t
            LEFT JOIN pelanggan p ON t.pelanggan_id=p.id
            LEFT JOIN users u ON t.created_by=u.id
            ORDER BY t.created_at DESC LIMIT 5
        `);

    return res
      .status(200)
      .json({
        totalTransaksi,
        totalPendapatan,
        aktif,
        selesai,
        hariIni,
        chartData,
        recent,
      });
  } catch (error) {
    next(error);
  }
};

// GET /api/laporan/pendapatan — laporan per tanggal
const getLaporan = async (req, res, next) => {
  try {
    const { dari, sampai } = req.query;
    let query = `
            SELECT DATE(r.selesai_at) AS tanggal,
                   COUNT(*) AS jumlah_transaksi,
                   SUM(t.total_harga) AS total_pendapatan
            FROM riwayat r JOIN transaksi t ON r.transaksi_id=t.id
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
    query += " GROUP BY DATE(r.selesai_at) ORDER BY tanggal ASC";

    const [rows] = await db.execute(query, params);
    return res.status(200).json({ message: "OK", data: rows });
  } catch (error) {
    next(error);
  }
};

// GET /api/pengaturan
const getPengaturan = async (req, res, next) => {
  try {
    const [rows] = await db.execute("SELECT * FROM pengaturan LIMIT 1");
    return res.status(200).json({ message: "OK", data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pengaturan (owner only)
const putPengaturan = async (req, res, next) => {
  try {
    const { harga_per_kg, express_tambahan } = req.body;
    await db.execute(
      "UPDATE pengaturan SET harga_per_kg=?, express_tambahan=? WHERE id=1",
      [harga_per_kg, express_tambahan],
    );
    return res.status(200).json({ message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRiwayat,
  getDashboard,
  getLaporan,
  getPengaturan,
  putPengaturan,
};
