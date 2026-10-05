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

  it('keeps an explicitly empty runtime API origin instead of using the build origin', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://build-api.example.com');
    window.__APP_CONFIG__ = { VITE_API_BASE_URL: '' };
    vi.resetModules();
    const { config } = await import('./index');
    expect(config.api.baseUrl).toBe('');
  });
});
