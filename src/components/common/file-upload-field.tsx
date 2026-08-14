import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";

import {
  ASSIGNMENT_FILE_ACCEPT,
  ASSIGNMENT_FILE_EXTENSIONS,
  ASSIGNMENT_FILE_HINT,
  ASSIGNMENT_FILE_MAX_MB,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  value: File | undefined;
  onChange: (file: File | undefined) => void;
  accept?: string;
  allowedExtensions?: readonly string[];
  maxSizeMB?: number;
  hint?: string;
  currentFileUrl?: string | null;
  currentFileLabel?: string;
  className?: string;
}

/** File input with upfront format/size hints and client-side validation, so a
 * student/teacher finds out about a rejected file immediately instead of after
 * a round trip — the backend (common/validators.py) still enforces the same
 * rules independently and is the actual source of truth. */
export function FileUploadField({
  value,
  onChange,
  accept = ASSIGNMENT_FILE_ACCEPT,
  allowedExtensions = ASSIGNMENT_FILE_EXTENSIONS,
  maxSizeMB = ASSIGNMENT_FILE_MAX_MB,
  hint = ASSIGNMENT_FILE_HINT,
  currentFileUrl,
  currentFileLabel = "Joriy fayl",
  className,
}: FileUploadFieldProps) {
  const [error, setError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  const reject = (message: string) => {
    setError(message);
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError(undefined);
      onChange(undefined);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      reject(
        `"${ext ?? "?"}" formatiga ruxsat yo'q. Ruxsat etilgan formatlar: ${allowedExtensions.join(", ")}.`,
      );
      return;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      reject(
        `Fayl hajmi ${maxSizeMB}MB dan oshmasligi kerak (tanlangan fayl: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      );
      return;
    }

    setError(undefined);
    onChange(file);
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
      </div>
      <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>{error ?? hint}</p>
      {currentFileUrl && !value && !error && (
        <p className="text-xs text-muted-foreground">
          {currentFileLabel}:{" "}
          <a href={currentFileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            ko'rish
          </a>{" "}
          — yangisini tanlasangiz, u almashtiriladi.
        </p>
      )}
    </div>
  );
}
