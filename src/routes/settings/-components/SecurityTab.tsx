import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Loader2, Shield } from 'lucide-react';

export type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function SecurityTab({ form, setForm, onSubmit, isPending }: {
  form: PasswordFormState;
  setForm: React.Dispatch<React.SetStateAction<PasswordFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}) {
  return (
    <div className="gap-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="size-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="gap-y-4">
            <div className="gap-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={e => setForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>
            <div className="gap-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={e => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div className="gap-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status: Not enabled</p>
              <p className="text-sm text-muted-foreground">Protect your account with 2FA</p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
