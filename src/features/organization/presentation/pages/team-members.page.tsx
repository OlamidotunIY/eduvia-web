import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  PauseCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { sessionStore } from "@/shared/store";
import {
  useChangeMemberRoleMutation,
  useInviteMemberMutation,
  useOrganizationMembersQuery,
  useSuspendMemberMutation,
} from "../../application";
import type {
  OrganizationMemberRecord,
  SendInvitationInput,
} from "../../domain";
import {
  ChangeRoleDialog,
  InviteMemberDialog,
  SuspendMemberDialog,
} from "../components";

function formatRoleName(role: string): string {
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

function formatJoinedDate(dateStr?: string | Date): string {
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

function getInitials(name?: string, email?: string): string {
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

export function TeamMembersPage() {
  const currentUserBootstrap = sessionStore((state) => state.currentUser);
  const currentUser = currentUserBootstrap?.user;
  const organizationId = currentUserBootstrap?.activeOrganization?.id;
  const permissions = currentUserBootstrap?.activeOrganization?.permissions ?? [];

  const canInvite = permissions.includes("members:invite");
  const canManage = permissions.includes("members:manage");

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Dialogs state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [roleTargetMember, setRoleTargetMember] =
    useState<OrganizationMemberRecord | null>(null);
  const [suspendTargetMember, setSuspendTargetMember] =
    useState<OrganizationMemberRecord | null>(null);

  // Queries
  const membersQuery = useOrganizationMembersQuery(organizationId);
  const inviteMutation = useInviteMemberMutation(organizationId);
  const changeRoleMutation = useChangeMemberRoleMutation(organizationId);
  const suspendMutation = useSuspendMemberMutation(organizationId);

  const rawMembers = membersQuery.data ?? [];

  // Enriched members with current user fallback if applicable
  const enrichedMembers = useMemo(() => {
    return rawMembers.map((m) => {
      if (!m.user && currentUser && m.userId === currentUser.id) {
        return {
          ...m,
          user: {
            id: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            image: currentUser.image,
            status: "active",
          },
        };
      }
      return m;
    });
  }, [rawMembers, currentUser]);

  // Metric counts
  const totalCount = enrichedMembers.length;
  const activeCount = enrichedMembers.filter(
    (m) => m.status === "active",
  ).length;
  const suspendedCount = enrichedMembers.filter(
    (m) => m.status === "suspended",
  ).length;

  // Filtered members
  const filteredMembers = useMemo(() => {
    return enrichedMembers.filter((m) => {
      // Status filter
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false;
      }

      // Role filter
      if (roleFilter !== "all") {
        const formatted = formatRoleName(m.role).toLowerCase();
        if (formatted !== roleFilter.toLowerCase()) {
          return false;
        }
      }

      // Search filter (name or email)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const fullName = `${m.user?.firstName ?? ""} ${m.user?.lastName ?? ""}`.toLowerCase();
        const email = (m.user?.email ?? "").toLowerCase();
        const userId = m.userId.toLowerCase();
        if (
          !fullName.includes(query) &&
          !email.includes(query) &&
          !userId.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedMembers, statusFilter, roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = useMemo(() => {
    const start = page * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, page, pageSize]);

  // Handlers
  const handleInviteSubmit = (input: SendInvitationInput) => {
    inviteMutation.mutate(input, {
      onSuccess: () => {
        setIsInviteOpen(false);
      },
    });
  };

  const handleChangeRoleSubmit = (newRole: string) => {
    if (!roleTargetMember) return;
    changeRoleMutation.mutate(
      {
        userId: roleTargetMember.userId,
        input: { role: newRole },
      },
      {
        onSuccess: () => {
          setRoleTargetMember(null);
        },
      },
    );
  };

  const handleSuspendConfirm = () => {
    if (!suspendTargetMember) return;
    suspendMutation.mutate(suspendTargetMember.userId, {
      onSuccess: () => {
        setSuspendTargetMember(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
          <UsersRound className="size-3.5" />
          <span>Organization</span>
          <span>/</span>
          <span className="text-foreground">Team & Members</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Team & Members
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage people in your organization. Invite members, assign roles, and oversee access.
            </p>
          </div>

          <Button
            onClick={() => setIsInviteOpen(true)}
            disabled={!canInvite && permissions.length > 0}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-xs gap-1.5 self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>Invite member</span>
          </Button>
        </div>
      </div>

      {/* Top 3 Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total members */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="size-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total members</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {membersQuery.isLoading ? <Skeleton className="h-7 w-12" /> : totalCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Active members */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="size-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="size-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active members</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {membersQuery.isLoading ? <Skeleton className="h-7 w-12" /> : activeCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Suspended members */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="size-11 rounded-lg bg-muted/60 border border-border/50 text-muted-foreground flex items-center justify-center shrink-0">
              <PauseCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Suspended members</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {membersQuery.isLoading ? <Skeleton className="h-7 w-12" /> : suspendedCount}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9 bg-background/50 border-border/70 h-9 text-xs"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val ?? "all");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs bg-background/50 border-border/70">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val ?? "all");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[150px] h-9 text-xs bg-background/50 border-border/70">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="lead teacher">Lead teacher</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="teaching assistant">Teaching assistant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Refresh Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => membersQuery.refetch()}
          disabled={membersQuery.isFetching}
          className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0 self-end sm:self-auto"
        >
          <RefreshCw
            className={`size-3.5 ${membersQuery.isFetching ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-[35%] text-xs font-semibold text-muted-foreground pl-6">
                Member
              </TableHead>
              <TableHead className="w-[20%] text-xs font-semibold text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="w-[20%] text-xs font-semibold text-muted-foreground">
                Joined
              </TableHead>
              <TableHead className="w-[15%] text-xs font-semibold text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-[10%] text-xs font-semibold text-muted-foreground text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membersQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow
                  key={idx}
                  className="border-border/60 hover:bg-transparent"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedMembers.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-12">
                  <Empty>
                    <EmptyMedia>
                      <Users className="size-10 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyHeader>
                      <EmptyTitle>No members found</EmptyTitle>
                      <EmptyDescription>
                        {search || statusFilter !== "all" || roleFilter !== "all"
                          ? "No organization members matched your current filters. Try resetting them."
                          : "Invite educators and staff to begin collaborating in your organization."}
                      </EmptyDescription>
                    </EmptyHeader>
                    {!search && statusFilter === "all" && roleFilter === "all" && (
                      <Button
                        size="sm"
                        onClick={() => setIsInviteOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white mt-4"
                      >
                        <UserPlus className="size-4 mr-1.5" />
                        Invite first member
                      </Button>
                    )}
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map((member) => {
                const displayName =
                  member.user?.firstName && member.user?.lastName
                    ? `${member.user.firstName} ${member.user.lastName}`
                    : member.user?.email || `Member ${member.userId.slice(0, 8)}`;
                const displayEmail = member.user?.email || "No email available";
                const initials = getInitials(displayName, member.user?.email);
                const isSuspended = member.status === "suspended";

                return (
                  <TableRow
                    key={member.id}
                    className="border-border/60 hover:bg-transparent transition-none"
                  >
                    {/* Member Column */}
                    <TableCell className="pl-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {member.user?.image ? (
                          <img
                            src={member.user.image}
                            alt={displayName}
                            className="size-10 rounded-full object-cover border border-border/70"
                          />
                        ) : (
                          <div className="size-10 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-semibold shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {displayName}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {displayEmail}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role Column */}
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs font-medium text-foreground">
                        {formatRoleName(member.role)}
                      </span>
                    </TableCell>

                    {/* Joined Column */}
                    <TableCell className="text-xs text-muted-foreground">
                      {formatJoinedDate(member.joinedAt)}
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-muted-foreground" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      )}
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="size-8 text-muted-foreground hover:text-foreground"
                              aria-label="Member actions"
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-popover border-border">
                          <DropdownMenuItem
                            onClick={() => setRoleTargetMember(member)}
                            disabled={!canManage && permissions.length > 0}
                          >
                            <ShieldAlert className="size-3.5 mr-2 text-muted-foreground" />
                            <span>Change role</span>
                          </DropdownMenuItem>

                          {!isSuspended ? (
                            <DropdownMenuItem
                              onClick={() => setSuspendTargetMember(member)}
                              disabled={
                                (!canManage && permissions.length > 0) ||
                                member.role === "OrgOwner" ||
                                member.userId === currentUser?.id
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <PauseCircle className="size-3.5 mr-2" />
                              <span>Suspend member</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                changeRoleMutation.mutate({
                                  userId: member.userId,
                                  input: { role: member.role },
                                });
                              }}
                              disabled={!canManage && permissions.length > 0}
                              className="text-emerald-400 focus:text-emerald-400"
                            >
                              <UserCheck className="size-3.5 mr-2" />
                              <span>Activate member</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border/60 px-6 py-3.5 text-xs text-muted-foreground">
          <span>{filteredMembers.length} total member(s)</span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-xs"
              className="size-7"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="px-1 text-xs font-medium text-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-xs"
              className="size-7"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <InviteMemberDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        isSubmitting={inviteMutation.isPending}
        onSubmit={handleInviteSubmit}
      />

      <ChangeRoleDialog
        open={Boolean(roleTargetMember)}
        onOpenChange={(open) => !open && setRoleTargetMember(null)}
        member={roleTargetMember}
        isSubmitting={changeRoleMutation.isPending}
        onSubmit={handleChangeRoleSubmit}
      />

      <SuspendMemberDialog
        open={Boolean(suspendTargetMember)}
        onOpenChange={(open) => !open && setSuspendTargetMember(null)}
        member={suspendTargetMember}
        isSubmitting={suspendMutation.isPending}
        onConfirm={handleSuspendConfirm}
      />
    </div>
  );
}

