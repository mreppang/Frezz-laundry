/**
 * SCRIPT RESET PASSWORD USERS
 * Jalankan: node reset_password.js
 * 
 * Script ini akan mengupdate password:
 *   - owner  → owner123
 *   - kasir  → owner123
 */

require('dotenv').config({ path: './src/.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
});

async function resetPasswords() {
    const client = await pool.connect();
    try {
        console.log('✅ Terhubung ke Supabase...');

        const SALT_ROUNDS = 10;
        const newPassword = 'owner123';
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        console.log(`🔐 Hash baru dibuat untuk password: "${newPassword}"`);

        // Update owner
        const resOwner = await client.query(
            'UPDATE users SET password = $1 WHERE username = $2 RETURNING username, role',
            [hashedPassword, 'owner']
        );

        // Update kasir
        const resKasir = await client.query(
            'UPDATE users SET password = $1 WHERE username = $2 RETURNING username, role',
            [hashedPassword, 'kasir']
        );

        if (resOwner.rowCount === 0) {
            console.warn('⚠️  User "owner" tidak ditemukan di database!');
        } else {
            console.log(`✅ Password "owner" berhasil direset → owner123`);
        }

        if (resKasir.rowCount === 0) {
            console.warn('⚠️  User "kasir" tidak ditemukan di database!');
        } else {
            console.log(`✅ Password "kasir" berhasil direset → owner123`);
        }

        // Tampilkan semua user setelah reset
        const allUsers = await client.query('SELECT id, username, role, created_at FROM users');
        console.log('\n📋 Daftar semua user di database:');
        console.table(allUsers.rows);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        client.release();
        await pool.end();
        console.log('\n🔌 Koneksi ditutup.');
    }
}

resetPasswords();
