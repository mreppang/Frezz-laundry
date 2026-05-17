const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addToBlacklist } = require('../utils/tokenBlacklist');

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password wajib diisi' });
        }

        const result = await db.execute('SELECT * FROM users WHERE username = $1', [username]);
        const rows = result.rows;
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                name: user.username,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/logout
const logout = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(400).json({ message: 'Token tidak ditemukan' });
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    addToBlacklist(token);
    return res.status(200).json({ message: 'Logout berhasil' });
};

module.exports = { login, logout };
