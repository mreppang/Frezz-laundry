const db = require("../config/database");

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

module.exports = { getPengaturan, putPengaturan };
