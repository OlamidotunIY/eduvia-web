import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import type {
  ParentChildProfile,
  ParentInvoiceHistoryItem,
  ParentSubscriptionItem,
  TuitionMarketplaceOrg,
} from "../domain/parent-workspace.types";

const PARENT_CHILDREN_STORAGE_KEY = "eduvia-parent-children-v1";
const PARENT_SUBS_STORAGE_KEY = "eduvia-parent-subscriptions-v1";

// Safely purge any legacy stale mock data from browser localStorage if present
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem(PARENT_CHILDREN_STORAGE_KEY);
    localStorage.removeItem(PARENT_SUBS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useParentChildrenQuery() {
  return useQuery({
    queryKey: ["parent", "children"],
    queryFn: async (): Promise<ParentChildProfile[]> => {
      try {
        const response = await apiClient.get<ParentChildProfile[]>("/users/parents/students");
        if (Array.isArray(response.data)) {
          return response.data;
        }
      } catch (err) {
        console.warn("Failed to fetch parent children from backend:", err);
      }
      return [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useRegisterChildMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      firstName: string;
      lastName: string;
      email: string;
      username?: string;
      password: string;
      dateOfBirth: string;
      gradeLevel: string;
      countryCode?: string;
      timezone?: string;
      enrolledSubjects?: string[];
    }): Promise<ParentChildProfile> => {
      const res = await apiClient.post<ParentChildProfile>("/users/parents/students", {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim().toLowerCase(),
        username: input.username?.trim() ? input.username.trim().toLowerCase() : undefined,
        password: input.password,
        dateOfBirth: input.dateOfBirth,
        gradeLevel: input.gradeLevel,
        countryCode: input.countryCode ?? "GB",
        timezone: input.timezone ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"),
      });

      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["parent", "children"] });
    },
  });
}

export function useParentSubscriptionsQuery() {
  return useQuery({
    queryKey: ["parent", "subscriptions"],
    queryFn: async (): Promise<ParentSubscriptionItem[]> => {
      try {
        const res = await apiClient.get<any[]>("/subscriptions");
        if (Array.isArray(res.data)) {
          return res.data.map((item) => ({
            id: item.id,
            childId: item.studentId ?? "",
            childName: item.studentName ?? "Learner",
            orgId: item.orgId,
            orgName: item.orgName ?? "Academy",
            subjectName: item.subjectName ?? "Subject",
            planName: item.planName ?? "Tuition Plan",
            amount: item.effectivePriceAmount ?? item.amount ?? 0,
            currency: item.currency ?? "NGN",
            billingInterval: item.billingInterval ?? "monthly",
            status: item.status ?? "active",
            currentPeriodStart: item.currentPeriodStart,
            currentPeriodEnd: item.currentPeriodEnd,
            nextBillingDate: item.currentPeriodEnd
              ? new Date(item.currentPeriodEnd).toLocaleDateString()
              : "N/A",
            lessonsPerInterval: item.lessonsPerInterval ?? 4,
          }));
        }
      } catch (err) {
        console.warn("Failed to fetch subscriptions from backend:", err);
      }
      return [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useParentInvoicesQuery() {
  return useQuery({
    queryKey: ["parent", "invoices"],
    queryFn: async (): Promise<ParentInvoiceHistoryItem[]> => {
      try {
        const res = await apiClient.get<ParentInvoiceHistoryItem[]>("/billing/history");
        if (Array.isArray(res.data)) return res.data;
      } catch (err) {
        console.warn("Failed to fetch billing history from backend:", err);
      }
      return [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateSubscriptionStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subscriptionId,
      action,
      reason,
    }: {
      subscriptionId: string;
      action: "pause" | "resume" | "cancel";
      reason?: string;
    }) => {
      if (action === "pause") {
        await apiClient.post(`/subscriptions/${subscriptionId}/pause`);
      } else if (action === "resume") {
        await apiClient.post(`/subscriptions/${subscriptionId}/resume`);
      } else if (action === "cancel") {
        await apiClient.post(`/subscriptions/${subscriptionId}/cancel`, { reason });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["parent", "subscriptions"] });
    },
  });
}

export function useMarketplaceTuitionQuery() {
  return useQuery({
    queryKey: ["marketplace", "tuition"],
    queryFn: async (): Promise<TuitionMarketplaceOrg[]> => {
      try {
        const res = await apiClient.get<any[]>("/marketplace/organizations");
        if (Array.isArray(res.data)) {
          return res.data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            logoUrl: item.logoUrl ?? undefined,
            tagline: item.description ? item.description.slice(0, 100) : "Accredited Tuition Academy",
            description: item.description ?? "Quality personalized tutoring and curriculum mastery.",
            rating: item.rating ?? 5.0,
            reviewCount: item.reviewCount ?? 0,
            studentCount: item.studentCount ?? 0,
            subjects: (item.subjects ?? []).map((s: any) => ({
              id: s.id,
              name: s.name,
              gradeRange: s.gradeRange ?? "All Grades",
              hourlyRate: s.hourlyRate ?? 0,
            })),
            curricula: item.curricula ?? ["Standard Curriculum"],
            priceRange: item.priceRange ?? {
              from: 0,
              to: 0,
              currency: "NGN",
              period: "month" as const,
            },
            features: item.features ?? ["Certified educators", "Progress updates"],
            badge: item.badge ?? undefined,
          }));
        }
      } catch (err) {
        console.warn("Failed to fetch marketplace organizations:", err);
      }
      return [];
    },
    staleTime: 1000 * 60 * 10,
  });
}
