import { FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Sahifa topilmadi</h1>
      <p className="max-w-sm text-muted-foreground">Siz izlayotgan sahifa mavjud emas yoki ko'chirilgan.</p>
      <Button asChild>
        <Link to="/dashboard">Bosh sahifaga qaytish</Link>
      </Button>
    </div>
  );
}
