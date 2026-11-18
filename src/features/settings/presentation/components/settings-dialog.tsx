import { useState, useMemo } from "react";
import {
  Bell,
  BookOpen,
  Camera,
  CreditCard,
  Grid,
  KeyRound,
  Palette,
  Receipt,
  Search,
  Settings as SettingsIcon,
  User,
  Users,
  X,
} from "lucide-react";
import { sessionStore } from "@/shared/store";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useSettingsDialog } from "../../application/use-settings-dialog";
import type { SettingsSectionId } from "../../domain/settings.types";

// Panels
import { GeneralProfilePanel } from "./panels/general-profile-panel";
import { SecurityPanel } from "./panels/security-panel";
import { PaymentMethodsPanel } from "./panels/payment-methods-panel";
import { BillingPanel } from "./panels/billing-panel";
import { NotificationSettingsPanel } from "./panels/notifications-panel";
import { AppearancePanel } from "./panels/appearance-panel";
import { LearningBoardPanel } from "./panels/learning-board-panel";
import { AudioVideoPanel } from "./panels/audio-video-panel";
import { FamilyPreferencesPanel } from "./panels/family-panel";
import { TeachingPreferencesPanel } from "./panels/teaching-panel";

interface SettingsNavGroup {
  title: string;
  items: {
    id: SettingsSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    badge?: string;
  }[];
}

export function SettingsDialog() {
  const { isOpen, closeSettings, activeSection, setActiveSection } =
    useSettingsDialog();
  const currentUser = sessionStore((state) => state.currentUser);
  const userRole = currentUser?.user?.userType ?? "parent";

  const [searchFilter, setSearchFilter] = useState("");

  const navigationGroups = useMemo<SettingsNavGroup[]>(() => {
    const groups: SettingsNavGroup[] = [
      {
        title: "Account",
        items: [
          {
            id: "profile",
            label: "General Profile",
            icon: User,
            description: "Personal details, avatar, and localization",
          },
          {
            id: "security",
            label: "Security & Access",
            icon: KeyRound,
            description: "Passwords, 2FA, and active sessions",
          },
        ],
      },
      {
        title: "Billing & Payments",
        items: [
          {
            id: "payment-methods",
            label: "Payment Methods",
            icon: CreditCard,
            description: "Saved cards, payment methods, and autopay",
            badge: "Important",
          },
          {
            id: "billing",
            label: "Billing & Invoices",
            icon: Receipt,
            description: "Tuition plans, receipts, and invoice history",
          },
        ],
      },
      {
        title: "Preferences",
        items: [
          {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
            description: "Lesson alerts, digests, and email triggers",
          },
          {
            id: "appearance",
            label: "Appearance & Theme",
            icon: Palette,
            description: "Color mode, display density, and motion",
          },
        ],
      },
      {
        title: "Classroom & Board",
        items: [
          {
            id: "learning-board",
            label: "Learning Board",
            icon: Grid,
            description: "Canvas grid style, pen width, and GPU settings",
          },
          {
            id: "audio-video",
            label: "Audio & Video",
            icon: Camera,
            description: "Camera, microphone, and speaker tests",
          },
        ],
      },
    ];

    // Role-specific sections
    if (userRole === "parent" || userRole === "admin") {
      groups.push({
        title: "Family & Oversight",
        items: [
          {
            id: "family",
            label: "Family & Children",
            icon: Users,
            description: "Parental approvals, recording playback, and curriculum",
          },
        ],
      });
    }

    if (userRole === "teacher" || userRole === "admin") {
      groups.push({
        title: "Teaching & Scheduling",
        items: [
          {
            id: "teaching",
            label: "Lesson Availability",
            icon: BookOpen,
            description: "Session durations, buffers, and AI note drafting",
          },
        ],
      });
    }

    return groups;
  }, [userRole]);

  // Filter items if searching in sidebar
  const filteredGroups = useMemo(() => {
    if (!searchFilter.trim()) return navigationGroups;
    const query = searchFilter.toLowerCase();
    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [navigationGroups, searchFilter]);

  // Render the active panel
  const renderPanel = () => {
    switch (activeSection) {
      case "profile":
        return <GeneralProfilePanel />;
      case "security":
        return <SecurityPanel />;
      case "payment-methods":
        return <PaymentMethodsPanel />;
      case "billing":
        return <BillingPanel />;
      case "notifications":
        return <NotificationSettingsPanel />;
      case "appearance":
        return <AppearancePanel />;
      case "learning-board":
        return <LearningBoardPanel />;
      case "audio-video":
        return <AudioVideoPanel />;
      case "family":
        return <FamilyPreferencesPanel />;
      case "teaching":
        return <TeachingPreferencesPanel />;
      default:
        return <GeneralProfilePanel />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent
        showCloseButton={false}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[88vw] max-w-5xl h-[88dvh] max-h-[88dvh] p-0 gap-0 overflow-hidden flex flex-col rounded-2xl border border-border/80 bg-background shadow-2xl"
      >
        {/* Accessible Dialog Title for Screen Readers */}
        <div className="sr-only">
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage profile, security, payment methods, notifications, and classroom preferences.
          </DialogDescription>
        </div>

        {/* Dialog Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SettingsIcon className="size-4.5" />
            </div>
            <div>
              <h1 className="font-heading text-base sm:text-lg font-bold text-foreground leading-tight">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Preferences and configuration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
              Esc to close
            </kbd>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeSettings}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4.5" />
              <span className="sr-only">Close settings</span>
            </Button>
          </div>
        </div>

        {/* Dialog Body (Two-Column Sidebar Layout) */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-56 sm:w-64 shrink-0 border-r border-border/60 bg-muted/10 flex flex-col h-full overflow-hidden">
            {/* Quick search input */}
            <div className="p-3.5 border-b border-border/40 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter settings..."
                  className="h-8.5 pl-8 text-xs sm:text-sm bg-background/80"
                />
              </div>
            </div>

            {/* Scrollable nav list (Enabled independent vertical scrolling as requested) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
              {filteredGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <p className="px-2.5 text-xs font-semibold tracking-wider text-muted-foreground/80 uppercase">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveSection(item.id)}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left text-xs sm:text-sm transition-colors group cursor-pointer ${
                            isActive
                              ? "bg-primary/15 text-primary font-semibold shadow-2xs"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`size-4 shrink-0 transition-colors ${
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-foreground"
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/20 text-primary font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Area (Scrollable vertical container) */}
          <main className="flex-1 min-w-0 h-full overflow-y-auto p-5 sm:p-7 md:p-8 scrollbar-thin bg-background">
            <div className="animate-in fade-in-50 duration-150">
              {renderPanel()}
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
