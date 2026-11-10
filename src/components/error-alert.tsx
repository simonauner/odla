import { Alert, AlertDescription } from "@/components/ui/alert";

export function ErrorAlert({ children }: { children: string }) {
  return (
    <Alert variant="destructive" className="mt-3">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
