import { useState } from 'react';
import { BarChart3, Calendar, ChevronDown, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

interface AnalyticsHeaderProps {
  currentSnapshotDate: string;
  availableDates: string[];
  selectedDate?: string;
  onSelectDate: (date?: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function AnalyticsHeader({
  currentSnapshotDate,
  availableDates,
  selectedDate,
  onSelectDate,
  onRefresh,
  isRefreshing = false,
}: AnalyticsHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayDate = selectedDate || currentSnapshotDate || 'Current';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Title block */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 shadow-inner">
          <BarChart3 className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
            Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor learning operations, teaching performance and student engagement.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        {/* Snapshot Date Selector */}
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-lg border-border/80 bg-card/60 px-3 text-xs font-medium text-foreground hover:bg-card hover:text-foreground shadow-xs"
              >
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>Snapshot: {displayDate}</span>
                <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52 bg-popover border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Select Snapshot Date
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                onSelectDate(undefined);
                setDropdownOpen(false);
              }}
              className="flex items-center justify-between text-xs cursor-pointer"
            >
              <span>Latest (Today)</span>
              {!selectedDate && <Check className="size-3.5 text-emerald-400" />}
            </DropdownMenuItem>
            {availableDates.map((dateStr) => (
              <DropdownMenuItem
                key={dateStr}
                onClick={() => {
                  onSelectDate(dateStr);
                  setDropdownOpen(false);
                }}
                className="flex items-center justify-between text-xs cursor-pointer"
              >
                <span>{dateStr}</span>
                {selectedDate === dateStr && <Check className="size-3.5 text-emerald-400" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh Button */}
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-xs gap-1.5 h-9 px-4 rounded-lg text-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  );
}
