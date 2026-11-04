import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Edit3, FolderKanban, Power } from "lucide-react";
import {
  DataTable,
  type DataTableFeatures,
} from "@/shared/composites/data-table";
import type {
  OrganizationSubjectRecord,
  PlatformSubject,
} from "@/shared/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";

const columns = createColumnHelper<
  DataTableFeatures,
  OrganizationSubjectRecord
>();

const columnLabels = {
  name: "Subject",
  source: "Source",
  description: "Description",
  status: "Status",
  createdAt: "Created",
};

interface SubjectsTableProps {
  subjects: OrganizationSubjectRecord[];
  platformSubjects: PlatformSubject[];
  isLoading?: boolean;
  isReloading?: boolean;
  onReload?: () => void;
  onEdit: (subject: OrganizationSubjectRecord) => void;
  onToggleActive: (subject: OrganizationSubjectRecord) => void;
  canUpdate: boolean;
  emptyAction?: React.ReactNode;
}

export function SubjectsTable({
  subjects,
  platformSubjects,
  isLoading,
  isReloading,
  onReload,
  onEdit,
  onToggleActive,
  canUpdate,
  emptyAction,
}: SubjectsTableProps) {
  const [status, setStatus] = useState("all");
  const platformSubjectNames = useMemo(
    () =>
      new Map(platformSubjects.map((subject) => [subject.id, subject.name])),
    [platformSubjects],
  );
  const tableColumns = useMemo(
    () =>
      createSubjectColumns({
        platformSubjectNames,
        onEdit,
        onToggleActive,
        canUpdate,
      }),
    [canUpdate, onEdit, onToggleActive, platformSubjectNames],
  );
  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          status === "all" || (status === "active") === subject.isActive,
      ),
    [status, subjects],
  );
  const isFiltered = status !== "all";

  return (
    <DataTable
      columns={tableColumns}
      data={filteredSubjects}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      filterContent={
        <StatusFilter status={status} onStatusChange={setStatus} />
      }
      isFiltered={isFiltered}
      searchKey="name"
      searchPlaceholder="Search subjects..."
      columnLabels={columnLabels}
      emptyIcon={FolderKanban}
      emptyHeading="No subjects yet"
      emptyDescription="Add a subject from the Eduvia catalog or create one for your organization."
      emptyAction={emptyAction}
    />
  );
}

function createSubjectColumns({
  platformSubjectNames,
  onEdit,
  onToggleActive,
  canUpdate,
}: {
  platformSubjectNames: Map<string, string>;
  onEdit: (subject: OrganizationSubjectRecord) => void;
  onToggleActive: (subject: OrganizationSubjectRecord) => void;
  canUpdate: boolean;
}) {
  return columns.columns([
    columns.accessor("name", {
      id: "name",
      header: "Subject",
      enableHiding: false,
      cell: ({ row }) => (
        <span className="text-xs font-semibold">{row.original.name}</span>
      ),
    }),
    columns.accessor("platformSubjectId", {
      id: "source",
      header: "Source",
      cell: ({ getValue }) => {
        const name = getValue() ? platformSubjectNames.get(getValue()!) : null;
        return name ? (
          <Badge variant="outline" className="text-[11px]">
            Eduvia · {name}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">
            Organization custom
          </span>
        );
      },
    }),
    columns.accessor("description", {
      id: "description",
      header: "Description",
      cell: ({ getValue }) => (
        <span className="block max-w-80 truncate text-xs text-muted-foreground">
          {getValue() || "—"}
        </span>
      ),
    }),
    columns.accessor("isActive", {
      id: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <Badge
          variant="outline"
          className={
            getValue()
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-muted-foreground/20 bg-muted text-muted-foreground"
          }
        >
          {getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
    }),
    columns.accessor("createdAt", {
      id: "createdAt",
      header: "Created",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(getValue()))}
        </span>
      ),
    }),
    columns.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableHiding: false,
      cell: ({ row }) =>
        canUpdate ? (
          <div className="flex justify-end gap-1">
            <IconAction
              label="Edit subject"
              onClick={() => onEdit(row.original)}
            >
              <Edit3 />
            </IconAction>
            <IconAction
              label={
                row.original.isActive
                  ? "Deactivate subject"
                  : "Reactivate subject"
              }
              onClick={() => onToggleActive(row.original)}
            >
              <Power />
            </IconAction>
          </div>
        ) : null,
    }),
  ]);
}

function StatusFilter({
  status,
  onStatusChange,
}: {
  status: string;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <DropdownMenuGroup>
        <DropdownMenuLabel>Subject status</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={onStatusChange}>
          <DropdownMenuRadioItem value="all">
            All subjects
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="inactive">
            Inactive
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>
      {status !== "all" ? (
        <>
          <DropdownMenuSeparator />
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1.5 text-left text-xs font-medium text-destructive hover:bg-destructive/10"
            onClick={() => onStatusChange("all")}
          >
            Clear filter
          </button>
        </>
      ) : null}
    </div>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
