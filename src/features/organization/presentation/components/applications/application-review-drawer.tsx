import {
  BookOpen,
  CalendarDays,
  Check,
  FileText,
  GraduationCap,
  Mail,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import type { TeacherApplicationRecord } from '@/shared/domain';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/sheet';
import { formatJoinedDate, getInitials } from '../members-table/member-columns';
import { getApplicationUserDisplay } from './application-columns';
import { ApplicationStatusBadge } from './application-status-badge';

interface ApplicationReviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: TeacherApplicationRecord | null;
  canReview: boolean;
  onApprove: (application: TeacherApplicationRecord) => void;
  onReject: (application: TeacherApplicationRecord) => void;
}

export function ApplicationReviewDrawer({
  open,
  onOpenChange,
  application,
  canReview,
  onApprove,
  onReject,
}: ApplicationReviewDrawerProps) {
  if (!application) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:md:w-[68vw] data-[side=right]:lg:w-[60vw] w-full sm:max-w-none md:w-[68vw] lg:w-[60vw] max-w-none p-0 overflow-hidden flex flex-col bg-background"
        />
      </Sheet>
    );
  }

  const applicant = getApplicationUserDisplay(
    application.applicant,
    application.applicantUserId,
  );
  const reviewer = application.reviewedBy
    ? getApplicationUserDisplay(application.reviewer, application.reviewedBy)
    : null;
  const isPending = application.status === 'pending_review';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:md:w-[68vw] data-[side=right]:lg:w-[60vw] w-full sm:max-w-none md:w-[68vw] lg:w-[60vw] max-w-none p-0 overflow-hidden flex flex-col bg-background"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/70 bg-card/40 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pr-8">
            <div className="flex items-start gap-4 min-w-0">
              <Avatar className="size-12 shrink-0 border border-border/70">
                {applicant.image && (
                  <AvatarImage src={applicant.image} alt={applicant.name} />
                )}
                <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-sm font-semibold">
                  {getInitials(applicant.name, applicant.email ?? undefined)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <SheetTitle className="text-lg font-bold tracking-tight font-serif truncate">
                    {applicant.name}
                  </SheetTitle>
                  <ApplicationStatusBadge status={application.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {applicant.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {applicant.email}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Submitted {formatJoinedDate(application.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Subjects & Approved Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border/70 shadow-none">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <BookOpen className="size-4 text-emerald-500" />
                  <span>Applied Subjects</span>
                </div>
                {application.appliedSubjectDetails.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {application.appliedSubjectDetails.map((subject) => (
                      <Badge
                        key={subject.id}
                        variant="outline"
                        className="text-xs font-normal bg-background/70 border-border/70"
                      >
                        {subject.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No specific subjects listed in application.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/70 shadow-none">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>
                    {application.status === 'approved'
                      ? 'Assigned Role & Subjects'
                      : 'Onboarding Preview'}
                  </span>
                </div>
                {application.status === 'approved' ? (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Role:{' '}
                      <span className="font-medium text-foreground">
                        {application.assignedRoleName || application.assignedRole || 'Teacher'}
                      </span>
                    </div>
                    {application.approvedSubjectDetails &&
                      application.approvedSubjectDetails.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {application.approvedSubjectDetails.map((subject) => (
                            <Badge
                              key={subject.id}
                              className="text-xs font-normal bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            >
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When approving, you can assign a custom organization role and adjust which subjects this educator can teach.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Qualifications */}
          <Card className="bg-card/60 border-border/70 shadow-none">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <GraduationCap className="size-4 text-emerald-500" />
                <span>Qualifications &amp; Credentials</span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {application.qualifications?.trim() ||
                  'No formal qualifications text was submitted.'}
              </p>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card className="bg-card/60 border-border/70 shadow-none">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <FileText className="size-4 text-emerald-500" />
                <span>Cover Letter / Statement</span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {application.coverLetter?.trim() ||
                  'No cover letter was included with this application.'}
              </p>
            </CardContent>
          </Card>

          {/* Review Audit Trail */}
          {(reviewer || application.rejectionReason || application.reviewedAt) && (
            <>
              <Separator />
              <Card className="bg-muted/30 border-border/70 shadow-none">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <UserCheck className="size-4 text-muted-foreground" />
                    <span>Review Decision History</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {reviewer && (
                      <p>
                        Reviewed by{' '}
                        <span className="font-medium text-foreground">{reviewer.name}</span>
                        {application.reviewedAt &&
                          ` on ${formatJoinedDate(application.reviewedAt)}`}
                      </p>
                    )}
                    {application.rejectionReason && (
                      <div className="mt-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                        <span className="font-semibold">Decline reason: </span>
                        {application.rejectionReason}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-border/70 bg-card/50 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close
          </Button>

          {isPending && (
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                disabled={!canReview}
                onClick={() => onReject(application)}
                className="text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 gap-1.5"
              >
                <X className="size-3.5" />
                Decline
              </Button>
              <Button
                type="button"
                disabled={!canReview}
                onClick={() => onApprove(application)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-1.5"
              >
                <Check className="size-3.5" />
                Approve application
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
