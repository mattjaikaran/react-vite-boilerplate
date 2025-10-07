import { ConfigProvider } from './ConfigProvider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfigProvider>
      <QueryProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          {children}
        </ThemeProvider>
      </QueryProvider>
    </ConfigProvider>
  );
}

export * from './ConfigProvider';
export { useTheme } from './theme-provider';
export { ConfigProvider, QueryProvider, ThemeProvider };
