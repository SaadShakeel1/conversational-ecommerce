"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (email: string, password: string) => {
    setLocalError(null);
    try {
      await register(email, password);
      router.push("/account");
    } catch {
      setLocalError(error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="section-container py-12 sm:py-20 flex items-center justify-center min-h-[60vh]">
      <AuthForm
        mode="register"
        onSubmit={handleSubmit}
        error={localError || error}
        loading={loading}
      />
    </div>
  );
}
