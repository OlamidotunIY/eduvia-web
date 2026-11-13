import {
  CheckCircle2,
  Clock,
  Sparkles,
  FileEdit,
  Archive,
  XCircle,
  UserX,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import type {
  ReportStatus,
  ReportAttendanceStatus,
} from "@/shared/domain";

export function ReportStatusBadge({ status }: { status: ReportStatus | string }) {
  switch (status) {
    case "submitted":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs px-2 py-0.5 gap-1 shrink-0"
        >
          <CheckCircle2 className="size-3" />
          Submitted
        </Badge>
      );
    case "ai_draft":
      return (
        <Badge
          variant="outline"
          className="border-purple-500/30 bg-purple-500/10 text-purple-500 text-xs px-2 py-0.5 gap-1 shrink-0"
        >
          <Sparkles className="size-3" />
          AI Draft
        </Badge>
      );
    case "teacher_reviewing":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-500 text-xs px-2 py-0.5 gap-1 shrink-0"
        >
          <FileEdit className="size-3" />
          In Review
        </Badge>
      );
    case "archived":
      return (
        <Badge
          variant="outline"
          className="border-border bg-muted text-muted-foreground text-xs px-2 py-0.5 gap-1 shrink-0"
        >
          <Archive className="size-3" />
          Archived
        </Badge>
      );
    case "draft":
    default:
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 gap-1 shrink-0"
        >
          <Clock className="size-3" />
          Draft
        </Badge>
      );
  }
}

export function ReportAttendanceBadge({
  status,
}: {
  status: ReportAttendanceStatus | string;
}) {
  switch (status) {
    case "attended":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs px-2 py-0.5 gap-1 shrink-0"
        >
          <CheckCircle2 className="size-3" />
          Attended
        </Badge>
      );
    case "late":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 gap-1 shrink-0"
        >
          <Clock className="size-3" />
          Late
        </Badge>
      );
    case "absent":
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs px-2 py-0.5 gap-1 shrink-0"
        >
          <XCircle className="size-3" />
          Absent
        </Badge>
      );
    case "no_show":
    default:
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs px-2 py-0.5 gap-1 shrink-0"
        >
          <UserX className="size-3" />
          No Show
        </Badge>
      );
  }
}
