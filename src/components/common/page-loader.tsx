import { Loader2 } from "lucide-react";

export function PageLoader({ label = "Yuklanmoqda..." }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function InlineSpinner({ className }: { className?: string }) {
  return <Loader2 className={className ?? "h-4 w-4 animate-spin"} />;
}
