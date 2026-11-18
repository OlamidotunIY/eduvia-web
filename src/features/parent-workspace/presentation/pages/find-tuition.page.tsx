import { useState, useMemo } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Compass,
  GraduationCap,
  Search,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  useMarketplaceTuitionQuery,
  useParentChildrenQuery,
} from "../../application/use-parent-workspace";
import type { TuitionMarketplaceOrg } from "../../domain/parent-workspace.types";

const SUBJECT_FILTER_OPTIONS = [
  "All",
  "Mathematics",
  "Sciences (Physics/Chemistry)",
  "English & Literacy",
  "Coding & Robotics",
  "French",
];

export function FindTuitionPage() {
  const marketplaceQuery = useMarketplaceTuitionQuery();
  const childrenQuery = useParentChildrenQuery();
  const orgs = marketplaceQuery.data ?? [];
  const children = childrenQuery.data ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [selectedOrgForEnroll, setSelectedOrgForEnroll] =
    useState<TuitionMarketplaceOrg | null>(null);

  const [selectedChildId, setSelectedChildId] = useState("");
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState<string | null>(
    null,
  );

  const filteredOrgs = useMemo(() => {
    return orgs.filter((org) => {
      const matchSearch =
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.subjects.some((s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchSubject =
        subjectFilter === "All" ||
        org.subjects.some((s) =>
          s.name.toLowerCase().includes(subjectFilter.toLowerCase().split(" ")[0]),
        );

      return matchSearch && matchSubject;
    });
  }, [orgs, searchQuery, subjectFilter]);

  const handleEnrollSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrgForEnroll || !selectedChildId) return;

    const child = children.find((c) => c.id === selectedChildId);
    setEnrollSuccessMessage(
      `Successfully initiated tuition enrollment for ${child?.firstName ?? "child"} at ${selectedOrgForEnroll.name}. An orientation lesson schedule will appear on your calendar!`,
    );
    setSelectedOrgForEnroll(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Compass className="size-4" />
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Find Tuition & Academies
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Discover verified tuition centers, STEM masterclasses, and specialized tutors for your children.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {enrollSuccessMessage ? (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{enrollSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setEnrollSuccessMessage(null)}
            className="text-[11px] underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search academies, subjects, or curricula (e.g. Cambridge, WAEC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUBJECT_FILTER_OPTIONS.map((sub) => {
            const active = subjectFilter === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSubjectFilter(sub)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "border border-border/80 bg-background/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* Academy Listing Grid */}
      {filteredOrgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="absolute size-20 rounded-full bg-primary/10 blur-xl pointer-events-none" />
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/15 via-primary/10 to-transparent border border-primary/20 text-primary shadow-xs">
              <Compass className="size-6" />
            </div>
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            No tuition academies available
          </h3>
          <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {searchQuery || subjectFilter !== "All"
              ? "No academies match your current search and filter criteria. Try adjusting your search query or filters."
              : "There are currently no tuition providers listed in the marketplace. Check back soon!"}
          </p>
          {(searchQuery || subjectFilter !== "All") && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 h-8 px-3.5 text-xs font-medium"
              onClick={() => {
                setSearchQuery("");
                setSubjectFilter("All");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org) => (
            <TuitionOrgCard
              key={org.id}
              org={org}
              onEnroll={() => {
                setSelectedOrgForEnroll(org);
                if (children[0]) setSelectedChildId(children[0].id);
              }}
            />
          ))}
        </div>
      )}

      {/* Enroll Child Dialog */}
      <Dialog
        open={selectedOrgForEnroll !== null}
        onOpenChange={(open) => !open && setSelectedOrgForEnroll(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Enroll in {selectedOrgForEnroll?.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Select which child to enroll in this academy's syllabus.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleEnrollSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Select Child</label>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id} className="text-xs">
                      {child.firstName} {child.lastName} ({child.gradeLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Available Subjects</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {selectedOrgForEnroll?.subjects.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-border/80 bg-muted/40 p-2"
                  >
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {s.gradeRange}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
              <p className="font-semibold text-primary">Pricing Estimate</p>
              <p className="mt-0.5 text-muted-foreground">
                From {selectedOrgForEnroll?.priceRange.currency}{" "}
                {selectedOrgForEnroll?.priceRange.from.toLocaleString()} /{" "}
                {selectedOrgForEnroll?.priceRange.period}. Includes interactive learning board sessions and weekly progress reports.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrgForEnroll(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!selectedChildId}>
                Confirm Enrollment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TuitionOrgCard({
  org,
  onEnroll,
}: {
  org: TuitionMarketplaceOrg;
  onEnroll: () => void;
}) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border-border/80 bg-card/90 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
      <CardContent className="flex flex-1 flex-col p-5">
        {/* Top Org Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-base font-bold text-primary">
              {org.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-heading text-sm font-bold text-foreground">
                  {org.name}
                </h2>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <Star className="size-3 fill-current" />
                  {org.rating}
                </span>
                <span>({org.reviewCount} reviews)</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {org.studentCount} students
                </span>
              </div>
            </div>
          </div>

          {org.badge ? (
            <Badge
              variant={org.badge === "Top Rated" ? "default" : "secondary"}
              className="rounded-md text-[10px] font-semibold shrink-0"
            >
              {org.badge}
            </Badge>
          ) : null}
        </div>

        {/* Tagline */}
        <p className="mt-3 text-xs font-medium text-foreground line-clamp-2">
          {org.tagline}
        </p>

        {/* Curricula Badges */}
        <div className="mt-3 flex flex-wrap gap-1">
          {org.curricula.map((curr) => (
            <span
              key={curr}
              className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {curr}
            </span>
          ))}
        </div>

        {/* Key Subjects */}
        <div className="mt-4 space-y-1 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            Featured Subjects
          </p>
          <div className="flex flex-wrap gap-1.5">
            {org.subjects.slice(0, 3).map((sub) => (
              <span
                key={sub.id}
                className="rounded-lg border border-border/70 bg-background/80 px-2 py-0.5 text-[11px] font-medium"
              >
                {sub.name}
              </span>
            ))}
            {org.subjects.length > 3 ? (
              <span className="text-[10px] text-muted-foreground self-center">
                +{org.subjects.length - 3} more
              </span>
            ) : null}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-border/70">
          <div>
            <p className="text-[10px] text-muted-foreground">Monthly tuition</p>
            <p className="font-heading text-sm font-bold text-foreground">
              {org.priceRange.currency} {org.priceRange.from.toLocaleString()}
              <span className="text-[11px] font-normal text-muted-foreground">
                /{org.priceRange.period}
              </span>
            </p>
          </div>

          <Button size="sm" className="gap-1.5 text-xs shadow-2xs" onClick={onEnroll}>
            <span>Enroll Child</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
