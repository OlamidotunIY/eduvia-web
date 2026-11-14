import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import type {
  ApproveTeacherApplicationInput,
  TeacherApplicationRecord,
} from '@/shared/domain';
import { useOrganizationSubjectsQuery } from '@/features/subject/application';
import { useOrganizationRolesQuery } from '../../../application';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { getApplicationUserDisplay } from './application-columns';

interface ApproveApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
  application: TeacherApplicationRecord | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onConfirm: (input: ApproveTeacherApplicationInput) => void;
}

interface SelectableSubject {
  id: string;
  name: string;
  wasApplied: boolean;
}

interface RoleOption {
  value: string;
  label: string;
  roleId?: string;
  legacyRole?: string;
  description?: string | null;
}

const FALLBACK_ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'legacy:Teacher',
    label: 'Teacher',
    legacyRole: 'Teacher',
    description: 'Standard educator permissions for classes, lessons, and assessments.',
  },
  {
    value: 'legacy:TeachingAssistant',
    label: 'Teaching Assistant',
    legacyRole: 'TeachingAssistant',
    description: 'Supports lead teachers and assists in assigned classrooms.',
  },
  {
    value: 'legacy:LeadTeacher',
    label: 'Lead Teacher',
    legacyRole: 'LeadTeacher',
    description: 'Oversees teaching operations, curriculum, and fellow educators.',
  },
  {
    value: 'legacy:OrgAdmin',
    label: 'Admin',
    legacyRole: 'OrgAdmin',
    description: 'Administrative access across organization settings and operations.',
  },
];

function roleKeyToLegacy(key: string | null): string {
  switch (key) {
    case 'org_admin':
      return 'OrgAdmin';
    case 'lead_teacher':
      return 'LeadTeacher';
    case 'teaching_assistant':
      return 'TeachingAssistant';
    case 'teacher':
    default:
      return 'Teacher';
  }
}

export function ApproveApplicationDialog({
  open,
  onOpenChange,
  organizationId,
  application,
  isSubmitting,
  errorMessage,
  onConfirm,
}: ApproveApplicationDialogProps) {
  const subjectsQuery = useOrganizationSubjectsQuery(organizationId);
  const rolesQuery = useOrganizationRolesQuery(organizationId);

  const [selectedSubjectsOverride, setSelectedSubjectsOverride] = useState<string[] | null>(null);
  const [selectedRoleOverride, setSelectedRoleOverride] = useState<string | null>(null);

  const roleOptions = useMemo<RoleOption[]>(() => {
    const roles = rolesQuery.data ?? [];
    if (roles.length === 0) {
      return FALLBACK_ROLE_OPTIONS;
    }

    return roles
      .filter((role) => role.key !== 'org_owner')
      .map((role) => ({
        value: `role:${role.id}`,
        label: role.name,
        roleId: role.id,
        legacyRole: roleKeyToLegacy(role.key),
        description: role.description,
      }));
  }, [rolesQuery.data]);

  const subjectOptions = useMemo<SelectableSubject[]>(() => {
    const map = new Map<string, SelectableSubject>();
    const appliedSet = new Set(application?.appliedSubjects ?? []);

    for (const detail of application?.appliedSubjectDetails ?? []) {
      map.set(detail.id, {
        id: detail.id,
        name: detail.name,
        wasApplied: true,
      });
    }

    for (const subject of subjectsQuery.data ?? []) {
      if (!subject.isActive && !appliedSet.has(subject.id) && !appliedSet.has(subject.name)) {
        continue;
      }
      const existingByName = Array.from(map.values()).find(
        (item) => item.name.toLowerCase() === subject.name.toLowerCase(),
      );
      if (existingByName && existingByName.id !== subject.id) {
        continue;
      }
      const existing = map.get(subject.id);
      map.set(subject.id, {
        id: subject.id,
        name: subject.name,
        wasApplied: Boolean(existing?.wasApplied || appliedSet.has(subject.id)),
      });
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.wasApplied !== b.wasApplied) return a.wasApplied ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [application, subjectsQuery.data]);

  if (!application) return null;

  const defaultRoleOption =
    roleOptions.find(
      (opt) => opt.legacyRole === 'Teacher' || opt.label.toLowerCase() === 'teacher',
    ) ?? roleOptions[0];
  const selectedRoleValue = selectedRoleOverride ?? defaultRoleOption?.value ?? 'legacy:Teacher';
  const selectedSubjects = selectedSubjectsOverride ?? application.appliedSubjects;

  const applicant = getApplicationUserDisplay(
    application.applicant,
    application.applicantUserId,
  );
  const activeRole =
    roleOptions.find((option) => option.value === selectedRoleValue) ?? roleOptions[0];

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedSubjectsOverride(null);
      setSelectedRoleOverride(null);
    }
    onOpenChange(nextOpen);
  };

  const toggleSubject = (subjectId: string) => {
    const current = selectedSubjects;
    setSelectedSubjectsOverride(
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      approvedSubjects: selectedSubjects,
      ...(activeRole?.roleId ? { roleId: activeRole.roleId } : {}),
      ...(activeRole?.legacyRole ? { role: activeRole.legacyRole } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/80">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-1.5 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="size-4" />
              </div>
              <DialogTitle className="text-lg font-semibold">
                Approve teacher application
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure the member role and approved subjects before onboarding{' '}
              <span className="font-medium text-foreground">{applicant.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Role selection */}
            <div className="space-y-2">
              <Label htmlFor="approve-role-select" className="text-xs font-medium flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Organization role
              </Label>
              <Select
                value={selectedRoleValue}
                onValueChange={(value) => value && setSelectedRoleOverride(value)}
              >
                <SelectTrigger
                  id="approve-role-select"
                  className="w-full bg-background/60 border-border/70"
                >
                  <SelectValue placeholder="Choose a role">
                    {activeRole?.label ?? 'Select role'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeRole?.description && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activeRole.description}
                </p>
              )}
            </div>

            {/* Subject adjustment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-emerald-500" />
                  Approved subjects ({selectedSubjects.length})
                </Label>
                {subjectOptions.length > 0 && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSubjectsOverride(subjectOptions.map((item) => item.id))
                      }
                      className="text-emerald-500 hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-border">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSubjectsOverride([])}
                      className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {subjectOptions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-3 text-xs text-muted-foreground">
                  No organization subjects configured yet. The educator will join without subject restrictions.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border/70 bg-background/40 divide-y divide-border/50">
                  {subjectOptions.map((subject) => {
                    const checked = selectedSubjects.includes(subject.id);
                    return (
                      <label
                        key={subject.id}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSubject(subject.id)}
                          />
                          <span className="text-xs font-medium text-foreground truncate">
                            {subject.name}
                          </span>
                        </div>
                        {subject.wasApplied && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
                            Applied
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errorMessage}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-1.5"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              Approve &amp; onboard
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
