import { useState } from "react";
import { Check, PauseCircle, Plus, UsersRound } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { MainHeaderPortal } from "@/app/shell/main/header";
import { sessionStore } from "@/shared/store";
import {
  useChangeMemberRoleMutation,
  useInviteMemberMutation,
  useOrganizationMembersQuery,
  useSuspendMemberMutation,
} from "../../application";
import type { OrganizationMemberRecord } from "@/shared/domain";
import type { ChangeMemberRoleDto, SendInvitationDto } from "@/shared/api/generated";
import {
  ChangeRoleDialog,
  InviteMemberDialog,
  MembersTable,
  SuspendMemberDialog,
} from "../components";

export function TeamMembersPage() {
  const currentUserBootstrap = sessionStore((state) => state.currentUser);
  const currentUser = currentUserBootstrap?.user;
  const organizationId = currentUserBootstrap?.activeOrganization?.id;
  const permissions = currentUserBootstrap?.activeOrganization?.permissions ?? [];

  const canInvite = permissions.includes("members:invite");
  const canManage = permissions.includes("members:manage");

  // Dialogs state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [roleTargetMember, setRoleTargetMember] =
    useState<OrganizationMemberRecord | null>(null);
  const [suspendTargetMember, setSuspendTargetMember] =
    useState<OrganizationMemberRecord | null>(null);

  // Queries & Mutations
  const membersQuery = useOrganizationMembersQuery(organizationId);
  const inviteMutation = useInviteMemberMutation(organizationId);
  const changeRoleMutation = useChangeMemberRoleMutation(organizationId);
  const suspendMutation = useSuspendMemberMutation(organizationId);

  const members = membersQuery.data ?? [];

  // Metric counts
  const totalCount = members.length;
  const activeCount = members.filter(
    (m) => m.status === "active",
  ).length;
  const suspendedCount = members.filter(
    (m) => m.status === "suspended",
  ).length;

  // Handlers
  const handleInviteSubmit = (input: SendInvitationDto) => {
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
        input: { role: newRole as NonNullable<ChangeMemberRoleDto["role"]> },
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

  const handleActivateMember = (member: OrganizationMemberRecord) => {
    changeRoleMutation.mutate({
      userId: member.userId,
      input: { role: member.role as NonNullable<ChangeMemberRoleDto["role"]> },
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 w-full">
      {/* Portal breadcrumbs into Main Application Header */}
      <MainHeaderPortal>
        <div className="flex items-center gap-2 text-xs font-medium">
          <UsersRound className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Organization</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-medium">Team & Members</span>
        </div>
      </MainHeaderPortal>

      {/* Page Title & Action Bar */}
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
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-xs gap-1.5 h-9 px-4 rounded-lg self-start sm:self-auto text-xs"
        >
          <Plus className="size-4" />
          <span>Invite member</span>
        </Button>
      </div>

      {/* Top 3 Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total members */}
        <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
          <div className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <UsersRound className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-normal text-muted-foreground">Total members</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {membersQuery.isLoading ? <Skeleton className="h-7 w-10" /> : totalCount}
              </h3>
            </div>
          </div>
        </Card>

        {/* Card 2: Active members */}
        <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
          <div className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="size-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-normal text-muted-foreground">Active members</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {membersQuery.isLoading ? <Skeleton className="h-7 w-10" /> : activeCount}
              </h3>
            </div>
          </div>
        </Card>

        {/* Card 3: Suspended members */}
        <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
          <div className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="size-10 rounded-full bg-muted/70 border border-border/60 text-muted-foreground flex items-center justify-center shrink-0">
              <PauseCircle className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-normal text-muted-foreground">Suspended members</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {membersQuery.isLoading ? <Skeleton className="h-7 w-10" /> : suspendedCount}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Members Reusable DataTable */}
      <MembersTable
        members={members}
        isLoading={membersQuery.isLoading}
        isReloading={membersQuery.isFetching && !membersQuery.isLoading}
        onReload={() => void membersQuery.refetch()}
        onOpenRoleDialog={(member) => setRoleTargetMember(member)}
        onOpenSuspendDialog={(member) => setSuspendTargetMember(member)}
        onActivateMember={handleActivateMember}
        canManage={canManage || permissions.length === 0}
        currentUserId={currentUser?.id}
        emptyAction={
          <Button
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white mt-4"
          >
            <Plus className="size-4 mr-1.5" />
            Invite member
          </Button>
        }
      />

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
