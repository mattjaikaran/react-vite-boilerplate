# Deployment Guide

This React Vite boilerplate can be deployed in two modes:

## 1. Standalone Mode (Default)

Deploy as a standalone Single Page Application (SPA) with its own backend API.

### Environment Variables

Create a `.env.production` file:

```env
VITE_MODE=standalone
VITE_API_BASE_URL=https://your-api-domain.com
VITE_API_TIMEOUT=10000
VITE_ENABLE_TODOS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DARK_MODE=true
```

### Build and Deploy

```bash
# Install dependencies
bun install

# Build for production
bun run build

# Deploy the dist/ folder to your hosting provider
# (Vercel, Netlify, AWS S3, etc.)
```

### Hosting Providers

#### Vercel

```bash
bun install -g vercel
vercel --prod
```

#### Netlify

```bash
bun install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### AWS S3 + CloudFront

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 2. Django SPA Mode

Integrate as a frontend for a Django application using django-ninja or Django REST Framework.

### Django Setup

1. **Install Django and dependencies:**

```bash
pip install django django-ninja django-cors-headers
```

2. **Django settings.py:**

```python
INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
]

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Add React build directory to static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'frontend/dist'),
]
```

3. **Django template (base.html):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token }}" />
    <title>Your App</title>
    {% load static %}
    <link rel="stylesheet" href="{% static 'assets/index.css' %}" />
  </head>
  <body>
    <div id="root"></div>

    <!-- Django data for React -->
    <script id="django-user-data" type="application/json">
      {{ user_data|safe }}
    </script>

    <script>
      window.__DJANGO_SPA__ = true;
      window.__DJANGO_USER__ = {{ user_data|safe }};
      window.__DJANGO_SETTINGS__ = {
          STATIC_URL: "{{ STATIC_URL }}",
          MEDIA_URL: "{{ MEDIA_URL }}",
          CSRF_TOKEN: "{{ csrf_token }}"
      };
    </script>

    <script src="{% static 'assets/index.js' %}"></script>
  </body>
</html>
```

4. **Django views.py:**

```python
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import json

@login_required
def spa_view(request):
    user_data = {
        'id': request.user.id,
        'email': request.user.email,
        'firstName': request.user.first_name,
        'lastName': request.user.last_name,
        'isActive': request.user.is_active,
    } if request.user.is_authenticated else None

    return render(request, 'spa.html', {
        'user_data': json.dumps(user_data)
    })
```

5. **Django urls.py:**

```python
from django.urls import path, include
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('your_api.urls')),
    path('', views.spa_view, name='spa'),
    path('<path:path>', views.spa_view, name='spa_catchall'),
]
```

### React Environment Variables for Django Mode

Create a `.env.production` file:

```env
VITE_MODE=django-spa
VITE_API_BASE_URL=
VITE_DJANGO_CSRF_COOKIE_NAME=csrftoken
VITE_DJANGO_STATIC_URL=/static/
VITE_DJANGO_MEDIA_URL=/media/
VITE_DJANGO_API_PREFIX=/api
```

### Build Process for Django

```bash
# Build React app
bun run build

# Copy build files to Django static directory
cp -r dist/* /path/to/your/django/project/static/

# Collect static files
python manage.py collectstatic --noinput
```

### Automated Django Deployment Script

Create `deploy-django.sh`:

```bash
#!/bin/bash

# Build React app
echo "Building React app..."
bun run build

# Copy to Django static directory
echo "Copying files to Django..."
cp -r dist/* ../backend/static/

# Django deployment
cd ../backend
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate

echo "Deployment complete!"
```

## Docker Deployment

### Production frontend

Use this repository's `Dockerfile`, not a separate Node or combined Django image:

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t react-vite-boilerplate .
docker run --read-only --tmpfs /tmp:uid=101,gid=101,mode=1770 \
  --cap-drop ALL --security-opt no-new-privileges:true \
  -p 3000:8080 react-vite-boilerplate
```

The build installs from `bun.lock` with `--frozen-lockfile` and compiles with Bun.
The release image contains only the static build and nginx configuration, runs as
UID/GID 101, and listens on 8080. nginx writes its PID and temporary files under
`/tmp`, logs to stdout/stderr, serves SPA fallbacks, and checks `/health`.
Security headers also apply to health and cache locations; hashed `/assets/`
files receive immutable caching, while HTML is revalidated.

`docker compose up --build app` publishes the same production image on port 3000
with a read-only filesystem, writable `/tmp`, dropped capabilities, and no privilege
escalation. Terminate TLS at your deployment's external ingress.
Vite configuration is compiled into assets: supply required public values during
the build, never secrets. Runtime environment variables do not rewrite the build.
`VITE_API_BASE_URL` is an origin, not `/api`; set it to an empty string and
`VITE_MODE=django-spa` for a same-origin API proxy. Compose forwards these two
public build arguments, preserving an explicitly empty origin.

nginx sends nosniff, SAMEORIGIN, referrer, Permissions-Policy, and baseline CSP
headers on successful and error responses. CSP blocks objects, foreign base URLs,
and foreign framing; it does not restrict script/connect sources. Configure a
stricter application CSP and HSTS at the TLS ingress for your deployment.

### Development and monorepo proxy

```bash
docker compose --profile dev up --build app-dev
# Separate backend deployment required:
docker compose -f docker-compose.monorepo.yml --profile production up --build
```

Development runs as the Bun user on container port 3000, published at port 3001
in standalone Compose and port 3000 in monorepo Compose. Named dependency volumes
must be recreated when the lockfile changes. The optional monorepo nginx proxy
publishes host port 80 to container port 8080 and preserves backend API/admin/static/
media routing and frontend HMR. `BACKEND_PATH` defaults to `../backend`; it must
point to an independently configured backend, not the isolated contract checkout.
The monorepo database credentials are local examples, not production credentials.
The backend must trust the browser's frontend origin in both CORS and CSRF
settings, including port 3001 when using standalone development Compose.

Both Dockerfiles and every third-party Compose image use exact tags plus immutable
multi-platform manifest digests. Upgrade tags and digests together after inspecting
the registry manifests with `docker buildx imagetools inspect`.

## Environment-Specific Configuration

The app automatically detects its environment and configures itself accordingly:

- **Standalone**: Uses full API URLs, handles its own authentication
- **Django SPA**: Uses relative URLs, integrates with Django's CSRF protection and user system

## Performance Optimization

### Code Splitting

The app uses React.lazy() for route-based code splitting.

### Bundle Analysis

```bash
bun run build -- --analyze
```

### PWA Support

Add PWA capabilities by installing:

```bash
bun install vite-plugin-pwa
```

## Monitoring and Analytics

### Error Tracking

Integrate with Sentry:

```bash
bun install @sentry/react @sentry/tracing
```

### Analytics

The app includes feature flags for analytics integration.

## Security Considerations

- CSRF protection in Django mode
- Content Security Policy headers
- Secure cookie settings
- API rate limiting
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **CORS errors in Django mode**: Check CORS_ALLOWED_ORIGINS settings
2. **Static files not loading**: Verify STATIC_URL and collectstatic
3. **API calls failing**: Check CSRF token configuration
4. **Build errors**: Clear node_modules and reinstall dependencies

### Debug Mode

Set `VITE_DEBUG=true` to enable detailed logging.
