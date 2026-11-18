import { useState } from "react";
import {
  CreditCard,
  Plus,
  ShieldCheck,
  Trash2,
  Check,
  Lock,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import type { SavedPaymentCard } from "../../../domain/settings.types";

const INITIAL_CARDS: SavedPaymentCard[] = [
  {
    id: "card_1",
    brand: "visa",
    last4: "4242",
    expiryMonth: "08",
    expiryYear: "28",
    isDefault: true,
    cardholderName: "Alex Johnson",
  },
  {
    id: "card_2",
    brand: "mastercard",
    last4: "8891",
    expiryMonth: "11",
    expiryYear: "27",
    isDefault: false,
    cardholderName: "Alex Johnson",
  },
];

export function PaymentMethodsPanel() {
  const [cards, setCards] = useState<SavedPaymentCard[]>(INITIAL_CARDS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [autoPay, setAutoPay] = useState(true);
  const [requireCvv, setRequireCvv] = useState(true);

  // Form state
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSetDefault = (id: string) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === id,
      })),
    );
    setSuccessNotice("Default payment method updated");
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleRemove = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    setSuccessNotice("Card removed successfully");
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) return;

    const last4 = cardNumber.replace(/\s+/g, "").slice(-4) || "9999";
    const [month, year] = expiry.split("/");
    const newCard: SavedPaymentCard = {
      id: `card_${Date.now()}`,
      brand: cardNumber.startsWith("5") ? "mastercard" : "visa",
      last4,
      expiryMonth: month || "12",
      expiryYear: year || "29",
      isDefault: setAsDefault || cards.length === 0,
      cardholderName: cardholderName || "Alex Johnson",
    };

    if (newCard.isDefault) {
      setCards((prev) => [
        ...prev.map((c) => ({ ...c, isDefault: false })),
        newCard,
      ]);
    } else {
      setCards((prev) => [...prev, newCard]);
    }

    setShowAddForm(false);
    setCardholderName("");
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setSetAsDefault(false);
    setSuccessNotice("New payment method added successfully");
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/50 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
            Payment Methods
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your credit and debit cards for monthly tuition and tutor bookings.
          </p>
        </div>

        {!showAddForm && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="h-8 gap-1.5 text-xs font-semibold shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Add Payment Method</span>
          </Button>
        )}
      </div>

      {successNotice && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium animate-in fade-in">
          <Check className="size-3.5" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Add New Card Form (Collapsible) */}
      {showAddForm && (
        <form
          onSubmit={handleAddCard}
          className="p-5 rounded-2xl border border-border/70 bg-muted/20 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <span>Add Credit or Debit Card</span>
            </h3>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Lock className="size-3" />
              256-bit encrypted
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="card-name" className="text-xs font-medium text-muted-foreground">
                Cardholder Name
              </Label>
              <Input
                id="card-name"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Name as it appears on card"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="card-number" className="text-xs font-medium text-muted-foreground">
                Card Number
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  id="card-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="h-9 pl-9 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="card-expiry" className="text-xs font-medium text-muted-foreground">
                Expiration Date (MM/YY)
              </Label>
              <Input
                id="card-expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="h-9 text-xs font-mono"
                maxLength={5}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="card-cvc" className="text-xs font-medium text-muted-foreground">
                CVC / CVV
              </Label>
              <Input
                id="card-cvc"
                type="password"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="•••"
                className="h-9 text-xs font-mono"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Switch
              checked={setAsDefault}
              onCheckedChange={setSetAsDefault}
              id="set-default"
            />
            <Label htmlFor="set-default" className="text-xs text-foreground cursor-pointer">
              Set as primary payment method for tuition charges
            </Label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs font-semibold px-4">
              Save Card
            </Button>
          </div>
        </form>
      )}

      {/* Saved Cards List */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="size-4 text-primary" />
          <span>Saved Cards ({cards.length})</span>
        </h3>

        {cards.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">
            No payment methods currently saved. Add a card to facilitate seamless lesson enrollments.
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60 border border-border/60 text-foreground font-semibold text-xs tracking-wider uppercase">
                    {card.brand === "visa" ? "VISA" : "MC"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-foreground">
                        {card.brand === "visa" ? "Visa" : "Mastercard"} •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-primary/15 text-primary py-0 h-4 font-semibold"
                        >
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Expires {card.expiryMonth}/{card.expiryYear} • {card.cardholderName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!card.isDefault && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleSetDefault(card.id)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Make Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleRemove(card.id)}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    title="Remove card"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-pay and Security Settings */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <span>Payment Automation & Protection</span>
        </h3>

        <div className="space-y-4 divide-y divide-border/30">
          <div className="flex items-start justify-between gap-4 pt-1">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Automatic Tuition Renewal
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatically charge your primary payment method on monthly invoice renewal dates to prevent lesson interruption.
              </p>
            </div>
            <Switch
              checked={autoPay}
              onCheckedChange={setAutoPay}
              aria-label="Toggle Automatic Tuition Renewal"
            />
          </div>

          <div className="flex items-start justify-between gap-4 pt-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Security Verification for Bookings
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prompt for CVV or 3D-Secure confirmation before booking new tutors or private sessions.
              </p>
            </div>
            <Switch
              checked={requireCvv}
              onCheckedChange={setRequireCvv}
              aria-label="Toggle Security Verification"
            />
          </div>
        </div>
      </div>

      {/* Trust & Compliance info */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/40 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-4 text-primary shrink-0" />
        <span>
          Payment card details are tokenized and stored securely by certified PCI-DSS Level 1 compliant payment gateways. Eduvia never stores your raw card number or security code.
        </span>
      </div>
    </div>
  );
}
