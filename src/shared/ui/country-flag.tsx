import { Globe } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const regionNames = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;

export function getCountryName(code?: string | null): string {
  if (!code) return "International";
  const normalized = code.trim().toUpperCase();
  if (
    normalized === "INT" ||
    normalized === "GLOBAL" ||
    normalized === "INTERNATIONAL"
  ) {
    return "International";
  }
  if (normalized === "UK") {
    return "United Kingdom";
  }
  try {
    return regionNames?.of(normalized) || normalized;
  } catch {
    return normalized;
  }
}

interface CountryFlagProps {
  code?: string | null;
  className?: string;
  name?: string;
}

export function CountryFlag({ code, className, name }: CountryFlagProps) {
  const normalized = (code || "INT").trim().toUpperCase();

  if (
    normalized === "INT" ||
    normalized === "GLOBAL" ||
    normalized === "INTERNATIONAL"
  ) {
    return (
      <Globe
        className={cn("size-4 shrink-0 text-foreground/80", className)}
        aria-label="International"
      />
    );
  }

  // Convert UK alias to GB for standard ISO flag lookup
  const isoCode = (normalized === "UK" ? "gb" : normalized).toLowerCase();
  const countryName = name || getCountryName(normalized);

  return (
    <span className="inline-flex shrink-0 items-center justify-center">
      <img
        src={`https://flagcdn.com/w40/${isoCode}.png`}
        srcSet={`https://flagcdn.com/w80/${isoCode}.png 2x`}
        width={20}
        height={14}
        alt={countryName}
        loading="lazy"
        className={cn(
          "inline-block h-3.5 w-5 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.15)]",
          className,
        )}
        onError={(e) => {
          // If flag image fails to load, gracefully hide and show globe
          e.currentTarget.style.display = "none";
          const sibling = e.currentTarget.nextElementSibling;
          if (sibling) {
            sibling.classList.remove("hidden");
          }
        }}
      />
      <Globe className="hidden size-4 shrink-0 text-muted-foreground" />
    </span>
  );
}
