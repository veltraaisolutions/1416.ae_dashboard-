import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  MessageSquare,
  Crown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Booked Jobs", url: "/jobs", icon: ClipboardList },
  // { title: "Enquiries", url: "/enquiries", icon: Users },
  { title: "Message Logs", url: "/messages", icon: MessageSquare },
  { title: "Schedule", url: "/schedule", icon: CalendarDays },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-colors flex-shrink-0">
            <img
              src="/img/logo.svg"
              alt="Maid To Perfection Logo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Styling */}
          <div className="flex flex-col">
            <span className="text-[14px] font-black italic uppercase tracking-tighter leading-none text-foreground">
              Maid <span className="text-[#D4AF37]">To Perfection</span>
            </span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-1 flex items-center gap-1">
              <Crown className="h-2 w-2 text-[#D4AF37]" />
              Admin Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        w-full h-11 px-3 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20 glow-gold-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }
                      `}
                    >
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3"
                      >
                        <item.icon
                          className={`h-5 w-5 ${
                            isActive ? "text-primary" : ""
                          }`}
                        />
                        <span className="font-medium text-sm">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="glass-card rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">KL</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Kayleigh
              </p>
              <p className="text-xs text-muted-foreground">Owner</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
