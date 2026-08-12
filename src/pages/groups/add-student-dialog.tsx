import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { InlineSpinner } from "@/components/common/page-loader";
import { useAddGroupStudent } from "@/hooks/api/use-groups";
import { useStudents } from "@/hooks/api/use-students";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/utils";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export function AddStudentDialog({ open, onOpenChange, groupId }: AddStudentDialogProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useStudents({ search: debouncedSearch, limit: 10, status: "ACTIVE" });
  const addStudent = useAddGroupStudent(groupId);

  const handleAdd = (studentId: string) => {
    addStudent.mutate(studentId, {
      onSuccess: () => {
        toast.success("O'quvchi guruhga qo'shildi");
        onOpenChange(false);
        setSearch("");
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guruhga o'quvchi qo'shish</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, telefon yoki email bo'yicha qidirish..."
            className="pl-8"
            autoFocus
          />
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {isLoading && <InlineSpinner className="mx-auto h-5 w-5 animate-spin" />}
          {!isLoading && !data?.items.length && <EmptyState title="O'quvchi topilmadi" />}
          {data?.items.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => handleAdd(student.id)}
              disabled={addStudent.isPending}
              className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
            >
              <span>
                <span className="font-medium">{student.fullName}</span>
                <span className="ml-2 text-muted-foreground">{student.phone}</span>
              </span>
              <Button type="button" size="sm" variant="ghost" disabled={addStudent.isPending}>
                Qo'shish
              </Button>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
