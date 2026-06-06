import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Check, ChevronLeft, ChevronRight, Search, X, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your workspace — VedaAI" },
      { name: "description", content: "Complete your VedaAI educator profile." },
    ],
  }),
  component: OnboardingPage,
});

const TITLES = ["Dr.", "Mr.", "Ms.", "Mrs."];
const ROLES = ["Teacher", "Head of Department", "Administrator"];
const INSTITUTIONS = [
  "Delhi Public School, Bokaro Steel City",
  "Delhi Public School, R.K. Puram",
  "Kendriya Vidyalaya, Mumbai",
  "St. Xavier's, Kolkata",
  "The Doon School, Dehradun",
];
const GRADES = ["3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const SUBJECTS = ["English", "Physics", "Chemistry", "Mathematics", "Biology", "History", "Geography", "Computer Science"];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [institution, setInstitution] = useState("Delhi Public School, Bokaro Steel City");
  const [grades, setGrades] = useState<string[]>(["10th"]);
  const [subjects, setSubjects] = useState<string[]>(["Physics"]);
  const [redirecting, setRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        navigate({ to: "/auth", replace: true });
      } else if (user.isOnboarded && step !== 2) {
        navigate({ to: "/assignments", replace: true });
      }
    }
  }, [isInitialized, user, navigate, step]);

  useEffect(() => {
    if (step === 2 && !redirecting) {
      setRedirecting(true);
      const t = setTimeout(() => navigate({ to: "/assignments" }), 2400);
      return () => clearTimeout(t);
    }
  }, [step, redirecting, navigate]);

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setIsSubmitting(true);
      try {
        await useAuthStore.getState().onboard({
          profile: {
            title: title as any,
            role: role as any,
            avatarUrl: avatar || undefined,
          },
          institution: {
            name: institution,
            location: "",
          },
          targetGrades: grades,
          primarySubjects: subjects,
        });
        setStep(2);
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message || "Failed to complete onboarding.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canNext =
    (step === 0 && title && role) || (step === 1 && institution && grades.length && subjects.length);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step
                    ? "bg-easy-foreground text-white"
                    : i === step
                      ? "bg-brand text-white scale-110 shadow-card"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && (
                <div className={`w-12 h-0.5 rounded ${i < step ? "bg-easy-foreground" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-3xl shadow-soft p-8 lg:p-10 relative overflow-hidden">
          <div key={step} className="fade-up">
            {step === 0 && (
              <StepIdentity
                avatar={avatar}
                setAvatar={setAvatar}
                title={title}
                setTitle={setTitle}
                role={role}
                setRole={setRole}
              />
            )}
            {step === 1 && (
              <StepInstitution
                institution={institution}
                setInstitution={setInstitution}
                grades={grades}
                setGrades={setGrades}
                subjects={subjects}
                setSubjects={setSubjects}
              />
            )}
            {step === 2 && <StepDone />}
          </div>

          {step < 2 && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || isSubmitting}
                className="btn-press flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canNext || isSubmitting}
                className="btn-press flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-card disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    {step === 1 ? "Finish" : "Continue"}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIdentity({
  avatar,
  setAvatar,
  title,
  setTitle,
  role,
  setRole,
}: {
  avatar: string | null;
  setAvatar: (v: string | null) => void;
  title: string;
  setTitle: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Tell us about you</h2>
      <p className="text-sm text-muted-foreground mt-1">This helps us tailor VedaAI to your role.</p>

      <div className="mt-8 flex flex-col items-center">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
          className={`relative w-28 h-28 rounded-full cursor-pointer overflow-hidden border-2 border-dashed transition-all ${
            drag ? "border-brand bg-brand/10 scale-105" : "border-border bg-secondary hover:border-brand/60"
          }`}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <Camera className="w-6 h-6" />
              <span className="text-[10px] mt-1">Drop or click</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">PNG or JPG, up to 4 MB</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Field label="Title">
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
          >
            <option value="">Select...</option>
            {TITLES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Job role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
          >
            <option value="">Select...</option>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function StepInstitution({
  institution,
  setInstitution,
  grades,
  setGrades,
  subjects,
  setSubjects,
}: {
  institution: string;
  setInstitution: (v: string) => void;
  grades: string[];
  setGrades: (v: string[]) => void;
  subjects: string[];
  setSubjects: (v: string[]) => void;
}) {
  const [query, setQuery] = useState(institution);
  const [open, setOpen] = useState(false);
  const filtered = INSTITUTIONS.filter((i) => i.toLowerCase().includes(query.toLowerCase()));

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Your institution</h2>
      <p className="text-sm text-muted-foreground mt-1">Where do you teach, and what do you teach?</p>

      <div className="mt-8 space-y-6">
        <Field label="Institution / School">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onChange={(e) => {
                setQuery(e.target.value);
                setInstitution(e.target.value);
                setOpen(true);
              }}
              placeholder="Search for your school..."
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
            />
            {open && filtered.length > 0 && (
              <div className="absolute z-10 mt-1 inset-x-0 bg-card border border-border rounded-xl shadow-lift max-h-56 overflow-auto scale-in">
                {filtered.map((i) => (
                  <button
                    key={i}
                    onMouseDown={() => {
                      setInstitution(i);
                      setQuery(i);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-secondary transition"
                  >
                    {i}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label="Grades you teach">
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => {
              const on = grades.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggle(grades, g, setGrades)}
                  className={`btn-press px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    on
                      ? "bg-brand text-brand-foreground border-brand shadow-card"
                      : "bg-secondary border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g} Grade
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Primary subjects">
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const on = subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(subjects, s, setSubjects)}
                  className={`btn-press px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    on
                      ? "bg-brand text-brand-foreground border-brand shadow-card"
                      : "bg-secondary border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}

function StepDone() {
  return (
    <div className="py-10 flex flex-col items-center text-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-easy animate-ping opacity-50" />
        <div className="relative w-20 h-20 rounded-full bg-easy-foreground flex items-center justify-center scale-in">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight">You're all set!</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        Setting up your workspace and dropping you into the dashboard...
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin text-brand" />
        Preparing dashboard
      </div>
      <div className="w-full max-w-sm mt-6 space-y-2">
        <div className="h-3 rounded-md bg-secondary shimmer" />
        <div className="h-3 rounded-md bg-secondary shimmer w-5/6" />
        <div className="h-3 rounded-md bg-secondary shimmer w-2/3" />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export { X };
