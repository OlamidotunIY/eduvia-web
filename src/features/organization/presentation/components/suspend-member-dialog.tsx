import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import type { OrganizationMemberRecord } from "@/shared/domain";

interface SuspendMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMemberRecord | null;
  isSubmitting?: boolean;
  onConfirm: () => void;
}

export function SuspendMemberDialog({
  open,
  onOpenChange,
  member,
  isSubmitting,
  onConfirm,
}: SuspendMemberDialogProps) {
  if (!member) return null;

  const memberName =
    member.user?.firstName && member.user?.lastName
      ? `${member.user.firstName} ${member.user.lastName}`
      : member.user?.email || member.userId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/80">
        <DialogHeader className="gap-1.5 pb-2">
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="size-4" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Suspend member access
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Are you sure you want to suspend <span className="font-medium text-foreground">{memberName}</span>?
            They will lose access to all classes, curriculum, and organization resources until reactivated.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 gap-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Suspending..." : "Suspend member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
