const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../../utils/tokenBlacklist');

// Middleware: Verifikasi token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ditemukan. Silakan login.' });
    }

    const token = authHeader.split(' ')[1];

    if (isBlacklisted(authHeader)) {
        return res.status(401).json({ message: 'Token tidak valid (sudah logout).' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
    }
};

// Middleware: Hanya owner yang boleh akses
const ownerOnly = (req, res, next) => {
    if (req.user?.role !== 'owner') {
        return res.status(403).json({ message: 'Akses ditolak. Hanya untuk Owner.' });
    }
    next();
};

module.exports = { verifyToken, ownerOnly };
