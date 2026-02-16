import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [['/', 'Dashboard'], ['/history', 'Test History'], ['/reports', 'Reports'], ['/settings', 'Settings'], ['/clinician', 'Clinician Portal']];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  return <div style={{ minHeight: '100vh', background: '#f8fafc' }}><header style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}><div style={{ maxWidth: 1000, margin: '0 auto', padding: 12, display: 'flex', justifyContent: 'space-between' }}><h1>Neuro-Sensory Cognitive Risk</h1><button onClick={logout}>Logout</button></div></header><nav style={{ maxWidth: 1000, margin: '0 auto', padding: 8, display: 'flex', gap: 8, overflow: 'auto' }}>{links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav><main style={{ maxWidth: 1000, margin: '0 auto', padding: 12 }}>{children}</main></div>;
}
