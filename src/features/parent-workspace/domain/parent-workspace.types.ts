export interface ParentChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  username?: string | null;
  dateOfBirth: string;
  gradeLevel: string;
  countryCode: string;
  timezone: string;
  avatarUrl?: string;
  enrolledSubjects: string[];
  attendanceRate: number;
  completedLessonsCount: number;
  masteryPercentage: number;
  nextLesson?: {
    id: string;
    subject: string;
    teacherName: string;
    scheduledAt: string;
    durationMins: number;
  };
}

export type ParentSubscriptionStatus = "active" | "paused" | "cancelled";

export interface ParentSubscriptionItem {
  id: string;
  childId: string;
  childName: string;
  orgId: string;
  orgName: string;
  subjectName: string;
  planName: string;
  amount: number;
  currency: string;
  billingInterval: "monthly" | "term" | "weekly";
  status: ParentSubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  lessonsPerInterval: number;
}

export interface ParentInvoiceHistoryItem {
  id: string;
  invoiceNumber: string;
  childName: string;
  orgName: string;
  subjectName: string;
  amount: number;
  currency: string;
  date: string;
  status: "paid" | "refunded" | "pending";
  downloadUrl?: string;
}

export interface TuitionMarketplaceOrg {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  tagline: string;
  description: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  subjects: Array<{
    id: string;
    name: string;
    gradeRange: string;
    hourlyRate?: number;
  }>;
  curricula: string[];
  priceRange: {
    from: number;
    to: number;
    currency: string;
    period: "month" | "hour";
  };
  features: string[];
  badge?: "Top Rated" | "Popular" | "Verified";
}
