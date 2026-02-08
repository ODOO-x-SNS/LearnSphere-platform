import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Button, Input } from "../../components/ui";
import { toast, ToastContainer } from "../../components/ui/Toast";
import { authApi } from "../../services/api";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Reset failed. The link may have expired or already been used.";
      setError(msg);
      toast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-sm text-text-muted mb-6">
            This password reset link is invalid. Please go back to the login
            page and request a new one.
          </p>
          <Button onClick={() => navigate("/login")} size="lg">
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-200/40">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent tracking-tight">
              LearnSphere
            </h1>
            <p className="text-[11px] text-text-muted font-semibold uppercase tracking-widest">
              Admin Portal
            </p>
          </div>
        </div>

        {!success ? (
          <>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-1.5">
              Set a new password
            </h2>
            <p className="text-sm text-text-muted mb-8">
              Your new password must be at least 8 characters long.
            </p>

            {error && (
              <div className="p-3 mb-5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Input
                  label="New password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <Input
                label="Confirm new password"
                type={showPw ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                Reset Password
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Password reset successful
            </h2>
            <p className="text-sm text-text-muted mb-6">
              Your password has been changed. You can now sign in with your new
              password.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
              size="lg"
            >
              Sign in
            </Button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
