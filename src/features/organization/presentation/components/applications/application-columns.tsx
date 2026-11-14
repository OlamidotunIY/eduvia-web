import { createColumnHelper } from '@tanstack/react-table';
import { Check, Eye, MoreHorizontal, X } from 'lucide-react';
import type { ApplicationUserSummary, TeacherApplicationRecord } from '@/shared/domain';
import type { DataTableFeatures } from '@/shared/composites/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { formatJoinedDate, getInitials } from '../members-table/member-columns';
import { ApplicationStatusBadge } from './application-status-badge';

const columnHelper = createColumnHelper<DataTableFeatures, TeacherApplicationRecord>();

export const applicationColumnLabels: Record<string, string> = {
  applicant: 'Applicant',
  subjects: 'Subjects',
  qualifications: 'Qualifications',
  submitted: 'Submitted',
  status: 'Status',
  reviewedBy: 'Reviewed by',
  actions: 'Actions',
};

export function getApplicationUserDisplay(
  user: ApplicationUserSummary | null | undefined,
  fallbackId?: string | null,
): { name: string; email: string | null; image: string | null } {
  if (!user) {
    return {
      name: fallbackId || 'Unknown user',
      email: null,
      image: null,
    };
  }
  const combined =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.email ||
    fallbackId ||
    'Unknown user';

  return {
    name: combined,
    email: user.email,
    image: user.image ?? user.avatarUrl,
  };
}

interface ApplicationColumnsOptions {
  canReview: boolean;
  onReview: (application: TeacherApplicationRecord) => void;
  onApprove: (application: TeacherApplicationRecord) => void;
  onReject: (application: TeacherApplicationRecord) => void;
}

export function createApplicationColumns({
  canReview,
  onReview,
  onApprove,
  onReject,
}: ApplicationColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor(
      (row) => {
        const applicant = getApplicationUserDisplay(row.applicant, row.applicantUserId);
        const subjectNames = row.appliedSubjectDetails.map((item) => item.name).join(' ');
        return `${applicant.name} ${applicant.email ?? ''} ${row.applicantUserId} ${subjectNames} ${row.qualifications ?? ''}`;
      },
      {
        id: 'applicant',
        header: 'Applicant',
        enableHiding: false,
        cell: ({ row }) => {
          const application = row.original;
          const applicant = getApplicationUserDisplay(
            application.applicant,
            application.applicantUserId,
          );

          return (
            <button
              type="button"
              onClick={() => onReview(application)}
              className="flex items-center gap-3 text-left group min-w-0"
            >
              <Avatar className="size-8 shrink-0 border border-border/70">
                {applicant.image && (
                  <AvatarImage src={applicant.image} alt={applicant.name} />
                )}
                <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                  {getInitials(applicant.name, applicant.email ?? undefined)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-emerald-400 transition-colors">
                  {applicant.name}
                </p>
                {applicant.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {applicant.email}
                  </p>
                )}
              </div>
            </button>
          );
        },
      },
    ),
    columnHelper.display({
      id: 'subjects',
      header: 'Subjects',
      cell: ({ row }) => {
        const subjects =
          row.original.status === 'approved' && row.original.approvedSubjectDetails?.length
            ? row.original.approvedSubjectDetails
            : row.original.appliedSubjectDetails;

        if (!subjects.length) {
          return <span className="text-xs text-muted-foreground">General / Unspecified</span>;
        }

        const visible = subjects.slice(0, 2);
        const remaining = subjects.length - visible.length;

        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {visible.map((subject) => (
              <Badge
                key={subject.id}
                variant="outline"
                className="text-[11px] font-normal bg-background/60 border-border/70"
              >
                {subject.name}
              </Badge>
            ))}
            {remaining > 0 && (
              <Badge
                variant="secondary"
                className="text-[11px] font-normal text-muted-foreground"
              >
                +{remaining}
              </Badge>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'qualifications',
      header: 'Qualifications',
      cell: ({ row }) => {
        const text = row.original.qualifications?.trim();
        if (!text) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return (
          <p className="text-xs text-muted-foreground max-w-52 truncate" title={text}>
            {text}
          </p>
        );
      },
    }),
    columnHelper.accessor('createdAt', {
      id: 'submitted',
      header: 'Submitted',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatJoinedDate(row.original.createdAt)}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <ApplicationStatusBadge status={row.original.status} />,
    }),
    columnHelper.display({
      id: 'reviewedBy',
      header: 'Reviewed by',
      cell: ({ row }) => {
        const application = row.original;
        if (!application.reviewedBy) {
          return <span className="text-xs text-muted-foreground">Awaiting review</span>;
        }
        const reviewer = getApplicationUserDisplay(
          application.reviewer,
          application.reviewedBy,
        );
        return (
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{reviewer.name}</p>
            {application.reviewedAt && (
              <p className="text-[11px] text-muted-foreground">
                {formatJoinedDate(application.reviewedAt)}
              </p>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right pr-2">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const application = row.original;
        const isPending = application.status === 'pending_review';

        return (
          <div className="flex items-center justify-end gap-1.5 pr-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onReview(application)}
              className="hidden sm:inline-flex text-xs gap-1 h-7 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Eye className="size-3.5" />
              Review
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    aria-label="Application actions"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-popover border-border">
                <DropdownMenuItem onClick={() => onReview(application)}>
                  <Eye className="size-3.5 mr-2 text-muted-foreground" />
                  <span>Review details</span>
                </DropdownMenuItem>
                {isPending && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onApprove(application)}
                      disabled={!canReview}
                      className="text-emerald-500 focus:text-emerald-500"
                    >
                      <Check className="size-3.5 mr-2" />
                      <span>Approve</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onReject(application)}
                      disabled={!canReview}
                      className="text-destructive focus:text-destructive"
                    >
                      <X className="size-3.5 mr-2" />
                      <span>Decline</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ]);
}
