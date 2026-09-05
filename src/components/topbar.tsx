import { Bell } from "lucide-react";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <button
        type="button"
        aria-label="Notifications"
        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Bell className="size-4" />
      </button>
    </header>
  );
}
