import { Outlet, useLocation } from "react-router-dom";
import { Bell, Settings2 } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { navigationStructure } from "./nav-config";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function AppShell() {
  const location = useLocation();

  // Dynamically configure header title state based on active pathing
  const getCurrentTitle = () => {
    for (const section of navigationStructure) {
      const match = section.items.find(item => item.path === location.pathname);
      if (match) return match.label === "Dashboard" ? "Overview" : match.label;
    }
    return "Overview";
  };

  return (
    <SidebarProvider>
      {/* Outer Studio Matte Gray Desk Background Frame Context */}
      <div className="min-h-screen w-full bg-[#52525B] flex p-0 sm:p-4 font-sans antialiased relative">
        
        {/* Isolated Modular Shadcn Custom Navigation Sidebar */}
        <DashboardSidebar />

        {/* --- Inner Application Content Box Canvas Viewport --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] rounded-none sm:rounded-2xl overflow-hidden shadow-inner min-h-[calc(100vh-32px)]">
          
          {/* --- Application Global Control Topbar Header Row --- */}
          <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 sm:px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Native responsive mobile panel viewport trigger switch primitive */}
              <SidebarTrigger className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl" />
              {/* Shadcn Primitive Separator element component usage */}
              <Separator orientation="vertical" className="h-4 hidden sm:block bg-slate-200" />
              <h1 className="text-base font-bold text-slate-800 tracking-tight select-none">
                {getCurrentTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button title="qw" className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 relative transition-colors">
                <Bell className="h-4 w-4 stroke-[2.2]" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
              </button>
              <button title="ok" className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <Settings2 className="h-4 w-4 stroke-[2.2]" />
              </button>
            </div>
          </header>

          {/* --- Active View Layout Target Node Render Frame --- */}
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}