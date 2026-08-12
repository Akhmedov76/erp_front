import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { InlineSpinner } from "@/components/common/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBulkAttendance } from "@/hooks/api/use-attendance";
import { useGroupStudents, useGroups } from "@/hooks/api/use-groups";
import { useSchedules } from "@/hooks/api/use-schedules";
import { ATTENDANCE_STATUS_OPTIONS } from "@/lib/constants";
import { cn, formatDate, getErrorMessage } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/records";

export function MarkAttendancePanel() {
  const [groupId, setGroupId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});

  const { data: groups } = useGroups({ limit: 100, status: "ACTIVE" });
  const { data: schedules } = useSchedules({ group_id: groupId, limit: 50 });
  const { data: roster, isLoading: rosterLoading } = useGroupStudents(groupId, { limit: 100 });
  const bulkAttendance = useBulkAttendance();

  const selectedSchedule = useMemo(() => schedules?.items.find((s) => s.id === scheduleId), [schedules, scheduleId]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    if (!roster) return;
    const next: Record<string, AttendanceStatus> = {};
    roster.items.forEach((m) => {
      next[m.student.id] = status;
    });
    setStatuses(next);
  };

  const handleSubmit = () => {
    if (!groupId || !scheduleId || !selectedSchedule || !roster?.items.length) return;
    const students = roster.items.map((m) => ({
      studentId: m.student.id,
      status: statuses[m.student.id] ?? "PRESENT",
    }));

    bulkAttendance.mutate(
      { groupId, scheduleId, date: selectedSchedule.date, students },
      {
        onSuccess: () => {
          toast.success("Davomat saqlandi");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Guruh va darsni tanlang</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Guruh</label>
            <Select
              value={groupId}
              onValueChange={(value) => {
                setGroupId(value);
                setScheduleId("");
                setStatuses({});
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Guruhni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {groups?.items.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Dars</label>
            <Select value={scheduleId} onValueChange={setScheduleId} disabled={!groupId}>
              <SelectTrigger>
                <SelectValue placeholder="Darsni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {schedules?.items.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {formatDate(s.date)} · {s.start_time.slice(0, 5)} · {s.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {groupId && scheduleId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">O'quvchilar ({roster?.items.length ?? 0})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll("PRESENT")}>
                Barchasi keldi
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll("ABSENT")}>
                Barchasi kelmadi
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {rosterLoading && <InlineSpinner />}
            {!rosterLoading && !roster?.items.length && <EmptyState title="Guruhda o'quvchilar yo'q" />}
            {roster?.items.map((membership) => {
              const current = statuses[membership.student.id] ?? "PRESENT";
              return (
                <div
                  key={membership.id}
                  className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium">{membership.student.fullName}</span>
                  <div className="flex flex-wrap gap-1">
                    {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(membership.student.id, opt.value as AttendanceStatus)}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                          current === opt.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background hover:bg-accent",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {Boolean(roster?.items.length) && (
              <div className="flex justify-end pt-2">
                <Button onClick={handleSubmit} disabled={bulkAttendance.isPending}>
                  {bulkAttendance.isPending ? <InlineSpinner /> : "Davomatni saqlash"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
