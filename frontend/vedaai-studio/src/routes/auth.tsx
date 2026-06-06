import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, Lock, User, Check, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — VedaAI" },
      { name: "description", content: "Sign in or create your VedaAI educator account." },
    ],
  }),
  component: AuthPage,
});

const testimonials = [
  {
    quote: "VedaAI cut my weekly assessment prep from 6 hours to 20 minutes.",
    author: "Priya S.",
    role: "Physics Teacher, DPS Bokaro",
  },
  {
    quote: "The question quality rivals what I'd write myself — but I get my weekends back.",
    author: "Anil K.",
    role: "Head of Department, Mathematics",
  },
  {
    quote: "Finally, an AI tool built for how teachers actually work.",
    author: "Meera J.",
    role: "English Lead, Grade 10",
  },
];

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [carousel, setCarousel] = useState(0);
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && user) {
      if (user.isOnboarded) {
        navigate({ to: "/assignments", replace: true });
      } else {
        navigate({ to: "/onboarding", replace: true });
      }
    }
  }, [isInitialized, user, navigate]);

  useEffect(() => {
    const id = setInterval(() => setCarousel((c) => (c + 1) % testimonials.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-brand to-[oklch(0.55_0.18_30)] text-white p-12 flex-col justify-between">
        <GeometricPattern />
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">
            V
          </div>
          <span className="text-xl font-bold">VedaAI</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Sparkles className="w-8 h-8 mb-6 opacity-80" />
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Reclaim your weekends.
          </h1>
          <p className="mt-4 text-lg text-white/85 leading-relaxed">
            Let AI handle the grading and assessment blueprints — so you can focus on teaching.
          </p>
        </div>

        <div className="relative z-10 min-h-[120px]">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-700 ${
                i === carousel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
              }`}
            >
              <p className="text-base leading-relaxed text-white/95">"{t.quote}"</p>
              <div className="mt-3 text-sm">
                <div className="font-semibold">{t.author}</div>
                <div className="text-white/70">{t.role}</div>
              </div>
            </div>
          ))}
          <div className="absolute -bottom-6 left-0 flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarousel(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === carousel ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center font-bold">V</div>
          <span className="font-bold">VedaAI</span>
        </div>

        <div className="w-full max-w-md relative">
          <div className="bg-card rounded-3xl shadow-soft p-1 flex mb-8 mt-12 lg:mt-0">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                mode === "login" ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                mode === "signup" ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${mode === "login" ? "0" : "-100%"})` }}
            >
              <div className="w-full shrink-0 px-1">
                <LoginForm />
              </div>
              <div className="w-full shrink-0 px-1">
                <SignupForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeometricPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="geo" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="1.5" fill="white" />
          <path d="M0 30 L60 30 M30 0 L30 60" stroke="white" strokeWidth="0.3" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geo)" />
      <circle cx="80%" cy="20%" r="180" fill="white" opacity="0.08" />
      <circle cx="15%" cy="85%" r="140" fill="white" opacity="0.06" />
    </svg>
  );
}

function FloatField({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType }) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
      <input
        {...props}
        className="w-full h-12 pl-11 pr-12 rounded-2xl bg-secondary border border-transparent text-sm placeholder:text-muted-foreground/70 transition-all focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15"
      />
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const user = await useAuthStore.getState().login(email, password);
      if (user.isOnboarded) {
        navigate({ to: "/assignments" });
      } else {
        navigate({ to: "/onboarding" });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Pick up where you left off.</p>
      </div>

      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

      <FloatField 
        icon={Mail} 
        type="email" 
        placeholder="you@school.edu" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required 
      />
      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
        <input
          type={show ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full h-12 pl-11 pr-12 rounded-2xl bg-secondary border border-transparent text-sm placeholder:text-muted-foreground/70 transition-all focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle password visibility"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="peer sr-only" />
          <span className="w-4 h-4 rounded border border-border bg-card peer-checked:bg-brand peer-checked:border-brand flex items-center justify-center transition">
            <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
          </span>
          <span className="text-muted-foreground">Remember me for 30 days</span>
        </label>
        <a href="#" className="text-brand font-medium hover:underline">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-press w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-card hover:bg-primary/90 transition"
      >
        {isLoading ? "Logging in..." : "Log in"}
      </button>
      
      <Divider />
      <GoogleButton label="Continue with Google" />
    </form>
  );
}

function SignupForm() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pw !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const user = await useAuthStore.getState().signup(name, email, pw);
      if (user.isOnboarded) {
        navigate({ to: "/assignments" });
      } else {
        navigate({ to: "/onboarding" });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const strength = useMemo(() => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s; // 0-4
  }, [pw]);

  const label = ["Too short", "Weak", "Fair", "Good", "Strong"][strength];
  const barColor = ["bg-border", "bg-hard-foreground", "bg-moderate-foreground", "bg-brand", "bg-easy-foreground"][strength];

  return (
    <form
      onSubmit={handleSignup}
      className="space-y-4"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        <p className="text-sm text-muted-foreground mt-1">Free for educators. No credit card needed.</p>
      </div>
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
      <FloatField 
        icon={User} 
        type="text" 
        placeholder="Full name" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        required 
      />
      <FloatField 
        icon={Mail} 
        type="email" 
        placeholder="Institutional email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required 
      />

      <div className="space-y-2">
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
            className="w-full h-12 pl-11 pr-12 rounded-2xl bg-secondary border border-transparent text-sm placeholder:text-muted-foreground/70 transition-all focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle password visibility"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {pw && (
          <div className="flex items-center gap-3 px-1">
            <div className="flex-1 grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-colors ${i < strength ? barColor : "bg-border"}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium w-16 text-right">{label}</span>
          </div>
        )}
      </div>

      <FloatField 
        icon={Lock} 
        type="password" 
        placeholder="Confirm password" 
        value={confirmPw}
        onChange={(e) => setConfirmPw(e.target.value)}
        required 
      />

      <label className="flex items-start gap-2 cursor-pointer select-none text-sm">
        <input type="checkbox" required className="peer sr-only" />
        <span className="w-4 h-4 mt-0.5 shrink-0 rounded border border-border bg-card peer-checked:bg-brand peer-checked:border-brand flex items-center justify-center transition">
          <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
        </span>
        <span className="text-muted-foreground">
          I agree to the <a href="#" className="text-foreground underline">Terms</a> and{" "}
          <a href="#" className="text-foreground underline">Privacy Policy</a>.
        </span>
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-press w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-card hover:bg-primary/90 transition"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>

      <Divider />
      <GoogleButton label="Sign up with Google" />
    </form>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground">or</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="btn-press w-full h-12 rounded-2xl border border-border bg-card text-sm font-medium flex items-center justify-center gap-3 hover:bg-secondary transition"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.32A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.98 10.72A5.4 5.4 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.02-2.32z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96L3.98 7.28C4.68 5.16 6.66 3.58 9 3.58z" />
      </svg>
      {label}
    </button>
  );
}
