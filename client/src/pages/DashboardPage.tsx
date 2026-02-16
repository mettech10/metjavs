import { Link } from 'react-router-dom';

const modules = [
  { title: 'Cognitive Tests', desc: 'Existing module placeholder', to: '/history' },
  { title: 'TCM Diagnostics', desc: 'Existing module placeholder', to: '/history' },
  { title: 'Sensory Screening', desc: 'Visual, Hearing, Olfactory', to: '/sensory' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <p className="text-slate-600">Calming, accessible experience with large touch targets and clear instructions.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {modules.map((m) => (
          <Link key={m.title} to={m.to} className="card hover:border-emerald-300">
            <h3 className="font-semibold text-lg">{m.title}</h3>
            <p className="text-sm text-slate-500 mt-2">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
