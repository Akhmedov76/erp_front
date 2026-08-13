import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { InlineSpinner } from "@/components/common/page-loader";
import { useGroups, useUpdateGroup } from "@/hooks/api/use-groups";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/utils";

interface AssignGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  currentGroupIds: string[];
}

export function AssignGroupDialog({ open, onOpenChange, teacherId, currentGroupIds }: AssignGroupDialogProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useGroups({ search: debouncedSearch, status: "ACTIVE", limit: 10 });
  const updateGroup = useUpdateGroup();

  const candidates = data?.items.filter((g) => !currentGroupIds.includes(g.id)) ?? [];

  const handleAssign = (groupId: string) => {
    updateGroup.mutate(
      { id: groupId, body: { teacher: teacherId } },
      {
        onSuccess: () => {
          toast.success("O'qituvchi guruhga biriktirildi");
          onOpenChange(false);
          setSearch("");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Boshqa guruhga biriktirish</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Guruh nomi bo'yicha qidirish..."
            className="pl-8"
            autoFocus
          />
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {isLoading && <InlineSpinner className="mx-auto h-5 w-5 animate-spin" />}
          {!isLoading && !candidates.length && <EmptyState title="Guruh topilmadi" />}
          {candidates.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => handleAssign(group.id)}
              disabled={updateGroup.isPending}
              className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
            >
              <span>
                <span className="font-medium">{group.name}</span>
                <span className="ml-2 text-muted-foreground">
                  {group.courseName}
                  {group.teacherName && ` · hozirgi o'qituvchi: ${group.teacherName}`}
                </span>
              </span>
              <Button type="button" size="sm" variant="ghost" disabled={updateGroup.isPending}>
                Biriktirish
              </Button>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
