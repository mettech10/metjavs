import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TestHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => { api.get('/sessions').then((r: any) => setSessions(r)); }, []);
  return <div className="card"><h2>Test History</h2><table><thead><tr><th>Type</th><th>Date</th><th>Class</th></tr></thead><tbody>{sessions.map((s) => <tr key={s.id}><td>{s.testType}</td><td>{new Date(s.timestamp).toLocaleString()}</td><td>{String(s.computedScores?.classification ?? '-')}</td></tr>)}</tbody></table></div>;
}
