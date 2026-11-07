import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { OrganizationMemberRecord } from "@/shared/domain";

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMemberRecord | null;
  isSubmitting?: boolean;
  onSubmit: (newRole: string) => void;
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  member,
  isSubmitting,
  onSubmit,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState("Teacher");

  useEffect(() => {
    if (member?.role) {
      setSelectedRole(member.role);
    }
  }, [member]);

  if (!member) return null;

  const memberName =
    member.user?.firstName && member.user?.lastName
      ? `${member.user.firstName} ${member.user.lastName}`
      : member.user?.email || member.userId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedRole);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/80">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-1.5 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldAlert className="size-4" />
              </div>
              <DialogTitle className="text-lg font-semibold">Change member role</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Update organization access permissions and administrative capabilities for this member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="p-3 rounded-lg bg-background/60 border border-border/60 space-y-1">
              <p className="text-xs font-medium text-foreground">{memberName}</p>
              {member.user?.email && (
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="change-role-select" className="text-xs font-medium">
                New Role
              </Label>
              <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val ?? "Teacher")}>
                <SelectTrigger id="change-role-select" className="w-full bg-background/50 border-border/70">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="OrgOwner">Owner</SelectItem>
                  <SelectItem value="OrgAdmin">Admin</SelectItem>
                  <SelectItem value="LeadTeacher">Lead teacher</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="TeachingAssistant">Teaching assistant</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving changes..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
