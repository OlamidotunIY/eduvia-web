import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { SendInvitationInput } from "../../domain";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  onSubmit: (input: SendInvitationInput) => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Teacher");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please provide a valid email format.");
      return;
    }

    setError(null);
    onSubmit({
      inviteeEmail: cleanEmail,
      role,
    });
  };

  const handleReset = () => {
    setEmail("");
    setRole("Teacher");
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleReset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md bg-card border-border/80">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-1.5 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UserPlus className="size-4" />
              </div>
              <DialogTitle className="text-lg font-semibold">Invite new member</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Send an invitation link to onboard a new teacher, administrator, or team member to your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="member-email" className="text-xs font-medium">
                Email address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="member-email"
                  type="email"
                  required
                  placeholder="name@organization.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="pl-9 bg-background/50 border-border/70"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-role" className="text-xs font-medium">
                Assigned Role <span className="text-destructive">*</span>
              </Label>
              <Select value={role} onValueChange={(val) => setRole(val ?? "Teacher")}>
                <SelectTrigger id="member-role" className="w-full bg-background/50 border-border/70">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="LeadTeacher">Lead teacher</SelectItem>
                  <SelectItem value="TeachingAssistant">Teaching assistant</SelectItem>
                  <SelectItem value="OrgAdmin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Members receive permissions matching their assigned role upon accepting the invitation.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2 border-t border-border/60">
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
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-xs"
              disabled={isSubmitting || !email.trim()}
            >
              {isSubmitting ? "Sending invite..." : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
