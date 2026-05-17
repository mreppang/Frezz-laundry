const db = require('../config/database');

// Helper: generate kode_order unik (FRZ-001)
const generateKode = async (conn) => {
    // Pakai conn jika dalam transaksi, db jika tidak
    const client = conn || db;
    const result = await client.execute('SELECT COUNT(*) AS total FROM transaksi');
    const n = Number(result.rows[0].total) + 1;
    return `FRZ-${String(n).padStart(3, '0')}`;
};

// Helper: ambil pengaturan harga dari tabel pengaturan
const getHargaPengaturan = async (conn) => {
    const client = conn || db;
    const result = await client.execute('SELECT * FROM pengaturan LIMIT 1');
    return result.rows[0] || { harga_per_kg: 10000, express_tambahan: 10000 };
};

// GET /api/transaksi — daftar transaksi (support filter status & search nama)
const getDataTransaksi = async (req, res, next) => {
    try {
        const { status, q } = req.query;
        const params = [];
        let paramIdx = 1;

        let query = `
            SELECT t.*, p.nama AS pelanggan_nama, p.no_hp AS pelanggan_hp,
                   u.username AS kasir_nama
            FROM transaksi t
            LEFT JOIN pelanggan p ON t.pelanggan_id = p.id
            LEFT JOIN users u ON t.created_by = u.id
            WHERE 1=1
        `;

        if (status) {
            query += ` AND t.status = $${paramIdx++}`;
            params.push(status);
        } else {
            // Default: hanya tampilkan transaksi aktif (belum_selesai & siap_diambil)
            query += ` AND t.status != $${paramIdx++}`;
            params.push('selesai');
        }
        if (q) {
            query += ` AND p.nama ILIKE $${paramIdx++}`;
            params.push(`%${q}%`);
        }
        query += ' ORDER BY t.created_at DESC';

        const result = await db.execute(query, params);
        return res.status(200).json({ message: 'OK', data: result.rows });
    } catch (error) {
        next(error);
    }
};

// GET /api/transaksi/:id — detail transaksi + items
const getDataByidTransaksi = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.execute(
            `SELECT t.*, p.nama AS pelanggan_nama, p.no_hp AS pelanggan_hp,
                    u.username AS kasir_nama
             FROM transaksi t
             LEFT JOIN pelanggan p ON t.pelanggan_id = p.id
             LEFT JOIN users u ON t.created_by = u.id
             WHERE t.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }

        const itemsResult = await db.execute(
            `SELECT td.*, jp.nama_jenis
             FROM transaksi_detail td
             LEFT JOIN jenis_pakaian jp ON td.jenis_id = jp.id
             WHERE td.transaksi_id = $1`,
            [id]
        );

        return res.status(200).json({ message: 'OK', data: { ...result.rows[0], items: itemsResult.rows } });
    } catch (error) {
        next(error);
    }
};

// POST /api/transaksi — buat transaksi baru
const postDataTransaksi = async (req, res, next) => {
    const conn = await db.getConnection();
    try {
        const { pelanggan_id, layanan, paket, berat_kg, items, tanggal_masuk } = req.body;

        if (!pelanggan_id || !layanan || !paket) {
            return res.status(400).json({ message: 'pelanggan_id, layanan, dan paket wajib diisi' });
        }
        if (layanan === 'kiloan' && !berat_kg) {
            return res.status(400).json({ message: 'berat_kg wajib diisi untuk layanan kiloan' });
        }
        if (layanan === 'satuan' && (!items || items.length === 0)) {
            return res.status(400).json({ message: 'Minimal 1 item untuk layanan satuan' });
        }

        await conn.beginTransaction();

        const cfg = await getHargaPengaturan(conn);
        const kode_order = await generateKode(conn);
        const kasir_id = req.user?.id || null;
        const tgl = tanggal_masuk || new Date();

        let total_harga = 0;

        // Hitung harga untuk kiloan
        if (layanan === 'kiloan') {
            const hargaKg = Number(cfg.harga_per_kg);
            const tambahan = paket === 'express' ? Number(cfg.express_tambahan) : 0;
            total_harga = Number(berat_kg) * (hargaKg + tambahan);
        }

        // Insert header transaksi — RETURNING id untuk dapat ID baru
        const insertResult = await conn.execute(
            `INSERT INTO transaksi (kode_order, pelanggan_id, layanan, paket, berat_kg, total_harga, status, tanggal_masuk, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, 'belum_selesai', $7, $8) RETURNING id`,
            [kode_order, pelanggan_id, layanan, paket, berat_kg || null, total_harga, tgl, kasir_id]
        );
        const transaksi_id = insertResult.rows[0].id;

        // Insert detail items untuk satuan
        if (layanan === 'satuan' && items) {
            for (const item of items) {
                const hargaItem = Number(item.harga || 0);
                const subtotal = hargaItem * Number(item.qty || 1);
                total_harga += subtotal;
                await conn.execute(
                    'INSERT INTO transaksi_detail (transaksi_id, jenis_id, qty, harga, subtotal) VALUES ($1,$2,$3,$4,$5)',
                    [transaksi_id, item.jenis_id, item.qty, hargaItem, subtotal]
                );
            }
            // Express untuk satuan = tambahan flat (bukan per item)
            if (paket === 'express') {
                total_harga += Number(cfg.express_tambahan);
            }
            // Update total_harga setelah semua item dihitung
            await conn.execute('UPDATE transaksi SET total_harga=$1 WHERE id=$2', [total_harga, transaksi_id]);
        }

        await conn.commit();
        return res.status(201).json({
            message: 'Transaksi berhasil dibuat',
            data: { id: transaksi_id, kode_order, total_harga },
        });
    } catch (error) {
        await conn.rollback();
        next(error);
    } finally {
        conn.release();
    }
};

// PATCH /api/transaksi/:id/status — update status transaksi
const patchStatusTransaksi = async (req, res, next) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatus = ['belum_selesai', 'siap_diambil', 'selesai'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({
                message: `Status tidak valid. Pilih: ${validStatus.join(', ')}`,
            });
        }

        await conn.beginTransaction();

        const tanggal_selesai = status === 'selesai' ? new Date() : null;
        await conn.execute(
            'UPDATE transaksi SET status=$1, tanggal_selesai=$2 WHERE id=$3',
            [status, tanggal_selesai, id]
        );

        // Jika selesai → auto insert ke tabel riwayat
        // PostgreSQL: INSERT ... ON CONFLICT DO NOTHING menggantikan INSERT IGNORE
        if (status === 'selesai') {
            await conn.execute(
                'INSERT INTO riwayat (transaksi_id, selesai_at) VALUES ($1, $2) ON CONFLICT (transaksi_id) DO NOTHING',
                [id, new Date()]
            );
        }

        await conn.commit();
        return res.status(200).json({ message: `Status diperbarui menjadi "${status}"` });
    } catch (error) {
        await conn.rollback();
        next(error);
    } finally {
        conn.release();
    }
};

module.exports = {
    getDataTransaksi,
    getDataByidTransaksi,
    postDataTransaksi,
    patchStatusTransaksi,
};
