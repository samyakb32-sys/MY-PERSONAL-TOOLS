import { Bell, Plus, Activity } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Topbar({
  section,
  page,
}: {
  section: string;
  page: string;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {section} <span className="mx-1">/</span>
        <span className="text-foreground">{page}</span>
      </p>
      <div className="flex items-center gap-3">
        <Button size="sm">
          <Plus />
          New Task
        </Button>
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="size-4" />
        </button>
        <Activity className="size-4 text-muted-foreground" />
      </div>
    </header>
  );
}
