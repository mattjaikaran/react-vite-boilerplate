/**
 * Configuration provider for runtime config management
 */

import { config, type AppConfig } from '@/config';
import { createContext, useContext, type ReactNode } from 'react';

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => void;
  isFeatureEnabled: (feature: keyof AppConfig['features']) => boolean;
  isDjangoSPA: boolean;
  isStandalone: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
  initialConfig?: Partial<AppConfig>;
}

export function ConfigProvider({
  children,
  initialConfig,
}: ConfigProviderProps) {
  // Merge initial config with default config
  const mergedConfig = initialConfig ? { ...config, ...initialConfig } : config;

  const updateConfig = (updates: Partial<AppConfig>) => {
    // In a real app, you might want to persist config changes
    Object.assign(mergedConfig, updates);
  };

  const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
    return mergedConfig.features[feature];
  };

  const contextValue: ConfigContextType = {
    config: mergedConfig,
    updateConfig,
    isFeatureEnabled,
    isDjangoSPA: mergedConfig.env.mode === 'django-spa',
    isStandalone: mergedConfig.env.mode === 'standalone',
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextType {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// Convenience hooks
export function useFeature(feature: keyof AppConfig['features']): boolean {
  const { isFeatureEnabled } = useConfig();
  return isFeatureEnabled(feature);
}

export function useApiConfig() {
  const { config } = useConfig();
  return config.api;
}

export function useAuthConfig() {
  const { config } = useConfig();
  return config.auth;
}

export function useDjangoConfig() {
  const { config } = useConfig();
  return config.django;
}

export function useEnvironment() {
  const { config } = useConfig();
  return config.env;
}
