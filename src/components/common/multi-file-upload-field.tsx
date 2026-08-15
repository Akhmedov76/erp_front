import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ASSIGNMENT_FILE_ACCEPT,
  ASSIGNMENT_FILE_EXTENSIONS,
  ASSIGNMENT_FILE_HINT,
  ASSIGNMENT_FILE_MAX_MB,
  MAX_FILES_PER_UPLOAD,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MultiFileUploadFieldProps {
  value: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  allowedExtensions?: readonly string[];
  maxSizeMB?: number;
  maxFiles?: number;
  hint?: string;
  className?: string;
}

/** Same format/size guardrails as FileUploadField, but for picking any number
 * of files across one or more picker openings — each valid selection is
 * appended to the pending list (shown below, individually removable) rather
 * than replacing it, since a native <input multiple> resets on every open. */
export function MultiFileUploadField({
  value,
  onChange,
  accept = ASSIGNMENT_FILE_ACCEPT,
  allowedExtensions = ASSIGNMENT_FILE_EXTENSIONS,
  maxSizeMB = ASSIGNMENT_FILE_MAX_MB,
  maxFiles = MAX_FILES_PER_UPLOAD,
  hint = ASSIGNMENT_FILE_HINT,
  className,
}: MultiFileUploadFieldProps) {
  const [error, setError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (!picked.length) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    const accepted: File[] = [];
    for (const file of picked) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        setError(`"${ext ?? "?"}" formatiga ruxsat yo'q. Ruxsat etilgan formatlar: ${allowedExtensions.join(", ")}.`);
        return;
      }
      if (file.size > maxBytes) {
        setError(
          `"${file.name}" hajmi ${maxSizeMB}MB dan oshmasligi kerak (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        );
        return;
      }
      accepted.push(file);
    }

    if (value.length + accepted.length > maxFiles) {
      setError(`Bir vaqtda ko'pi bilan ${maxFiles} ta fayl biriktirish mumkin.`);
      return;
    }

    setError(undefined);
    onChange([...value, ...accepted]);
  };

  const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleChange}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
      </div>
      <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>{error ?? hint}</p>
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeAt(index)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
