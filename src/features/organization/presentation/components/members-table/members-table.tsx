import { useMemo, useState } from "react";
import { UsersRound } from "lucide-react";
import { DataTable } from "@/shared/composites/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { OrganizationMemberRecord } from "@/shared/domain";
import {
  createMemberColumns,
  formatRoleName,
  memberColumnLabels,
} from "./member-columns";

interface MembersTableProps {
  members: OrganizationMemberRecord[];
  isLoading?: boolean;
  isReloading?: boolean;
  onReload?: () => void;
  onOpenRoleDialog: (member: OrganizationMemberRecord) => void;
  onOpenSuspendDialog: (member: OrganizationMemberRecord) => void;
  onActivateMember: (member: OrganizationMemberRecord) => void;
  canManage: boolean;
  currentUserId?: string;
  emptyAction?: React.ReactNode;
}

export function MembersTable({
  members,
  isLoading,
  isReloading,
  onReload,
  onOpenRoleDialog,
  onOpenSuspendDialog,
  onActivateMember,
  canManage,
  currentUserId,
  emptyAction,
}: MembersTableProps) {
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");

  const columns = useMemo(
    () =>
      createMemberColumns({
        onOpenRoleDialog,
        onOpenSuspendDialog,
        onActivateMember,
        canManage,
        currentUserId,
      }),
    [
      onOpenRoleDialog,
      onOpenSuspendDialog,
      onActivateMember,
      canManage,
      currentUserId,
    ],
  );

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (status !== "all" && member.status !== status) {
        return false;
      }
      if (role !== "all") {
        const formatted = formatRoleName(member.role).toLowerCase();
        if (formatted !== formatRoleName(role).toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [members, status, role]);

  const isFiltered = status !== "all" || role !== "all";

  const filterSlot = (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <Select
        value={status}
        onValueChange={(value) => setStatus(value ?? "all")}
      >
        <SelectTrigger size="sm" className="h-8 flex-1 sm:flex-initial min-w-[120px] sm:min-w-32 rounded-lg text-xs">
          <SelectValue>
            {status === "all"
              ? "All statuses"
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select value={role} onValueChange={(value) => setRole(value ?? "all")}>
        <SelectTrigger size="sm" className="h-8 flex-1 sm:flex-initial min-w-[120px] sm:min-w-32 rounded-lg text-xs">
          <SelectValue>
            {role === "all" ? "All roles" : formatRoleName(role)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="OrgOwner">Owner</SelectItem>
          <SelectItem value="OrgAdmin">Admin</SelectItem>
          <SelectItem value="LeadTeacher">Lead teacher</SelectItem>
          <SelectItem value="Teacher">Teacher</SelectItem>
          <SelectItem value="TeachingAssistant">Teaching assistant</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={filteredMembers}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      filterSlot={filterSlot}
      isFiltered={isFiltered}
      searchKey="member"
      searchPlaceholder="Search members by name or email..."
      columnLabels={memberColumnLabels}
      emptyIcon={UsersRound}
      emptyHeading="No members found"
      emptyDescription="Invite members to your organization to get started."
      emptyAction={emptyAction}
    />
  );
}
