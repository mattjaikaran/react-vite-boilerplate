import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TodoForm } from './TodoForm';

// Mock the hooks
const mockUseCreateTodo = vi.fn();
const mockUseUpdateTodo = vi.fn();
const mockAddNotification = vi.fn();

vi.mock('@/hooks/use-todo', () => ({
  useCreateTodo: mockUseCreateTodo,
  useUpdateTodo: mockUseUpdateTodo,
}));

vi.mock('@/lib/store', () => ({
  useUI: () => ({
    addNotification: mockAddNotification,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TodoForm', () => {
  it('renders create form correctly', () => {
    const mockCreateTodo = {
      mutateAsync: vi.fn(),
      isPending: false,
    };

    const mockUpdateTodo = {
      mutateAsync: vi.fn(),
      isPending: false,
    };

    mockUseCreateTodo.mockReturnValue(mockCreateTodo);
    mockUseUpdateTodo.mockReturnValue(mockUpdateTodo);

    render(<TodoForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Create New Todo')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Create Todo')).toBeInTheDocument();
  });

  it('calls createTodo API when form is submitted', async () => {
    const user = userEvent.setup();
    const mockCreateTodo = {
      mutateAsync: vi.fn().mockResolvedValue({
        id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'medium',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user1',
      }),
      isPending: false,
    };

    const mockUpdateTodo = {
      mutateAsync: vi.fn(),
      isPending: false,
    };

    const mockOnSuccess = vi.fn();

    mockUseCreateTodo.mockReturnValue(mockCreateTodo);
    mockUseUpdateTodo.mockReturnValue(mockUpdateTodo);

    render(<TodoForm onSuccess={mockOnSuccess} />, {
      wrapper: createWrapper(),
    });

    // Fill out the form
    await user.type(screen.getByLabelText('Title'), 'Test Todo');
    await user.type(screen.getByLabelText('Description'), 'Test Description');

    // Submit the form
    await user.click(screen.getByText('Create Todo'));

    await waitFor(() => {
      expect(mockCreateTodo.mutateAsync).toHaveBeenCalledWith({
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'medium',
        dueDate: '',
        tags: [],
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('calls updateTodo API when editing existing todo', async () => {
    const user = userEvent.setup();
    const existingTodo = {
      id: '1',
      title: 'Existing Todo',
      description: 'Existing Description',
      priority: 'high' as const,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['existing-tag'],
      userId: 'user1',
    };

    const mockCreateTodo = {
      mutateAsync: vi.fn(),
      isPending: false,
    };

    const mockUpdateTodo = {
      mutateAsync: vi.fn().mockResolvedValue({
        ...existingTodo,
        title: 'Updated Todo',
      }),
      isPending: false,
    };

    const mockOnSuccess = vi.fn();

    mockUseCreateTodo.mockReturnValue(mockCreateTodo);
    mockUseUpdateTodo.mockReturnValue(mockUpdateTodo);

    render(<TodoForm todo={existingTodo} onSuccess={mockOnSuccess} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Edit Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Todo')).toBeInTheDocument();

    // Update the title
    const titleInput = screen.getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Todo');

    // Submit the form
    await user.click(screen.getByText('Update Todo'));

    await waitFor(() => {
      expect(mockUpdateTodo.mutateAsync).toHaveBeenCalledWith({
        id: '1',
        updates: {
          title: 'Updated Todo',
          description: 'Existing Description',
          priority: 'high',
          dueDate: '',
          tags: ['existing-tag'],
        },
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('shows loading state during API call', async () => {
    const user = userEvent.setup();
    const mockCreateTodo = {
      mutateAsync: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
      isPending: true,
    };

    const mockUpdateTodo = {
      mutateAsync: vi.fn(),
      isPending: false,
    };

    mockUseCreateTodo.mockReturnValue(mockCreateTodo);
    mockUseUpdateTodo.mockReturnValue(mockUpdateTodo);

    render(<TodoForm />, { wrapper: createWrapper() });

    await user.type(screen.getByLabelText('Title'), 'Test Todo');
    await user.click(screen.getByText('Create Todo'));

    // Should show loading state
    expect(screen.getByRole('button', { name: /create todo/i })).toBeDisabled();
    // Check for loading spinner or text
    const loadingElements = screen.queryAllByText(/loading/i);
    const spinnerElements = screen.queryAllByTestId('loading-spinner');
    expect(loadingElements.length > 0 || spinnerElements.length > 0).toBe(true);
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    const mockCreateTodo = {
      mutateAsync: vi.fn().mockRejectedValue(new Error('API Error')),
      isPending: false,
    };

    const mockUpdateTodo = {
      mutateAsync: vi.fn(),
      isPending: false,
    };

    mockUseCreateTodo.mockReturnValue(mockCreateTodo);
    mockUseUpdateTodo.mockReturnValue(mockUpdateTodo);

    render(<TodoForm />, { wrapper: createWrapper() });

    await user.type(screen.getByLabelText('Title'), 'Test Todo');
    await user.click(screen.getByText('Create Todo'));

    await waitFor(() => {
      expect(mockCreateTodo.mutateAsync).toHaveBeenCalled();
    });

    // Form should still be visible (not closed due to error)
    expect(screen.getByText('Create New Todo')).toBeInTheDocument();
  });
});
