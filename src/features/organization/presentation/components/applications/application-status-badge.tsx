import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import type { TeacherApplicationStatus } from '@/shared/domain';

interface ApplicationStatusBadgeProps {
  status: TeacherApplicationStatus;
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  switch (status) {
    case 'approved':
      return (
        <Badge className="gap-1.5 bg-emerald-500/15 text-emerald-500 border-emerald-500/25 hover:bg-emerald-500/15 font-medium text-xs">
          <CheckCircle2 className="size-3.5" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="gap-1.5 bg-rose-500/15 text-rose-500 border-rose-500/25 hover:bg-rose-500/15 font-medium text-xs">
          <XCircle className="size-3.5" />
          Declined
        </Badge>
      );
    case 'auto_rejected':
      return (
        <Badge className="gap-1.5 bg-muted text-muted-foreground border-border hover:bg-muted font-medium text-xs">
          <XCircle className="size-3.5" />
          Auto-declined
        </Badge>
      );
    case 'pending_review':
    default:
      return (
        <Badge className="gap-1.5 bg-amber-500/15 text-amber-500 border-amber-500/25 hover:bg-amber-500/15 font-medium text-xs">
          <Clock className="size-3.5" />
          Pending review
        </Badge>
      );
  }
}
