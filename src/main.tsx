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

// Initialize the store
initializeStore();
useStore.subscribe((state, previous) => {
  if (!state.isAuthenticated && previous.isAuthenticated) {
    void router.navigate({ to: '/auth/login' });
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
