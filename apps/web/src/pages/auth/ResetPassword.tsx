import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResetPassword() {
  const [searchParams] =
    useSearchParams();

  const navigate = useNavigate();

  const token =
    searchParams.get("token") ?? "";

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(
        "Passwords do not match"
      );
      return;
    }

    setLoading(true);

    try {
      await authClient.resetPassword({
        token,
        newPassword: password,
      });

      toast.success(
        "Password updated"
      );

      navigate("/login");
    } catch {
      toast.error(
        "Invalid or expired token"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-md"
      >
        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <Input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}