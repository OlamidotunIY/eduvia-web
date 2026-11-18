import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  CreditCard,
  Receipt,
  Download,
  PauseCircle,
  PlayCircle,
  XCircle,
  MoreVertical,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
} from "lucide-react";
import {
  DataTable,
  type DataTableFeatures,
} from "@/shared/composites/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  useParentInvoicesQuery,
  useParentSubscriptionsQuery,
  useUpdateSubscriptionStatusMutation,
} from "../../application/use-parent-workspace";
import type {
  ParentSubscriptionItem,
  ParentInvoiceHistoryItem,
} from "../../domain/parent-workspace.types";

const subColumnHelper =
  createColumnHelper<DataTableFeatures, ParentSubscriptionItem>();
const invColumnHelper =
  createColumnHelper<DataTableFeatures, ParentInvoiceHistoryItem>();

const subColumnLabels = {
  child: "Learner",
  tuition: "Tuition & Subject",
  plan: "Plan & Schedule",
  billing: "Billing",
  status: "Status",
  renewal: "Next Renewal",
  actions: "Actions",
};

const invColumnLabels = {
  invoiceNumber: "Invoice #",
  program: "Tuition Program",
  childName: "Learner",
  amount: "Amount Paid",
  date: "Billing Date",
  status: "Status",
  receipt: "Receipt",
};

