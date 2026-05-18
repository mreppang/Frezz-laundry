const db = require('../config/database');

// GET /api/laporan/dashboard — statistik & data untuk halaman dashboard
const getDashboard = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // PostgreSQL: COUNT() dan SUM() mengembalikan string, parse ke Number
        const r1 = await db.execute('SELECT COUNT(*) AS "totalTransaksi" FROM transaksi');
        const totalTransaksi = Number(r1.rows[0].totalTransaksi);

        const r2 = await db.execute(
            "SELECT COALESCE(SUM(total_harga),0) AS \"totalPendapatan\" FROM transaksi WHERE status='selesai'"
        );
        const totalPendapatan = Number(r2.rows[0].totalPendapatan);

        const r3 = await db.execute(
            "SELECT COUNT(*) AS aktif FROM transaksi WHERE status != 'selesai'"
        );
        const aktif = Number(r3.rows[0].aktif);

        const r4 = await db.execute(
            "SELECT COUNT(*) AS selesai FROM transaksi WHERE status='selesai'"
        );
        const selesai = Number(r4.rows[0].selesai);

        const r5 = await db.execute(
            'SELECT COUNT(*) AS "hariIni" FROM transaksi WHERE DATE(tanggal_masuk)=$1',
            [today]
        );
        const hariIni = Number(r5.rows[0].hariIni);

        // Chart pendapatan 7 hari terakhir
        // PostgreSQL: CURRENT_DATE - INTERVAL '7 days' menggantikan DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        const chartResult = await db.execute(`
            SELECT DATE(r.selesai_at) AS tanggal,
                   COUNT(*) AS jumlah,
                   SUM(t.total_harga) AS pendapatan
            FROM riwayat r
            JOIN transaksi t ON r.transaksi_id = t.id
            WHERE r.selesai_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(r.selesai_at)
            ORDER BY tanggal ASC
        `);
        const chartData = chartResult.rows.map(row => ({
            ...row,
            jumlah: Number(row.jumlah),
            pendapatan: Number(row.pendapatan),
        }));

        // 5 transaksi terbaru
        const recentResult = await db.execute(`
            SELECT t.*, p.nama AS pelanggan_nama, u.username AS kasir_nama
            FROM transaksi t
            LEFT JOIN pelanggan p ON t.pelanggan_id = p.id
            LEFT JOIN users u ON t.created_by = u.id
            ORDER BY t.created_at DESC
            LIMIT 5
        `);
        const recent = recentResult.rows;

        return res.status(200).json({
            message: 'OK',
            data: { totalTransaksi, totalPendapatan, aktif, selesai, hariIni, chartData, recent },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/laporan/pendapatan — laporan pendapatan per tanggal (owner only)
const getLaporan = async (req, res, next) => {
    try {
        const { dari, sampai } = req.query;
        const params = [];
        let paramIdx = 1;

        let query = `
            SELECT DATE(r.selesai_at) AS tanggal,
                   COUNT(*) AS jumlah_transaksi,
                   SUM(t.total_harga) AS total_pendapatan
            FROM riwayat r
            JOIN transaksi t ON r.transaksi_id = t.id
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
        query += ' GROUP BY DATE(r.selesai_at) ORDER BY tanggal ASC';

        const result = await db.execute(query, params);
        const rows = result.rows.map(row => ({
            ...row,
            jumlah_transaksi: Number(row.jumlah_transaksi),
            total_pendapatan: Number(row.total_pendapatan),
        }));
        return res.status(200).json({ message: 'OK', data: rows });
    } catch (error) {
        next(error);
    }
};

// GET /api/laporan/export — detail per-transaksi untuk export CSV (owner only)
const getExportDetail = async (req, res, next) => {
    try {
        const { dari, sampai } = req.query;
        const params = [];
        let paramIdx = 1;

        let query = `
            SELECT t.kode_order, p.nama AS pelanggan_nama, p.no_hp AS pelanggan_hp,
                   t.layanan, t.paket, t.berat_kg, t.total_harga,
                   u.username AS kasir_nama,
                   t.tanggal_masuk, r.selesai_at
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
        query += ' ORDER BY r.selesai_at ASC';

        const result = await db.execute(query, params);
        return res.status(200).json({ message: 'OK', data: result.rows });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboard, getLaporan, getExportDetail };
