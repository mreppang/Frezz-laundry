import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import '../styles/shared.css';

const emptyForm = { nama: '', no_hp: '' };

export default function Pelanggan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState({ open: false, form: emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const r = await api.get('/api/pelanggan', { params: search ? { q: search } : {} });
      setData(r.data?.data || []);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => setModal({ open: true, form: emptyForm });
  const openEdit = (row) => setModal({ open: true, form: { id: row.id, nama: row.nama, no_hp: row.no_hp } });
  const closeModal = () => setModal({ open: false, form: emptyForm });

  const handleSave = async () => {
    if (!modal.form.nama || !modal.form.no_hp) { toast.error('Nama dan No HP wajib diisi'); return; }
    setSaving(true);
    try {
      if (modal.form.id) {
        await api.put(`/api/pelanggan/${modal.form.id}`, modal.form);
      } else {
        await api.post('/api/pelanggan', modal.form);
      }
      toast.success('Data pelanggan disimpan');
      closeModal();
      fetchData(q);
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus pelanggan "${nama}"?`)) return;
    try {
      await api.delete(`/api/pelanggan/${id}`);
      toast.success('Pelanggan dihapus');
      fetchData(q);
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal menghapus'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Manajemen Pelanggan</h1>
          <p className="page-subtitle">Kelola data pelanggan laundry</p>
        </div>
        <button className="btn btn-blue" onClick={openAdd}><Plus size={15} /> Tambah Pelanggan</button>
      </div>

      {/* Search */}
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div className="filter-group" style={{ flex: 1 }}>
          <input className="filter-input" placeholder="Cari nama atau no. HP..." value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData(q)} />
        </div>
        <button className="btn btn-outline" onClick={() => fetchData(q)}>
          <Search size={14} /> Cari
        </button>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          {loading ? <div className="loading-state"><p>Memuat...</p></div>
          : data.length === 0 ? <div className="empty-state"><p>Tidak ada pelanggan ditemukan.</p></div>
          : (
            <table>
              <thead><tr><th>#</th><th>Nama</th><th>No. HP</th><th>Terdaftar</th><th>Aksi</th></tr></thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{row.nama}</td>
                    <td>{row.no_hp}</td>
                    <td>{new Date(row.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}><Pencil size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id, row.nama)}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal.form.id ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Nama *</label>
                  <input type="text" className="form-input" value={modal.form.nama}
                    onChange={e => setModal({ ...modal, form: { ...modal.form, nama: e.target.value } })}
                    placeholder="Nama lengkap pelanggan" />
                </div>
                <div className="form-group">
                  <label className="form-label">No. HP *</label>
                  <input type="tel" className="form-input" value={modal.form.no_hp}
                    onChange={e => setModal({ ...modal, form: { ...modal.form, no_hp: e.target.value } })}
                    placeholder="08xx-xxxx-xxxx" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Batal</button>
              <button className="btn btn-blue" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
