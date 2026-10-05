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

// Enumerate public build settings so dynamic access cannot serialize the full environment.
const buildSettings = {
  VITE_MODE: import.meta.env.VITE_MODE,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
  VITE_API_RETRIES: import.meta.env.VITE_API_RETRIES,
  VITE_AUTH_STORAGE_KEY: import.meta.env.VITE_AUTH_STORAGE_KEY,
  VITE_AUTH_REFRESH_STORAGE_KEY: import.meta.env.VITE_AUTH_REFRESH_STORAGE_KEY,
  VITE_AUTH_SESSION_SECONDS: import.meta.env.VITE_AUTH_SESSION_SECONDS,
  VITE_ENABLE_MAGIC_LINK: import.meta.env.VITE_ENABLE_MAGIC_LINK,
  VITE_ENABLE_TODOS: import.meta.env.VITE_ENABLE_TODOS,
  VITE_ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS,
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
  VITE_ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE,
  VITE_DJANGO_CSRF_COOKIE_NAME: import.meta.env.VITE_DJANGO_CSRF_COOKIE_NAME,
  VITE_DJANGO_STATIC_URL: import.meta.env.VITE_DJANGO_STATIC_URL,
  VITE_DJANGO_MEDIA_URL: import.meta.env.VITE_DJANGO_MEDIA_URL,
  VITE_DJANGO_API_PREFIX: import.meta.env.VITE_DJANGO_API_PREFIX,
};

type PublicSetting = keyof typeof buildSettings;

const getEnvVar = (key: PublicSetting, defaultValue: string = ''): string => {
  const runtimeValue =
    typeof window !== 'undefined' ? window.__APP_CONFIG__?.[key] : undefined;
  return runtimeValue || buildSettings[key] || defaultValue;
};

const getEnvBool = (
  key: PublicSetting,
  defaultValue: boolean = false
): boolean => {
  const value = getEnvVar(key);
  return value === '' ? defaultValue : value === 'true' || value === '1';
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
    tokenKey: getEnvVar('VITE_AUTH_STORAGE_KEY', 'access_token'),
    refreshTokenKey: getEnvVar(
      'VITE_AUTH_REFRESH_STORAGE_KEY',
      'refresh_token'
    ),
    tokenExpiry: parseInt(getEnvVar('VITE_AUTH_SESSION_SECONDS', '3600')), // 1 hour
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
      csrfTokenName: getEnvVar('VITE_DJANGO_CSRF_COOKIE_NAME', 'csrftoken'),
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
