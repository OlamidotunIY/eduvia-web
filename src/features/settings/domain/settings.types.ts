export type SettingsSectionId =
  | "profile"
  | "security"
  | "payment-methods"
  | "billing"
  | "notifications"
  | "appearance"
  | "learning-board"
  | "audio-video"
  | "family"
  | "teaching";

export type SettingsGroupCategory =
  | "account"
  | "billing"
  | "preferences"
  | "classroom"
  | "role";

export interface SettingsSectionItem {
  id: SettingsSectionId;
  label: string;
  description: string;
  iconName: string;
  category: SettingsGroupCategory;
  roles?: ("parent" | "teacher" | "student" | "admin" | "pending")[];
}

export interface SavedPaymentCard {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  cardholderName: string;
}

export interface BillingInvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  description: string;
  pdfUrl?: string;
}
