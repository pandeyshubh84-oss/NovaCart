"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResetRequest(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    if (!email.trim()) {
      alert("Please enter your account email.");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl =
        `${window.location.origin}/reset-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: redirectUrl,
          }
        );

      if (error) {
        console.error(
          "PASSWORD RESET ERROR:",
          error
        );

        alert(
          error.message ||
            "Unable to send reset email."
        );

        setLoading(false);
        return;
      }

      setSent(true);
    } catch (error: any) {
      console.error(
        "PASSWORD RESET ERROR:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong. Please try again."
      );
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">
            🔐
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Reset Password
          </h1>

          <p className="text-gray-500 mt-2">
            Enter your account email to receive a
            password reset link.
          </p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-3">
              📩
            </div>

            <h2 className="font-bold text-green-800">
              Reset Email Sent
            </h2>

            <p className="text-sm text-green-700 mt-2">
              Please check your email inbox and
              click the password reset link.
            </p>

            <p className="text-xs text-gray-500 mt-3">
              Also check your Spam or Promotions
              folder.
            </p>

            <Link
              href="/login"
              className="inline-block mt-5 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleResetRequest}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Email
              </label>

              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={loading}
                autoComplete="email"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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
                ? "Sending..."
                : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}