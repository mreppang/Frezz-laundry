const db = require('../config/database');

// GET /api/riwayat — arsip transaksi yang sudah selesai
const getRiwayat = async (req, res, next) => {
    try {
        const { dari, sampai, q } = req.query;
        const params = [];
        let paramIdx = 1;

        let query = `
            SELECT r.selesai_at, t.*, p.nama AS pelanggan_nama, p.no_hp AS pelanggan_hp,
                   u.username AS kasir_nama
            FROM riwayat r
            JOIN transaksi t ON r.transaksi_id = t.id
            LEFT JOIN pelanggan p ON t.pelanggan_id = p.id
            LEFT JOIN users u ON t.created_by = u.id
            WHERE 1=1
        `;

        if (dari) {
            query += ` AND DATE(r.selesai_at) >= $${paramIdx++}`;
            params.push(dari);
        }
        if (sampai) {
            query += ` AND DATE(r.selesai_at) <= $${paramIdx++}`;
            params.push(sampai);
        }
        if (q) {
            query += ` AND p.nama ILIKE $${paramIdx++}`;
            params.push(`%${q}%`);
        }
        query += ' ORDER BY r.selesai_at DESC';

        const result = await db.execute(query, params);
        return res.status(200).json({ message: 'OK', data: result.rows });
    } catch (error) {
        next(error);
    }
};

module.exports = { getRiwayat };
