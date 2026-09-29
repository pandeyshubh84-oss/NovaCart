"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);

  useEffect(() => {
    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert(
          "This reset link is invalid or expired. Please request a new link."
        );

        router.replace("/forgot-password");
        return;
      }

      setCheckingSession(false);
    }

    checkRecoverySession();
  }, [router]);

  async function handleUpdatePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        console.error(
          "UPDATE PASSWORD ERROR:",
          error
        );

        alert(
          error.message ||
            "Unable to update password."
        );

        setLoading(false);
        return;
      }

      alert(
        "🎉 Password updated successfully! Please login with your new password."
      );

      await supabase.auth.signOut();

      router.replace("/login");
    } catch (error: any) {
      console.error(
        "UPDATE PASSWORD ERROR:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-4xl mb-4">
            🔐
          </div>

          <h1 className="text-2xl font-bold">
            Verifying Reset Link...
          </h1>

          <p className="text-gray-500 mt-2">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">
            🔑
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Create New Password
          </h1>

          <p className="text-gray-500 mt-2">
            Set a new secure password for your
            NovaCart account.
          </p>
        </div>

        <form
          onSubmit={handleUpdatePassword}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>

            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={loading}
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              disabled={loading}
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <p className="text-xs text-gray-500">
            Password should contain at least 6
            characters.
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}