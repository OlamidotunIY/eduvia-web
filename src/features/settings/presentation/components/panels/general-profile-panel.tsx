import { useState } from "react";
import { Camera, Check, Globe, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { sessionStore } from "@/shared/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";

export function GeneralProfilePanel() {
  const currentUser = sessionStore((state) => state.currentUser);
  const user = currentUser?.user;

  const [firstName, setFirstName] = useState(user?.firstName || "Alex");
  const [lastName, setLastName] = useState(user?.lastName || "Johnson");
  const [email] = useState(user?.email || "alex.johnson@eduvia.org");
  const [phone, setPhone] = useState("+234 802 345 6789");
  const [timezone, setTimezone] = useState(user?.timezone || "Africa/Lagos");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((n) => n.charAt(0).toUpperCase())
      .join("") || "U";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
          General Profile
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage your personal information, contact email, and regional preferences.
        </p>
      </div>

      {/* Avatar / Photo section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="size-16 sm:size-20 rounded-2xl ring-2 ring-border shadow-xs">
              <AvatarImage src={user?.image ?? undefined} alt={fullName} />
              <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground font-semibold text-lg sm:text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              title="Change avatar"
            >
              <Camera className="size-3.5" />
            </button>
          </div>
          <div>
            <h3 className="font-medium text-sm text-foreground">{fullName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG or WEBP up to 5MB. Recommended ratio 1:1.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button type="button" variant="outline" size="xs" className="h-7 text-xs">
                Upload New
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="h-6 w-fit text-[11px] font-medium border-primary/30 bg-primary/10 text-primary capitalize">
          Role: {user?.userType || "Parent"}
        </Badge>
      </div>

      {/* Name and Basic Info */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="size-4 text-primary" />
          <span>Personal Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="first-name" className="text-xs font-medium text-muted-foreground">
              First Name
            </Label>
            <Input
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-9 text-xs"
              placeholder="e.g. Alex"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="last-name" className="text-xs font-medium text-muted-foreground">
              Last Name
            </Label>
            <Input
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-9 text-xs"
              placeholder="e.g. Johnson"
              required
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Mail className="size-4 text-primary" />
          <span>Contact Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email Address
              </Label>
              <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
                <ShieldCheck className="size-3" />
                Verified
              </span>
            </div>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="h-9 text-xs bg-muted/40 cursor-not-allowed opacity-80"
            />
            <p className="text-[11px] text-muted-foreground">
              Used for lesson notifications, receipts, and authentication.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 pl-9 text-xs"
                placeholder="+234 800 000 0000"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              For urgent SMS lesson reminders and security alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Regional & Localization */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Globe className="size-4 text-primary" />
          <span>Localization & Regional Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="timezone" className="text-xs font-medium text-muted-foreground">
              Timezone
            </Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
              <option value="Africa/Accra">Africa/Accra (GMT+0)</option>
              <option value="Europe/London">Europe/London (GMT+0 / GMT+1)</option>
              <option value="America/New_York">America/New York (EST/EDT)</option>
              <option value="America/Chicago">America/Chicago (CST/CDT)</option>
              <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST+4)</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              All lesson calendars and session times display in this timezone.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="language" className="text-xs font-medium text-muted-foreground">
              Display Language
            </Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="en">English (UK / International)</option>
              <option value="en-us">English (US)</option>
              <option value="fr">Français (French)</option>
              <option value="es">Español (Spanish)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-xs font-medium text-muted-foreground">
              Preferred Currency
            </Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="NGN">NGN (₦) - Nigerian Naira</option>
              <option value="CAD">CAD ($) - Canadian Dollar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium animate-in fade-in">
              <Check className="size-3.5" />
              Profile settings saved successfully!
            </span>
          )}
        </div>
        <Button type="submit" size="sm" className="h-9 px-5 text-xs font-semibold">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
