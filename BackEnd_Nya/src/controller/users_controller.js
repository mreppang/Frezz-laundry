const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { addToBlacklist } = require("../../utils/tokenBlacklist");

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Username atau password salah" });

    const data = rows[0];
    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch)
      return res.status(401).json({ message: "Username atau password salah" });

    const token = jwt.sign(
      { id: data.id, username: data.username, role: data.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: data.id,
        name: data.username,
        username: data.username,
        role: data.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(400).json({ message: "Token tidak ditemukan" });
  addToBlacklist(token);
  return res.status(200).json({ message: "Logout berhasil" });
};

// GET /api/pengguna
const getDataUser = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC",
    );
    return res.status(200).json({ message: "Berhasil GET users", data: rows });
  } catch (error) {
    next(error);
  }
};

// POST /api/pengguna
const postDataUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi" });
    const hashing = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashing, role || "kasir"],
    );
    return res
      .status(201)
      .json({
        message: "User berhasil ditambahkan",
        data: { id: result.insertId, username },
      });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pengguna/:id
const putDataUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    if (!username)
      return res.status(400).json({ message: "Username wajib diisi" });
    if (password) {
      const hashing = await bcrypt.hash(password, 10);
      await db.execute(
        "UPDATE users SET username=?, password=?, role=? WHERE id=?",
        [username, hashing, role || "kasir", id],
      );
    } else {
      await db.execute("UPDATE users SET username=?, role=? WHERE id=?", [
        username,
        role || "kasir",
        id,
      ]);
    }
    return res.status(200).json({ message: `User id:${id} berhasil diupdate` });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/pengguna/:id
const deleteDataUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM users WHERE id=?", [id]);
    return res.status(200).json({ message: `User id:${id} berhasil dihapus` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getDataUser,
  postDataUser,
  putDataUser,
  deleteDataUser,
};
