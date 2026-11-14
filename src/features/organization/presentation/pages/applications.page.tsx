import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe,
  RefreshCw,
  UserCheck,
  XCircle,
} from 'lucide-react';
import type {
  ApproveTeacherApplicationInput,
  TeacherApplicationRecord,
} from '@/shared/domain';
import { sessionStore } from '@/shared/store';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  useApproveApplicationMutation,
  useRejectApplicationMutation,
  useTeacherApplicationSettingsQuery,
  useTeacherApplicationsQuery,
  useUpdateApplicationSettingsMutation,
} from '../../application';
import {
  ApplicationReviewDrawer,
  ApplicationsTable,
  ApproveApplicationDialog,
  RejectApplicationDialog,
  getApplicationUserDisplay,
} from '../components';

type ApplicationTab = 'all' | 'pending_review' | 'approved' | 'declined';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const maybeAxios = err as { response?: { data?: { message?: string } }; message?: string };
    if (maybeAxios.response?.data?.message) return maybeAxios.response.data.message;
    if (maybeAxios.message) return maybeAxios.message;
  }
  return fallback;
}

export function ApplicationsPage() {
  const currentUserBootstrap = sessionStore((state) => state.currentUser);
  const organizationId = currentUserBootstrap?.activeOrganization?.id;
  const permissions = currentUserBootstrap?.activeOrganization?.permissions ?? [];

  const canReview =
    permissions.length === 0 || permissions.includes('applications:review');

  const [activeTab, setActiveTab] = useState<ApplicationTab>('all');
  const [reviewTarget, setReviewTarget] = useState<TeacherApplicationRecord | null>(null);
  const [approveTarget, setApproveTarget] = useState<TeacherApplicationRecord | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TeacherApplicationRecord | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const applicationsQuery = useTeacherApplicationsQuery(organizationId);
  const settingsQuery = useTeacherApplicationSettingsQuery(organizationId);
  const approveMutation = useApproveApplicationMutation(organizationId);
  const rejectMutation = useRejectApplicationMutation(organizationId);
  const updateSettingsMutation = useUpdateApplicationSettingsMutation(organizationId);

  const applications = useMemo(
    () => applicationsQuery.data ?? [],
    [applicationsQuery.data],
  );

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let declined = 0;

    for (const app of applications) {
      if (app.status === 'pending_review') pending += 1;
      else if (app.status === 'approved') approved += 1;
      else if (app.status === 'rejected' || app.status === 'auto_rejected') declined += 1;
    }

    return {
      total: applications.length,
      pending,
      approved,
      declined,
    };
  }, [applications]);

  const tabApplications = useMemo(() => {
    switch (activeTab) {
      case 'pending_review':
        return applications.filter((app) => app.status === 'pending_review');
      case 'approved':
        return applications.filter((app) => app.status === 'approved');
      case 'declined':
        return applications.filter(
          (app) => app.status === 'rejected' || app.status === 'auto_rejected',
        );
      case 'all':
      default:
        return applications;
    }
  }, [applications, activeTab]);

  const acceptingTeachers = settingsQuery.data?.acceptingTeachers ?? false;

  const handleToggleAccepting = () => {
    setFeedbackBanner(null);
    updateSettingsMutation.mutate(
      { acceptingTeachers: !acceptingTeachers },
      {
        onSuccess: (updated) => {
          setFeedbackBanner({
            type: 'success',
            message: updated.acceptingTeachers
              ? 'Teacher applications are now open for your organization.'
              : 'Teacher applications have been paused.',
          });
        },
        onError: (err) => {
          setFeedbackBanner({
            type: 'error',
            message: extractErrorMessage(err, 'Could not update application settings.'),
          });
        },
      },
    );
  };

  const handleApproveConfirm = (input: ApproveTeacherApplicationInput) => {
    if (!approveTarget) return;
    const applicant = getApplicationUserDisplay(
      approveTarget.applicant,
      approveTarget.applicantUserId,
    );
    approveMutation.mutate(
      {
        applicationId: approveTarget.id,
        input,
      },
      {
        onSuccess: () => {
          setApproveTarget(null);
          setReviewTarget(null);
          setFeedbackBanner({
            type: 'success',
            message: `${applicant.name} has been approved and added to your organization.`,
          });
        },
      },
    );
  };

  const handleRejectConfirm = (reason?: string) => {
    if (!rejectTarget) return;
    const applicant = getApplicationUserDisplay(
      rejectTarget.applicant,
      rejectTarget.applicantUserId,
    );
    rejectMutation.mutate(
      {
        applicationId: rejectTarget.id,
        input: reason ? { reason } : {},
      },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setReviewTarget(null);
          setFeedbackBanner({
            type: 'success',
            message: `${applicant.name}'s application has been declined.`,
          });
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 w-full">
      {/* Page Title & Hiring Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Teacher Applications
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review educator applications, inspect qualifications, and approve or decline candidates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {settingsQuery.isLoading ? (
            <Skeleton className="h-9 w-44 rounded-lg" />
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/70 px-3 py-1.5">
              <Globe className="size-3.5 text-muted-foreground" />
              <Badge
                variant="outline"
                className={
                  acceptingTeachers
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs'
                    : 'border-border bg-muted/60 text-muted-foreground text-xs'
                }
              >
                {acceptingTeachers ? 'Accepting teachers' : 'Applications paused'}
              </Badge>
              {canReview && (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={updateSettingsMutation.isPending}
                  onClick={handleToggleAccepting}
                  className="text-xs h-7 px-2 text-foreground hover:bg-muted"
                >
                  {acceptingTeachers ? 'Pause' : 'Open applications'}
                </Button>
              )}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void applicationsQuery.refetch();
              void settingsQuery.refetch();
            }}
            disabled={applicationsQuery.isFetching}
            className="h-9 px-3 text-xs gap-1.5"
          >
            <RefreshCw
              className={`size-3.5 ${applicationsQuery.isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {feedbackBanner && (
        <Alert
          variant={feedbackBanner.type === 'error' ? 'destructive' : 'default'}
          className={
            feedbackBanner.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
              : undefined
          }
        >
          {feedbackBanner.type === 'success' ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          <AlertDescription className="text-xs flex items-center justify-between gap-4">
            <span>{feedbackBanner.message}</span>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="text-xs underline opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
          <div className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-normal text-muted-foreground">Total applications</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {applicationsQuery.isLoading ? <Skeleton className="h-7 w-10" /> : counts.total}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
          <div className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="size-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-normal text-muted-foreground">Pending review</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {applicationsQuery.isLoading ? <Skeleton className="h-7 w-10" /> : counts.pending}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
          <div className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-normal text-muted-foreground">Approved</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {applicationsQuery.isLoading ? <Skeleton className="h-7 w-10" /> : counts.approved}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
          <div className="flex flex-row items-center gap-4 px-5 py-4">
            <div className="size-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <XCircle className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-normal text-muted-foreground">Declined</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {applicationsQuery.isLoading ? <Skeleton className="h-7 w-10" /> : counts.declined}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab((value as ApplicationTab) ?? 'all')}
        className="gap-4"
      >
        <TabsList className="w-fit flex-wrap h-auto p-1">
          <TabsTrigger value="all" className="text-xs px-3 py-1.5 gap-1.5">
            <span>All</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {counts.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending_review" className="text-xs px-3 py-1.5 gap-1.5">
            <span>Pending review</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {counts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs px-3 py-1.5 gap-1.5">
            <span>Approved</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {counts.approved}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="declined" className="text-xs px-3 py-1.5 gap-1.5">
            <span>Declined</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {counts.declined}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Applications DataTable */}
      <ApplicationsTable
        applications={tabApplications}
        isLoading={applicationsQuery.isLoading}
        isReloading={applicationsQuery.isFetching && !applicationsQuery.isLoading}
        onReload={() => void applicationsQuery.refetch()}
        canReview={canReview}
        onReview={(application) => setReviewTarget(application)}
        onApprove={(application) => {
          approveMutation.reset();
          setApproveTarget(application);
        }}
        onReject={(application) => {
          rejectMutation.reset();
          setRejectTarget(application);
        }}
        emptyHeading={
          activeTab === 'pending_review'
            ? 'No pending applications'
            : 'No teacher applications yet'
        }
        emptyDescription={
          activeTab === 'pending_review'
            ? 'You are all caught up. New teacher applications will appear here for review.'
            : 'When educators apply through the marketplace, their applications will appear here.'
        }
      />

      {/* Wide Slide-Over Review Drawer */}
      <ApplicationReviewDrawer
        open={Boolean(reviewTarget)}
        onOpenChange={(open) => !open && setReviewTarget(null)}
        application={reviewTarget}
        canReview={canReview}
        onApprove={(application) => {
          approveMutation.reset();
          setApproveTarget(application);
        }}
        onReject={(application) => {
          rejectMutation.reset();
          setRejectTarget(application);
        }}
      />

      {/* Approve Confirmation Dialog */}
      <ApproveApplicationDialog
        key={`approve-${approveTarget?.id ?? 'none'}`}
        open={Boolean(approveTarget)}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        organizationId={organizationId}
        application={approveTarget}
        isSubmitting={approveMutation.isPending}
        errorMessage={
          approveMutation.error
            ? extractErrorMessage(approveMutation.error, 'Could not approve application.')
            : null
        }
        onConfirm={handleApproveConfirm}
      />

      {/* Decline Confirmation Dialog */}
      <RejectApplicationDialog
        key={`reject-${rejectTarget?.id ?? 'none'}`}
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        application={rejectTarget}
        isSubmitting={rejectMutation.isPending}
        errorMessage={
          rejectMutation.error
            ? extractErrorMessage(rejectMutation.error, 'Could not decline application.')
            : null
        }
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
