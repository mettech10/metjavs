import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

function DashboardPage() {
  const { token, user } = useAuth();
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

  const totals = useMemo(() => {
    const attempts = stats.reduce((sum, item) => sum + (item.attempts || 0), 0);
    return {
      attempts,
      moduleCount: stats.length,
      latestDate: results[0]?.completedAt ? new Date(results[0].completedAt).toLocaleString() : 'N/A'
    };
  }, [stats, results]);

  return (
    <section>
      <h2>{user?.name}'s Results Dashboard</h2>
      {error && <p className="error-text">{error}</p>}

      <div className="stats-grid overview-cards">
        <article className="stat-card">
          <h3>Total Attempts</h3>
          <p className="metric">{totals.attempts}</p>
        </article>
        <article className="stat-card">
          <h3>Modules Trained</h3>
          <p className="metric">{totals.moduleCount}</p>
        </article>
        <article className="stat-card">
          <h3>Last Session</h3>
          <p>{totals.latestDate}</p>
        </article>
      </div>

      <div className="panel-header">
        <h3>Per-Module Performance</h3>
        <Link to="/sensory-tests">Run New Test</Link>
      </div>

      <div className="stats-grid">
        {stats.length === 0 && <p>No completed tests yet. Run your first session.</p>}
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
          {results.length === 0 && (
            <tr>
              <td colSpan={3}>No session data yet.</td>
            </tr>
          )}
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
