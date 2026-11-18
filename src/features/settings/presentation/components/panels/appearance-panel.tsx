import { useState } from "react";
import { Monitor, Moon, Sun, Palette, Sparkles } from "lucide-react";
import { useTheme } from "@/app/providers/theme-provider";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";

export function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [compactDensity, setCompactDensity] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
          Appearance & Theme
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Customize the interface look and feel, color theme, and display accessibility.
        </p>
      </div>

      {/* Color Mode Selection (Sleek button tiles, not heavy cards) */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Palette className="size-4 text-primary" />
          <span>Interface Color Theme</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Light Theme */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
              theme === "light"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border/70 hover:border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Sun className="size-4" />
              </div>
              {theme === "light" && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Light Mode
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Crisp white surfaces with rich dark text contrast.
            </p>
          </button>

          {/* Dark Theme */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border/70 hover:border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Moon className="size-4" />
              </div>
              {theme === "dark" && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Dark Mode
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Reduced eye strain in low-light environments.
            </p>
          </button>

          {/* System Mode */}
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
              theme === "system"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border/70 hover:border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Monitor className="size-4" />
              </div>
              {theme === "system" && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              System Sync
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Automatically match your operating system theme.
            </p>
          </button>
        </div>
      </div>

      {/* Accessibility & Display Controls */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span>Display & Motion Accessibility</span>
        </h3>

        <div className="divide-y divide-border/30">
          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion" className="text-xs sm:text-sm font-medium text-foreground cursor-pointer">
                Reduce Animations & Motion
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Minimizes screen transitions, drawer slides, and bouncy particle effects throughout the application.
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={reduceMotion}
              onCheckedChange={setReduceMotion}
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="compact-density" className="text-xs sm:text-sm font-medium text-foreground cursor-pointer">
                Compact Table & Sidebar Density
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reduces row padding across data tables and lists to show more items per screen.
              </p>
            </div>
            <Switch
              id="compact-density"
              checked={compactDensity}
              onCheckedChange={setCompactDensity}
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-xs sm:text-sm font-medium text-foreground cursor-pointer">
                High Contrast Borders
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Increases contrast lines between panels, table columns, and card boundaries for enhanced readability.
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
