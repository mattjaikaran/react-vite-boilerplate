import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function SecurityTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-5" />
          Session Security
        </CardTitle>
        <CardDescription>
          Authentication is managed by the backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Access and refresh credentials stay in HttpOnly cookies, not browser
          storage.
        </p>
        <p>
          Unsafe requests require Django CSRF protection. Production cookies
          require HTTPS.
        </p>
        <p>
          This backend has no authenticated change-password endpoint; account
          recovery uses its email-code password-reset API.
        </p>
      </CardContent>
    </Card>
  );
}
