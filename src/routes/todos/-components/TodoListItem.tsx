import type { TodoSchema } from '@/api/generated/types.gen';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';

function priorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function TodoListItem({
  todo,
  isUpdating,
  isDeleting,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: TodoSchema;
  isUpdating: boolean;
  isDeleting: boolean;
  onToggle: (todo: TodoSchema) => void;
  onEdit: (todo: TodoSchema) => void;
  onDelete: (todo: TodoSchema) => void;
}) {
  return (
    <div className="card-container p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1"
          aria-label={`${todo.completed ? 'Mark incomplete' : 'Complete'}: ${todo.title}`}
          aria-pressed={todo.completed}
          disabled={isUpdating}
          onClick={() => onToggle(todo)}
        >
          {todo.completed ? (
            <CheckCircle2 className="size-5 text-green-600" />
          ) : (
            <Circle className="size-5 text-muted-foreground" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3
              className={`font-medium ${todo.completed ? 'text-muted-foreground line-through' : ''}`}
            >
              {todo.title}
            </h3>
            <span
              className={`rounded-full border px-2 py-1 text-xs ${priorityColor(todo.priority)}`}
            >
              {todo.priority}
            </span>
          </div>
          {todo.description && (
            <p
              className={`mb-2 text-sm text-muted-foreground ${todo.completed ? 'line-through' : ''}`}
            >
              {todo.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(todo)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete: ${todo.title}`}
            disabled={isDeleting}
            onClick={() => onDelete(todo)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
