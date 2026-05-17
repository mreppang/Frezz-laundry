const db = require('../config/database');

// GET /api/pengaturan — ambil konfigurasi harga
const getPengaturan = async (req, res, next) => {
    try {
        const result = await db.execute('SELECT * FROM pengaturan LIMIT 1');
        return res.status(200).json({ message: 'OK', data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// PUT /api/pengaturan — update konfigurasi harga (owner only)
const putPengaturan = async (req, res, next) => {
    try {
        const { harga_per_kg, express_tambahan } = req.body;
        if (harga_per_kg === undefined || express_tambahan === undefined) {
            return res.status(400).json({ message: 'harga_per_kg dan express_tambahan wajib diisi' });
        }
        await db.execute(
            'UPDATE pengaturan SET harga_per_kg=$1, express_tambahan=$2 WHERE id=1',
            [harga_per_kg, express_tambahan]
        );
        return res.status(200).json({ message: 'Pengaturan berhasil disimpan' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPengaturan, putPengaturan };
