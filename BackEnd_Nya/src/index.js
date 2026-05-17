const dotenv = require('dotenv');
// Load .env dari src/.env (lokal) atau dari env vars langsung (Render/production)
dotenv.config({ path: './src/.env' });
dotenv.config(); // fallback ke root .env jika ada

const express = require('express');
const cors = require('cors');

const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = Number(process.env.PORT) || 5000;

// ─────────────────────────────────────────────
// MIDDLEWARE GLOBAL
// ─────────────────────────────────────────────
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://frezz-laundry.vercel.app',  // production frontend
        /\.vercel\.app$/,                     // semua subdomain vercel
    ],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Frezz Laundry API berjalan ✓', version: '2.0.0' });
});

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
app.use('/', routes);

// ─────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.url} tidak ditemukan` });
});

// ─────────────────────────────────────────────
// ERROR HANDLER GLOBAL (harus di paling bawah)
// ─────────────────────────────────────────────
app.use(errorHandler);

app.listen(port, () => {
    console.log(`✅ Server Frezz Laundry berjalan di http://localhost:${port}`);
});
