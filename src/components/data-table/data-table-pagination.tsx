import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";

interface DataTablePaginationProps {
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({ meta, page, onPageChange }: DataTablePaginationProps) {
  if (!meta || meta.total === 0) return null;

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-2 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {meta.total} tadan {start}–{end} ko'rsatilmoqda
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={meta.page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Oldingi
        </Button>
        <span className="text-sm text-muted-foreground">
          {meta.page} / {meta.totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={meta.page >= meta.totalPages}
        >
          Keyingi
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
