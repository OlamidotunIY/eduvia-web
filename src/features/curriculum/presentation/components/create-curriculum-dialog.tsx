import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import type { CreateCurriculumInput } from "@/shared/domain";

interface CreateCurriculumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCurriculumInput) => Promise<void>;
  isSubmitting?: boolean;
}

const COMMON_COUNTRIES = [
  { code: "GB", name: "🇬🇧 United Kingdom" },
  { code: "US", name: "🇺🇸 United States" },
  { code: "NG", name: "🇳🇬 Nigeria" },
  { code: "CA", name: "🇨🇦 Canada" },
  { code: "INT", name: "🌐 International" },
  { code: "AU", name: "🇦🇺 Australia" },
  { code: "GH", name: "🇬🇭 Ghana" },
  { code: "ZA", name: "🇿🇦 South Africa" },
  { code: "KE", name: "🇰🇪 Kenya" },
];

export function CreateCurriculumDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateCurriculumDialogProps) {
  const [name, setName] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [countryCode, setCountryCode] = useState("GB");
  const [authority, setAuthority] = useState("");
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a curriculum framework name.");
      return;
    }
    if (!shortCode.trim()) {
      setError("Please provide a unique short code (e.g. UK-NC).");
      return;
    }
    if (!authority.trim()) {
      setError("Please provide the governing educational authority.");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        shortCode: shortCode.trim().toUpperCase(),
        countryCode: countryCode.trim().toUpperCase(),
        authority: authority.trim(),
        version: version.trim() || undefined,
        description: description.trim() || undefined,
        isActive: true,
      });
      // Reset form
      setName("");
      setShortCode("");
      setAuthority("");
      setVersion("");
      setDescription("");
      onOpenChange(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create curriculum framework.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Plus className="size-5 text-primary" />
              <span>Add Curriculum</span>
            </DialogTitle>
            <DialogDescription>
              Register a recognized educational framework or national curriculum.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="curriculum-name" className="text-xs font-medium">
                Framework Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="curriculum-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Common Core State Standards"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="curriculum-code" className="text-xs font-medium">
                  Short Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="curriculum-code"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  placeholder="e.g. CCSS"
                  className="h-9 text-xs uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="curriculum-country" className="text-xs font-medium">
                  Country <span className="text-destructive">*</span>
                </Label>
                <select
                  id="curriculum-country"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {COMMON_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="curriculum-authority" className="text-xs font-medium">
                  Authority <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="curriculum-authority"
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  placeholder="e.g. CCSS Initiative"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="curriculum-version" className="text-xs font-medium">
                  Version / Year (Optional)
                </Label>
                <Input
                  id="curriculum-version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 2025"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="curriculum-description" className="text-xs font-medium">
                Description (Optional)
              </Label>
              <textarea
                id="curriculum-description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of this curriculum scope..."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Add Curriculum"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
