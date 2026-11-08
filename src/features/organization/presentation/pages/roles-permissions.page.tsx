import { useState } from "react";
import { Info, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { MainHeaderPortal } from "@/app/shell/main/header";
import { sessionStore } from "@/shared/store";
import {
  useCreateRoleMutation,
  useOrganizationPermissionsQuery,
  useOrganizationRolesQuery,
  useUpdateRoleMutation,
} from "../../application";
import type { OrganizationRoleDefinition } from "@/shared/domain";
import type {
  CreateOrganizationRoleDto,
  UpdateOrganizationRoleDto,
} from "@/shared/api/generated";
import {
  RoleDrawer,
  RolesMetrics,
  RolesTable,
} from "../components";

export function RolesPermissionsPage() {
  const currentUserBootstrap = sessionStore((state) => state.currentUser);
  const organizationId = currentUserBootstrap?.activeOrganization?.id;
  const userPermissions = currentUserBootstrap?.activeOrganization?.permissions ?? [];

  const canManage = userPermissions.includes("roles:manage");

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<OrganizationRoleDefinition | null>(null);

  // Queries & Mutations
  const rolesQuery = useOrganizationRolesQuery(organizationId);
  const permissionsQuery = useOrganizationPermissionsQuery(organizationId);
  const createRoleMutation = useCreateRoleMutation(organizationId);
  const updateRoleMutation = useUpdateRoleMutation(organizationId);

  const roles = rolesQuery.data ?? [];
  const permissionsCatalog = permissionsQuery.data ?? [];

  // Handlers
  const handleOpenCreate = () => {
    setSelectedRole(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (role: OrganizationRoleDefinition) => {
    setSelectedRole(role);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRole(null);
  };

  const handleSaveRole = ({
    roleId,
    dto,
  }: {
    roleId?: string;
    dto: CreateOrganizationRoleDto | UpdateOrganizationRoleDto;
  }) => {
    if (roleId) {
      updateRoleMutation.mutate(
        {
          roleId,
          input: dto as UpdateOrganizationRoleDto,
        },
        {
          onSuccess: () => {
            handleCloseDrawer();
          },
        },
      );
    } else {
      createRoleMutation.mutate(dto as CreateOrganizationRoleDto, {
        onSuccess: () => {
          handleCloseDrawer();
        },
      });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 w-full">
      {/* Portal breadcrumbs into Main Application Header */}
      <MainHeaderPortal>
        <div className="flex items-center gap-2 text-xs font-medium">
          <ShieldCheck className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Organization</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-medium">Roles & Permissions</span>
        </div>
      </MainHeaderPortal>

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Roles & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Define roles and control what members can do across your organization.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          disabled={!canManage && userPermissions.length > 0}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-xs gap-1.5 h-9 px-4 rounded-lg self-start sm:self-auto text-xs"
        >
          <Plus className="size-4" />
          <span>Create custom role</span>
        </Button>
      </div>

      {/* Top 3 Summary Metric Cards */}
      <RolesMetrics roles={roles} isLoading={rolesQuery.isLoading} />

      {/* Roles Reusable DataTable */}
      <div className="space-y-4">
        <RolesTable
          roles={roles}
          selectedRoleId={selectedRole?.id}
          isLoading={rolesQuery.isLoading}
          isReloading={rolesQuery.isRefetching}
          onReload={() => rolesQuery.refetch()}
          onSelectRole={handleOpenEdit}
          canManage={canManage}
        />

        {/* Informational Hint footer */}
        {!isDrawerOpen && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Info className="size-4 text-muted-foreground shrink-0" />
            <span>Select a role to review or update its permissions.</span>
          </div>
        )}
      </div>

      {/* Side Drawable Component */}
      <RoleDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        role={selectedRole}
        permissionsCatalog={permissionsCatalog}
        onSaveRole={handleSaveRole}
        isSaving={createRoleMutation.isPending || updateRoleMutation.isPending}
      />
    </div>
  );
}
