import { apiErrorMessage } from '@/api/error';
import {
  todoDeleteTodoMutation,
  todoListTodosOptions,
  todoListTodosQueryKey,
  todoUpdateTodoMutation,
} from '@/api/generated/@tanstack/react-query.gen';
import type { TodoSchema } from '@/api/generated/types.gen';
import { TodoForm } from '@/forms/todos/TodoForm';
import { DataTable } from '@/components/shared/DataTable';
import { TodosFeature } from '@/components/shared/FeatureFlag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks';
import { useStore } from '@/lib/store';
import type { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { Plus, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { TodoListItem } from './-components/TodoListItem';

// TanStack Router requires the named Route registration in this file.
// react-doctor-disable-next-line react-doctor/only-export-components
export const Route = createFileRoute('/todos/')({
  beforeLoad: () => {
    if (!useStore.getState().isAuthenticated)
      throw redirect({ to: '/auth/login' });
  },
  component: TodosPage,
});

const todoColumns: ColumnDef<TodoSchema>[] = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'priority', header: 'Priority' },
  { accessorKey: 'completed', header: 'Status' },
];

function TodosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'completed' | 'pending'
  >('all');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [page, setPage] = useState(1);
  const [editingTodo, setEditingTodo] = useState<TodoSchema | null>(null);
  const editor = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const todosQuery = useQuery(
    todoListTodosOptions({
      query: {
        search: debouncedSearch || undefined,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        completed:
          statusFilter === 'all' ? undefined : statusFilter === 'completed',
        page,
      },
    })
  );
  const invalidateTodos = () =>
    queryClient.invalidateQueries({ queryKey: todoListTodosQueryKey() });
  const toggleTodo = useMutation({
    ...todoUpdateTodoMutation(),
    onSuccess: invalidateTodos,
  });
  const deleteTodo = useMutation({
    ...todoDeleteTodoMutation(),
    onSuccess: () => {
      setPage(1);
      return invalidateTodos();
    },
  });
  const todos = todosQuery.data?.results ?? [];
  const isLoading = todosQuery.isPending;
  const error = todosQuery.error ?? toggleTodo.error ?? deleteTodo.error;

  const closeEditor = () => editor.current?.close();
  const editTodo = (todo: TodoSchema) => {
    setEditingTodo(todo);
    editor.current?.showModal();
  };

  return (
    <TodosFeature>
      <div className="page-container">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
              <p className="text-muted-foreground">
                Manage your tasks and stay organized
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
              <Link to="/todos/create">
                <Button>
                  <Plus className="mr-2 size-4" />
                  Add Todo
                </Button>
              </Link>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {apiErrorMessage(error)}
            </p>
          )}
          {viewMode === 'table' ? (
            <DataTable
              columns={todoColumns}
              data={todos}
              searchKey="title"
              searchPlaceholder="Search todos..."
              isLoading={isLoading}
            />
          ) : (
            <>
              {/* Filters */}
              <div className="card-container p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Search todos..."
                        value={searchTerm}
                        onChange={e => {
                          setSearchTerm(e.target.value);
                          setPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={priorityFilter}
                    onValueChange={value => {
                      setPriorityFilter(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter}
                    onValueChange={(value: 'all' | 'completed' | 'pending') => {
                      setStatusFilter(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Todo List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="card-container p-6 text-center">
                    <p className="text-muted-foreground">Loading todos…</p>
                  </div>
                ) : todos.length === 0 ? (
                  <div className="card-container p-6 text-center">
                    <p className="text-muted-foreground">
                      {todos.length === 0
                        ? 'No todos yet. Create your first todo to get started!'
                        : 'No todos match your current filters.'}
                    </p>
                    {todos.length === 0 && (
                      <Link to="/todos/create" className="mt-4 inline-block">
                        <Button>
                          <Plus className="mr-2 size-4" />
                          Create Your First Todo
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  todos.map(todo => (
                    <TodoListItem
                      key={todo.id}
                      todo={todo}
                      isUpdating={toggleTodo.isPending}
                      isDeleting={deleteTodo.isPending}
                      onToggle={item =>
                        toggleTodo.mutate({
                          path: { todo_id: item.id },
                          body: { completed: !item.completed },
                        })
                      }
                      onEdit={editTodo}
                      onDelete={item =>
                        deleteTodo.mutate({ path: { todo_id: item.id } })
                      }
                    />
                  ))
                )}
              </div>
            </>
          )}
          {todosQuery.data && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} · {todosQuery.data.count} matching tasks
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!todosQuery.data.previous || todosQuery.isFetching}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!todosQuery.data.next || todosQuery.isFetching}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          <dialog
            ref={editor}
            aria-labelledby="edit-todo-title"
            onClose={() => setEditingTodo(null)}
            className="m-auto w-full max-w-lg rounded-lg border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/50"
          >
            <h2 id="edit-todo-title" className="sr-only">
              Edit Todo
            </h2>
            {editingTodo && (
              <TodoForm
                todo={editingTodo}
                onSuccess={closeEditor}
                onCancel={closeEditor}
              />
            )}
          </dialog>
        </div>
      </div>
    </TodosFeature>
  );
}
