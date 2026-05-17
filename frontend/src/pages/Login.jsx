import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import logoImg from '../assets/Logo_Brand.png';
import './Login.css';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.username, form.password);
      toast.success(`Selamat datang, ${user.name || user.username}!`);
      navigate(user.role === 'owner' ? '/dashboard-owner' : '/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Username atau password salah';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="login-bg">
      {/* Decorative blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-card">
        <div className="login-card-left">
          <div className="login-brand-icon">
            <img src={logoImg} alt="Frezz Laundry" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          </div>
          <h1 className="login-brand-title">Frezz Laundry</h1>
          <p className="login-brand-tagline">Fresh • Clean • Express</p>
          <p className="login-brand-sub">
            Sistem manajemen laundry modern. Catat transaksi, pantau cucian, dan kelola bisnis Anda dengan mudah.
          </p>
          <div className="login-features">
            {['Manajemen Transaksi', 'Status Cucian Real-time', 'Notifikasi WhatsApp', 'Laporan Pendapatan'].map((f) => (
              <div key={f} className="login-feature-item">
                <span className="login-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="login-card-right">
          <div className="login-form-header">
            <h2 className="login-form-title">Masuk ke Sistem</h2>
            <p className="login-form-sub">Masukkan kredensial akun Anda</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Masukkan username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button
              id="btn-login"
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Memproses...
                </span>
              ) : (
                <>
                  <LogIn size={16} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="login-footer-text">
            <img src={logoImg} alt="" style={{ width: 20, height: 20, objectFit: 'contain', opacity: 0.5, verticalAlign: 'middle', marginRight: 6 }} />
            Frezz Laundry &copy; {new Date().getFullYear()} — v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
