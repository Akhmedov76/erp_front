import { useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export function useListQueryState(extraFilters: Record<string, string | undefined> = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const params: Record<string, string | number> = {
    page,
    limit: DEFAULT_PAGE_SIZE,
  };
  if (debouncedSearch) params.search = debouncedSearch;
  for (const [key, value] of Object.entries(extraFilters)) {
    if (value) params[key] = value;
  }

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return { page, setPage, search, setSearch: handleSearchChange, params };
}
