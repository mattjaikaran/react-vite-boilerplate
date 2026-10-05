/* react-doctor-disable deslop/unused-file */
/**
 * Client Entry Point for SSR
 * This file is the entry point for the client-side bundle in SSR mode
 */

import { configureCookieAuth } from '@/api/auth';
import { AppProviders } from '@/components/providers';
import { initializeStore, useStore } from '@/lib/store';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

configureCookieAuth(() => useStore.getState().clearSession());

void initializeStore().then(() => {
  const rootElement = document.getElementById('root')!;
  const app = (
    <React.StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </React.StrictMode>
  );
  if (rootElement.innerHTML) {
    ReactDOM.hydrateRoot(rootElement, app);
  } else {
    ReactDOM.createRoot(rootElement).render(app);
  }
});
