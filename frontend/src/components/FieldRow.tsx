import { Label } from "./ui/label";

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-muted-foreground text-sm shrink-0">{label}</Label>
      <div className="w-40">{children}</div>
    </div>
  )
}

