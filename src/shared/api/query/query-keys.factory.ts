

export function createQueryKeyFactory<const T extends string>(scope: T) {
    return {
        all: [scope] as const,
        lists: () => [scope, "list"] as const,
        list: (filters: Record<string, unknown>) => [scope, "list", filters] as const,
        details: () => [scope, "detail"] as const,
        detail: (id: string | number) => [scope, "detail", id] as const,
    }
}