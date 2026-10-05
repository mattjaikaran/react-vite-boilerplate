import { MainLayout } from '@/components/layouts/MainLayout';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

// TanStack Router requires the named Route registration in this file.
// react-doctor-disable-next-line react-doctor/only-export-components
export const Route = createRootRoute({
  component: () => (
    <MainLayout>
      <Outlet />
      {import.meta.env?.DEV && <TanStackRouterDevtools />}
    </MainLayout>
  ),
});
