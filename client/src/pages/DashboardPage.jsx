import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, resultsData] = await Promise.all([
          apiRequest('/sensory/dashboard', {}, token),
          apiRequest('/sensory/results', {}, token)
        ]);
        setStats(statsData);
        setResults(resultsData);
      } catch (dashboardError) {
        setError(dashboardError.message);
      }
    };

    loadDashboardData();
  }, [token]);

  return (
    <section>
      <h2>Results Dashboard</h2>
      {error && <p className="error-text">{error}</p>}
      <div className="stats-grid">
        {stats.length === 0 && <p>No completed tests yet.</p>}
        {stats.map((stat) => (
          <article key={stat._id} className="stat-card">
            <h3>{stat._id}</h3>
            <p>Attempts: {stat.attempts}</p>
            <p>Average score: {Number(stat.averageScore || 0).toFixed(2)}</p>
            <p>Latest score: {stat.latestScore}</p>
          </article>
        ))}
      </div>

      <h3>Recent Test Sessions</h3>
      <table className="results-table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Score</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result._id}>
              <td>{result.moduleType}</td>
              <td>{result.score}</td>
              <td>{new Date(result.completedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default DashboardPage;
