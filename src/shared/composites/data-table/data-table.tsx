import * as React from "react";
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Funnel,
  RefreshCw,
  Search,
  Settings2,
} from "lucide-react";
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
  filterSlot?: React.ReactNode;
  enableColumnVisibility?: boolean;
  columnLabels?: Record<string, string>;
  toolbarActions?: React.ReactNode;
  getRowClassName?: (row: TData) => string | undefined;
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
  getRowClassName,
  className,
  onReload,
  isReloading = false,
  filterContent,
  onFilterClick,
  isFiltered = false,
  filterSlot,
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

  const filterButtonElement = filterContent ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:bg-muted/60 border border-border/60 sm:border-0",
              isFiltered && "bg-primary/10 text-primary border-primary/30",
            )}
          >
            <Funnel className="size-3 shrink-0" />
            <span>Filter</span>
            <ChevronDown className="size-3 shrink-0 opacity-70" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64 p-3">
        {filterContent}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : onFilterClick ? (
    <Button
      variant="ghost"
      size="sm"
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground border border-border/60 sm:border-0"
      onClick={onFilterClick}
    >
      <Funnel className="size-3 shrink-0" />
      <span>Filter</span>
      <ChevronDown className="size-3 shrink-0 opacity-70" />
    </Button>
  ) : null;

  const searchInputElement = searchKey ? (
    <div className="relative min-w-[140px] flex-1 sm:w-64 sm:max-w-xs sm:flex-initial">
      <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-8 rounded-lg pl-8 text-xs w-full"
        placeholder={searchPlaceholder}
        value={
          (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
        }
        onChange={(event) =>
          table.getColumn(searchKey)?.setFilterValue(event.target.value)
        }
      />
    </div>
  ) : null;

  const actionsElement = (
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
  );

  return (
    <div
      className={cn("flex min-h-0 w-full flex-1 flex-col space-y-3", className)}
    >
      {/* Desktop Toolbar (sm and up) */}
      <div className="hidden sm:flex shrink-0 items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {filterButtonElement}
          {searchInputElement}
          {filterSlot}
        </div>
        {actionsElement}
      </div>

      {/* Mobile Toolbar (below sm) */}
      <div className="flex sm:hidden flex-col gap-2 w-full shrink-0">
        {/* Row 1: Search + Actions */}
        <div className="flex items-center gap-2 w-full">
          {searchInputElement}
          <div className="ml-auto shrink-0">{actionsElement}</div>
        </div>

        {/* Row 2: Scrollable Filter strip */}
        {(filterButtonElement || filterSlot) ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full flex-nowrap py-0.5">
            {filterButtonElement}
            {filterSlot}
          </div>
        ) : null}
      </div>
      <div className="border-b border-border/80">
        {isEmpty ? (
          <div className="flex min-h-[300px] flex-col overflow-hidden">
            <Table>
              <TableHeader className="[&_th]:px-4 [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg [&_tr]:border-0 [&_tr]:bg-muted/50 [&_tr]:hover:bg-muted/50">
                <HeaderRows table={table} />
              </TableHeader>
            </Table>
            <DataTableEmptyState
              icon={emptyIcon}
              heading={emptyHeading}
              description={emptyDescription}
              action={emptyAction}
              className="bg-transparent hover:bg-transparent"
            />
          </div>
        ) : (
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="[&_th]:px-4 [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg [&_tr]:border-0 [&_tr]:bg-muted/50 [&_tr]:hover:bg-muted/50">
                <HeaderRows table={table} />
              </TableHeader>
              <TableBody className="[&_td]:px-4 [&_td]:py-3 [&_tr]:hover:bg-transparent">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-transparent">
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
                        className={cn(
                          "hover:bg-transparent",
                          onRowClick && "cursor-pointer",
                          getRowClassName?.(row.original),
                        )}
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
          </div>
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
