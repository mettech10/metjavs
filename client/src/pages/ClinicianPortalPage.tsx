import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ClinicianPortalPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/sessions/clinician/patients').then((r: any) => setRows(r)).catch(() => setRows([])); }, []);
  return <div className="card"><h2 className="font-semibold text-lg">Clinician Portal</h2><p className="text-sm text-slate-500">Search/filter scaffolding by risk and date.</p><div className="overflow-auto"><table className="w-full text-sm mt-2"><thead><tr><th>Patient</th><th>Composite Risk</th><th>Latest Date</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{r.email}</td><td>{r.latestComposite?.classification ?? '-'}</td><td>{r.latestDate ? new Date(r.latestDate).toLocaleDateString() : '-'}</td></tr>)}</tbody></table></div></div>;
}
