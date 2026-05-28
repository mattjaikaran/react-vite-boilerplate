import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SkeletonTable } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';
import React, { useReducer, useRef } from 'react';

/**
 * Server-side pagination info (Django Ninja format)
 */
interface ServerPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  showColumnToggle?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Server-side pagination (for Django integration) */
  serverPagination?: ServerPagination;
  /** Callback for server-side pagination */
  onPaginationChange?: (page: number, pageSize: number) => void;
  /** Callback for server-side search */
  onSearchChange?: (search: string) => void;
  /** Debounce delay for search (ms) */
  searchDebounce?: number;
}

type TableState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: Record<string, boolean>;
  searchValue: string;
};

type TableAction =
  | { type: 'set_sorting'; sorting: SortingState }
  | { type: 'set_column_filters'; filters: ColumnFiltersState }
  | { type: 'set_column_visibility'; visibility: VisibilityState }
  | { type: 'set_row_selection'; selection: Record<string, boolean> }
  | { type: 'set_search'; value: string };

function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case 'set_sorting':
      return { ...state, sorting: action.sorting };
    case 'set_column_filters':
      return { ...state, columnFilters: action.filters };
    case 'set_column_visibility':
      return { ...state, columnVisibility: action.visibility };
    case 'set_row_selection':
      return { ...state, rowSelection: action.selection };
    case 'set_search':
      return { ...state, searchValue: action.value };
    default:
      return state;
  }
}

