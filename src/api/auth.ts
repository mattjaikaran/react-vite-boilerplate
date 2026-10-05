import { client } from '@/api/generated/client.gen';
import { createClient } from '@/api/generated/client';
import { authCsrf, authRefresh } from '@/api/generated/sdk.gen';
import { config } from '@/config';

const nativeFetch: typeof fetch = (input, init) => {
  const callerSignal =
    init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const timeout = AbortSignal.timeout(config.api.timeout);
  return globalThis.fetch(input, {
    ...init,
    credentials: 'include',
    signal: callerSignal ? AbortSignal.any([callerSignal, timeout]) : timeout,
  });
};

/** Configure the generated client once, before session bootstrap or rendering. */
export function configureCookieAuth(onSessionExpired: () => void) {
  const rawClient = createClient({
    baseUrl: config.api.baseUrl,
    credentials: 'include',
    fetch: nativeFetch,
  });
  const protectedRequests = new WeakSet<Request>();
  let csrf: Promise<string> | undefined;
  let refresh: Promise<boolean> | undefined;
  let sessionRevision = 0;

  const csrfToken = () => {
    csrf ??= authCsrf({ client: rawClient, throwOnError: true })
      .then(({ data }) => data.csrfToken)
      .catch(error => {
        csrf = undefined;
        throw error;
      });
    return csrf;
  };

  const prepare = async (request: Request) => {
    if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(request.method)) {
      request.headers.set('X-CSRFToken', await csrfToken());
    }
    return request;
  };

  const refreshSession = async () => {
    const result = await authRefresh({
      client: rawClient,
      headers: { 'X-CSRFToken': await csrfToken() },
    });
    if (result.response?.status === 401) return false;
    if (result.error !== undefined) throw result.error;
    csrf = undefined;
    sessionRevision += 1;
    return true;
  };

  const cookieFetch: typeof fetch = async (input, init) => {
    const isProtected =
      input instanceof Request && protectedRequests.has(input);
    const request = new Request(input, { ...init, credentials: 'include' });
    const revision = sessionRevision;
    // Only streamed bodies need a clone; bodyless requests remain reusable.
    const retry = isProtected
      ? request.body
        ? request.clone()
        : request
      : undefined;
    const response = await nativeFetch(await prepare(request));
    if (
      response.ok &&
      request.method === 'POST' &&
      new URL(request.url).pathname.startsWith('/api/auth/')
    ) {
      // Login rotates Django's CSRF secret; the next mutation bootstraps it again.
      csrf = undefined;
    }
    if (response.status !== 401 || !retry) return response;

    if (revision === sessionRevision) {
      refresh ??= refreshSession().finally(() => {
        refresh = undefined;
      });
      if (!(await refresh)) {
        onSessionExpired();
        return response;
      }
    }
    const retried = await nativeFetch(await prepare(retry));
    if (retried.status === 401) onSessionExpired();
    return retried;
  };

  client.setConfig({
    baseUrl: config.api.baseUrl,
    credentials: 'include',
    fetch: cookieFetch,
  });
  client.interceptors.request.use((request, options) => {
    if (
      options.security?.some(
        security => security.in === 'cookie' && security.name === 'access_token'
      )
    ) {
      protectedRequests.add(request);
    }
    return request;
  });
}
