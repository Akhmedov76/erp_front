import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert className="h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-semibold">Ruxsat yo'q</h1>
      <p className="max-w-sm text-muted-foreground">Bu sahifani ko'rish uchun sizda yetarli huquq mavjud emas.</p>
      <Button asChild>
        <Link to="/dashboard">Bosh sahifaga qaytish</Link>
      </Button>
    </div>
  );
}
