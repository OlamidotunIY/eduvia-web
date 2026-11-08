import type { ColumnDef } from "@tanstack/react-table";
import {
  Crown,
  Eye,
  GraduationCap,
  Layers,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { OrganizationRoleDefinition } from "@/shared/domain";
import type { DataTableFeatures } from "@/shared/composites/data-table/data-table-features";

interface CreateRoleColumnsOptions {
  onOpenEdit: (role: OrganizationRoleDefinition) => void;
  canManage?: boolean;
}

function getRoleIcon(role: OrganizationRoleDefinition) {
  const key = (role.key ?? "").toLowerCase();
  const name = role.name.toLowerCase();

  if (key.includes("owner") || name.includes("owner")) {
    return Crown;
  }
  if (key.includes("admin") || name.includes("admin")) {
    return UsersRound;
  }
  if (key.includes("lead") || name.includes("lead")) {
    return GraduationCap;
  }
  if (key.includes("coordinator") || name.includes("coordinator")) {
    return Layers;
  }
  if (key.includes("assistant") || name.includes("assistant")) {
    return Users;
  }
  if (key.includes("teacher") || name.includes("teacher")) {
    return UserCheck;
  }
  return ShieldCheck;
}

export function createRoleColumns({
  onOpenEdit,
  canManage = true,
}: CreateRoleColumnsOptions): ColumnDef<
  DataTableFeatures,
  OrganizationRoleDefinition
>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "Role",
      enableSorting: true,
      cell: ({ row }) => {
        const role = row.original;
        const IconComponent = getRoleIcon(role);

        return (
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <IconComponent className="size-4" />
            </div>
            <span className="font-medium text-foreground text-sm truncate">
              {role.name}
            </span>
          </div>
        );
      },
    },
    {
      id: "type",
      accessorKey: "isSystem",
      header: "Type",
      cell: ({ row }) => {
        const role = row.original;
        if (role.isSystem) {
          return (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-medium px-2.5 py-0.5 rounded-full"
            >
              System
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="bg-muted/80 text-muted-foreground border-border/70 text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            Custom
          </Badge>
        );
      },
    },
    {
      id: "permissions",
      accessorFn: (row) => row.permissions.length,
      header: "Permissions",
      cell: ({ row }) => {
        const count = row.original.permissions.length;
        return (
          <span className="text-xs text-foreground font-normal">
            {count} {count === 1 ? "permission" : "permissions"}
          </span>
        );
      },
    },
    {
      id: "members",
      accessorKey: "membersCount",
      header: "Members",
      cell: ({ row }) => {
        const count = row.original.membersCount;
        return (
          <div className="flex items-center gap-1.5 text-xs text-foreground font-normal">
            <User className="size-3.5 text-muted-foreground" />
            <span>{count}</span>
          </div>
        );
      },
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.original.description;
        return (
          <p
            className="text-xs text-muted-foreground max-w-sm truncate"
            title={description ?? ""}
          >
            {description || "No description provided."}
          </p>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const role = row.original;

        return (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => onOpenEdit(role)}
              title="View permissions"
            >
              <Eye className="size-3.5" />
            </Button>

            {canManage && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-7 rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => onOpenEdit(role)}
                title="Edit role"
              >
                <Pencil className="size-3.5" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7 rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44 bg-popover border-border">
                <DropdownMenuItem
                  onClick={() => onOpenEdit(role)}
                  className="text-xs cursor-pointer"
                >
                  Edit permissions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

export const roleColumnLabels: Record<string, string> = {
  name: "Role",
  type: "Type",
  permissions: "Permissions",
  members: "Members",
  description: "Description",
  actions: "Actions",
};
