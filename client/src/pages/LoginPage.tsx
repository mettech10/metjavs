import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('demo4@example.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data: any = await api.post('/auth/login', { email, password });
      login(data.token, data.role);
      nav('/');
    } catch {
      setError('Login failed');
    }
  };

  return <div className="min-h-screen grid place-items-center p-4"><form onSubmit={onSubmit} className="card w-full max-w-md space-y-3"><h2 className="text-2xl font-semibold">Sign in</h2><p className="text-sm text-slate-500">Screening only; not a medical diagnosis.</p><input className="w-full border rounded-lg p-3" value={email} onChange={(e) => setEmail(e.target.value)} /><input className="w-full border rounded-lg p-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><button className="w-full rounded-lg p-3 bg-emerald-600 text-white">Login</button>{error && <p className="text-red-600 text-sm">{error}</p>}<Link to="/register" className="text-sm text-emerald-700">Create account</Link></form></div>;
}
