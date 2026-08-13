import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { InlineSpinner } from "@/components/common/page-loader";
import { useAddStudentToGroup, useGroups } from "@/hooks/api/use-groups";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/utils";

interface AddToGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  currentGroupIds: string[];
}

export function AddToGroupDialog({ open, onOpenChange, studentId, currentGroupIds }: AddToGroupDialogProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useGroups({ search: debouncedSearch, status: "ACTIVE", limit: 10 });
  const addToGroup = useAddStudentToGroup();

  const candidates = data?.items.filter((g) => !currentGroupIds.includes(g.id)) ?? [];

  const handleAdd = (groupId: string) => {
    addToGroup.mutate(
      { groupId, studentId },
      {
        onSuccess: () => {
          toast.success("O'quvchi guruhga qo'shildi");
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
          <DialogTitle>Boshqa guruhga qo'shish</DialogTitle>
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
              onClick={() => handleAdd(group.id)}
              disabled={addToGroup.isPending || group.studentCount >= group.capacity}
              className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
            >
              <span>
                <span className="font-medium">{group.name}</span>
                <span className="ml-2 text-muted-foreground">
                  {group.courseName} · {group.studentCount}/{group.capacity}
                  {group.studentCount >= group.capacity && " (to'la)"}
                </span>
              </span>
              <Button type="button" size="sm" variant="ghost" disabled={addToGroup.isPending}>
                Qo'shish
              </Button>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
