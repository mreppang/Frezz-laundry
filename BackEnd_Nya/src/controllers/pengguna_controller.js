const db = require('../config/database');
const bcrypt = require('bcrypt');

// GET /api/pengguna
const getDataUser = async (req, res, next) => {
    try {
        const result = await db.execute(
            'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
        );
        return res.status(200).json({ message: 'Berhasil GET pengguna', data: result.rows });
    } catch (error) {
        next(error);
    }
};

// POST /api/pengguna
const postDataUser = async (req, res, next) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password wajib diisi' });
        }
        const hashing = await bcrypt.hash(password, 10);
        const result = await db.execute(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id',
            [username, hashing, role || 'kasir']
        );
        return res.status(201).json({
            message: 'Pengguna berhasil ditambahkan',
            data: { id: result.rows[0].id, username, role: role || 'kasir' },
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Username sudah terdaftar' });
        }
        next(error);
    }
};

// PUT /api/pengguna/:id
const putDataUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, password, role } = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Username wajib diisi' });
        }
        if (password) {
            const hashing = await bcrypt.hash(password, 10);
            await db.execute(
                'UPDATE users SET username=$1, password=$2, role=$3 WHERE id=$4',
                [username, hashing, role || 'kasir', id]
            );
        } else {
            await db.execute(
                'UPDATE users SET username=$1, role=$2 WHERE id=$3',
                [username, role || 'kasir', id]
            );
        }
        return res.status(200).json({ message: `Pengguna id:${id} berhasil diupdate` });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/pengguna/:id
const deleteDataUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM users WHERE id=$1', [id]);
        return res.status(200).json({ message: `Pengguna id:${id} berhasil dihapus` });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDataUser, postDataUser, putDataUser, deleteDataUser };
