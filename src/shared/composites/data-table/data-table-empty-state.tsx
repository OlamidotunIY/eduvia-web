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
  const icon = isValidElement(Icon)
    ? Icon
    : createElement(Icon as ComponentType<{ className?: string }>, {
        className: "size-6 text-primary",
      });

  return (
    <Empty className={cn("m-auto w-full border-0 p-8 shadow-none bg-transparent hover:bg-transparent", className)}>
      <EmptyHeader>
        <div className="relative mb-2 flex items-center justify-center">
          <div className="absolute size-16 rounded-full bg-primary/10 blur-lg pointer-events-none" />
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/15 via-primary/10 to-transparent border border-primary/20 text-primary shadow-xs">
            {icon}
          </div>
        </div>
        <EmptyTitle className="text-base font-bold text-foreground font-heading">
          {heading}
        </EmptyTitle>
        <EmptyDescription className="max-w-sm text-xs text-muted-foreground leading-relaxed">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent className="mt-2">{action}</EmptyContent> : null}
    </Empty>
  );
}
