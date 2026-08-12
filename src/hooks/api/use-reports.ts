import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient, apiGet } from "@/lib/api-client";

export type ReportEntity = "students" | "groups" | "teachers" | "courses" | "attendance" | "grades" | "payments";
export type ReportFormat = "csv" | "xlsx" | "pdf";

export function useReport(entity: ReportEntity, params?: Record<string, string>) {
  return useQuery({
    queryKey: ["reports", entity, params ?? {}],
    queryFn: () => apiGet<Record<string, unknown>[]>(`/reports/${entity}`, { params }),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: async ({
      entity,
      format,
      params,
    }: {
      entity: ReportEntity;
      format: ReportFormat;
      params?: Record<string, string>;
    }) => {
      const response = await apiClient.get(`/reports/${entity}/export`, {
        params: { ...params, format },
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${entity}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
