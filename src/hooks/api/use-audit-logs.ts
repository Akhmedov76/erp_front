import { useQuery } from "@tanstack/react-query";

import { apiGetPaginated } from "@/lib/api-client";
import type { ListQueryParams } from "@/types/api";
import type { AuditLog } from "@/types/system";

export function useAuditLogs(params?: ListQueryParams) {
  return useQuery({
    queryKey: ["audit-logs", params ?? {}],
    queryFn: () => apiGetPaginated<AuditLog>("/audit-logs", { params }),
    placeholderData: (previous) => previous,
  });
}
