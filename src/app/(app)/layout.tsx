import { AppSidebar } from "@/components/app-sidebar";
import { SyncProvider } from "@/components/sync-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SyncProvider>
      <div className="flex h-full min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </SyncProvider>
  );
}
