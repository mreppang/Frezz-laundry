const jwt = require('jsonwebtoken')
const { isBlacklisted } = require('../utils/tokenBlacklist')

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Tidak ada akses',
        })
    }

    // Strip "Bearer " prefix jika ada
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (isBlacklisted(token)) {
        return res.status(401).json({
            message: `Token Sudah Logout`
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: `Token Tidak valid`
        })
    }
}

module.exports = auth;
