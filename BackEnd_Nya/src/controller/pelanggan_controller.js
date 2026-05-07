const db = require("../config/database");

// GET semua pelanggan (search by nama/no_hp)
const getData_pelanggan = async (req, res, next) => {
  try {
    const { q } = req.query;
    let query = "SELECT * FROM pelanggan";
    const params = [];
    if (q) {
      query += " WHERE nama LIKE ? OR no_hp LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }
    query += " ORDER BY nama ASC";
    const [rows] = await db.execute(query, params);
    return res
      .status(200)
      .json({ message: "Berhasil GET pelanggan", data: rows });
  } catch (error) {
    next(error);
  }
};

// GET pelanggan by ID
const getDataByid_Pelanggan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM pelanggan WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Pelanggan tidak ditemukan" });
    return res.status(200).json({ message: "OK", data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// POST tambah pelanggan
const postData_pelanggan = async (req, res, next) => {
  try {
    const { nama, no_hp } = req.body;
    if (!nama || !no_hp)
      return res.status(400).json({ message: "Nama dan no_hp wajib diisi" });
    const [result] = await db.execute(
      "INSERT INTO pelanggan (nama, no_hp) VALUES (?, ?)",
      [nama, no_hp],
    );
    const [newRow] = await db.execute("SELECT * FROM pelanggan WHERE id = ?", [
      result.insertId,
    ]);
    return res
      .status(201)
      .json({ message: "Pelanggan berhasil ditambahkan", data: newRow[0] });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "No HP sudah terdaftar" });
    next(error);
  }
};

// PUT update pelanggan
const putData_pelanggan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama, no_hp } = req.body;
    if (!nama || !no_hp)
      return res.status(400).json({ message: "Nama dan no_hp wajib diisi" });
    await db.execute("UPDATE pelanggan SET nama=?, no_hp=? WHERE id=?", [
      nama,
      no_hp,
      id,
    ]);
    return res
      .status(200)
      .json({ message: `Pelanggan id:${id} berhasil diupdate` });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "No HP sudah terdaftar" });
    next(error);
  }
};

// DELETE hapus pelanggan
const deleteData_pelanggan = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Cek apakah ada transaksi aktif
    const [aktif] = await db.execute(
      "SELECT id FROM transaksi WHERE pelanggan_id=? AND status != 'selesai'",
      [id],
    );
    if (aktif.length > 0)
      return res
        .status(409)
        .json({ message: "Pelanggan masih memiliki transaksi aktif" });
    await db.execute("DELETE FROM pelanggan WHERE id=?", [id]);
    return res
      .status(200)
      .json({ message: `Pelanggan id:${id} berhasil dihapus` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getData_pelanggan,
  getDataByid_Pelanggan,
  postData_pelanggan,
  putData_pelanggan,
  deleteData_pelanggan,
};
