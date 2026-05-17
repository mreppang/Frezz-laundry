const { Pool } = require('pg');

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT) || 5432,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }, // Wajib untuk Supabase
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// ─── Helper: query dengan placeholder $1,$2,... ─────────────────────────────
// Membungkus pool agar mirip seperti mysql2 (pool.execute / pool.query)
// mysql2  : db.execute('SELECT * WHERE id = ?', [id])
// pg      : db.execute('SELECT * WHERE id = $1', [id])
// Kita buat wrapper supaya semua controller tetap jalan dengan db.execute()

const db = {
    // query / execute → kedua‑duanya dipakai di controller, perilaku sama
    query: (text, params) => pool.query(text, params),
    execute: (text, params) => pool.query(text, params),

    // getConnection → dipakai di transaksi (BEGIN/COMMIT/ROLLBACK)
    getConnection: async () => {
        const client = await pool.connect();
        return {
            execute: (text, params) => client.query(text, params),
            query:   (text, params) => client.query(text, params),
            beginTransaction: () => client.query('BEGIN'),
            commit:           () => client.query('COMMIT'),
            rollback:         () => client.query('ROLLBACK'),
            release:          () => client.release(),
        };
    },
};

// ─── Cek koneksi saat startup ────────────────────────────────────────────────
const testConnection = async (attempt = 1) => {
    try {
        const client = await pool.connect();
        console.log('✅ Terhubung ke Supabase PostgreSQL!');
        client.release();
    } catch (err) {
        console.error(`❌ Gagal koneksi Supabase (percobaan ${attempt}): ${err.message}`);
        if (attempt < 5) {
            console.log('⏳ Coba ulang dalam 3 detik...');
            setTimeout(() => testConnection(attempt + 1), 3000);
        } else {
            console.error('❌ Tidak bisa terhubung ke Supabase setelah 5 percobaan.');
        }
    }
};

testConnection();

module.exports = db;
