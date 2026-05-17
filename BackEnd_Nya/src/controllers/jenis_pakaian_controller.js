const db = require('../config/database');

// GET /api/jenis-pakaian — semua jenis pakaian
const getDataJenisPakaian = async (req, res, next) => {
    try {
        const result = await db.execute('SELECT * FROM jenis_pakaian ORDER BY nama_jenis ASC');
        return res.status(200).json({ message: 'OK', data: result.rows });
    } catch (error) {
        next(error);
    }
};

// POST /api/jenis-pakaian — tambah jenis pakaian (owner)
const postDataJenisPakaian = async (req, res, next) => {
    try {
        const { nama_jenis, harga } = req.body;
        if (!nama_jenis) {
            return res.status(400).json({ message: 'nama_jenis wajib diisi' });
        }
        // RETURNING * untuk langsung dapat data baru
        const result = await db.execute(
            'INSERT INTO jenis_pakaian (nama_jenis, harga) VALUES ($1, $2) RETURNING *',
            [nama_jenis, harga || 0]
        );
        return res.status(201).json({ message: 'Jenis pakaian ditambahkan', data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// PUT /api/jenis-pakaian/:id — update jenis pakaian (owner)
const putDataJenisPakaian = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nama_jenis, harga } = req.body;
        if (!nama_jenis) {
            return res.status(400).json({ message: 'nama_jenis wajib diisi' });
        }
        await db.execute(
            'UPDATE jenis_pakaian SET nama_jenis=$1, harga=$2 WHERE id=$3',
            [nama_jenis, harga || 0, id]
        );
        return res.status(200).json({ message: `Jenis pakaian id:${id} berhasil diupdate` });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/jenis-pakaian/:id — hapus jenis pakaian (owner)
const deleteDataJenisPakaian = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM jenis_pakaian WHERE id=$1', [id]);
        return res.status(200).json({ message: `Jenis pakaian id:${id} berhasil dihapus` });
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
