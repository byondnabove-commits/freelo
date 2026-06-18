import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const createOrgSchema = z.object({
  name: z.string().min(3, "Workspace name must be at least 3 characters").max(50),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  }),
});

type CreateOrgForm = z.infer<typeof createOrgSchema>;

export default function Onboarding() {
  const { data: activeOrg, isPending: checkingOrg } = authClient.useActiveOrganization();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateOrgForm>({
    resolver: zodResolver(createOrgSchema),
  });

  // Type-safe mutation handling the backend workspace creation
  const { mutate: createWorkspace, isPending: submitting } = useMutation({
    mutationFn: async (values: CreateOrgForm) => {
      return await authClient.organization.create({
        name: values.name.trim(),
        slug: values.slug.trim().toLowerCase(),
      });
    },
    onSuccess: (res) => {
      toast.success(`Workspace "${res.data?.name}" created successfully!`);
      // Better Auth automatically updates the active organization state on success, 
      // which will instantly trigger our route guards to transition to the dashboard.
    },
    onError: (error: unknown) => {
      const errorMsg = error instanceof Error ? error.message : "Failed to create workspace";
      toast.error(errorMsg);
    },
  });

  if (checkingOrg) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F0ECE6]">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  // Reverse Guard: If they already have an active organization, boot them back to the app
  if (activeOrg) {
    return <Navigate to="/dashboard" replace />;
  }

  // Automatically sync slug input value to match the organization name format cleanly
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setValue("slug", generatedSlug, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0ECE6] p-4">
      <Card className="w-full max-w-md border-neutral-200/60 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
            Create your workspace
          </CardTitle>
          <CardDescription>
            Set up an organization environment to manage your projects, client funnels, and workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => createWorkspace(data))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="Acme Studio"
                disabled={submitting}
                {...register("name", { onChange: handleNameChange })}
              />
              {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Workspace URL Slug</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm text-neutral-400 select-none">/org/</span>
                <Input
                  id="slug"
                  className="pl-12"
                  placeholder="acme-studio"
                  disabled={submitting}
                  {...register("slug")}
                />
              </div>
              {errors.slug && <p className="text-xs font-medium text-destructive">{errors.slug.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Building Workspace...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}