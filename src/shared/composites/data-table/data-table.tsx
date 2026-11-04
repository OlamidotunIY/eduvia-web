import * as React from "react";
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { Funnel, RefreshCw, Search, Settings2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { DataTableEmptyState } from "./data-table-empty-state";
import {
  dataTableFeatures,
  type DataTableFeatures,
} from "./data-table-features";
import { DataTablePagination } from "./data-table-pagination";

export interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyHeading?: string;
  emptyDescription?: string;
  emptyIcon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  emptyAction?: React.ReactNode;
  searchKey?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  className?: string;
  onReload?: () => void;
  isReloading?: boolean;
  filterContent?: React.ReactNode;
  onFilterClick?: () => void;
  isFiltered?: boolean;
  enableColumnVisibility?: boolean;
  columnLabels?: Record<string, string>;
  toolbarActions?: React.ReactNode;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  emptyHeading,
  emptyDescription,
  emptyIcon,
  emptyAction,
  searchKey,
  searchPlaceholder = "Search...",
  onRowClick,
  className,
  onReload,
  isReloading = false,
  filterContent,
  onFilterClick,
  isFiltered = false,
  enableColumnVisibility = true,
  columnLabels,
  toolbarActions,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });
  const isEmpty = !isLoading && table.getRowModel().rows.length === 0;

  return (
    <div
      className={cn("flex min-h-0 w-full flex-1 flex-col space-y-3", className)}
    >
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {filterContent ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 gap-2 rounded-lg px-2.5 text-xs text-muted-foreground hover:bg-muted/60",
                      isFiltered && "bg-primary/10 text-primary",
                    )}
                  >
                    <Funnel />
                    <span>Filter</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="w-64 p-3">
                {filterContent}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {!filterContent && onFilterClick ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 rounded-lg px-2.5 text-xs text-muted-foreground"
              onClick={onFilterClick}
            >
              <Funnel />
              <span>Filter</span>
            </Button>
          ) : null}
          {searchKey ? (
            <div className="relative w-full max-w-xs">
              <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 rounded-lg pl-8 text-xs"
                placeholder={searchPlaceholder}
                value={
                  (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
              />
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {onReload ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-lg text-muted-foreground"
              onClick={onReload}
              disabled={isLoading || isReloading}
              aria-label="Reload"
            >
              <RefreshCw
                className={cn(
                  "size-3.5",
                  (isLoading || isReloading) && "animate-spin",
                )}
              />
            </Button>
          ) : null}
          {enableColumnVisibility ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 rounded-lg px-2.5 text-xs text-muted-foreground"
                  >
                    <Settings2 />
                    <span>Settings</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(checked)
                        }
                      >
                        {columnLabels?.[column.id] ?? column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {toolbarActions}
        </div>
      </div>
      <div className="overflow-y-auto border-y [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
        {isEmpty ? (
          <div className="flex min-h-[300px] flex-col">
            <Table>
              <TableHeader>
                <HeaderRows table={table} />
              </TableHeader>
            </Table>
            <DataTableEmptyState
              icon={emptyIcon}
              heading={emptyHeading}
              description={emptyDescription}
              action={emptyAction}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <HeaderRows table={table} />
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => onRowClick?.(row.original)}
                      className={cn(onRowClick && "cursor-pointer")}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        )}
      </div>
      {!isLoading && table.getFilteredRowModel().rows.length > 0 ? (
        <DataTablePagination table={table} className="shrink-0 pt-1" />
      ) : null}
    </div>
  );
}

function HeaderRows<TData extends RowData>({
  table,
}: {
  table: ReturnType<typeof useTable<DataTableFeatures, TData>>;
}) {
  return (
    <>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder ? null : (
                <table.FlexRender header={header} />
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </>
  );
}
