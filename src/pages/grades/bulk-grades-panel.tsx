import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { InlineSpinner } from "@/components/common/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBulkGrades } from "@/hooks/api/use-grades";
import { useGroupStudents, useGroups } from "@/hooks/api/use-groups";
import { useSubjects } from "@/hooks/api/use-subjects";
import { useTeachers } from "@/hooks/api/use-teachers";
import { DEFAULT_MAX_SCORE_BY_GRADE_TYPE, GRADE_TYPE_OPTIONS, ROLES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { GradeType } from "@/types/records";

export function BulkGradesPanel() {
  const role = useAuthStore((state) => state.user?.role);
  const isTeacher = role === ROLES.TEACHER;

  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [gradeType, setGradeType] = useState<GradeType>("HOMEWORK");
  const [maxScore, setMaxScore] = useState(DEFAULT_MAX_SCORE_BY_GRADE_TYPE.HOMEWORK);
  const [maxScoreTouched, setMaxScoreTouched] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [scores, setScores] = useState<Record<string, string>>({});

  // Groups are already scoped to "my groups" for a TEACHER, so its `teacher`
  // field is always their own id — same trick as the assignment form, no
  // extra "who am I" lookup needed.
  const { data: groups } = useGroups({ limit: 100, status: "ACTIVE" });
  const { data: subjects } = useSubjects({ limit: 100 });
  const { data: teachers } = useTeachers({ limit: 100 });
  const [teacherIdOverride, setTeacherIdOverride] = useState("");
  const ownTeacherId = isTeacher ? groups?.items[0]?.teacher : undefined;
  const teacherId = isTeacher ? (ownTeacherId ?? "") : teacherIdOverride;

  const { data: roster, isLoading: rosterLoading } = useGroupStudents(groupId, { limit: 100 });
  const bulkGrades = useBulkGrades();

  const handleGradeTypeChange = (value: GradeType) => {
    setGradeType(value);
    if (!maxScoreTouched) setMaxScore(DEFAULT_MAX_SCORE_BY_GRADE_TYPE[value] ?? "100");
  };

  const ready = groupId && subjectId && teacherId && maxScore;

  const handleSubmit = () => {
    if (!ready || !roster?.items.length) return;
    const grades = roster.items
      .filter((m) => scores[m.student.id] !== undefined && scores[m.student.id] !== "")
      .map((m) => ({ studentId: m.student.id, score: scores[m.student.id] }));

    if (!grades.length) {
      toast.error("Kamida bitta o'quvchiga ball qo'ying");
      return;
    }

    bulkGrades.mutate(
      { groupId, subjectId, teacherId, gradeType, maxScore, date, grades },
      {
        onSuccess: () => {
          toast.success("Baholar saqlandi");
          setScores({});
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Baholash parametrlari</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Guruh">
            <Select value={groupId} onValueChange={setGroupId}>
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
          </Field>
          <Field label="Fan">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Fanni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.items.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {/* TEACHER is always grading their own class — no need to make
              them re-pick themselves from a dropdown every time. */}
          {!isTeacher && (
            <Field label="O'qituvchi">
              <Select value={teacherIdOverride} onValueChange={setTeacherIdOverride}>
                <SelectTrigger>
                  <SelectValue placeholder="O'qituvchini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.items.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Baho turi">
            <Select value={gradeType} onValueChange={(v) => handleGradeTypeChange(v as GradeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Maksimal ball" hint="Baho turi bo'yicha avtomatik taklif etiladi, kerak bo'lsa o'zgartiring">
            <Input
              type="number"
              min={1}
              value={maxScore}
              onChange={(e) => {
                setMaxScore(e.target.value);
                setMaxScoreTouched(true);
              }}
            />
          </Field>
          <Field label="Sana">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      {ready && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">O'quvchilar ballari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rosterLoading && <InlineSpinner />}
            {!rosterLoading && !roster?.items.length && <EmptyState title="Guruhda o'quvchilar yo'q" />}
            {roster?.items.map((membership) => (
              <div key={membership.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <span className="font-medium">{membership.student.fullName}</span>
                <Input
                  type="number"
                  min={0}
                  max={Number(maxScore) || undefined}
                  step="0.01"
                  placeholder={`0-${maxScore}`}
                  className="w-28"
                  value={scores[membership.student.id] ?? ""}
                  onChange={(e) => setScores((prev) => ({ ...prev, [membership.student.id]: e.target.value }))}
                />
              </div>
            ))}
            {Boolean(roster?.items.length) && (
              <div className="flex justify-end pt-2">
                <Button onClick={handleSubmit} disabled={bulkGrades.isPending}>
                  {bulkGrades.isPending ? <InlineSpinner /> : "Baholarni saqlash"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
