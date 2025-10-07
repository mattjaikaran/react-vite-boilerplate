/**
 * Django integration utilities for SPA mode
 */

import { config, isDjangoSPA } from '@/config';

/**
 * Get CSRF token from Django
 */
export function getCSRFToken(): string | null {
  if (!isDjangoSPA()) return null;

  // Try to get from meta tag first
  const metaTag = document.querySelector(
    'meta[name="csrf-token"]'
  ) as HTMLMetaElement;
  if (metaTag) {
    return metaTag.content;
  }

  // Try to get from cookie
  const cookieName = config.django?.csrfTokenName || 'csrftoken';
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Get Django user data from window object or DOM
 */
export function getDjangoUser(): any {
  if (!isDjangoSPA()) return null;

  // Check if Django user data is available in window
  const windowUser = (window as any).__DJANGO_USER__;
  if (windowUser) {
    return windowUser;
  }

  // Try to get from JSON script tag
  const userScript = document.getElementById('django-user-data');
  if (userScript) {
    try {
      return JSON.parse(userScript.textContent || '{}');
    } catch (error) {
      console.warn('Failed to parse Django user data:', error);
    }
  }

  return null;
}

/**
 * Get Django settings/config from window object
 */
export function getDjangoSettings(): any {
  if (!isDjangoSPA()) return {};

  return (window as any).__DJANGO_SETTINGS__ || {};
}

/**
 * Build URL with Django static/media prefix
 */
export function buildDjangoUrl(
  path: string,
  type: 'static' | 'media' = 'static'
): string {
  if (!isDjangoSPA()) return path;

  const prefix =
    type === 'static'
      ? config.django?.staticUrl || '/static/'
      : config.django?.mediaUrl || '/media/';

  return `${prefix.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/**
 * Initialize Django SPA integration
 */
export function initializeDjangoSPA(): void {
  if (!isDjangoSPA()) return;

  console.log('🐍 Initializing Django SPA integration...');

  // Set up CSRF token for all requests
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    console.log('🔒 CSRF token configured for Django SPA mode');
  }

  // Initialize user data if available
  const djangoUser = getDjangoUser();
  if (djangoUser) {
    console.log('👤 Django user data loaded:', djangoUser);
  }

  // Set up Django-specific error handling
  window.addEventListener('unhandledrejection', event => {
    if (event.reason?.response?.status === 403) {
      console.warn('🔒 CSRF token may be invalid, attempting to refresh...');
      // Could implement CSRF token refresh logic here
    }
  });
}

/**
 * Django form helpers
 */
export class DjangoFormHelper {
  static addCSRFToken(formData: FormData): FormData {
    if (!isDjangoSPA()) return formData;

    const csrfToken = getCSRFToken();
    if (csrfToken) {
      formData.append('csrfmiddlewaretoken', csrfToken);
    }

    return formData;
  }

  static createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    return this.addCSRFToken(formData);
  }
}

/**
 * Django URL helpers
 */
export class DjangoUrlHelper {
  static reverse(viewName: string, args: Record<string, any> = {}): string {
    if (!isDjangoSPA()) return viewName;

    // Check if Django URL reverse function is available
    const djangoUrls = (window as any).__DJANGO_URLS__;
    if (djangoUrls && djangoUrls[viewName]) {
      let url = djangoUrls[viewName];

      // Replace URL parameters
      Object.entries(args).forEach(([key, value]) => {
        url = url.replace(new RegExp(`<${key}>`, 'g'), String(value));
      });

      return url;
    }

    return viewName;
  }

  static buildApiUrl(endpoint: string): string {
    const apiPrefix = config.django?.apiPrefix || '/api/v1';
    return `${apiPrefix}/${endpoint.replace(/^\//, '')}`;
  }
}

/**
 * Django message framework integration
 */
export class DjangoMessages {
  static getMessages(): Array<{
    level: string;
    message: string;
    tags: string;
  }> {
    if (!isDjangoSPA()) return [];

    const messages = (window as any).__DJANGO_MESSAGES__ || [];
    return messages;
  }

  static clearMessages(): void {
    if (typeof window !== 'undefined') {
      (window as any).__DJANGO_MESSAGES__ = [];
    }
  }
}

// Auto-initialize if in Django SPA mode
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  const initIfDjango = () => {
    if (isDjangoSPA()) {
      initializeDjangoSPA();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIfDjango);
  } else {
    initIfDjango();
  }
}
