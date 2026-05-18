import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Download } from 'lucide-react';
import '../styles/shared.css';

export default function Laporan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dari: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    sampai: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/laporan/pendapatan', { params: filters });
      setData(r.data?.data || []);
    } catch { toast.error('Gagal memuat laporan'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const totalPendapatan = data.reduce((a, r) => a + Number(r.total_pendapatan || 0), 0);
  const totalTrx = data.reduce((a, r) => a + Number(r.jumlah_transaksi || 0), 0);

  const exportCSV = async () => {
    if (data.length === 0) return;
    try {
      toast.loading('Menyiapkan export...', { id: 'export' });

      // Fetch detail per-transaksi
      const r = await api.get('/api/laporan/export', { params: filters });
      const detail = r.data?.data || [];

      const fmtRp = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;
      const fmtTgl = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
      const fmtTglPanjang = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';
      const q = (v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`;

      const lines = [];

      // ═══════════════════ HEADER SECTION ═══════════════════
      lines.push([q('═══════════════════════════════════════════════════════════════')].join(','));
      lines.push([q('FREZZ LAUNDRY')].join(','));
      lines.push([q('LAPORAN PENDAPATAN')].join(','));
      lines.push([q('═══════════════════════════════════════════════════════════════')].join(','));
      lines.push('');

      // ─── Info Laporan ───
      lines.push([q('Periode'), '', q(`${fmtTglPanjang(filters.dari)}  s/d  ${fmtTglPanjang(filters.sampai)}`)].join(','));
      lines.push([q('Tanggal Cetak'), '', q(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }))].join(','));
      lines.push([q('Total Hari'), '', q(`${data.length} hari`)].join(','));
      lines.push('');

      // ═══════════════════ RINGKASAN ═══════════════════
      lines.push([q('───────────────── RINGKASAN ─────────────────')].join(','));
      lines.push([q('Total Transaksi Selesai'), '', q(`${totalTrx} transaksi`)].join(','));
      lines.push([q('Total Pendapatan'), '', q(fmtRp(totalPendapatan))].join(','));
      lines.push([q('Rata-rata Pendapatan / Hari'), '', q(data.length > 0 ? fmtRp(Math.round(totalPendapatan / data.length)) : 'Rp 0')].join(','));
      lines.push([q('Rata-rata Pendapatan / Transaksi'), '', q(totalTrx > 0 ? fmtRp(Math.round(totalPendapatan / totalTrx)) : 'Rp 0')].join(','));
      lines.push('');

      // ═══════════════════ TABEL RINGKASAN PER HARI ═══════════════════
      lines.push([q('───────────────── RINGKASAN PER HARI ─────────────────')].join(','));
      lines.push([q('No'), q('Tanggal'), q('Jumlah Transaksi'), q('Total Pendapatan')].join(','));
      data.forEach((row, i) => {
        lines.push([
          q(i + 1),
          q(fmtTglPanjang(row.tanggal)),
          q(row.jumlah_transaksi),
          q(fmtRp(row.total_pendapatan)),
        ].join(','));
      });
      lines.push([q(''), q('TOTAL'), q(totalTrx), q(fmtRp(totalPendapatan))].join(','));
      lines.push('');

      // ═══════════════════ DETAIL TRANSAKSI ═══════════════════
      if (detail.length > 0) {
        lines.push([q('───────────────── DETAIL TRANSAKSI ─────────────────')].join(','));
        lines.push([
          q('No'), q('Kode Order'), q('Pelanggan'), q('No. HP'),
          q('Layanan'), q('Paket'), q('Berat (kg)'),
          q('Total Harga'), q('Kasir'),
          q('Tgl Masuk'), q('Tgl Selesai'),
        ].join(','));

        // Group detail by date for subtotals
        const grouped = {};
        detail.forEach(row => {
          const dateKey = new Date(row.selesai_at).toISOString().split('T')[0];
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(row);
        });

        let no = 1;
        const dateKeys = Object.keys(grouped).sort();
        dateKeys.forEach((dateKey, di) => {
          const rows = grouped[dateKey];
          // Date separator
          lines.push('');
          lines.push([q(`📅 ${fmtTglPanjang(dateKey)}`), '', '', '', '', '', '', '', '', '', ''].join(','));

          let dayTotal = 0;
          rows.forEach(row => {
            const harga = Number(row.total_harga);
            dayTotal += harga;
            lines.push([
              q(no++),
              q(row.kode_order),
              q(row.pelanggan_nama || '-'),
              q(row.pelanggan_hp || '-'),
              q(row.layanan === 'kiloan' ? 'Kiloan' : 'Satuan'),
              q(row.paket === 'express' ? 'Express' : 'Normal'),
              q(row.berat_kg || '-'),
              q(fmtRp(harga)),
              q(row.kasir_nama || '-'),
              q(fmtTgl(row.tanggal_masuk)),
              q(fmtTgl(row.selesai_at)),
            ].join(','));
          });

          // Daily subtotal
          lines.push([q(''), q(''), q(''), q(''), q(''), q(''), q(`Subtotal (${rows.length} trx)`), q(fmtRp(dayTotal)), '', '', ''].join(','));
        });

        lines.push('');
        lines.push([q(''), q(''), q(''), q(''), q(''), q(''), q(`GRAND TOTAL (${detail.length} trx)`), q(fmtRp(totalPendapatan)), '', '', ''].join(','));
      }

      lines.push('');
      lines.push([q('═══════════════════════════════════════════════════════════════')].join(','));
      lines.push([q('Laporan ini digenerate otomatis oleh sistem Frezz Laundry')].join(','));
      lines.push([q('═══════════════════════════════════════════════════════════════')].join(','));

      const BOM = '\uFEFF';
      const csvContent = lines.join('\n');
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Pendapatan_${filters.dari}_sd_${filters.sampai}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Laporan berhasil di-export!', { id: 'export' });
    } catch (err) {
      toast.error('Gagal export laporan', { id: 'export' });
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Laporan Pendapatan</h1>
          <p className="page-subtitle">Ringkasan pendapatan dari transaksi selesai</p>
        </div>
        <button className="btn btn-outline" onClick={exportCSV} disabled={data.length === 0}><Download size={15} /> Export</button>
      </div>

      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div className="filter-group">
          <label className="filter-label">Dari Tanggal</label>
          <input type="date" className="filter-input" value={filters.dari}
            onChange={e => setFilters({ ...filters, dari: e.target.value })} />
        </div>
        <div className="filter-group">
          <label className="filter-label">Sampai Tanggal</label>
          <input type="date" className="filter-input" value={filters.sampai}
            onChange={e => setFilters({ ...filters, sampai: e.target.value })} />
        </div>
        <button className="btn btn-blue" onClick={fetchData} disabled={loading}>
          <Search size={14} /> Tampilkan
        </button>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          {loading ? <div className="loading-state"><p>Memuat...</p></div>
          : data.length === 0 ? <div className="empty-state"><p>Tidak ada data pada rentang tanggal ini.</p></div>
          : (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th style={{ textAlign: 'right' }}>Jumlah Transaksi</th>
                  <th style={{ textAlign: 'right' }}>Total Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td>{new Date(row.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td style={{ textAlign: 'right' }}>{row.jumlah_transaksi}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#00459a' }}>
                      Rp {Number(row.total_pendapatan).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#eff4ff' }}>
                  <td style={{ fontWeight: 700, padding: 16 }}>Total</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, padding: 16 }}>{totalTrx}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, color: '#00459a', padding: 16 }}>
                    Rp {totalPendapatan.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
