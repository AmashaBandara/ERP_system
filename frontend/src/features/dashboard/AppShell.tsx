import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Building2, ScrollText, LogOut, Menu, X, User as UserIcon, ChevronDown } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visible = navItems.filter((i) => !i.permission || useHasPermission(i.permission));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function onLogout() {
    await logout();
    navigate('/login');
  }

  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const navContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b px-6 border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-sm">
            W
          </span>
          <div>
            <span className="text-sm font-semibold tracking-tight block">Waikkal ERP</span>
            <span className="text-[10px] text-muted-foreground block -mt-1 font-mono">v1.2.0</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </div>
        <ul className="space-y-1">
          {visible.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 hover:text-primary-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-sidebar text-sidebar-foreground z-10 shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex md:hidden items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* User Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full p-1 pl-2 hover:bg-accent transition-colors focus:outline-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold leading-tight">{user?.full_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {user?.roles?.map((r) => r.code).join(', ') || 'User'}
                  </p>
                </div>
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                    {getInitials(user?.full_name)}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover text-popover-foreground shadow-lg ring-1 ring-black/5 z-50 divide-y divide-border animate-in fade-in-50 zoom-in-95">
                  <div className="p-3">
                    <p className="text-sm font-semibold">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {user?.roles?.map((r) => (
                        <span key={r.code} className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          {r.code}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      My Profile
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}