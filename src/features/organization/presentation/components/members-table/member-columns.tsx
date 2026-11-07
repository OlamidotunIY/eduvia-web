import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, PauseCircle, ShieldAlert, UserCheck } from "lucide-react";
import type { OrganizationMemberRecord } from "@/shared/domain";
import type { DataTableFeatures } from "@/shared/composites/data-table";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

const columnHelper = createColumnHelper<DataTableFeatures, OrganizationMemberRecord>();

export const memberColumnLabels: Record<string, string> = {
  member: "Member",
  role: "Role",
  joined: "Joined",
  status: "Status",
  actions: "Actions",
};

export function formatRoleName(role: string): string {
  switch (role) {
    case "OrgOwner":
    case "owner":
      return "Owner";
    case "OrgAdmin":
    case "admin":
      return "Admin";
    case "LeadTeacher":
    case "lead_teacher":
      return "Lead teacher";
    case "Teacher":
    case "teacher":
      return "Teacher";
    case "TeachingAssistant":
    case "teaching_assistant":
      return "Teaching assistant";
    default:
      return role.replace(/([A-Z])/g, " $1").trim();
  }
}

export function formatJoinedDate(dateStr?: string | Date): string {
  if (!dateStr) return "Oct 14, 2026";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "MB";
}

interface MemberColumnsOptions {
  onOpenRoleDialog: (member: OrganizationMemberRecord) => void;
  onOpenSuspendDialog: (member: OrganizationMemberRecord) => void;
  onActivateMember: (member: OrganizationMemberRecord) => void;
  canManage: boolean;
  currentUserId?: string;
}

export function createMemberColumns({
  onOpenRoleDialog,
  onOpenSuspendDialog,
  onActivateMember,
  canManage,
  currentUserId,
}: MemberColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor(
      (row) =>
        `${row.fullName ?? ""} ${row.firstName ?? ""} ${row.lastName ?? ""} ${row.email ?? ""} ${row.user?.fullName ?? ""} ${row.user?.firstName ?? ""} ${row.user?.lastName ?? ""} ${row.user?.email ?? ""} ${row.userId}`,
      {
        id: "member",
        header: "Member",
        enableHiding: false,
        cell: ({ row }) => {
          const member = row.original;
          const displayName =
            member.fullName ||
            (member.firstName && member.lastName
              ? `${member.firstName} ${member.lastName}`
              : null) ||
            member.user?.fullName ||
            (member.user?.firstName && member.user?.lastName
              ? `${member.user.firstName} ${member.user.lastName}`
              : null) ||
            member.email ||
            member.user?.email ||
            `Member ${member.userId.slice(0, 8)}`;
          const displayEmail =
            member.email || member.user?.email || "No email available";
          const avatarUrl =
            member.avatarUrl ?? member.image ?? member.user?.avatarUrl ?? member.user?.image;
          const initials = getInitials(displayName, displayEmail);

          return (
            <div className="flex items-center gap-3 py-1">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="size-9 rounded-full object-cover border border-border/70 shrink-0"
                />
              ) : (
                <div className="size-9 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {displayName}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {displayEmail}
                </span>
              </div>
            </div>
          );
        },
      },
    ),
    columnHelper.accessor("role", {
      id: "role",
      header: "Role",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-foreground">
          {formatRoleName(getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("joinedAt", {
      id: "joined",
      header: "Joined",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {formatJoinedDate(getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const isSuspended = getValue() === "suspended";
        return isSuspended ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground shrink-0" />
            Suspended
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
            Active
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right pr-2">Actions</div>,
      cell: ({ row }) => {
        const member = row.original;
        const isSuspended = member.status === "suspended";
        const isSelf = member.userId === currentUserId;
        const isOwner = member.role === "OrgOwner" || member.role === "owner";

        return (
          <div className="text-right pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    aria-label="Member actions"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-popover border-border">
                <DropdownMenuItem
                  onClick={() => onOpenRoleDialog(member)}
                  disabled={!canManage}
                >
                  <ShieldAlert className="size-3.5 mr-2 text-muted-foreground" />
                  <span>Change role</span>
                </DropdownMenuItem>

                {!isSuspended ? (
                  <DropdownMenuItem
                    onClick={() => onOpenSuspendDialog(member)}
                    disabled={!canManage || isOwner || isSelf}
                    className="text-destructive focus:text-destructive"
                  >
                    <PauseCircle className="size-3.5 mr-2" />
                    <span>Suspend member</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onActivateMember(member)}
                    disabled={!canManage}
                    className="text-emerald-400 focus:text-emerald-400"
                  >
                    <UserCheck className="size-3.5 mr-2" />
                    <span>Activate member</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ]);
}
