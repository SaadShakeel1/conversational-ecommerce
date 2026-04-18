"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function AccountPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="section-container py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="section-container py-20 text-center">
        <div className="glass-card max-w-md mx-auto p-12 animate-fade-up">
          <span className="text-5xl mb-4 block">🔒</span>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Not Signed In
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign in to view your account details and order history.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/auth/login" className="btn-primary">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-8 sm:py-12">
      <div className="page-header !py-6">
        <h1 className="page-title">My Account</h1>
        <p className="page-subtitle">Manage your profile and preferences</p>
      </div>

      <div className="max-w-2xl mx-auto animate-fade-up">
        {/* Profile Card */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-neon-green flex items-center justify-center text-3xl text-surface-900 font-bold shadow-glow">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                {user?.email}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-neon-green" />
                Active Account
              </p>
            </div>
          </div>

          <div className="divider mb-6" />

          {/* Account Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface-700/30">
              <span className="text-sm text-gray-400">User ID</span>
              <span className="text-sm text-white font-mono">{user?.id}</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface-700/30">
              <span className="text-sm text-gray-400">Email</span>
              <span className="text-sm text-white">{user?.email}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <Link
              href="/orders/track"
              className="glass-card p-4 text-center hover:border-neon-green/30 transition-all group"
            >
              <span className="text-2xl block mb-2">📦</span>
              <span className="text-xs text-gray-400 group-hover:text-neon-green transition-colors">
                Track Orders
              </span>
            </Link>
            <Link
              href="/cart"
              className="glass-card p-4 text-center hover:border-neon-green/30 transition-all group"
            >
              <span className="text-2xl block mb-2">🛒</span>
              <span className="text-xs text-gray-400 group-hover:text-neon-green transition-colors">
                My Cart
              </span>
            </Link>
            <Link
              href="/chat"
              className="glass-card p-4 text-center hover:border-neon-green/30 transition-all group"
            >
              <span className="text-2xl block mb-2">💬</span>
              <span className="text-xs text-gray-400 group-hover:text-neon-green transition-colors">
                Chat with AI
              </span>
            </Link>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="btn-secondary w-full text-red-400 hover:text-red-300 hover:border-red-500/40"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
