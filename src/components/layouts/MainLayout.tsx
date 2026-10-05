import { Footer } from '@/components/nav/Footer';
import { Navbar } from '@/components/nav/Navbar';
import { useSetTheme, useTheme } from '@/lib/store';
import { Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme();
  const setTheme = useSetTheme();

  useEffect(() => {
    if (theme !== 'system') return;
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    const followSystem = () => setTheme('system');
    preference.addEventListener('change', followSystem);
    return () => preference.removeEventListener('change', followSystem);
  }, [theme, setTheme]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">{children || <Outlet />}</main>

      <Footer />
    </div>
  );
}
