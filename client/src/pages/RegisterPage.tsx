import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', consentAccepted: false });
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      nav('/login');
    } catch {
      setError('Registration failed');
    }
  };
  return <div className="min-h-screen grid place-items-center p-4"><form onSubmit={submit} className="card w-full max-w-md space-y-2"><h2 className="text-xl font-semibold">Informed Consent & Registration</h2><input className="border rounded p-2" placeholder="First name" onChange={(e) => setForm({ ...form, firstName: e.target.value })} /><input className="border rounded p-2" placeholder="Last name" onChange={(e) => setForm({ ...form, lastName: e.target.value })} /><input className="border rounded p-2" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} /><input className="border rounded p-2" type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} /><label className="text-sm flex gap-2"><input type="checkbox" checked={form.consentAccepted} onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })} />I consent to screening and HIPAA-aware data handling.</label><button className="bg-emerald-700 text-white p-2 rounded">Register</button>{error && <p className="text-red-500 text-sm">{error}</p>}</form></div>;
}
