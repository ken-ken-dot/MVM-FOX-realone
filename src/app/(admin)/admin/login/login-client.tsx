"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button, AmbientIconField } from "@/components/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/validators";

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary-dark p-4">
      <AmbientIconField variant="dark" density="medium" />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center">
            <span className="text-h2 font-bold text-text-on-dark tracking-tight">
              MVM
            </span>
            <span className="text-h2 font-bold text-accent ml-1 tracking-tight">
              FOX
            </span>
          </a>
          <p className="text-body text-text-on-dark-secondary mt-2">
            Admin Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-lg border border-border-dark bg-surface-card-dark p-8">
          <h1 className="text-h3 font-semibold text-text-on-dark mb-6">
            Sign In
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-body-sm font-medium text-text-on-dark"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@mvmfox.com"
                className="h-10 rounded-md border bg-bg-primary-dark-elevated px-3 text-body-sm text-text-on-dark placeholder:text-text-on-dark-secondary border-border-default focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg-primary-dark transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-caption text-error">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-body-sm font-medium text-text-on-dark"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-10 w-full rounded-md border bg-bg-primary-dark-elevated px-3 pr-10 text-body-sm text-text-on-dark placeholder:text-text-on-dark-secondary border-border-default focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg-primary-dark transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-on-dark-secondary hover:text-text-on-dark transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-caption text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-error/10 border border-error/20 p-3">
                <p className="text-body-sm text-error">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting}
            >
              <LogIn size={18} className="mr-2" />
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-caption text-text-on-dark-secondary mt-6">
          &copy; {new Date().getFullYear()} MVM FOX. All rights reserved.
        </p>
      </div>
    </div>
  );
}