/** Toolbar with search input and column visibility toggle */
function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  showColumnToggle,
  isLoading,
  searchValue,
  onSearchChange,
  searchDebounce,
  onSearchValueChange,
}: {
  table: ReturnType<typeof useReactTable<TData>>;
  searchKey?: string;
  searchPlaceholder: string;
  showColumnToggle: boolean;
  isLoading: boolean;
  searchValue: string;
  onSearchChange?: (v: string) => void;
  searchDebounce: number;
  onSearchValueChange: (v: string) => void;
}) {
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    onSearchValueChange(value);
    if (onSearchChange) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        onSearchChange(value);
      }, searchDebounce);
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-x-2">
        {(searchKey || onSearchChange) && (
          <div className="relative">
            <Input
              placeholder={searchPlaceholder}
              value={
                onSearchChange
                  ? searchValue
                  : ((table.getColumn(searchKey!)?.getFilterValue() as string) ?? '')
              }
              onChange={event =>
                onSearchChange
                  ? handleSearchChange(event.target.value)
                  : table.getColumn(searchKey!)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {showColumnToggle && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .reduce<React.ReactNode[]>((acc, column) => {
                if (!column.getCanHide()) return acc;
                acc.push(
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
                return acc;
              }, [])}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/** Pagination controls */
function DataTablePagination<TData>({
  table,
  isServerSide,
  serverPagination,
  currentPage,
  totalPages,
  totalRows,
  data,
  isLoading,
  onPaginationChange,
}: {
  table: ReturnType<typeof useReactTable<TData>>;
  isServerSide: boolean;
  serverPagination?: ServerPagination;
  currentPage: number;
  totalPages: number;
  totalRows: number;
  data: TData[];
  isLoading: boolean;
  onPaginationChange?: (page: number, pageSize: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {isServerSide ? (
          <>Showing {data.length} of {totalRows} row(s)</>
        ) : (
          <>{table.getFilteredSelectedRowModel().rows.length} of {totalRows} row(s) selected.</>
        )}
      </div>
      <div className="flex items-center gap-x-6 lg:gap-x-8">
        <div className="flex items-center gap-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <select
            value={isServerSide ? serverPagination!.pageSize : table.getState().pagination.pageSize}
            onChange={e => {
              const newSize = Number(e.target.value);
              if (onPaginationChange) {
                onPaginationChange(1, newSize);
              } else {
                table.setPageSize(newSize);
              }
            }}
            className="h-8 w-[70px] rounded border border-input bg-background px-2 text-sm"
            disabled={isLoading}
          >
            {[10, 20, 30, 40, 50].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages || 1}
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => {
              if (onPaginationChange) {
                onPaginationChange(1, serverPagination!.pageSize);
              } else {
                table.setPageIndex(0);
              }
            }}
            disabled={currentPage <= 1 || isLoading}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => {
              if (onPaginationChange) {
                onPaginationChange(currentPage - 1, serverPagination!.pageSize);
              } else {
                table.previousPage();
              }
            }}
            disabled={currentPage <= 1 || isLoading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => {
              if (onPaginationChange) {
                onPaginationChange(currentPage + 1, serverPagination!.pageSize);
              } else {
                table.nextPage();
              }
            }}
            disabled={currentPage >= totalPages || isLoading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => {
              if (onPaginationChange) {
                onPaginationChange(totalPages, serverPagination!.pageSize);
              } else {
                table.setPageIndex(totalPages - 1);
              }
            }}
            disabled={currentPage >= totalPages || isLoading}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  showColumnToggle = true,
  showPagination = true,
  pageSize = 10,
  isLoading = false,
  serverPagination,
  onPaginationChange,
  onSearchChange,
  searchDebounce = 300,
}: DataTableProps<TData, TValue>) {
  const [tableState, dispatch] = useReducer(tableReducer, {
    sorting: [],
    columnFilters: [],
    columnVisibility: {},
    rowSelection: {},
    searchValue: '',
  });

  const isServerSide = !!serverPagination;
  const pagination: PaginationState = isServerSide
    ? { pageIndex: serverPagination.page - 1, pageSize: serverPagination.pageSize }
    : { pageIndex: 0, pageSize };

  const handlePaginationChange: OnChangeFn<PaginationState> = updater => {
    if (!onPaginationChange) return;
    const newState = typeof updater === 'function' ? updater(pagination) : updater;
    onPaginationChange(newState.pageIndex + 1, newState.pageSize);
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: sorting => dispatch({ type: 'set_sorting', sorting: typeof sorting === 'function' ? sorting(tableState.sorting) : sorting }),
    onColumnFiltersChange: filters => dispatch({ type: 'set_column_filters', filters: typeof filters === 'function' ? filters(tableState.columnFilters) : filters }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: visibility => dispatch({ type: 'set_column_visibility', visibility: typeof visibility === 'function' ? visibility(tableState.columnVisibility) : visibility }),
    onRowSelectionChange: selection => dispatch({ type: 'set_row_selection', selection: typeof selection === 'function' ? selection(tableState.rowSelection) : selection }),
    ...(isServerSide
      ? {
          manualPagination: true,
          manualFiltering: true,
          pageCount: serverPagination.totalPages,
          onPaginationChange: handlePaginationChange,
        }
      : {
          initialState: { pagination: { pageSize } },
        }),
    state: {
      sorting: tableState.sorting,
      columnFilters: tableState.columnFilters,
      columnVisibility: tableState.columnVisibility,
      rowSelection: tableState.rowSelection,
      ...(isServerSide && { pagination }),
    },
  });

  if (isLoading && data.length === 0) {
    return <SkeletonTable rows={pageSize} columns={columns.length} />;
  }

  const currentPage = isServerSide
    ? serverPagination.page
    : table.getState().pagination.pageIndex + 1;
  const totalPages = isServerSide ? serverPagination.totalPages : table.getPageCount();
  const totalRows = isServerSide
    ? serverPagination.total
    : table.getFilteredRowModel().rows.length;

  return (
    <div className="gap-y-4">
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        showColumnToggle={showColumnToggle}
        isLoading={isLoading}
        searchValue={tableState.searchValue}
        onSearchChange={onSearchChange}
        searchDebounce={searchDebounce}
        onSearchValueChange={value => dispatch({ type: 'set_search', value })}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <DataTablePagination
          table={table}
          isServerSide={isServerSide}
          serverPagination={serverPagination}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          data={data}
          isLoading={isLoading}
          onPaginationChange={onPaginationChange}
        />
      )}
    </div>
  );
}
