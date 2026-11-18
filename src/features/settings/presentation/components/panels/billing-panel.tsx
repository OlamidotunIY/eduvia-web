import { useState } from "react";
import {
  Download,
  Receipt,
  Mail,
  Calendar,
  FileCheck2,
  Check,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import type { BillingInvoiceItem } from "../../../domain/settings.types";

const MOCK_INVOICES: BillingInvoiceItem[] = [
  {
    id: "inv_1092",
    invoiceNumber: "INV-2026-004",
    date: "Nov 01, 2026",
    amount: "$120.00",
    status: "paid",
    description: "November Tuition - Fisayo (Year 7) & Timmy (Year 9)",
  },
  {
    id: "inv_1091",
    invoiceNumber: "INV-2026-003",
    date: "Oct 01, 2026",
    amount: "$120.00",
    status: "paid",
    description: "October Tuition - Fisayo & Timmy",
  },
  {
    id: "inv_1090",
    invoiceNumber: "INV-2026-002",
    date: "Sep 01, 2026",
    amount: "$120.00",
    status: "paid",
    description: "September Tuition - Fisayo & Timmy",
  },
];

export function BillingPanel() {
  const [invoices] = useState<BillingInvoiceItem[]>(MOCK_INVOICES);
  const [billingEmail, setBillingEmail] = useState("billing@alexjohnson.com");
  const [savedEmailNotice, setSavedEmailNotice] = useState(false);

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedEmailNotice(true);
    setTimeout(() => setSavedEmailNotice(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
          Billing & Invoices
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Review subscription status, invoice history, and billing contact details.
        </p>
      </div>

      {/* Current Plan Overview (Clean borderless block, not a bulky card) */}
      <div className="pb-6 border-b border-border/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">
                Eduvia Family Tuition Plan
              </span>
              <Badge variant="secondary" className="bg-primary/15 text-primary text-[10px] font-semibold py-0 h-4">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Covers 2 registered students • Unlimited classroom sessions • Weekly AI progress tracking
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xl font-bold font-heading text-foreground">$120.00</span>
            <span className="text-xs text-muted-foreground"> / month</span>
            <p className="text-[11px] text-muted-foreground flex items-center sm:justify-end gap-1 mt-0.5">
              <Calendar className="size-3" />
              Renews Dec 01, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Billing Email */}
      <form onSubmit={handleUpdateEmail} className="space-y-4 pb-6 border-b border-border/40">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <span>Invoice Delivery Contact</span>
          </h3>
          {savedEmailNotice && (
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Check className="size-3.5" />
              Billing email saved!
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 max-w-md">
          <div className="relative flex-1 w-full">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="invoices@example.com"
              className="h-9 pl-9 text-xs"
              type="email"
              required
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-9 text-xs">
            Update
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Monthly statements and payment receipts will be sent to this email address.
        </p>
      </form>

      {/* Invoice History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            <span>Invoice & Payment History</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            {invoices.length} statements
          </span>
        </div>

        <div className="divide-y divide-border/30">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <FileCheck2 className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {inv.invoiceNumber}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary py-0 h-4">
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {inv.description} • {inv.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs font-semibold font-mono text-foreground">
                  {inv.amount}
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <Download className="size-3" />
                  <span>PDF</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
