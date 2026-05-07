import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Save, Settings } from 'lucide-react';
import '../styles/shared.css';

export default function Pengaturan() {
  const [form, setForm] = useState({ harga_per_kg: '', express_tambahan: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/pengaturan')
      .then(r => {
        const d = r.data?.data;
        if (d) setForm({ harga_per_kg: d.harga_per_kg, express_tambahan: d.express_tambahan });
      })
      .catch(() => toast.error('Gagal memuat pengaturan'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.harga_per_kg || !form.express_tambahan) {
      toast.error('Semua field wajib diisi');
      return;
    }
    setSaving(true);
    try {
      await api.put('/api/pengaturan', {
        harga_per_kg: Number(form.harga_per_kg),
        express_tambahan: Number(form.express_tambahan),
      });
      toast.success('Pengaturan berhasil disimpan');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: '#eff4ff', color: '#00459a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Settings size={20} />
        </div>
        <div>
          <h1 className="page-title">Pengaturan Harga</h1>
          <p className="page-subtitle">Atur tarif dasar laundry kiloan dan biaya express</p>
        </div>
      </div>

      <div className="table-card" style={{ maxWidth: 520 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e6eeff' }}>
          <h2 style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, margin: 0, color: '#0d1c2e' }}>
            Tarif Layanan
          </h2>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loading ? (
            <div className="loading-state"><p>Memuat...</p></div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Harga per KG (Rp)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={form.harga_per_kg}
                  onChange={e => setForm({ ...form, harga_per_kg: e.target.value })}
                  placeholder="10000"
                />
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  Tarif dasar untuk layanan kiloan normal
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Biaya Tambahan Express (Rp)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={form.express_tambahan}
                  onChange={e => setForm({ ...form, express_tambahan: e.target.value })}
                  placeholder="10000"
                />
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  Untuk kiloan: ditambahkan per kg. Untuk satuan: flat ke total.
                </span>
              </div>

              {/* Preview harga */}
              {form.harga_per_kg && form.express_tambahan && (
                <div style={{ background: '#eff4ff', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#00459a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Preview Perhitungan
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#424753' }}>Kiloan Normal (per kg)</span>
                    <span style={{ fontWeight: 600, color: '#0d1c2e' }}>
                      Rp {Number(form.harga_per_kg).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#424753' }}>Kiloan Express (per kg)</span>
                    <span style={{ fontWeight: 600, color: '#d97706' }}>
                      Rp {(Number(form.harga_per_kg) + Number(form.express_tambahan)).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#424753' }}>Satuan Express (flat tambahan)</span>
                    <span style={{ fontWeight: 600, color: '#d97706' }}>
                      +Rp {Number(form.express_tambahan).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-blue"
                onClick={handleSave}
                disabled={saving}
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
              >
                {saving ? <><span className="spinner" /> Menyimpan...</> : <><Save size={15} /> Simpan Pengaturan</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
