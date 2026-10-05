import { apiErrorMessage } from '@/api/error';
import {
  todoCreateTodoMutation,
  todoListTodosQueryKey,
  todoUpdateTodoMutation,
} from '@/api/generated/@tanstack/react-query.gen';
import type { TodoSchema } from '@/api/generated/types.gen';
import { zCreateTodoSchema } from '@/api/generated/zod.gen';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface TodoFormProps {
  todo?: TodoSchema;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TodoForm({ todo, onSuccess, onCancel }: TodoFormProps) {
  const queryClient = useQueryClient();
  const invalidateTodos = () =>
    queryClient.invalidateQueries({ queryKey: todoListTodosQueryKey() });
  const createTodoMutation = useMutation({
    ...todoCreateTodoMutation(),
    onSuccess: invalidateTodos,
  });
  const updateTodoMutation = useMutation({
    ...todoUpdateTodoMutation(),
    onSuccess: invalidateTodos,
  });

  const isEditing = !!todo;
  const isLoading =
    createTodoMutation.isPending || updateTodoMutation.isPending;

  const form = useForm<
    z.input<typeof zCreateTodoSchema>,
    unknown,
    z.output<typeof zCreateTodoSchema>
  >({
    resolver: zodResolver(zCreateTodoSchema),
    defaultValues: {
      title: todo?.title || '',
      description: todo?.description || '',
      priority: todo?.priority || 'medium',
      completed: todo?.completed ?? false,
    },
  });

  const onSubmit = async (data: z.output<typeof zCreateTodoSchema>) => {
    form.clearErrors('root');
    try {
      if (todo) {
        await updateTodoMutation.mutateAsync({
          path: { todo_id: todo.id },
          body: data,
        });
      } else {
        await createTodoMutation.mutateAsync({ body: data });
      }
      onSuccess?.();
    } catch (error) {
      form.setError('root', { message: apiErrorMessage(error) });
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Todo' : 'Create New Todo'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Update your todo details below.'
              : 'Fill in the details to create a new todo.'}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter todo title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter todo description (optional)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Update Todo' : 'Create Todo'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </Form>
  );
}
