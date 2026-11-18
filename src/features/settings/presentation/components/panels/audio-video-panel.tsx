import { useState } from "react";
import {
  Camera,
  Mic,
  Volume2,
  Sliders,
  Play,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

export function AudioVideoPanel() {
  const [camera, setCamera] = useState("default");
  const [microphone, setMicrophone] = useState("default");
  const [speakers, setSpeakers] = useState("default");
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGain, setAutoGain] = useState(true);
  const [testingAudio, setTestingAudio] = useState(false);

  const handleTestAudio = () => {
    setTestingAudio(true);
    setTimeout(() => setTestingAudio(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
          Audio & Video
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Select and test your webcam, microphone, and output speakers for live lessons.
        </p>
      </div>

      {/* Video Device */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Camera className="size-4 text-primary" />
          <span>Camera Input</span>
        </h3>

        <div className="space-y-3 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="camera-select" className="text-xs font-medium text-muted-foreground">
              Webcam
            </Label>
            <select
              id="camera-select"
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="default">Integrated HD Webcam (1080p)</option>
              <option value="external">Logitech C920 Pro HD Webcam</option>
              <option value="virtual">OBS Virtual Camera</option>
            </select>
          </div>

          <div className="relative aspect-video max-w-sm rounded-xl border border-border/70 bg-muted/40 overflow-hidden flex flex-col items-center justify-center text-center p-4">
            <Camera className="size-8 text-muted-foreground/50 mb-2" />
            <span className="text-xs font-medium text-foreground">Camera Preview</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live stream activated during classroom lessons.
            </p>
          </div>
        </div>
      </div>

      {/* Audio Input (Microphone) */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Mic className="size-4 text-primary" />
          <span>Microphone Input</span>
        </h3>

        <div className="space-y-3 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="mic-select" className="text-xs font-medium text-muted-foreground">
              Microphone
            </Label>
            <select
              id="mic-select"
              value={microphone}
              onChange={(e) => setMicrophone(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="default">Default - Internal Microphone Array</option>
              <option value="usb">USB Condenser Headset Microphone</option>
            </select>
          </div>

          {/* Input Level Meter */}
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Input Level</span>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex gap-0.5 p-0.5">
              <div className="h-full w-2/5 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Audio Output (Speakers) */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Volume2 className="size-4 text-primary" />
          <span>Speakers & Sound Output</span>
        </h3>

        <div className="space-y-3 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="speaker-select" className="text-xs font-medium text-muted-foreground">
              Output Device
            </Label>
            <select
              id="speaker-select"
              value={speakers}
              onChange={(e) => setSpeakers(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="default">Default - System Audio Speakers</option>
              <option value="headphones">Headphones / AirPods Stereo</option>
            </select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestAudio}
            className="h-8 text-xs gap-1.5"
          >
            {testingAudio ? (
              <>
                <Volume2 className="size-3.5 text-primary animate-pulse" />
                <span>Playing test tone...</span>
              </>
            ) : (
              <>
                <Play className="size-3.5" />
                <span>Test Speakers</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Audio Enhancement Toggles */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sliders className="size-4 text-primary" />
          <span>Speech Processing</span>
        </h3>

        <div className="divide-y divide-border/30">
          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                AI Background Noise Suppression
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter out keyboard clicks, ambient family chatter, and air conditioning hum.
              </p>
            </div>
            <Switch
              checked={noiseSuppression}
              onCheckedChange={setNoiseSuppression}
              aria-label="Toggle Background Noise Suppression"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Acoustic Echo Cancellation
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prevent audio feedback loops when not wearing headphones.
              </p>
            </div>
            <Switch
              checked={echoCancellation}
              onCheckedChange={setEchoCancellation}
              aria-label="Toggle Acoustic Echo Cancellation"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Automatic Microphone Gain Control
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatically normalize voice volume so tutors and students hear each other clearly.
              </p>
            </div>
            <Switch
              checked={autoGain}
              onCheckedChange={setAutoGain}
              aria-label="Toggle Automatic Gain Control"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
