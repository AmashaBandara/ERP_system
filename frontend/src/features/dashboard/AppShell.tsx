import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Building2, ScrollText, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/app/auth-store';
import { useHasPermission } from '@/shared/hooks';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Users;
  permission?: string;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'reports.dashboard.read' },
  { to: '/users', label: 'Users', icon: Users, permission: 'users.read' },
  { to: '/roles', label: 'Roles & Permissions', icon: Shield, permission: 'roles.read' },
  { to: '/branches', label: 'Branches', icon: Building2, permission: 'branches.read' },
  { to: '/audit', label: 'Audit Logs', icon: ScrollText, permission: 'audit.read' },
];

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const visible = navItems.filter((i) => !i.permission || useHasPermission(i.permission));

  async function onLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2 px-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            W
          </span>
          <span className="text-sm font-semibold">Waikkal ERP</span>
        </div>
        <nav className="px-3 py-2">
          <ul className="space-y-1">
            {visible.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent',
                      isActive && 'bg-sidebar-accent text-white',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground">{user?.roles?.map((r) => r.code).join(', ')}</p>
            </div>
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}