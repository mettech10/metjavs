import { useMemo, useState } from 'react';
import api from '../services/api';
import { compositeRisk } from '../utils/scoring';

const odors = ['Coffee', 'Lemon', 'Mint', 'Vinegar', 'Peanut Butter', 'Cinnamon', 'Vanilla', 'Soap', 'Garlic', 'Banana', 'Orange', 'Chocolate'];

export default function SensoryTestsPage() {
  const [weights, setWeights] = useState({ cognitive: 0.45, olfactory: 0.2, auditory: 0.2, visual: 0.15 });
  const [scores, setScores] = useState({ cognitive: 78, olfactory: 75, auditory: 71, visual: 82 });
  const [homeMode] = useState(true);
  const risk = useMemo(() => compositeRisk(scores.cognitive, scores.olfactory, scores.auditory, scores.visual, weights), [scores, weights]);

  const saveDemo = async () => {
    await api.post('/sessions/dev/simulate');
    alert('Simulated sensory modules completed.');
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-semibold">Sensory Screening</h2>
        <p className="text-sm text-slate-600">Visual: logMAR staircase; Hearing: DIN SRT adaptive; Olfactory: forced-choice identification.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card"><h3 className="font-semibold">Visual Screening</h3><p className="text-sm">Credit-card calibration, per-eye testing, high-contrast Tumbling E, large directional buttons.</p></div>
        <div className="card"><h3 className="font-semibold">Hearing Screening</h3><p className="text-sm">Ambient noise gate (&lt;45 dBA), headphone lateralization check, volume calibration, DIN trials.</p><audio controls className="mt-2 w-full"><source src="/audio/digit-placeholder.wav" /></audio><p className="text-xs text-amber-700">TODO: Replace placeholder with calibrated clinical DIN assets.</p></div>
        <div className="card"><h3 className="font-semibold">Olfactory Screening</h3><p className="text-sm">{homeMode ? 'Home Items Mode' : 'Odor Card Mode'} with 30s interval timer and randomized 4-option choices.</p><p className="text-xs text-slate-500 mt-2">Items: {odors.slice(0, 8).join(', ')}...</p></div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Clinician-adjustable composite weighting</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {Object.keys(weights).map((k) => <label key={k} className="flex flex-col gap-1 capitalize">{k}<input type="number" step="0.01" value={(weights as any)[k]} onChange={(e) => setWeights((w) => ({ ...w, [k]: Number(e.target.value) }))} className="border rounded p-2" /></label>)}
        </div>
        <p className="mt-3 text-lg">Composite Risk: <span className="font-semibold">{risk.score}</span> ({risk.classification})</p>
        <button onClick={saveDemo} className="mt-3 bg-emerald-700 text-white rounded-lg px-4 py-2">Run /dev/simulate and save session</button>
      </div>
    </div>
  );
}
