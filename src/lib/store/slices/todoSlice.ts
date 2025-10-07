import { generateId } from '@/lib/utils';
import type {
  CreateTodoRequest,
  Todo,
  TodoFilters,
  TodoState,
  UpdateTodoRequest,
} from '@/types';
import { StateCreator } from 'zustand';

export interface TodoSlice extends TodoState {
  // Actions
  fetchTodos: () => Promise<void>;
  createTodo: (todo: CreateTodoRequest) => Promise<void>;
  updateTodo: (id: string, updates: UpdateTodoRequest) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TodoFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialFilters: TodoFilters = {
  search: '',
  priority: 'all',
  completed: 'all',
  tags: [],
};

const initialState: TodoState = {
  todos: [],
  isLoading: false,
  error: null,
  filters: initialFilters,
};

// Mock data for development
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Complete project setup',
    description:
      'Set up the React Vite boilerplate with all necessary configurations',
    completed: false,
    priority: 'high',
    dueDate: '2024-12-31',
    tags: ['development', 'setup'],
    userId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Write documentation',
    description: 'Create comprehensive documentation for the boilerplate',
    completed: false,
    priority: 'medium',
    dueDate: '2024-12-25',
    tags: ['documentation', 'writing'],
    userId: '1',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Add unit tests',
    description: 'Implement unit tests for all components and utilities',
    completed: true,
    priority: 'high',
    tags: ['testing', 'quality'],
    userId: '1',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

export const createTodoSlice: StateCreator<TodoSlice> = (set, get) => ({
  ...initialState,

  fetchTodos: async () => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // This will be replaced with actual API call
      set({
        todos: mockTodos,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch todos',
      });
    }
  },

  createTodo: async (todoData: CreateTodoRequest) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const newTodo: Todo = {
        id: generateId(),
        ...todoData,
        completed: false,
        tags: todoData.tags || [],
        userId: '1', // This would come from auth state
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { todos } = get();
      set({
        todos: [newTodo, ...todos],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create todo',
      });
    }
  },

  updateTodo: async (id: string, updates: UpdateTodoRequest) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const { todos } = get();
      const updatedTodos = todos.map(todo =>
        todo.id === id
          ? {
              ...todo,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : todo
      );

      set({
        todos: updatedTodos,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update todo',
      });
    }
  },

  deleteTodo: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const { todos } = get();
      const filteredTodos = todos.filter(todo => todo.id !== id);

      set({
        todos: filteredTodos,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete todo',
      });
    }
  },

  toggleTodo: async (id: string) => {
    const { todos, updateTodo } = get();
    const todo = todos.find(t => t.id === id);

    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  },

  setFilters: (newFilters: Partial<TodoFilters>) => {
    const { filters } = get();
    set({
      filters: { ...filters, ...newFilters },
    });
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
});
