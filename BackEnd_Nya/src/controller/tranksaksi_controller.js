const db = require("../config/database");

// Helper: generate kode_order unik FRZ-001
const generateKode = async () => {
  const [rows] = await db.execute("SELECT COUNT(*) AS total FROM transaksi");
  const n = rows[0].total + 1;
  return `FRZ-${String(n).padStart(3, "0")}`;
};

// Helper: ambil pengaturan harga
const getPengaturan = async () => {
  const [rows] = await db.execute("SELECT * FROM pengaturan LIMIT 1");
  return rows[0] || { harga_per_kg: 10000, express_tambahan: 10000 };
};

// GET /api/transaksi — daftar transaksi aktif (belum selesai)
const getDataTransaksi = async (req, res, next) => {
  try {
    const { status, q } = req.query;
    let query = `
            SELECT t.*, p.nama AS pelanggan_nama, p.no_hp AS pelanggan_hp,
                   u.username AS kasir_nama
            FROM transaksi t
            LEFT JOIN pelanggan p ON t.pelanggan_id = p.id
            LEFT JOIN users u ON t.created_by = u.id
            WHERE 1=1
        `;
    const params = [];
    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }
    if (q) {
      query += " AND p.nama LIKE ?";
      params.push(`%${q}%`);
    }
    query += " ORDER BY t.created_at DESC";

    const [rows] = await db.execute(query, params);
    return res.status(200).json({ message: "OK", data: rows });
  } catch (error) {
    next(error);
  }
};

// GET /api/transaksi/:id — detail + items
const getDataByidTransaksi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `
            SELECT t.*, p.nama AS pelanggan_nama, p.no_hp AS pelanggan_hp,
                   u.username AS kasir_nama
            FROM transaksi t
            LEFT JOIN pelanggan p ON t.pelanggan_id = p.id
            LEFT JOIN users u ON t.created_by = u.id
            WHERE t.id = ?
        `,
      [id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });

    const [items] = await db.execute(
      `
            SELECT td.*, jp.nama_jenis
            FROM transaksi_detail td
            LEFT JOIN jenis_pakaian jp ON td.jenis_id = jp.id
            WHERE td.transaksi_id = ?
        `,
      [id],
    );

    return res.status(200).json({ message: "OK", ...rows[0], items });
  } catch (error) {
    next(error);
  }
};

// POST /api/transaksi — buat transaksi baru
const postDataTransaksi = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { pelanggan_id, layanan, paket, berat_kg, items, tanggal_masuk } =
      req.body;

    if (!pelanggan_id || !layanan || !paket) {
      return res
        .status(400)
        .json({ message: "pelanggan_id, layanan, dan paket wajib diisi" });
    }
    if (layanan === "kiloan" && !berat_kg) {
      return res
        .status(400)
        .json({ message: "berat_kg wajib diisi untuk layanan kiloan" });
    }
    if (layanan === "satuan" && (!items || items.length === 0)) {
      return res
        .status(400)
        .json({ message: "Minimal 1 item untuk layanan satuan" });
    }

    await conn.beginTransaction();

    const cfg = await getPengaturan();
    const kode_order = await generateKode();
    const kasir_id = req.user?.id || null;
    const tgl = tanggal_masuk || new Date();

    let total_harga = 0;

    if (layanan === "kiloan") {
      const hargaKg = Number(cfg.harga_per_kg);
      const tambahan = paket === "express" ? Number(cfg.express_tambahan) : 0;
      total_harga = Number(berat_kg) * (hargaKg + tambahan);
    }

    // Insert transaksi header dulu (untuk satuan, total dihitung dari items)
    const [result] = await conn.execute(
      `INSERT INTO transaksi (kode_order, pelanggan_id, layanan, paket, berat_kg, total_harga, status, tanggal_masuk, created_by)
             VALUES (?, ?, ?, ?, ?, ?, 'belum_selesai', ?, ?)`,
      [
        kode_order,
        pelanggan_id,
        layanan,
        paket,
        berat_kg || null,
        total_harga,
        tgl,
        kasir_id,
      ],
    );
    const transaksi_id = result.insertId;

    // Insert detail items untuk satuan
    if (layanan === "satuan" && items) {
      for (const item of items) {
        // Harga satuan = harga asli (express fee TIDAK per item)
        const hargaItem = Number(item.harga || 0);
        const subtotal = hargaItem * Number(item.qty || 1);
        total_harga += subtotal;
        await conn.execute(
          "INSERT INTO transaksi_detail (transaksi_id, jenis_id, qty, harga, subtotal) VALUES (?,?,?,?,?)",
          [transaksi_id, item.jenis_id, item.qty, hargaItem, subtotal],
        );
      }
      // Express untuk satuan = tambahan flat Rp10.000 ke total (bukan per item)
      if (paket === "express") {
        total_harga += Number(cfg.express_tambahan);
      }
      // Update total_harga
      await conn.execute("UPDATE transaksi SET total_harga=? WHERE id=?", [
        total_harga,
        transaksi_id,
      ]);
    }

    await conn.commit();
    return res.status(201).json({
      message: "Transaksi berhasil dibuat",
      data: { id: transaksi_id, kode_order, total_harga },
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// PATCH /api/transaksi/:id/status — update status
const patchStatusTransaksi = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const valid = ["belum_selesai", "siap_diambil", "selesai"];
    if (!valid.includes(status)) {
      return res
        .status(400)
        .json({ message: `Status tidak valid. Pilih: ${valid.join(", ")}` });
    }

    await conn.beginTransaction();

    const tanggal_selesai = status === "selesai" ? new Date() : null;
    await conn.execute(
      "UPDATE transaksi SET status=?, tanggal_selesai=? WHERE id=?",
      [status, tanggal_selesai, id],
    );

    // Jika selesai → auto insert ke riwayat
    if (status === "selesai") {
      await conn.execute(
        "INSERT IGNORE INTO riwayat (transaksi_id, selesai_at) VALUES (?, ?)",
        [id, new Date()],
      );
    }

    await conn.commit();
    return res
      .status(200)
      .json({ message: `Status diperbarui menjadi "${status}"` });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

module.exports = {
  getDataTransaksi,
  getDataByidTransaksi,
  postDataTransaksi,
  patchStatusTransaksi,
};
