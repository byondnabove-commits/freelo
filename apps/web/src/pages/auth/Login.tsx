import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasCompletedOnboarding } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Where to redirect after login
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: "google",
        callbackURL: `${window.location.origin}/onboarding`,
    });
  };

  const onSubmit = async (values: LoginForm) => {
    await signIn.email(
      {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        rememberMe: true,
      },
      {
        onRequest: () => setLoading(true),

        onSuccess: () => {
          toast.success("Welcome back!");
          // Go to onboarding if not set up yet
          navigate(hasCompletedOnboarding ? redirectTo : "/onboarding", {
            replace: true,
          });
        },

        onError: (ctx) => {
          setLoading(false);
          // Better Auth returns specific error codes
          const msg = ctx.error.message ?? "Invalid credentials";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <div
      className="min-h-screen flex items-center
      justify-center bg-background p-4"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-8 h-8 bg-primary rounded-lg
            flex items-center justify-center"
          >
            <span
              className="text-primary-foreground
              font-bold text-sm"
            >
              F
            </span>
          </div>
          <span className="text-xl font-bold">FreeLo</span>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your studio</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@studio.com"
                  disabled={loading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div
                  className="flex items-center
                  justify-between"
                >
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary
                      hover:underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Your password"
                    disabled={loading}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2
                      -translate-y-1/2 text-muted-foreground
                      hover:text-foreground transition-colors"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2
                      className="w-4 h-4 mr-2
                      animate-spin"
                    />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                Continue with Google
              </Button>

              <p
                className="text-center text-sm
                text-muted-foreground"
              >
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary font-medium
                    hover:underline underline-offset-4"
                >
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
