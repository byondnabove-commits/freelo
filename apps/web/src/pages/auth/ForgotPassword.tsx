import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // TanStack Query Mutation wrapping better-auth password reset request
  const { mutate: requestReset, isPending: loading } = useMutation({
    mutationFn: async (values: ForgotPasswordForm) => {
      return await authClient.requestPasswordReset({
        email: values.email.trim().toLowerCase(),
        redirectTo: `${window.location.origin}/reset-password`,
      });
    },
    onSuccess: () => {
      toast.success("Password reset email sent", {
        description: "Please check your inbox for the recovery link.",
      });
    },
    onError: (error: unknown) => {
      const errorMsg = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMsg);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a recovery link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => requestReset(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@studio.com"
                disabled={loading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-primary font-medium hover:underline underline-offset-4"
              >
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}