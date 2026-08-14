import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/features/dashboard/AppShell';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { PublicOnly, RequireAuth, RequirePermission } from '@/features/auth/guards';
import { UsersPage } from '@/features/users/UsersPage';
import { RolesPage } from '@/features/roles/RolesPage';
import { BranchesPage } from '@/features/branches/BranchesPage';
import { AuditPage } from '@/features/audit/AuditPage';
import { ProfilePage } from '@/features/profile/ProfilePage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnly>
        <LoginPage />
      </PublicOnly>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'users',
        element: (
          <RequirePermission permission="users.read">
            <UsersPage />
          </RequirePermission>
        ),
      },
      {
        path: 'roles',
        element: (
          <RequirePermission permission="roles.read">
            <RolesPage />
          </RequirePermission>
        ),
      },
      {
        path: 'branches',
        element: (
          <RequirePermission permission="branches.read">
            <BranchesPage />
          </RequirePermission>
        ),
      },
      {
        path: 'audit',
        element: (
          <RequirePermission permission="audit.read">
            <AuditPage />
          </RequirePermission>
        ),
      },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}