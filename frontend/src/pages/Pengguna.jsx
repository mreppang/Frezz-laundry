import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import '../styles/shared.css';

const emptyForm = { username: '', password: '', role: 'kasir' };

export default function Pengguna() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState({ open: false, form: emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try { const r = await api.get('/api/pengguna'); setData(r.data?.data || []); }
    catch { toast.error('Gagal memuat data'); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!modal.form.username) { toast.error('Username wajib diisi'); return; }
    if (!modal.form.id && !modal.form.password) { toast.error('Password wajib diisi untuk akun baru'); return; }
    setSaving(true);
    try {
      if (modal.form.id) {
        await api.put(`/api/pengguna/${modal.form.id}`, modal.form);
      } else {
        await api.post('/api/pengguna', modal.form);
      }
      toast.success('Disimpan');
      setModal({ open: false, form: emptyForm });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Hapus akun "${username}"?`)) return;
    try { await api.delete(`/api/pengguna/${id}`); toast.success('Dihapus'); fetchData(); }
    catch (e) { toast.error(e.response?.data?.message || 'Gagal'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Kelola Kasir</h1>
          <p className="page-subtitle">Manajemen akun pengguna sistem</p>
        </div>
        <button className="btn btn-blue" onClick={() => setModal({ open: true, form: emptyForm })}>
          <Plus size={15} /> Tambah Kasir
        </button>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          {data.length === 0 ? <div className="empty-state"><p>Belum ada kasir.</p></div> : (
            <table>
              <thead><tr><th>Username</th><th>Role</th><th>Terdaftar</th><th>Aksi</th></tr></thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 500 }}>{row.username}</td>
                    <td>
                      <span className={`badge ${row.role === 'owner' ? 'badge-indigo' : 'badge-amber'}`}>
                        {row.role}
                      </span>
                    </td>
                    <td>{new Date(row.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, form: { id: row.id, username: row.username, password: '', role: row.role } })}><Pencil size={13} /></button>
                      {row.role !== 'owner' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id, row.username)}><Trash2 size={13} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false, form: emptyForm })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal.form.id ? 'Edit' : 'Tambah'} Kasir</h3>
              <button className="modal-close" onClick={() => setModal({ open: false, form: emptyForm })}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input type="text" className="form-input" value={modal.form.username}
                    onChange={e => setModal({ ...modal, form: { ...modal.form, username: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password {modal.form.id && '(kosongkan jika tidak diubah)'}</label>
                  <input type="password" className="form-input" value={modal.form.password}
                    onChange={e => setModal({ ...modal, form: { ...modal.form, password: e.target.value } })}
                    placeholder={modal.form.id ? '••••••••' : 'Password baru'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={modal.form.role}
                    onChange={e => setModal({ ...modal, form: { ...modal.form, role: e.target.value } })}>
                    <option value="kasir">Kasir</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal({ open: false, form: emptyForm })}>Batal</button>
              <button className="btn btn-blue" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
