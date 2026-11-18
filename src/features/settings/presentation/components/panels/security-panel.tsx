import { useState } from "react";
import {
  Check,
  KeyRound,
  Laptop,
  Smartphone,
  Shield,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";

export function SecurityPanel() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
          Security & Access
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage your password, multi-factor authentication, and monitor active sessions.
        </p>
      </div>

      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4 pb-6 border-b border-border/40">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            <span>Change Password</span>
          </h3>
          {passwordSaved && (
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Check className="size-3.5" />
              Password updated!
            </span>
          )}
        </div>

        <div className="space-y-3 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="curr-password" className="text-xs font-medium text-muted-foreground">
              Current Password
            </Label>
            <Input
              id="curr-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-9 text-xs"
              placeholder="••••••••••••"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-medium text-muted-foreground">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-9 text-xs"
              placeholder="Minimum 8 characters"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-medium text-muted-foreground">
              Confirm New Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-9 text-xs"
              placeholder="Re-enter new password"
              required
            />
          </div>

          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs mt-2">
            Update Password
          </Button>
        </div>
      </form>

      {/* Two-Factor Authentication */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          <span>Two-Factor Authentication (2FA)</span>
        </h3>

        <div className="flex items-start justify-between gap-4 py-2">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Authenticator App / SMS Verification
              </span>
              <Badge
                variant="outline"
                className={
                  twoFactorEnabled
                    ? "border-primary/40 bg-primary/10 text-primary text-[10px]"
                    : "border-muted-foreground/30 text-muted-foreground text-[10px]"
                }
              >
                {twoFactorEnabled ? "Active" : "Disabled"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add an additional layer of security to your account. When enabled, signing in will require a one-time verification code.
            </p>
          </div>

          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
            aria-label="Toggle Two-Factor Authentication"
          />
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Laptop className="size-4 text-primary" />
            <span>Active Login Sessions</span>
          </h3>
          <Button variant="ghost" size="xs" className="h-7 text-xs text-muted-foreground hover:text-foreground">
            Sign out other sessions
          </Button>
        </div>

        <div className="divide-y divide-border/30">
          {/* Session 1: Current */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Laptop className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    Chrome on Windows (11)
                  </span>
                  <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary py-0 h-4">
                    Current Device
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Lagos, Nigeria • IP: 102.89.44.12 • Active now
                </p>
              </div>
            </div>
          </div>

          {/* Session 2: Mobile */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Smartphone className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    Eduvia Mobile on iPhone 15 Pro
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  London, United Kingdom • IP: 82.165.197.1 • Last active 2 hours ago
                </p>
              </div>
            </div>
            <Button variant="ghost" size="xs" className="h-7 text-xs text-muted-foreground hover:text-destructive">
              <LogOut className="size-3 mr-1" />
              Revoke
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive flex items-center gap-1.5">
          <AlertTriangle className="size-3.5" />
          <span>Danger Zone</span>
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-t border-destructive/20">
          <div>
            <p className="text-xs sm:text-sm font-medium text-foreground">
              Deactivate or Delete Account
            </p>
            <p className="text-xs text-muted-foreground">
              Permanently delete your user profile, children's enrollment records, and historical lesson reports.
            </p>
          </div>
          <Button variant="destructive" size="sm" className="h-8 text-xs shrink-0">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
