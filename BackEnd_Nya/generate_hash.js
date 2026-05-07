/**
 * generate_hash.js
 * Jalankan: node generate_hash.js
 * Menghasilkan hash bcrypt untuk password yang bisa langsung dipakai di SQL
 */
const bcrypt = require('bcrypt');

const passwords = [
  { label: 'owner', plain: 'owner123' },
  { label: 'kasir', plain: 'kasir123' },
  { label: 'password (universal)', plain: 'password' },
];

(async () => {
  for (const p of passwords) {
    const hash = await bcrypt.hash(p.plain, 10);
    console.log(`\n[${p.label}]`);
    console.log(`  Plain   : ${p.plain}`);
    console.log(`  Hash    : ${hash}`);
    // Verify
    const ok = await bcrypt.compare(p.plain, hash);
    console.log(`  Verify  : ${ok ? '✅ OK' : '❌ FAIL'}`);
  }

  // Cek hash yang sudah ada di database
  console.log('\n--- Cek hash lama ---');
  const existingHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  for (const try_pwd of ['password', 'admin123', 'kasir123', 'owner123']) {
    const match = await bcrypt.compare(try_pwd, existingHash);
    console.log(`  "${try_pwd}" vs hash lama → ${match ? '✅ COCOK' : '❌ tidak cocok'}`);
  }
})();
