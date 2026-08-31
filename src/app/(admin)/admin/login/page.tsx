import { Suspense } from "react";
import { LoginPageClient } from "./login-client";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-primary-dark">
          <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
