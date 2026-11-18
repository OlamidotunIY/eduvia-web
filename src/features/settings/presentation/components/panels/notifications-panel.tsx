import { useState } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  Calendar,
} from "lucide-react";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";

export function NotificationSettingsPanel() {
  // Channel toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Event toggles
  const [lessonReminders, setLessonReminders] = useState(true);
  const [progressReports, setProgressReports] = useState(true);
  const [tutorMessages, setTutorMessages] = useState(true);
  const [billingNotices, setBillingNotices] = useState(true);
  const [marketingNews, setMarketingNews] = useState(false);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
          Notification Preferences
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Control how and when you receive lesson schedules, student reports, and billing updates.
        </p>
      </div>

      {/* Notification Delivery Channels */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Bell className="size-4 text-primary" />
          <span>Delivery Channels</span>
        </h3>

        <div className="divide-y divide-border/30">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="size-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  Email Notifications
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Receive comprehensive session summaries, progress PDFs, and invoice receipts in your inbox.
                </p>
              </div>
            </div>
            <Switch
              checked={emailAlerts}
              onCheckedChange={setEmailAlerts}
              aria-label="Toggle Email Notifications"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="size-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  In-App Notification Feed
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Real-time notification badges and alerts inside your Eduvia web and mobile dashboard.
                </p>
              </div>
            </div>
            <Switch
              checked={inAppAlerts}
              onCheckedChange={setInAppAlerts}
              aria-label="Toggle In-App Notification Feed"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Smartphone className="size-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  SMS Text Reminders
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Urgent SMS alerts sent 10 minutes prior to scheduled lesson start times.
                </p>
              </div>
            </div>
            <Switch
              checked={smsAlerts}
              onCheckedChange={setSmsAlerts}
              aria-label="Toggle SMS Reminders"
            />
          </div>
        </div>
      </div>

      {/* Notification Events */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Calendar className="size-4 text-primary" />
          <span>Activity & Event Triggers</span>
        </h3>

        <div className="divide-y divide-border/30">
          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  Upcoming Lesson Reminders
                </span>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary py-0 h-4">
                  15 min before
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive countdown alerts and direct join links before a classroom session goes live.
              </p>
            </div>
            <Switch
              checked={lessonReminders}
              onCheckedChange={setLessonReminders}
              aria-label="Toggle Upcoming Lesson Reminders"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Student Progress & Mastery Reports
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Weekly digest and milestone notifications when your children complete curriculum assessments.
              </p>
            </div>
            <Switch
              checked={progressReports}
              onCheckedChange={setProgressReports}
              aria-label="Toggle Progress Reports"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Tutor Messages & Feedback
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct messages, homework submissions, and lesson remarks left by assigned tutors.
              </p>
            </div>
            <Switch
              checked={tutorMessages}
              onCheckedChange={setTutorMessages}
              aria-label="Toggle Tutor Messages"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Billing & Subscription Notices
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receipts, invoice renewals, and payment method expiration warnings.
              </p>
            </div>
            <Switch
              checked={billingNotices}
              onCheckedChange={setBillingNotices}
              aria-label="Toggle Billing Notices"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Platform Releases & Educational Tips
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Occasional product updates, new tutor highlights, and curriculum additions.
              </p>
            </div>
            <Switch
              checked={marketingNews}
              onCheckedChange={setMarketingNews}
              aria-label="Toggle Platform Releases"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
