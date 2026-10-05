import { apiErrorMessage } from '@/api/error';
import { authRequestPasswordlessLoginMutation } from '@/api/generated/@tanstack/react-query.gen';
import type { PasswordlessLoginRequest } from '@/api/generated/types.gen';
import { zPasswordlessLoginRequest } from '@/api/generated/zod.gen';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface MagicLinkFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function MagicLinkForm({
  onSuccess,
  onSwitchToLogin,
}: MagicLinkFormProps) {
  const magicLinkMutation = useMutation(authRequestPasswordlessLoginMutation());

  const form = useForm<PasswordlessLoginRequest>({
    resolver: zodResolver(zPasswordlessLoginRequest),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: PasswordlessLoginRequest) => {
    form.clearErrors('root');
    try {
      await magicLinkMutation.mutateAsync({ body: data });
      onSuccess?.();
    } catch (error) {
      form.setError('root', { message: apiErrorMessage(error) });
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Magic Link Sign In
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we'll send you a magic link to sign in
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={magicLinkMutation.isPending}
          >
            {magicLinkMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Send Magic Link
          </Button>
        </form>

        {magicLinkMutation.isSuccess && (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-950/20">
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="font-medium">Magic link sent!</p>
              <p className="mt-1">
                Check your email for a link to sign in. The link will expire in
                15 minutes.
              </p>
            </div>
          </div>
        )}

        {onSwitchToLogin && (
          <div className="text-center text-sm">
            Remember your password?{' '}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 font-semibold"
              onClick={onSwitchToLogin}
            >
              Sign in with password
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
}
