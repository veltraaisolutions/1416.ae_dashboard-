import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <header className="h-14 border-b border-border flex items-center px-4 lg:px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-4 text-muted-foreground hover:text-foreground transition-colors" />
            <div className="flex-1" />
          </header>
          <div className="flex-1 overflow-auto p-4 lg:p-6 scrollbar-thin">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
