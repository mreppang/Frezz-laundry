/**
 * reset_password.js
 * Reset password semua akun di database
 * Jalankan: node reset_password.js
 */
require('dotenv').config({ path: './src/.env' });
const db = require('./src/config/database');
const bcrypt = require('bcrypt');

(async () => {
  try {
    // Cek users yang ada
    const [users] = await db.execute('SELECT id, username, role FROM users');
    console.log('\n📋 Akun yang ditemukan di database:');
    users.forEach(u => console.log(`  - id:${u.id} | username: ${u.username} | role: ${u.role}`));

    if (users.length === 0) {
      console.log('\n⚠️  Tidak ada akun! Buat akun baru dulu dengan database_v2.sql');
      process.exit(1);
    }

    // Buat hash untuk setiap akun
    console.log('\n🔒 Reset password...');

    // Owner → password: owner123
    const ownerHash = await bcrypt.hash('owner123', 10);
    const [ownerRes] = await db.execute(
      "UPDATE users SET password=? WHERE role='owner'",
      [ownerHash]
    );
    console.log(`  ✅ Owner password → "owner123" (${ownerRes.affectedRows} row updated)`);

    // Kasir → password: kasir123
    const kasirHash = await bcrypt.hash('kasir123', 10);
    const [kasirRes] = await db.execute(
      "UPDATE users SET password=? WHERE role='kasir'",
      [kasirHash]
    );
    console.log(`  ✅ Kasir password → "kasir123" (${kasirRes.affectedRows} row updated)`);

    // Verifikasi
    console.log('\n🔍 Verifikasi...');
    const [updated] = await db.execute('SELECT username, role, password FROM users');
    for (const u of updated) {
      const pwd = u.role === 'owner' ? 'owner123' : 'kasir123';
      const ok = await bcrypt.compare(pwd, u.password);
      console.log(`  ${ok ? '✅' : '❌'} ${u.username} (${u.role}) → "${pwd}"`);
    }

    console.log('\n🎉 Selesai! Login dengan:');
    console.log('  👑 Owner  → username: owner  | password: owner123');
    console.log('  🖨️  Kasir  → username: kasir  | password: kasir123');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
})();
