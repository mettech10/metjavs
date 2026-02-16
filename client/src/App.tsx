import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import SensoryTestsPage from './pages/SensoryTestsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TestHistoryPage from './pages/TestHistoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ClinicianPortalPage from './pages/ClinicianPortalPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<PrivateRoute><Layout><Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sensory" element={<SensoryTestsPage />} />
          <Route path="/history" element={<TestHistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/clinician" element={<ClinicianPortalPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes></Layout></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  );
}
