import { Bell, Building2, ClipboardList, FileCog, FileText, LayoutDashboard, LogOut, Settings2, Wrench } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ToastStack } from '../components/ToastStack';
import { canAccessCompany, canAccessContracts } from '../auth/permissions';

const navItems = [
  { to: '/app/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/app/condominiums', label: 'Condomínios', icon: Building2 },
  { to: '/app/technicians', label: 'Técnicos', icon: Wrench },
  { to: '/app/visits', label: 'Visitas', icon: ClipboardList },
  { to: '/app/reports', label: 'Relatórios', icon: FileText },
  { to: '/app/contracts', label: 'Contratos', icon: FileCog, canAccess: canAccessContracts },
  { to: '/app/company', label: 'Empresa', icon: Settings2, canAccess: canAccessCompany },
];

function NavItem({ item, mobile = false }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        mobile
          ? `flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium ${
              isActive ? 'bg-brand-600 text-white' : 'text-slate-500'
            }`
          : `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
              isActive ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100'
            }`
      }
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export function AppShell() {
  const { currentUser, logout, notifications, dismissNotification } = useAppContext();
  const navigate = useNavigate();
  const visibleNavItems = navItems.filter((item) => !item.canAccess || item.canAccess(currentUser));

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <ToastStack items={notifications} onDismiss={dismissNotification} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-24 pt-4 lg:px-6 lg:pb-6">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] bg-white p-5 shadow-soft lg:flex lg:flex-col">
          <div className="rounded-3xl bg-hero-grid p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">BlueFlow</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Gestão Hidráulica</h1>
            <p className="mt-2 text-sm text-slate-600">
              Operação de manutenção hidráulica para condomínios residenciais.
            </p>
          </div>
          <nav className="mt-6 space-y-2">
            {visibleNavItems.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <LogOut size={18} />
            Sair
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Central Operacional</p>
              <p className="mt-1 text-sm text-slate-500">Acompanhe visitas técnicas, equipe e relatórios de atendimento.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Bell size={18} className="text-brand-600" />
              Fluxo preparado para alto volume de registros
            </div>
          </div>
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-20 rounded-[2rem] border border-slate-200 bg-white p-2 shadow-soft lg:hidden">
        <div className="flex items-center gap-2">
          {visibleNavItems.map((item) => (
            <NavItem key={item.to} item={item} mobile />
          ))}
        </div>
      </nav>
    </div>
  );
}
