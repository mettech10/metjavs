import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

function SensoryTestsPage() {
  const { token } = useAuth();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [score, setScore] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    apiRequest('/sensory/modules', {}, token)
      .then((data) => {
        setModules(data);
        if (data[0]) {
          setSelectedModule(data[0].id);
        }
      })
      .catch((error) => setStatus(error.message));
  }, [token]);

  const submitTest = async (event) => {
    event.preventDefault();
    setStatus('Submitting...');

    try {
      await apiRequest(
        '/sensory/results',
        {
          method: 'POST',
          body: JSON.stringify({
            moduleType: selectedModule,
            score: Number(score),
            metadata: { source: 'manual-input-simulator' }
          })
        },
        token
      );
      setScore('');
      setStatus('Test result recorded successfully.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section>
      <h2>Sensory Test Modules</h2>
      <div className="stats-grid">
        {modules.map((module) => (
          <article key={module.id} className="stat-card">
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <small>{module.scoringHint}</small>
          </article>
        ))}
      </div>

      <h3>Record Test Result</h3>
      <form className="test-form" onSubmit={submitTest}>
        <label htmlFor="module">Select module</label>
        <select
          id="module"
          value={selectedModule}
          onChange={(event) => setSelectedModule(event.target.value)}
        >
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>

        <label htmlFor="score">Score</label>
        <input
          id="score"
          type="number"
          value={score}
          onChange={(event) => setScore(event.target.value)}
          required
        />

        <button type="submit">Save Result</button>
      </form>
      {status && <p>{status}</p>}
    </section>
  );
}

export default SensoryTestsPage;
