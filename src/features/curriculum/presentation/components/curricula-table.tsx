import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { BookOpen, Eye } from "lucide-react";
import {
  DataTable,
  type DataTableFeatures,
} from "@/shared/composites/data-table";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import { CountryFlag, getCountryName } from "@/shared/ui/country-flag";
import type { CurriculumProfileSummary } from "@/shared/domain";

const columnHelper = createColumnHelper<
  DataTableFeatures,
  CurriculumProfileSummary
>();

const columnLabels: Record<string, string> = {
  name: "Curriculum",
  countryCode: "Country",
  authority: "Authority",
  version: "Version",
  isActive: "Status",
};

interface CurriculaTableProps {
  curricula: CurriculumProfileSummary[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onViewCurriculum: (curriculum: CurriculumProfileSummary) => void;
}

export function CurriculaTable({
  curricula,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onViewCurriculum,
}: CurriculaTableProps) {
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Extract unique countries dynamically from data
  const availableCountries = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    for (const c of curricula) {
      const code = (c.countryCode || "INT").toUpperCase();
      if (!map.has(code)) {
        map.set(code, { code, name: getCountryName(code) });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [curricula]);

  // Filter curricula
  const filteredCurricula = useMemo(() => {
    return curricula.filter((c) => {
      // Country filter
      if (selectedCountry !== "ALL") {
        if ((c.countryCode || "").toUpperCase() !== selectedCountry.toUpperCase()) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus === "ACTIVE" && !c.isActive) return false;
      if (selectedStatus === "INACTIVE" && c.isActive) return false;

      return true;
    });
  }, [curricula, selectedCountry, selectedStatus]);

  const isFiltered = selectedCountry !== "ALL" || selectedStatus !== "ALL";

  // Table Columns Definition
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Curriculum",
        cell: ({ row }) => (
          <div className="py-0.5">
            <div className="font-medium text-foreground text-sm">
              {row.original.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.shortCode}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("countryCode", {
        header: "Country",
        cell: ({ row }) => {
          const code = row.original.countryCode;
          const name = getCountryName(code);
          return (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CountryFlag code={code} name={name} />
              <span>{name}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("authority", {
        header: "Authority",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground truncate max-w-xs block">
            {row.original.authority || "—"}
          </span>
        ),
      }),
      columnHelper.accessor("version", {
        header: "Version",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.version || "—"}
          </span>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: ({ row }) =>
          row.original.isActive ? (
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-0.5 text-xs font-medium text-emerald-400">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-zinc-500/40 bg-zinc-500/10 px-3 py-0.5 text-xs font-medium text-zinc-400">
              Inactive
            </span>
          ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => onViewCurriculum(row.original)}
              title="View curriculum standards"
            >
              <Eye className="size-4" />
              <span className="sr-only">View</span>
            </Button>

          </div>
        ),
      }),
    ],
    [onViewCurriculum],
  );

  // Filter content for the Filter popover
  const filterContent = (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Country
        </div>
        <DropdownMenuRadioGroup
          value={selectedCountry}
          onValueChange={(val) => setSelectedCountry(val ?? "ALL")}
        >
          <DropdownMenuRadioItem value="ALL">All countries</DropdownMenuRadioItem>
          {availableCountries.map((c) => (
            <DropdownMenuRadioItem key={c.code} value={c.code}>
              <div className="flex items-center gap-2">
                <CountryFlag code={c.code} />
                <span>{c.name}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </div>

      <DropdownMenuSeparator />

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Status
        </div>
        <DropdownMenuRadioGroup
          value={selectedStatus}
          onValueChange={(val) => setSelectedStatus(val ?? "ALL")}
        >
          <DropdownMenuRadioItem value="ALL">All statuses</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ACTIVE">Active</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="INACTIVE">Inactive</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </div>

      {isFiltered && (
        <>
          <DropdownMenuSeparator />
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1.5 text-left text-xs font-medium text-destructive hover:bg-destructive/10"
            onClick={() => {
              setSelectedCountry("ALL");
              setSelectedStatus("ALL");
            }}
          >
            Clear filters
          </button>
        </>
      )}
    </div>
  );

  // Filter slot with shadcn Select components
  const filterSlot = (
    <div className="flex items-center gap-2">
      <Select
        value={selectedCountry}
        onValueChange={(val) => setSelectedCountry(val ?? "ALL")}
      >
        <SelectTrigger size="sm" className="h-8 min-w-36 text-xs border-border/70">
          <span className="flex items-center gap-1.5">
            {selectedCountry === "ALL" ? (
              "All countries"
            ) : (
              <>
                <CountryFlag code={selectedCountry} />
                <span>{getCountryName(selectedCountry)}</span>
              </>
            )}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All countries</SelectItem>
          {availableCountries.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <div className="flex items-center gap-2">
                <CountryFlag code={c.code} />
                <span>{c.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedStatus}
        onValueChange={(val) => setSelectedStatus(val ?? "ALL")}
      >
        <SelectTrigger size="sm" className="h-8 min-w-32 text-xs border-border/70">
          <span>
            {selectedStatus === "ALL"
              ? "All statuses"
              : selectedStatus === "ACTIVE"
                ? "Active"
                : "Inactive"}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          All curricula
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          A library of recognized curricula used for teaching and learning.
        </p>
      </div>

      {/* Reusable DataTable component */}
      <DataTable
        columns={columns}
        data={filteredCurricula}
        isLoading={isLoading}
        isReloading={isRefreshing}
        onReload={onRefresh}
        onRowClick={onViewCurriculum}
        searchKey="name"
        searchPlaceholder="Search curricula..."
        filterContent={filterContent}
        filterSlot={filterSlot}
        isFiltered={isFiltered}
        columnLabels={columnLabels}
        emptyIcon={BookOpen}
        emptyHeading="No recognized curricula found"
        emptyDescription="A library of recognized curricula used for teaching and learning."
      />
    </div>
  );
}
