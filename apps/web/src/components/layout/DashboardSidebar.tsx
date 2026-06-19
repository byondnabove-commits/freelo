import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationStructure } from "./nav-config";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-slate-100 bg-white">
      {/* --- Premium Workspace Header Card --- */}
      <SidebarHeader className="p-4 pt-6">
        <div className="flex items-center justify-between p-3 bg-[#1E293B] text-white rounded-xl cursor-pointer hover:bg-slate-800 transition-colors duration-200 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            {/* Using individual Shadcn Avatar primitive components */}
            <Avatar className="h-9 w-9 rounded-full shrink-0">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" 
                alt="Alex Mercer Avatar"
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">AM</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold tracking-wide truncate">Alex Mercer</span>
              <span className="text-[10px] text-slate-400 truncate font-medium">Brand Identity · Web Design</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
        </div>
      </SidebarHeader>

      {/* --- Navigation Content Groups --- */}
      <SidebarContent className="px-2 mt-4 space-y-4 scrollbar-none">
        {navigationStructure.map((section) => (
          <SidebarGroup key={section.title} className="p-0">
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 h-auto py-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  // Precise route evaluation matching for individual buttons
                  const isRouteActive = item.path === "/dashboard" 
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.path);

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild
                        className={cn(
                          "w-full h-10 px-3 rounded-xl transition-all duration-200",
                          isRouteActive 
                            ? "bg-[#F0FDF4] text-[#16A34A] hover:bg-[#F0FDF4] hover:text-[#16A34A]" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <NavLink to={item.path} end={item.path === "/dashboard"}>
                          <Icon 
                            className={cn(
                              "h-4 w-4 stroke-[2.2]", 
                              isRouteActive ? "text-[#16A34A]" : "text-slate-400"
                            )} 
                          />
                          <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* --- Sidebar Footer Element --- */}
      <SidebarFooter className="p-4 mt-auto">
        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=300&auto=format&fit=crop" 
            alt="Workspace setup" 
            className="w-full h-24 object-cover filter brightness-95"
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}