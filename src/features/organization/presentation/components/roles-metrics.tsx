import { Layers, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import type { OrganizationRoleDefinition } from "@/shared/domain";

interface RolesMetricsProps {
  roles: OrganizationRoleDefinition[];
  isLoading?: boolean;
}

export function RolesMetrics({ roles, isLoading }: RolesMetricsProps) {
  const totalRoles = roles.length;
  const systemRoles = roles.filter((r) => r.isSystem).length;
  const customRoles = roles.filter((r) => !r.isSystem).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Total roles */}
      <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
        <div className="flex flex-row items-center gap-4 px-5 py-4">
          <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-normal text-muted-foreground">Total roles</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-10" /> : totalRoles}
            </h3>
          </div>
        </div>
      </Card>

      {/* Card 2: System roles */}
      <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
        <div className="flex flex-row items-center gap-4 px-5 py-4">
          <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="size-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-normal text-muted-foreground">System roles</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-10" /> : systemRoles}
            </h3>
          </div>
        </div>
      </Card>

      {/* Card 3: Custom roles */}
      <Card className="bg-card/70 border-border/70 rounded-xl shadow-none py-0">
        <div className="flex flex-row items-center gap-4 px-5 py-4">
          <div className="size-10 rounded-lg bg-muted/70 border border-border/60 text-muted-foreground flex items-center justify-center shrink-0">
            <SlidersHorizontal className="size-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-normal text-muted-foreground">Custom roles</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-10" /> : customRoles}
            </h3>
          </div>
        </div>
      </Card>
    </div>
  );
}
