import { useState } from "react";
import { Users, GraduationCap, Check } from "lucide-react";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";

export function FamilyPreferencesPanel() {
  const [requireApproval, setRequireApproval] = useState(true);
  const [primaryCurriculum, setPrimaryCurriculum] = useState("cambridge");
  const [recordSessions, setRecordSessions] = useState(true);
  const [simplifiedLogin, setSimplifiedLogin] = useState(true);
  const [digestDay, setDigestDay] = useState("friday");
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
          Family & Children Preferences
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Configure parental supervision rules, curriculum standards, and lesson recording permissions.
        </p>
      </div>

      {/* Parental Oversight & Safety */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <span>Parental Oversight & Safety</span>
        </h3>

        <div className="divide-y divide-border/30">
          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Require Parent Approval for New Tutor Bookings
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When enabled, sessions scheduled by students or recommended by tutors require your confirmation before billing.
              </p>
            </div>
            <Switch
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
              aria-label="Toggle Booking Approval"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Automatic Lesson Recording & Playback
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Securely store video and board recordings of lessons for 90 days for child review and parental safety checks.
              </p>
            </div>
            <Switch
              checked={recordSessions}
              onCheckedChange={setRecordSessions}
              aria-label="Toggle Lesson Recording"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Child Login with Simplified Credentials
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Allow enrolled children to sign in to their student portal using their assigned student ID without requiring an email address.
              </p>
            </div>
            <Switch
              checked={simplifiedLogin}
              onCheckedChange={setSimplifiedLogin}
              aria-label="Toggle Simplified Login"
            />
          </div>
        </div>
      </div>

      {/* Curriculum Standard */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GraduationCap className="size-4 text-primary" />
          <span>Curriculum Standards & Alignment</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="curriculum-select" className="text-xs font-medium text-muted-foreground">
              Default Curriculum Framework
            </Label>
            <select
              id="curriculum-select"
              value={primaryCurriculum}
              onChange={(e) => setPrimaryCurriculum(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="british">British National Curriculum (Key Stages 1-4)</option>
              <option value="cambridge">Cambridge Primary & Secondary (Checkpoint / IGCSE)</option>
              <option value="nigerian">Nigerian Curriculum (NERDC / BECE / WAEC)</option>
              <option value="us">US Common Core Standards</option>
              <option value="ib">International Baccalaureate (IB MYP/DP)</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              Applied automatically to topics, progress benchmarks, and assessment tests.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="digest-day" className="text-xs font-medium text-muted-foreground">
              Weekly Progress Report Delivery
            </Label>
            <select
              id="digest-day"
              value={digestDay}
              onChange={(e) => setDigestDay(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="friday">Every Friday Afternoon (5:00 PM)</option>
              <option value="sunday">Every Sunday Evening (7:00 PM)</option>
              <option value="monday">Every Monday Morning (8:00 AM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium animate-in fade-in">
              <Check className="size-3.5" />
              Family preferences saved!
            </span>
          )}
        </div>
        <Button type="submit" size="sm" className="h-9 px-5 text-xs font-semibold">
          Save Preferences
        </Button>
      </div>
    </form>
  );
}
