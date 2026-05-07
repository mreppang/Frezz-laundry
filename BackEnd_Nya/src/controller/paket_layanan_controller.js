const db = require("../config/database");

// GET semua paket layanan
const getDataPaket = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM paket_layanan ORDER BY nama ASC",
    );
    return res.status(200).json({
      message: "Berhasil GET data paket layanan",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// GET paket by ID
const getDataByidPaket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      "SELECT * FROM paket_layanan WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: `Paket id:${id} tidak ditemukan` });
    }
    return res
      .status(200)
      .json({ message: `Berhasil GET paket id:${id}`, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// POST tambah paket (owner only)
const postDataPaket = async (req, res, next) => {
  try {
    const { nama, tipe, harga_per_kg, estimasi_hari } = req.body;
    if (!nama || !tipe) {
      return res
        .status(400)
        .json({ message: "Nama dan tipe paket wajib diisi" });
    }
    const [result] = await db.execute(
      "INSERT INTO paket_layanan (nama, tipe, harga_per_kg, estimasi_hari) VALUES (?, ?, ?, ?)",
      [nama, tipe, harga_per_kg || 0, estimasi_hari || 1],
    );
    const [newRow] = await db.execute(
      "SELECT * FROM paket_layanan WHERE id = ?",
      [result.insertId],
    );
    return res
      .status(201)
      .json({ message: "Paket berhasil ditambahkan", data: newRow[0] });
  } catch (error) {
    next(error);
  }
};

// PUT update paket (owner only)
const putDataPaket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama, tipe, harga_per_kg, estimasi_hari } = req.body;
    if (!nama || !tipe) {
      return res
        .status(400)
        .json({ message: "Nama dan tipe paket wajib diisi" });
    }
    await db.execute(
      "UPDATE paket_layanan SET nama = ?, tipe = ?, harga_per_kg = ?, estimasi_hari = ? WHERE id = ?",
      [nama, tipe, harga_per_kg || 0, estimasi_hari || 1, id],
    );
    return res
      .status(200)
      .json({ message: `Paket id:${id} berhasil diupdate` });
  } catch (error) {
    next(error);
  }
};

// DELETE hapus paket (owner only)
const deleteDataPaket = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM paket_layanan WHERE id = ?", [id]);
    return res.status(200).json({ message: `Paket id:${id} berhasil dihapus` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDataPaket,
  getDataByidPaket,
  postDataPaket,
  putDataPaket,
  deleteDataPaket,
};
