const db = require('../config/database');

// GET /api/pelanggan — semua pelanggan (support search by nama/no_hp)
const getData_pelanggan = async (req, res, next) => {
    try {
        const { q } = req.query;
        let query = 'SELECT * FROM pelanggan';
        const params = [];
        if (q) {
            // PostgreSQL: ILIKE untuk case-insensitive, $1 dan $2 untuk params
            query += ' WHERE nama ILIKE $1 OR no_hp ILIKE $2';
            params.push(`%${q}%`, `%${q}%`);
        }
        query += ' ORDER BY nama ASC';
        const result = await db.execute(query, params);
        return res.status(200).json({ message: 'Berhasil GET pelanggan', data: result.rows });
    } catch (error) {
        next(error);
    }
};

// GET /api/pelanggan/:id — pelanggan by ID
const getDataByid_Pelanggan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.execute('SELECT * FROM pelanggan WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
        }
        return res.status(200).json({ message: 'OK', data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// POST /api/pelanggan — tambah pelanggan
const postData_pelanggan = async (req, res, next) => {
    try {
        const { nama, no_hp } = req.body;
        if (!nama || !no_hp) {
            return res.status(400).json({ message: 'Nama dan no_hp wajib diisi' });
        }
        // PostgreSQL: RETURNING id untuk mendapat ID baru
        const result = await db.execute(
            'INSERT INTO pelanggan (nama, no_hp) VALUES ($1, $2) RETURNING *',
            [nama, no_hp]
        );
        return res.status(201).json({ message: 'Pelanggan berhasil ditambahkan', data: result.rows[0] });
    } catch (error) {
        // PostgreSQL unique violation code: 23505
        if (error.code === '23505') {
            return res.status(409).json({ message: 'No HP sudah terdaftar' });
        }
        next(error);
    }
};

// PUT /api/pelanggan/:id — update pelanggan
const putData_pelanggan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nama, no_hp } = req.body;
        if (!nama || !no_hp) {
            return res.status(400).json({ message: 'Nama dan no_hp wajib diisi' });
        }
        await db.execute('UPDATE pelanggan SET nama=$1, no_hp=$2 WHERE id=$3', [nama, no_hp, id]);
        return res.status(200).json({ message: `Pelanggan id:${id} berhasil diupdate` });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'No HP sudah terdaftar' });
        }
        next(error);
    }
};

// DELETE /api/pelanggan/:id — hapus pelanggan
const deleteData_pelanggan = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Cek apakah ada transaksi aktif
        const aktif = await db.execute(
            "SELECT id FROM transaksi WHERE pelanggan_id=$1 AND status != 'selesai'",
            [id]
        );
        if (aktif.rows.length > 0) {
            return res.status(409).json({ message: 'Pelanggan masih memiliki transaksi aktif' });
        }
        await db.execute('DELETE FROM pelanggan WHERE id=$1', [id]);
        return res.status(200).json({ message: `Pelanggan id:${id} berhasil dihapus` });
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
