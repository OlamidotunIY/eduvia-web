import { useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import type { TeacherApplicationRecord } from '@/shared/domain';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { getApplicationUserDisplay } from './application-columns';

const PRESET_REASONS = [
  'Insufficient subject qualifications',
  'Currently at teaching capacity for these subjects',
  'Incomplete application details',
];

interface RejectApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: TeacherApplicationRecord | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onConfirm: (reason?: string) => void;
}

export function RejectApplicationDialog({
  open,
  onOpenChange,
  application,
  isSubmitting,
  errorMessage,
  onConfirm,
}: RejectApplicationDialogProps) {
  const [reason, setReason] = useState('');

  if (!application) return null;

  const applicant = getApplicationUserDisplay(
    application.applicant,
    application.applicantUserId,
  );

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason('');
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    onConfirm(trimmed ? trimmed : undefined);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/80">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-1.5 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <XCircle className="size-4" />
              </div>
              <DialogTitle className="text-lg font-semibold">
                Decline application
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Decline <span className="font-medium text-foreground">{applicant.name}</span>&apos;s
              teacher application. Adding a reason is optional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="reject-reason-textarea" className="text-xs font-medium">
                Reason for declining <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="reject-reason-textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Share constructive feedback with the applicant or leave blank..."
                className="bg-background/60 border-border/70 text-xs resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">Quick suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_REASONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReason(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-border/70 bg-background/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
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
              variant="destructive"
              disabled={isSubmitting}
              className="text-xs gap-1.5"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              Decline application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
