import { apiErrorMessage } from '@/api/error';
import { authLoginMutation } from '@/api/generated/@tanstack/react-query.gen';
import type { LoginSchema } from '@/api/generated/types.gen';
import { zLoginSchema } from '@/api/generated/zod.gen';
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
import { useAuth } from '@/lib/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToMagicLink?: () => void;
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToMagicLink,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useMutation(authLoginMutation());
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(zLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    form.clearErrors('root');
    try {
      const user = await loginMutation.mutateAsync({ body: data });
      queryClient.clear();
      setUser(user);
      onSuccess?.();
    } catch (error) {
      form.setError('root', { message: apiErrorMessage(error) });
    }
  };

  return (
    <Form {...form}>
      <div className="gap-y-6">
        <div className="gap-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="gap-y-4">
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? 'Hide password' : 'Show password'}
                      </span>
                    </Button>
                  </div>
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Sign In
          </Button>
        </form>

        <div className="gap-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {onSwitchToMagicLink && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onSwitchToMagicLink}
            >
              Send Magic Link
            </Button>
          )}
        </div>

        {onSwitchToRegister && (
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 font-semibold"
              onClick={onSwitchToRegister}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
}
