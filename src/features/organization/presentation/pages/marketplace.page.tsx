import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import type { ApplyToOrganizationInput, MarketplaceOrganization } from '@/shared/domain';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { APP_ROUTES } from '@/shared/constant/routes.constants';
import {
  useApplyToOrganizationMutation,
  useMarketplaceOrganizationsQuery,
} from '../../application';
import { MarketplaceApplyDialog } from '../components';

export function MarketplacePage() {
  const marketplace = useMarketplaceOrganizationsQuery();
  const apply = useApplyToOrganizationMutation();
  const [selectedOrg, setSelectedOrg] = useState<MarketplaceOrganization | null>(null);
  const [submittedOrgName, setSubmittedOrgName] = useState<string | null>(null);

  const handleOpenApply = (organization: MarketplaceOrganization) => {
    apply.reset();
    setSelectedOrg(organization);
  };

  const handleSubmitApplication = (
    organizationId: string,
    input: ApplyToOrganizationInput,
  ) => {
    const orgName = selectedOrg?.name ?? 'this organization';
    apply.mutate(
      { organizationId, ...input },
      {
        onSuccess: () => {
          setSubmittedOrgName(orgName);
          setSelectedOrg(null);
        },
      },
    );
  };

  const applyErrorMessage =
    apply.error instanceof Error
      ? apply.error.message
      : apply.error
        ? 'We could not submit your application.'
        : null;

  return (
    <section className="mx-auto max-w-4xl py-10 px-4">
      <Link className="text-sm text-primary hover:underline" to={APP_ROUTES.ONBOARDING}>
        ← Back
      </Link>
      <h1 className="mt-5 font-heading text-3xl font-semibold">Teacher marketplace</h1>
      <p className="mt-3 text-muted-foreground">
        Browse active Eduvia organizations and apply to those accepting teachers.
      </p>

      {submittedOrgName && (
        <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-500">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>
            Your application to <strong className="font-semibold">{submittedOrgName}</strong> was
            submitted. We&apos;ll notify you when the organization responds.
          </span>
        </div>
      )}

      {marketplace.isPending && (
        <p className="mt-8 text-sm text-muted-foreground">Loading organizations…</p>
      )}
      {marketplace.error && (
        <p className="mt-8 text-sm text-destructive">
          {marketplace.error instanceof Error
            ? marketplace.error.message
            : 'We could not load the marketplace.'}
        </p>
      )}

      {marketplace.data && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {marketplace.data.map((organization) => (
            <article
              key={organization.id}
              className="rounded-xl border bg-card p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{organization.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {organization.country} · {organization.timezone}
                    </p>
                  </div>
                  {organization.acceptingTeachers && (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500 shrink-0">
                      Hiring teachers
                    </span>
                  )}
                </div>

                <p className="mt-4 min-h-10 text-sm leading-6 text-muted-foreground">
                  {organization.description ??
                    'This organization has not added a public description yet.'}
                </p>

                {organization.subjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {organization.subjects.slice(0, 3).map((subject) => (
                      <Badge
                        key={subject.id}
                        variant="outline"
                        className="text-[11px] font-normal"
                      >
                        {subject.name}
                      </Badge>
                    ))}
                    {organization.subjects.length > 3 && (
                      <Badge variant="secondary" className="text-[11px] font-normal">
                        +{organization.subjects.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Button
                className="mt-5 w-full sm:w-auto self-start"
                variant={organization.acceptingTeachers ? 'default' : 'outline'}
                disabled={!organization.acceptingTeachers}
                onClick={() => handleOpenApply(organization)}
              >
                {organization.acceptingTeachers
                  ? 'Apply to teach'
                  : 'Not accepting applications'}
              </Button>
            </article>
          ))}
        </div>
      )}

      {marketplace.data?.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No organizations are accepting applications yet.{' '}
          <Link className="text-primary hover:underline" to={APP_ROUTES.ONBOARDING_ORGANIZATION}>
            Create your own organization
          </Link>
          .
        </div>
      )}

      <MarketplaceApplyDialog
        key={selectedOrg?.id ?? 'none'}
        open={Boolean(selectedOrg)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrg(null);
        }}
        organization={selectedOrg}
        isSubmitting={apply.isPending}
        errorMessage={applyErrorMessage}
        onSubmit={handleSubmitApplication}
      />
    </section>
  );
}
