const db = require("../config/database");

// GET semua jenis pakaian
const getDataJenisPakaian = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM jenis_pakaian ORDER BY nama_jenis ASC",
    );
    return res.status(200).json({ message: "OK", data: rows });
  } catch (error) {
    next(error);
  }
};

// POST tambah jenis pakaian (owner)
const postDataJenisPakaian = async (req, res, next) => {
  try {
    const { nama_jenis, harga } = req.body;
    if (!nama_jenis)
      return res.status(400).json({ message: "nama_jenis wajib diisi" });
    const [result] = await db.execute(
      "INSERT INTO jenis_pakaian (nama_jenis, harga) VALUES (?, ?)",
      [nama_jenis, harga || 0],
    );
    const [newRow] = await db.execute(
      "SELECT * FROM jenis_pakaian WHERE id=?",
      [result.insertId],
    );
    return res
      .status(201)
      .json({ message: "Jenis pakaian ditambahkan", data: newRow[0] });
  } catch (error) {
    next(error);
  }
};

// PUT update jenis pakaian (owner)
const putDataJenisPakaian = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_jenis, harga } = req.body;
    if (!nama_jenis)
      return res.status(400).json({ message: "nama_jenis wajib diisi" });
    await db.execute(
      "UPDATE jenis_pakaian SET nama_jenis=?, harga=? WHERE id=?",
      [nama_jenis, harga || 0, id],
    );
    return res.status(200).json({ message: `Jenis pakaian id:${id} diupdate` });
  } catch (error) {
    next(error);
  }
};

// DELETE hapus jenis pakaian (owner)
const deleteDataJenisPakaian = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM jenis_pakaian WHERE id=?", [id]);
    return res.status(200).json({ message: `Jenis pakaian id:${id} dihapus` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDataJenisPakaian,
  postDataJenisPakaian,
  putDataJenisPakaian,
  deleteDataJenisPakaian,
};
