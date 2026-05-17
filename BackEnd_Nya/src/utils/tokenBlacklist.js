// Simpan token yang sudah di-logout (dalam memori)
// Catatan: akan reset saat server restart. Untuk produksi, gunakan Redis.
const blacklist = new Set();

const addToBlacklist = (token) => {
    blacklist.add(token);
};

const isBlacklisted = (token) => {
    return blacklist.has(token);
};

module.exports = { addToBlacklist, isBlacklisted };
