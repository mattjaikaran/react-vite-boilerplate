// Dynamic imports intentionally re-evaluate module-level config after each environment change.
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  delete window.__APP_CONFIG__;
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('public runtime settings', () => {
  it('honors explicit false feature flags instead of reapplying enabled defaults', async () => {
    vi.stubEnv('VITE_ENABLE_TODOS', 'false');
    vi.stubEnv('VITE_ENABLE_MAGIC_LINK', '0');
    vi.resetModules();
    const { config } = await import('./index');
    expect(config.features.enableTodos).toBe(false);
    expect(config.auth.enableMagicLink).toBe(false);
  });

  it('gives public runtime settings precedence and preserves non-secret storage and cookie names', async () => {
    vi.stubEnv('VITE_AUTH_STORAGE_KEY', 'build-session');
    window.__APP_CONFIG__ = {
      VITE_MODE: 'django-spa',
      VITE_AUTH_STORAGE_KEY: 'runtime-session',
      VITE_AUTH_REFRESH_STORAGE_KEY: 'runtime-renewal',
      VITE_AUTH_SESSION_SECONDS: '1800',
      VITE_DJANGO_CSRF_COOKIE_NAME: 'csrf-cookie',
      VITE_ENABLE_DARK_MODE: 'false',
    };
    vi.resetModules();
    const { config } = await import('./index');
    expect(config.auth.tokenKey).toBe('runtime-session');
    expect(config.auth.refreshTokenKey).toBe('runtime-renewal');
    expect(config.auth.tokenExpiry).toBe(1800);
    expect(config.django?.csrfTokenName).toBe('csrf-cookie');
    expect(config.features.enableDarkMode).toBe(false);
  });
});
