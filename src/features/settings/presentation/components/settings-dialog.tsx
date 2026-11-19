import { useState, useMemo, useEffect } from "react";
import {
  Bell,
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
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
import { cn } from "cn";
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

  const [mobileView, setMobileView] = useState<"nav" | "content">("nav");

  useEffect(() => {
    if (isOpen) {
      setMobileView("nav");
    }
  }, [isOpen]);

  const activeItem = useMemo(() => {
    for (const group of navigationGroups) {
      const found = group.items.find((i) => i.id === activeSection);
      if (found) return found;
    }
    return null;
  }, [navigationGroups, activeSection]);

  const activeGroup = useMemo(() => {
    for (const group of navigationGroups) {
      if (group.items.some((i) => i.id === activeSection)) return group;
    }
    return null;
  }, [navigationGroups, activeSection]);

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
        className="w-full max-w-full h-full max-h-full sm:w-[92vw] md:w-[90vw] lg:w-[88vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl sm:h-[88dvh] sm:max-h-[88dvh] top-0 left-0 translate-x-0 translate-y-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 p-0 gap-0 overflow-hidden flex flex-col rounded-none sm:rounded-2xl border-0 sm:border border-border/80 bg-background shadow-2xl"
      >
        {/* Accessible Dialog Title for Screen Readers */}
        <div className="sr-only">
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage profile, security, payment methods, notifications, and classroom preferences.
          </DialogDescription>
        </div>

        {/* Dialog Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Back Button: displayed on mobile when viewing content panel */}
            {mobileView === "content" && (
              <button
                type="button"
                onClick={() => setMobileView("nav")}
                aria-label="Back to settings categories"
                className="flex items-center gap-1 md:hidden -ml-1 mr-1 px-2 py-1 rounded-lg hover:bg-muted/60 text-primary font-medium text-xs sm:text-sm cursor-pointer transition-colors shrink-0"
              >
                <ChevronLeft className="size-4" />
                <span>Sections</span>
              </button>
            )}

            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SettingsIcon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-base sm:text-lg font-bold text-foreground leading-tight truncate">
                {mobileView === "content" && activeItem ? activeItem.label : "Settings"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {mobileView === "content" && activeGroup ? activeGroup.title : "Preferences and configuration"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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

        {/* Dialog Body (Two-Column Sidebar Layout on Desktop, Master-Detail on Mobile) */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar Navigation */}
          <aside
            className={cn(
              "w-full md:w-64 lg:w-72 shrink-0 border-r border-border/60 bg-muted/10 flex flex-col h-full overflow-hidden transition-all",
              mobileView === "content" ? "hidden md:flex" : "flex",
            )}
          >
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
                          onClick={() => {
                            setActiveSection(item.id);
                            setMobileView("content");
                          }}
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
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/20 text-primary font-semibold">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className="size-4 text-muted-foreground/40 md:hidden" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Area (Scrollable vertical container) */}
          <main
            className={cn(
              "flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 scrollbar-thin bg-background",
              mobileView === "nav" ? "hidden md:block" : "block",
            )}
          >
            <div className="animate-in fade-in-50 duration-150">
              {renderPanel()}
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
