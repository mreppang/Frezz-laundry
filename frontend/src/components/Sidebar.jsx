import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ListOrdered, PlusCircle, Users,
  Shirt, BarChart2, LogOut, History, UserCog, Settings
} from 'lucide-react';
import logoImg from '../assets/Logo_Brand.png';
import './Sidebar.css';

const kasirMenu = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/transaksi', icon: <ListOrdered size={18} />, label: 'Daftar Transaksi' },
  { to: '/transaksi/baru', icon: <PlusCircle size={18} />, label: 'Buat Transaksi' },
  { to: '/pelanggan', icon: <Users size={18} />, label: 'Pelanggan' },
  { to: '/riwayat', icon: <History size={18} />, label: 'Riwayat' },
  { to: '/jenis-pakaian', icon: <Shirt size={18} />, label: 'Jenis Pakaian' },
];

const ownerMenu = [
  { to: '/dashboard-owner', icon: <LayoutDashboard size={18} />, label: 'Dashboard Owner' },
  { to: '/transaksi', icon: <ListOrdered size={18} />, label: 'Daftar Transaksi' },
  { to: '/transaksi/baru', icon: <PlusCircle size={18} />, label: 'Buat Transaksi' },
  { to: '/pelanggan', icon: <Users size={18} />, label: 'Pelanggan' },
  { to: '/riwayat', icon: <History size={18} />, label: 'Riwayat' },
  { to: '/jenis-pakaian', icon: <Shirt size={18} />, label: 'Jenis Pakaian' },
  { to: '/pengguna', icon: <UserCog size={18} />, label: 'Kelola Kasir' },
  { to: '/laporan', icon: <BarChart2 size={18} />, label: 'Laporan' },
  { to: '/pengaturan', icon: <Settings size={18} />, label: 'Pengaturan' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menu = user?.role === 'owner' ? ownerMenu : kasirMenu;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img
          src={logoImg}
          alt="Frezz Laundry Logo"
          style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain', background: '#f0f6ff', padding: 2, flexShrink: 0 }}
        />
        <div>
          <div className="sidebar-brand-name">Frezz Laundry</div>
          <div className="sidebar-brand-role">{user?.role === 'owner' ? 'Owner' : 'Kasir'}</div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{(user?.username || 'U')[0].toUpperCase()}</div>
        <span className="sidebar-user-name">{user?.username || user?.name}</span>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to !== '/transaksi'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={16} />
        <span>Keluar</span>
      </button>
    </aside>
  );
}
