import { DataTableToolbar, DataTablePagination, type ServerPagination } from './DataTableControls';
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
import { useReducer } from 'react';


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
