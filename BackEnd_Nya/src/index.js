const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: './src/.env' });

const router = require('./router/router');

const app = express();
const port = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE GLOBAL
// =====================================================
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// ROUTES
// =====================================================
app.get('/', (req, res) => {
    res.json({ message: 'Frezz Laundry API berjalan ✓', version: '1.0.0' });
});

app.use('/', router);

// =====================================================
// ERROR HANDLER GLOBAL
// =====================================================
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({
        message: err.message || 'Terjadi kesalahan pada server',
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.url} tidak ditemukan` });
});

app.listen(port, () => {
    console.log(`✅ Server Frezz Laundry berjalan di http://localhost:${port}`);
});
