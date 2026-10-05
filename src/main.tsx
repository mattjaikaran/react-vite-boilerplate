import { configureCookieAuth } from '@/api/auth';
import { AppProviders } from '@/components/providers';
import { initializeStore, useStore } from '@/lib/store';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Cookie transport is configured before any generated SDK request.
configureCookieAuth(() => useStore.getState().clearSession());
const sessionReady = initializeStore();
useStore.subscribe((state, previous) => {
  if (!state.isAuthenticated && previous.isAuthenticated) {
    void router.navigate({ to: '/auth/login' });
  }
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <output className="flex min-h-screen items-center justify-center">
    Loading session…
  </output>
);

void sessionReady.then(() => {
  root.render(
    <React.StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </React.StrictMode>
  );
});
