import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'backend/docs/openapi/openapi.json',
  output: 'src/api/generated',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch',
    '@hey-api/sdk',
    {
      name: 'zod',
      compatibilityVersion: 4,
      requests: true,
      responses: true,
      definitions: true,
    },
    '@tanstack/react-query',
  ],
});
