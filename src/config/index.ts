/**
 * Application configuration
 */

export interface AppConfig {
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };

  // Authentication
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpiry: number;
    enableMagicLink: boolean;
  };

  // Features
  features: {
    enableTodos: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enableDarkMode: boolean;
  };

  // Environment
  env: {
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    mode: 'standalone' | 'django-spa';
  };

  // Django Integration (when mode is 'django-spa')
  django?: {
    csrfTokenName: string;
    staticUrl: string;
    mediaUrl: string;
    apiPrefix: string;
  };
}

// Type for window runtime config
declare global {
  interface Window {
    __APP_CONFIG__?: Record<string, string>;
    __DJANGO_SPA__?: boolean;
  }
}

// Environment variables with defaults
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Browser environment - check for runtime config
    return window.__APP_CONFIG__?.[key] || import.meta.env[key] || defaultValue;
  }
  return import.meta.env[key] || defaultValue;
};

const getEnvBool = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key);
  return value === 'true' || value === '1' || defaultValue;
};

// Determine if we're running in Django SPA mode
const isDjangoSPAMode =
  getEnvVar('VITE_MODE') === 'django-spa' ||
  (typeof window !== 'undefined' && window.__DJANGO_SPA__);

// Application configuration
export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar(
      'VITE_API_BASE_URL',
      isDjangoSPAMode ? '/api' : 'http://localhost:8000/api'
    ),
    timeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '10000')),
    retries: parseInt(getEnvVar('VITE_API_RETRIES', '3')),
  },

  auth: {
    tokenKey: getEnvVar('VITE_AUTH_TOKEN_KEY', 'access_token'),
    refreshTokenKey: getEnvVar('VITE_AUTH_REFRESH_TOKEN_KEY', 'refresh_token'),
    tokenExpiry: parseInt(getEnvVar('VITE_AUTH_TOKEN_EXPIRY', '3600')), // 1 hour
    enableMagicLink: getEnvBool('VITE_ENABLE_MAGIC_LINK', true),
  },

  features: {
    enableTodos: getEnvBool('VITE_ENABLE_TODOS', true),
    enableNotifications: getEnvBool('VITE_ENABLE_NOTIFICATIONS', true),
    enableAnalytics: getEnvBool('VITE_ENABLE_ANALYTICS', false),
    enableDarkMode: getEnvBool('VITE_ENABLE_DARK_MODE', true),
  },

  env: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    isTest: import.meta.env.MODE === 'test',
    mode: isDjangoSPAMode ? 'django-spa' : 'standalone',
  },

  ...(isDjangoSPAMode && {
    django: {
      csrfTokenName: getEnvVar('VITE_DJANGO_CSRF_TOKEN_NAME', 'csrftoken'),
      staticUrl: getEnvVar('VITE_DJANGO_STATIC_URL', '/static/'),
      mediaUrl: getEnvVar('VITE_DJANGO_MEDIA_URL', '/media/'),
      apiPrefix: getEnvVar('VITE_DJANGO_API_PREFIX', '/api'),
    },
  }),
};

// Config sections (access via config.api, config.auth, etc.)
const apiConfig = config.api;
const authConfig = config.auth;
const featureConfig = config.features;
const envConfig = config.env;
const djangoConfig = config.django;

// Helper functions (access via config.env.isDevelopment, etc.)
const isDevelopment = () => config.env.isDevelopment;
const isProduction = () => config.env.isProduction;
const isTest = () => config.env.isTest;
const isDjangoSPA = () => config.env.mode === 'django-spa';
const isStandalone = () => config.env.mode === 'standalone';

// Feature flags
// react-doctor-disable-next-line deslop/unused-export
export const isFeatureEnabled = (
  feature: keyof typeof config.features
): boolean => {
  return config.features[feature];
};

// Suppress unused vars (these exist for convenience/documentation purposes)
void apiConfig;
void authConfig;
void featureConfig;
void envConfig;
void djangoConfig;
void isDevelopment;
void isProduction;
void isTest;
void isDjangoSPA;
void isStandalone;

