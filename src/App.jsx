import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { AppShell } from './layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CondominiumsPage } from './pages/CondominiumsPage';
import { TechniciansPage } from './pages/TechniciansPage';
import { VisitsPage } from './pages/VisitsPage';
import { VisitFormPage } from './pages/VisitFormPage';
import { ReportsPage } from './pages/ReportsPage';
import { ContractsPage } from './pages/ContractsPage';
import { CompanySettingsPage } from './pages/CompanySettingsPage';
import { fullAccessRoles, hasAnyRole } from './auth/permissions';

function ProtectedRoute({ children, allowedRoles }) {
  const { authLoading, currentUser, isAuthenticated } = useAppContext();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-sm font-medium text-slate-600">
        Validando sessão...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAnyRole(currentUser, allowedRoles)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="condominiums" element={<CondominiumsPage />} />
        <Route path="technicians" element={<TechniciansPage />} />
        <Route path="visits" element={<VisitsPage />} />
        <Route path="visits/new" element={<VisitFormPage />} />
        <Route path="visits/:visitId" element={<VisitFormPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="contracts"
          element={
            <ProtectedRoute allowedRoles={fullAccessRoles}>
              <ContractsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="company"
          element={
            <ProtectedRoute allowedRoles={fullAccessRoles}>
              <CompanySettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
