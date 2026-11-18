import { useState } from "react";
import { Clock, Sparkles, Landmark, Check } from "lucide-react";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export function TeachingPreferencesPanel() {
  const [defaultDuration, setDefaultDuration] = useState("60");
  const [bufferTime, setBufferTime] = useState("10");
  const [instantBooking, setInstantBooking] = useState(false);
  const [aiReportDrafts, setAiReportDrafts] = useState(true);
  const [payoutSchedule, setPayoutSchedule] = useState("weekly");
  const [bankAccount, setBankAccount] = useState("0123456789 (Access Bank)");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
          Teaching & Lesson Availability
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Set up default class durations, scheduling buffers, and AI session summary assistants.
        </p>
      </div>

      {/* Scheduling & Availability */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <span>Lesson Scheduling Rules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="duration" className="text-xs font-medium text-muted-foreground">
              Default Lesson Duration
            </Label>
            <select
              id="duration"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="45">45 minutes</option>
              <option value="60">60 minutes (1 hour - Recommended)</option>
              <option value="90">90 minutes (1.5 hours)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="buffer" className="text-xs font-medium text-muted-foreground">
              Buffer Time Between Sessions
            </Label>
            <select
              id="buffer"
              value={bufferTime}
              onChange={(e) => setBufferTime(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="0">No buffer</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes (Recommended)</option>
              <option value="15">15 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Mode & AI Tools */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span>Teaching Automation</span>
        </h3>

        <div className="divide-y divide-border/30">
          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                AI Lesson Summary & Progress Drafts
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatically draft structured student progress remarks and curriculum mastery points right after classroom completion.
              </p>
            </div>
            <Switch
              checked={aiReportDrafts}
              onCheckedChange={setAiReportDrafts}
              aria-label="Toggle AI Progress Drafts"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Instant Student Booking
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Allow parents and enrolled students to book available slots immediately without waiting for your manual confirmation.
              </p>
            </div>
            <Switch
              checked={instantBooking}
              onCheckedChange={setInstantBooking}
              aria-label="Toggle Instant Booking"
            />
          </div>
        </div>
      </div>

      {/* Payout Information */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Landmark className="size-4 text-primary" />
          <span>Tutor Payout Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="payout-schedule" className="text-xs font-medium text-muted-foreground">
              Payout Schedule
            </Label>
            <select
              id="payout-schedule"
              value={payoutSchedule}
              onChange={(e) => setPayoutSchedule(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="weekly">Weekly (Every Monday)</option>
              <option value="biweekly">Bi-weekly (Every 1st and 15th)</option>
              <option value="monthly">Monthly (End of month)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank" className="text-xs font-medium text-muted-foreground">
              Primary Bank Account
            </Label>
            <Input
              id="bank"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium animate-in fade-in">
              <Check className="size-3.5" />
              Teaching preferences saved!
            </span>
          )}
        </div>
        <Button type="submit" size="sm" className="h-9 px-5 text-xs font-semibold">
          Save Settings
        </Button>
      </div>
    </form>
  );
}
