import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useLogin } from '../../hooks/useApi';
import { toast, ToastContainer } from '../../components/ui/Toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    login.mutate(
      { email, password },
      {
        onSuccess: () => navigate('/admin'),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Login failed';
          toast('error', msg);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left - form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[420px] animate-fade-in">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-200/40">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent tracking-tight">
                LearnSphere
              </h1>
              <p className="text-[11px] text-text-muted font-semibold uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-1.5">Welcome back</h2>
          <p className="text-sm text-text-muted mb-8">Sign in to manage your learning platform</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="admin@learnsphere.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={login.isPending}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-10 p-4 rounded-2xl bg-surface-dim border border-border/60">
            <p className="text-[11px] text-text-muted mb-2 font-semibold uppercase tracking-wider">Demo accounts</p>
            <div className="space-y-1.5 text-xs text-text-secondary font-mono">
              <p><span className="font-semibold text-text-primary">Admin:</span> admin@learnsphere.io / Admin123!</p>
              <p><span className="font-semibold text-text-primary">Instructor:</span> instructor@learnsphere.io / Instructor123!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 items-center justify-center p-16 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-16 left-16 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute bottom-16 right-16 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white" />
          <div className="absolute top-32 right-32 w-40 h-40 rounded-full bg-white/20" />
        </div>
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-8 ring-1 ring-white/20">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Empower Learning</h2>
          <p className="text-white/75 text-base leading-relaxed">
            Create, manage, and track courses with an intuitive admin experience designed for modern educators.
          </p>
          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="text-center">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-xs text-white/50 mt-1 font-medium">Courses</p>
            </div>
            <div className="w-px h-12 bg-white/15" />
            <div className="text-center">
              <p className="text-3xl font-bold">12K+</p>
              <p className="text-xs text-white/50 mt-1 font-medium">Learners</p>
            </div>
            <div className="w-px h-12 bg-white/15" />
            <div className="text-center">
              <p className="text-3xl font-bold">98%</p>
              <p className="text-xs text-white/50 mt-1 font-medium">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
