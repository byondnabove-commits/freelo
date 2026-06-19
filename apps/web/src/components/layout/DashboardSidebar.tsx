import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationStructure } from "./nav-config";
import { signOut, authClient } from "@/lib/auth-client";
import { toast } from "sonner";

// Shadcn UI Component Primitives
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Auth & Account Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          navigate("/login", { replace: true });
        },
      },
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authClient.changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
        revokeOtherSessions: true,
      });

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsModalOpen(false);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to update password.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar className="border-r border-slate-100 bg-white">
        
        {/* --- Header Workspace Selector with Dropdown Menu Trigger --- */}
        <SidebarHeader className="p-4 pt-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-between p-3 bg-[#1E293B] text-white rounded-xl cursor-pointer hover:bg-slate-800 transition-colors duration-200 shadow-sm focus:outline-none data-[state=open]:bg-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 rounded-full shrink-0">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" 
                      alt="Alex Mercer Avatar"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">AM</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-xs font-semibold tracking-wide truncate">Alex Mercer</span>
                    <span className="text-[10px] text-slate-400 truncate font-medium">Brand Identity · Web Design</span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
              </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56 mt-1 rounded-xl shadow-md border-slate-100" align="start">
              <DropdownMenuLabel className="text-xs text-slate-400 font-bold uppercase tracking-wider px-3 py-2">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-50" />
              
              <DropdownMenuItem 
                onSelect={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-slate-600 font-medium text-sm p-2.5 rounded-lg cursor-pointer focus:bg-slate-50 focus:text-slate-900"
              >
                <KeyRound className="h-4 w-4 text-slate-400 stroke-[2.2]" />
                <span>Change Password</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem 
                onSelect={handleLogout}
                className="flex items-center gap-2 text-rose-600 font-semibold text-sm p-2.5 rounded-lg cursor-pointer focus:bg-rose-50 focus:text-rose-700"
              >
                <LogOut className="h-4 w-4 text-rose-400 stroke-[2.2]" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

        {/* --- Footer Component --- */}
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

      {/* --- Password Validation Dialog Overlay --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-106.25 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">Change Password</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-medium">
              Update your account password. You will need to confirm your current credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="pt-4 flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#1E293B] hover:bg-slate-800 text-white font-medium rounded-xl px-4"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}