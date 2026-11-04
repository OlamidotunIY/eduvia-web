import {
  createElement,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";
import { Inbox } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { cn } from "@/shared/lib/utils";

export interface DataTableEmptyStateProps {
  icon?: ComponentType<{ className?: string }> | ReactNode;
  heading?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function DataTableEmptyState({
  icon: Icon = Inbox,
  heading = "No records found",
  description = "There is no data available to display at this moment.",
  action,
  className,
}: DataTableEmptyStateProps) {
  // Lucide icons are forward-ref component objects, not plain functions.
  // Rendering one directly would pass that object to React as a child.
  const icon = isValidElement(Icon)
    ? Icon
    : createElement(Icon as ComponentType<{ className?: string }>, {
        className: "size-6",
      });
  return (
    <Empty className={cn("m-auto w-full border-0 p-6 shadow-none", className)}>
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="mb-1 size-12 rounded-2xl bg-muted/60"
        >
          {icon}
        </EmptyMedia>
        <EmptyTitle className="text-sm">{heading}</EmptyTitle>
        <EmptyDescription className="max-w-sm text-xs">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent className="mt-2">{action}</EmptyContent> : null}
    </Empty>
  );
}
