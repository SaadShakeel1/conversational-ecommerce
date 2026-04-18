"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (email: string, password: string) => {
    setLocalError(null);
    try {
      await login(email, password);
      router.push("/account");
    } catch {
      setLocalError(error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="section-container py-12 sm:py-20 flex items-center justify-center min-h-[60vh]">
      <AuthForm
        mode="login"
        onSubmit={handleSubmit}
        error={localError || error}
        loading={loading}
      />
    </div>
  );
}
