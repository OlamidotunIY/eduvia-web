import { useMemo, useState } from "react";
import { RotateCw, ShieldCheck } from "lucide-react";
import { DataTable } from "@/shared/composites/data-table";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { OrganizationRoleDefinition } from "@/shared/domain";
import { createRoleColumns, roleColumnLabels } from "./role-columns";

interface RolesTableProps {
  roles: OrganizationRoleDefinition[];
  selectedRoleId?: string | null;
  isLoading?: boolean;
  isReloading?: boolean;
  onReload?: () => void;
  onSelectRole: (role: OrganizationRoleDefinition) => void;
  canManage?: boolean;
}

export function RolesTable({
  roles,
  selectedRoleId,
  isLoading,
  isReloading,
  onReload,
  onSelectRole,
  canManage = true,
}: RolesTableProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "system" | "custom">("all");

  const columns = useMemo(
    () =>
      createRoleColumns({
        onOpenEdit: onSelectRole,
        canManage,
      }),
    [onSelectRole, canManage],
  );

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      if (typeFilter === "system" && !role.isSystem) return false;
      if (typeFilter === "custom" && role.isSystem) return false;
      return true;
    });
  }, [roles, typeFilter]);

  const isFiltered = typeFilter !== "all";

  const filterSlot = (
    <div className="flex items-center gap-2">
      <Select
        value={typeFilter}
        onValueChange={(val) => setTypeFilter((val as "all" | "system" | "custom") ?? "all")}
      >
        <SelectTrigger size="sm" className="h-8 min-w-36 rounded-lg text-xs">
          <SelectValue>
            {typeFilter === "all"
              ? "All role types"
              : typeFilter === "system"
                ? "System roles"
                : "Custom roles"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">All role types</SelectItem>
          <SelectItem value="system">System roles</SelectItem>
          <SelectItem value="custom">Custom roles</SelectItem>
        </SelectContent>
      </Select>

      {onReload && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReload}
          disabled={isReloading}
          className="h-8 gap-1.5 rounded-lg text-xs border-border/70 text-muted-foreground hover:text-foreground"
        >
          <RotateCw className={`size-3.5 ${isReloading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      )}
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={filteredRoles}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      filterSlot={filterSlot}
      isFiltered={isFiltered}
      searchKey="name"
      searchPlaceholder="Search roles by name or description..."
      onRowClick={onSelectRole}
      getRowClassName={(role) =>
        role.id === selectedRoleId
          ? "bg-emerald-500/5 ring-1 ring-emerald-500/30"
          : undefined
      }
      columnLabels={roleColumnLabels}
      emptyIcon={ShieldCheck}
      emptyHeading="No roles found"
      emptyDescription="No organization roles match the selected filter."
    />
  );
}
