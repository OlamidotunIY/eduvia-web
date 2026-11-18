import { useState } from "react";
import { PenTool, Grid, Cpu, RefreshCw } from "lucide-react";
import { boardSettingsStore } from "@/shared/store";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import type { BoardSurfaceStyle } from "@/shared/domain";

export function LearningBoardPanel() {
  const {
    surfaceStyle,
    setSurfaceStyle,
    resetSettings,
  } = boardSettingsStore();

  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState("30");
  const [smoothingLevel, setSmoothingLevel] = useState("medium");

  const surfaceStyles: { id: BoardSurfaceStyle; label: string; desc: string }[] = [
    { id: "blank", label: "Blank Canvas", desc: "Clean, empty sheet without lines or background guides." },
    { id: "notebook", label: "Ruled Notebook", desc: "Horizontal ruled lines for handwriting and structured notes." },
    { id: "grid", label: "Grid Lines", desc: "Even grid cells ideal for mathematics, geometry, and plotting." },
    { id: "whiteboard", label: "Classic Whiteboard", desc: "Bright white marker surface for presentations." },
    { id: "blackboard", label: "Dark Blackboard", desc: "High-contrast dark chalkboard with chalk textures." },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
            Learning Board & Whiteboard
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure default canvas surfaces, stroke smoothing, and hardware rendering settings.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetSettings}
          className="h-8 text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1.5"
        >
          <RefreshCw className="size-3" />
          <span>Reset Board Defaults</span>
        </Button>
      </div>

      {/* Surface Style Selection */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Grid className="size-4 text-primary" />
          <span>Default Canvas Surface</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {surfaceStyles.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSurfaceStyle(item.id)}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                surfaceStyle === item.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                  : "border-border/70 hover:border-border hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  {item.label}
                </span>
                {surfaceStyle === item.id && (
                  <span className="size-2 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tool & Stroke Preferences */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <PenTool className="size-4 text-primary" />
          <span>Stroke & Drawing Dynamics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="smoothing" className="text-xs font-medium text-muted-foreground">
              Stylus & Pen Stroke Smoothing
            </Label>
            <select
              id="smoothing"
              value={smoothingLevel}
              onChange={(e) => setSmoothingLevel(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="none">Off (Raw stylus inputs)</option>
              <option value="low">Low (Light jitter dampening)</option>
              <option value="medium">Medium (Recommended for neat handwriting)</option>
              <option value="high">High (Maximum curve stabilization)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="autosave" className="text-xs font-medium text-muted-foreground">
              Canvas Auto-Save Frequency
            </Label>
            <select
              id="autosave"
              value={autoSaveInterval}
              onChange={(e) => setAutoSaveInterval(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="15">Every 15 seconds</option>
              <option value="30">Every 30 seconds (Default)</option>
              <option value="60">Every 60 seconds</option>
              <option value="on-stroke">Immediately after each stroke sequence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance & Acceleration */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Cpu className="size-4 text-primary" />
          <span>Graphics & Performance</span>
        </h3>

        <div className="divide-y divide-border/30">
          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="gpu-accel" className="text-xs sm:text-sm font-medium text-foreground cursor-pointer">
                Hardware GPU Acceleration
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utilize device WebGL and GPU pipelines for butter-smooth 60fps pen latency on high-refresh displays.
              </p>
            </div>
            <Switch
              id="gpu-accel"
              checked={hardwareAcceleration}
              onCheckedChange={setHardwareAcceleration}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
