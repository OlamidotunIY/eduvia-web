import { useMemo, useState } from 'react';
import { BookOpen, GraduationCap, Loader2, Plus, Send, X } from 'lucide-react';
import type {
  ApplyToOrganizationInput,
  MarketplaceOrganization,
} from '@/shared/domain';
import { useMarketplaceOrganizationSubjectsQuery } from '../../application';
import { Badge } from '@/shared/ui/badge';
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
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

interface MarketplaceApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: MarketplaceOrganization | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (organizationId: string, input: ApplyToOrganizationInput) => void;
}

export function MarketplaceApplyDialog({
  open,
  onOpenChange,
  organization,
  isSubmitting,
  errorMessage,
  onSubmit,
}: MarketplaceApplyDialogProps) {
  const subjectsQuery = useMarketplaceOrganizationSubjectsQuery(
    organization?.id,
    open && Boolean(organization?.id),
  );

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const offeredSubjects = useMemo(() => {
    const queryList = subjectsQuery.data ?? [];
    if (queryList.length > 0) return queryList;
    return organization?.subjects ?? [];
  }, [subjectsQuery.data, organization?.subjects]);

  if (!organization) return null;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedSubjectIds([]);
      setCustomSubjectInput('');
      setCustomSubjects([]);
      setQualifications('');
      setCoverLetter('');
    }
    onOpenChange(nextOpen);
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  const addCustomSubject = () => {
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!customSubjects.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setCustomSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubjectInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedSubjects = Array.from(
      new Set([...selectedSubjectIds, ...customSubjects]),
    );
    onSubmit(organization.id, {
      appliedSubjects: combinedSubjects,
      qualifications: qualifications.trim() || null,
      coverLetter: coverLetter.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/80">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-1.5 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <GraduationCap className="size-4" />
              </div>
              <DialogTitle className="text-lg font-semibold">
                Apply to {organization.name}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Select the subjects you would like to teach and share your qualifications and teaching background.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 max-h-[65vh] overflow-y-auto pr-1">
            {/* Offered Subjects */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-emerald-500" />
                Subjects to teach
              </Label>

              {offeredSubjects.length > 0 ? (
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border/70 bg-background/40 divide-y divide-border/50">
                  {offeredSubjects.map((subject) => {
                    const checked = selectedSubjectIds.includes(subject.id);
                    return (
                      <label
                        key={subject.id}
                        className="flex items-start gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleSubject(subject.id)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground">
                            {subject.name}
                          </p>
                          {subject.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {subject.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {subjectsQuery.isLoading
                    ? 'Loading organization subjects...'
                    : 'No catalog subjects listed yet. Add subjects you specialize in below.'}
                </p>
              )}

              {/* Optional additional subject input */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSubject();
                    }
                  }}
                  placeholder="Add another subject (e.g. Physics)"
                  className="h-8 text-xs bg-background/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomSubject}
                  className="h-8 px-2.5 text-xs shrink-0 gap-1"
                >
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>

              {customSubjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {customSubjects.map((subject) => (
                    <Badge
                      key={subject}
                      variant="secondary"
                      className="text-xs gap-1 pr-1"
                    >
                      <span>{subject}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomSubjects((prev) =>
                            prev.filter((item) => item !== subject),
                          )
                        }
                        className="rounded-full p-0.5 hover:bg-muted"
                        aria-label={`Remove ${subject}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Qualifications */}
            <div className="space-y-1.5">
              <Label htmlFor="apply-qualifications" className="text-xs font-medium">
                Qualifications &amp; credentials
              </Label>
              <Textarea
                id="apply-qualifications"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                rows={3}
                placeholder="e.g. B.Sc. in Mathematics, PGCE, 5 years GCSE & A-Level tutoring experience"
                className="text-xs bg-background/50 resize-none"
              />
            </div>

            {/* Cover letter */}
            <div className="space-y-1.5">
              <Label htmlFor="apply-cover-letter" className="text-xs font-medium">
                Cover letter / introduction
              </Label>
              <Textarea
                id="apply-cover-letter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                placeholder="Tell the organization about your teaching style, availability, and student outcomes..."
                className="text-xs bg-background/50 resize-none"
              />
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
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Submit application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
