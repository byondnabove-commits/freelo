import { signOut } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();

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

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <p className="text-muted-foreground">
        You're in. Onboarding next.
      </p>

      <Button
        variant="destructive"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
}