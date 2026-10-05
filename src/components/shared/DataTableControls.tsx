import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { useReactTable } from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';
import React, { useRef } from 'react';
/**
 * Server-side pagination info (Django Ninja format)
 */
interface ServerPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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
                  : ((table
                      .getColumn(searchKey!)
                      ?.getFilterValue() as string) ?? '')
              }
              onChange={event =>
                onSearchChange
                  ? handleSearchChange(event.target.value)
                  : table
                      .getColumn(searchKey!)
                      ?.setFilterValue(event.target.value)
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
            {table.getAllColumns().reduce<React.ReactNode[]>((acc, column) => {
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
          <>
            Showing {data.length} of {totalRows} row(s)
          </>
        ) : (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of {totalRows}{' '}
            row(s) selected.
          </>
        )}
      </div>
      <div className="flex items-center gap-x-6 lg:gap-x-8">
        <div className="flex items-center gap-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <select
            aria-label="Rows per page"
            value={
              isServerSide
                ? serverPagination!.pageSize
                : table.getState().pagination.pageSize
            }
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

export { DataTableToolbar, DataTablePagination };
export type { ServerPagination };