export function ParentBillingPage() {
  const subsQuery = useParentSubscriptionsQuery();
  const invoicesQuery = useParentInvoicesQuery();
  const updateStatusMutation = useUpdateSubscriptionStatusMutation();

  const subscriptions = subsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];

  const [activeTab, setActiveTab] = useState<string>("subscriptions");
  const [cancelTarget, setCancelTarget] =
    useState<ParentSubscriptionItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedInvoice, setSelectedInvoice] =
    useState<ParentInvoiceHistoryItem | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(
    null,
  );

  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const totalMonthlySpend = activeSubs.reduce((acc, s) => acc + s.amount, 0);

  const handlePauseResume = async (sub: ParentSubscriptionItem) => {
    const nextAction = sub.status === "paused" ? "resume" : "pause";
    await updateStatusMutation.mutateAsync({
      subscriptionId: sub.id,
      action: nextAction,
    });
    setStatusNotification(
      `Subscription for ${sub.subjectName} (${sub.childName}) has been ${
        nextAction === "pause" ? "paused" : "resumed"
      }.`,
    );
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    await updateStatusMutation.mutateAsync({
      subscriptionId: cancelTarget.id,
      action: "cancel",
      reason: cancelReason,
    });
    setCancelTarget(null);
    setCancelReason("");
    setStatusNotification(
      `Subscription for ${cancelTarget.subjectName} has been cancelled.`,
    );
  };

  const subColumns = useMemo(
    () => [
      subColumnHelper.accessor("childName", {
        id: "child",
        header: "Learner",
        cell: (info) => {
          const row = info.row.original;
          const initials = row.childName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8 rounded-full border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {row.childName}
                </span>
                <span className="text-xs text-muted-foreground">Enrolled</span>
              </div>
            </div>
          );
        },
      }),
      subColumnHelper.accessor("subjectName", {
        id: "tuition",
        header: "Tuition & Subject",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {row.subjectName}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Building2 className="size-3 shrink-0" />
                <span className="truncate">{row.orgName}</span>
              </div>
            </div>
          );
        },
      }),
      subColumnHelper.accessor("planName", {
        id: "plan",
        header: "Plan & Schedule",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-foreground">
                {row.planName}
              </span>
              <Badge variant="secondary" className="w-fit text-[11px] font-normal">
                {row.lessonsPerInterval} lessons / month
              </Badge>
            </div>
          );
        },
      }),
      subColumnHelper.accessor("amount", {
        id: "billing",
        header: "Billing",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">
                ₦{row.amount.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground capitalize">
                Per {row.billingInterval}
              </span>
            </div>
          );
        },
      }),
      subColumnHelper.accessor("status", {
        id: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          if (status === "active") {
            return (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
              >
                Active
              </Badge>
            );
          }
          if (status === "paused") {
            return (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium"
              >
                Paused
              </Badge>
            );
          }
          return (
            <Badge
              variant="outline"
              className="border-muted bg-muted/30 text-muted-foreground text-xs"
            >
              Cancelled
            </Badge>
          );
        },
      }),
      subColumnHelper.accessor("nextBillingDate", {
        id: "renewal",
        header: "Next Renewal",
        cell: (info) => {
          const row = info.row.original;
          if (row.status === "cancelled") {
            return (
              <span className="text-xs text-muted-foreground italic">
                Cancelled
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <Calendar className="size-3 text-muted-foreground shrink-0" />
              <span>{row.nextBillingDate}</span>
            </div>
          );
        },
      }),
      subColumnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const row = info.row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-8"
                    aria-label="Manage subscription"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                {row.status !== "cancelled" ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => handlePauseResume(row)}
                      className="cursor-pointer"
                    >
                      {row.status === "paused" ? (
                        <>
                          <PlayCircle className="size-4 text-emerald-500" />
                          <span>Resume tuition</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle className="size-4 text-amber-500" />
                          <span>Pause tuition</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setCancelTarget(row)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <XCircle className="size-4" />
                      <span>Cancel enrollment</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled>
                    Subscription terminated
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [],
  );

  const invColumns = useMemo(
    () => [
      invColumnHelper.accessor("invoiceNumber", {
        id: "invoiceNumber",
        header: "Invoice #",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-muted-foreground shrink-0" />
            <span className="font-mono text-xs font-semibold text-foreground">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      invColumnHelper.accessor("subjectName", {
        id: "program",
        header: "Tuition Program",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {row.subjectName}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {row.orgName}
              </span>
            </div>
          );
        },
      }),
      invColumnHelper.accessor("childName", {
        id: "childName",
        header: "Learner",
        cell: (info) => (
          <span className="text-sm text-foreground">{info.getValue()}</span>
        ),
      }),
      invColumnHelper.accessor("amount", {
        id: "amount",
        header: "Amount Paid",
        cell: (info) => (
          <span className="font-semibold text-sm text-foreground">
            ₦{info.getValue().toLocaleString()}
          </span>
        ),
      }),
      invColumnHelper.accessor("date", {
        id: "date",
        header: "Billing Date",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3 shrink-0" />
            <span>
              {new Date(info.getValue()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        ),
      }),
      invColumnHelper.accessor("status", {
        id: "status",
        header: "Status",
        cell: () => (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
          >
            Paid
          </Badge>
        ),
      }),
      invColumnHelper.display({
        id: "receipt",
        header: "Receipt",
        cell: (info) => {
          const row = info.row.original;
          return (
            <Button
              variant="ghost"
              size="xs"
              className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedInvoice(row)}
            >
              <Download className="size-3.5" />
              <span>Receipt</span>
            </Button>
          );
        },
      }),
    ],
    [],
  );

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Family Tuition & Billing
          </p>
          <h1 className="mt-1 font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Subscriptions & Billing
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs md:text-sm text-muted-foreground">
            Manage your active tuition subscriptions, billing intervals, renewal
            dates, and payment receipts across all enrolled children.
          </p>
        </div>
      </div>

      {/* Aggregate KPI / Metrics Bar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Monthly Spend
            </span>
            <CreditCard className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-heading">
            ₦{totalMonthlySpend.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Across {activeSubs.length} active tuition subjects
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Active Enrollments
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-heading">
            {activeSubs.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {subscriptions.length - activeSubs.length} paused or pending
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Next Renewal Date
            </span>
            <Calendar className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-heading">
            {activeSubs[0]?.nextBillingDate ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Autopay enabled via card
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Payment Security
            </span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-base font-semibold tracking-tight text-foreground">
            Mastercard ···· 4242
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PCI-DSS compliant token
          </p>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusNotification && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary shrink-0" />
            <span>{statusNotification}</span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            className="h-6 px-2 text-xs"
            onClick={() => setStatusNotification(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Tabs with DataTables */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="gap-4 w-full"
      >
        <TabsList
          variant="line"
          aria-label="Billing sections"
          className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent p-0 pb-2 overflow-x-auto scrollbar-none flex-nowrap"
        >
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="subscriptions"
          >
            <CreditCard className="size-3.5" />
            <span>Active Subscriptions ({subscriptions.length})</span>
          </TabsTrigger>
          <TabsTrigger
            className="h-8 flex-none rounded-lg px-3.5 text-xs font-medium after:inset-x-2 after:-bottom-[9px] after:bg-primary data-active:bg-primary/15! data-active:text-primary! dark:data-active:bg-primary/20! dark:data-active:text-primary!"
            value="invoices"
          >
            <Receipt className="size-3.5" />
            <span>Invoice History ({invoices.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="pt-2 outline-none">
          <DataTable
            columns={subColumns}
            data={subscriptions}
            isLoading={subsQuery.isLoading}
            columnLabels={subColumnLabels}
            searchKey="child"
            searchPlaceholder="Filter subscriptions by child..."
            emptyHeading="No tuition subscriptions"
            emptyDescription="You have not enrolled in any tuition plans yet. Browse accredited academies to get started."
            emptyIcon={CreditCard}
          />
        </TabsContent>

        {/* Invoice History Tab */}
        <TabsContent value="invoices" className="pt-2 outline-none">
          <DataTable
            columns={invColumns}
            data={invoices}
            isLoading={invoicesQuery.isLoading}
            columnLabels={invColumnLabels}
            searchKey="program"
            searchPlaceholder="Search invoices by program or academy..."
            emptyHeading="No invoices recorded"
            emptyDescription="Tuition payments and billing receipts will appear here automatically."
            emptyIcon={Receipt}
          />
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Tuition Subscription?</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop enrollment for{" "}
              <strong>{cancelTarget?.childName}</strong> in{" "}
              <strong>{cancelTarget?.subjectName}</strong>? They will retain
              access until the end of the current billing cycle.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Reason for cancellation (optional):
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              rows={3}
              placeholder="e.g. Completed objective, scheduling conflict, etc."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelTarget(null)}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending
                ? "Processing..."
                : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog
        open={Boolean(selectedInvoice)}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Receipt className="size-5 text-primary" />
              <DialogTitle>Payment Receipt</DialogTitle>
            </div>
            <DialogDescription>
              Official proof of tuition payment.
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 py-3">
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]"
                  >
                    Paid
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Learner</span>
                    <span className="font-semibold text-foreground">
                      {selectedInvoice.childName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Program</span>
                    <span className="font-semibold text-foreground">
                      {selectedInvoice.subjectName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Academy</span>
                    <span className="font-semibold text-foreground">
                      {selectedInvoice.orgName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Date</span>
                    <span className="font-semibold text-foreground">
                      {new Date(selectedInvoice.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-medium text-foreground">
                    Total Paid
                  </span>
                  <span className="text-lg font-bold text-foreground font-heading">
                    ₦{selectedInvoice.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedInvoice(null)}
            >
              Close
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                const dummyLink = document.createElement("a");
                dummyLink.href = "data:text/plain;charset=utf-8,Eduvia Receipt";
                dummyLink.download = `${selectedInvoice?.invoiceNumber}.pdf`;
                dummyLink.click();
              }}
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
