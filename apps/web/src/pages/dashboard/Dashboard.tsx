import { useState } from "react";
import { signOut, authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // State for password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out");
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
        revokeOtherSessions: true, // Optional: logs out other devices for security
      });

      toast.success("Password updated successfully!");
      
      // Reset form states and close modal
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to update password. Check your current password.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <p className="text-muted-foreground">
        You're in. Onboarding next.
      </p>

      <div className="flex gap-4">
        {/* Change Password Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Change Password</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Update your account password. You'll need to enter your current credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Logout Button */}
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}