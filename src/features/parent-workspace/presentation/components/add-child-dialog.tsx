import { useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
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
import { useRegisterChildMutation } from "../../application/use-parent-workspace";

interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GRADE_LEVELS = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7 (JSS 1)",
  "Grade 8 (JSS 2)",
  "Grade 9 (JSS 3)",
  "Grade 10 (SSS 1)",
  "Grade 11 (SSS 2)",
  "Grade 12 (SSS 3)",
];

export function AddChildDialog({ open, onOpenChange }: AddChildDialogProps) {
  const registerMutation = useRegisterChildMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("2014-06-15");
  const [gradeLevel, setGradeLevel] = useState("Grade 6");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setDateOfBirth("2014-06-15");
    setGradeLevel("Grade 6");
    setErrorMessage(null);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Please enter your child's first and last name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter an email address for your child's login.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Please set a login password with at least 6 characters.");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim() ? username.trim().toLowerCase() : undefined,
        password,
        dateOfBirth,
        gradeLevel,
      });

      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to register child. Please check the details and try again.";
      setErrorMessage(typeof message === "string" ? message : "Failed to register child.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[85dvh] rounded-2xl">
        <DialogHeader className="p-5 pb-3.5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3 pr-8">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <UserPlus className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Register a Child Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Creates student account & login credentials on Eduvia.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3.5 scrollbar-thin overscroll-contain">
            {/* Informational Callout: Registration vs Enrollment */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground/90 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <ShieldCheck className="size-3.5" />
                <span>Student Login Provision</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Registering creates your child's student identity. They will use the email and password below to log in to their Student Workspace. Classroom enrollment and tuition subscriptions are managed separately after registration.
              </p>
            </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="child-first-name" className="text-xs font-medium">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="child-first-name"
                placeholder="e.g. Timi"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="child-last-name" className="text-xs font-medium">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="child-last-name"
                placeholder="e.g. Adebayo"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Student Login Email & Username */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="child-email" className="text-xs font-medium flex items-center gap-1">
                <Mail className="size-3 text-muted-foreground" />
                <span>Student Login Email</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="child-email"
                type="email"
                placeholder="e.g. timi@adebayo.family"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="child-username" className="text-xs font-medium flex items-center gap-1">
                <span>Username</span>
                <span className="text-[10px] text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="child-username"
                placeholder="e.g. timi.adebayo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Student Login Password */}
          <div className="space-y-1">
            <Label htmlFor="child-password" className="text-xs font-medium flex items-center gap-1">
              <KeyRound className="size-3 text-muted-foreground" />
              <span>Student Password</span>
              <span className="text-destructive">*</span>
              <span className="text-[10px] text-muted-foreground">(Min. 6 chars)</span>
            </Label>
            <div className="relative">
              <Input
                id="child-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create password for child's login"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-9 pr-9 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Date of Birth & Grade Level */}
          <div className="grid grid-cols-2 gap-3 pt-0.5">
            <div className="space-y-1">
              <Label htmlFor="child-dob" className="text-xs font-medium">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="child-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="child-grade" className="text-xs font-medium flex items-center gap-1">
                <GraduationCap className="size-3 text-muted-foreground" />
                <span>Grade Level</span>
              </Label>
              <Select value={gradeLevel} onValueChange={(val) => val && setGradeLevel(val)}>
                <SelectTrigger id="child-grade" className="h-9 text-xs">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((g) => (
                    <SelectItem key={g} value={g} className="text-xs">
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="p-3.5 sm:px-5 bg-muted/20 border-t border-border/40 shrink-0 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={
              registerMutation.isPending ||
              !firstName.trim() ||
              !lastName.trim() ||
              !email.trim() ||
              !password
            }
          >
            {registerMutation.isPending ? "Registering Child..." : "Register Child Account"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);
}
