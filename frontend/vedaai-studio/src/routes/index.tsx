import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Sparkles,
  Sliders,
  FileText,
  BarChart3,
  Play,
  Star,
  Menu,
  X,
  ArrowRight,
  Upload,
  Wand2,
  Printer,
  Twitter,
  Linkedin,
  Github,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VedaAI — Create Perfect Exam Papers in Seconds" },
      {
        name: "description",
        content:
          "VedaAI helps teachers instantly generate structured, curriculum-aligned assessments, quizzes, and assignments using advanced AI.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && user && user.isOnboarded) {
      navigate({ to: "/assignments", replace: true });
    }
  }, [isInitialized, user, navigate]);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Testimonials />
      <BottomCTA />
      <Footer />
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it Works" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/80 backdrop-blur-md shadow-soft border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
        <a href="#" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-[oklch(0.55_0.18_30)] flex items-center justify-center text-white font-bold shadow-card">
            V
          </div>
          <span className="text-xl font-bold tracking-tight">VedaAI</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/assignments"
            className="text-sm font-medium px-4 py-2 rounded-full hover:bg-secondary transition"
          >
            Log In
          </Link>
          <Link
            to="/create"
            className="btn-press text-sm font-semibold px-5 py-2.5 rounded-full bg-brand text-brand-foreground shadow-card hover:shadow-lift transition"
          >
            Get Started Free
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-t border-border px-5 py-4 flex flex-col gap-2 scale-in">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/assignments"
            className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary"
          >
            Log In
          </Link>
          <Link
            to="/create"
            className="px-3 py-2 rounded-full bg-brand text-brand-foreground text-sm font-semibold text-center"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-36 pb-24 px-5 sm:px-8">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(closest-side, oklch(0.85 0.18 40 / 0.5), transparent)" }} />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-medium text-muted-foreground fade-up shadow-card">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          AI-powered assessments for modern educators
        </div>

        <h1
          className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] fade-up"
          style={{ animationDelay: "60ms" }}
        >
          Create Perfect Exam Papers in{" "}
          <span className="text-brand">Seconds</span>, Not Hours.
        </h1>

        <p
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto fade-up"
          style={{ animationDelay: "140ms" }}
        >
          Empower your teaching with VedaAI. Instantly generate structured,
          curriculum-aligned assessments, quizzes, and assignments using
          advanced AI.
        </p>

        <div
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 fade-up"
          style={{ animationDelay: "220ms" }}
        >
          <Link
            to="/create"
            className="btn-press inline-flex items-center gap-2 bg-brand text-brand-foreground px-6 py-3.5 rounded-full font-semibold shadow-card hover:shadow-lift transition"
          >
            Start Creating for Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="btn-press inline-flex items-center gap-2 bg-card border border-border px-6 py-3.5 rounded-full font-semibold hover:bg-secondary transition">
            <Play className="w-4 h-4 text-brand fill-brand" />
            Watch Demo
          </button>
        </div>

        <div
          className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-4 fade-up"
          style={{ animationDelay: "280ms" }}
        >
          <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-brand" /> No credit card</span>
          <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-brand" /> Free forever plan</span>
        </div>
      </div>
      <div
        className="relative max-w-6xl mx-auto mt-16 fade-up"
        style={{ animationDelay: "360ms" }}
      >
        <div
          aria-hidden
          className="absolute -inset-10 -z-10 rounded-[3rem] blur-3xl opacity-60"
          style={{ background: "radial-gradient(closest-side, oklch(0.75 0.2 40 / 0.45), transparent 70%)" }}
        />
        <div className="float-slow rounded-3xl overflow-hidden shadow-lift border border-border bg-card transform-gpu rotate-[-1.2deg] hover:rotate-0 transition-transform duration-700">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="grid grid-cols-12 min-h-[460px] bg-background">
      <div className="hidden md:flex col-span-3 lg:col-span-2 flex-col gap-3 bg-card border-r border-border p-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold">V</div>
          <span className="font-bold">VedaAI</span>
        </div>
        <div className="mt-4 h-9 rounded-full bg-brand/10 text-brand text-xs font-medium flex items-center justify-center">+ Create Assignment</div>
        {["Home", "Groups", "Assignments", "Library"].map((l, i) => (
          <div key={l} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${i === 2 ? "bg-secondary font-semibold" : "text-muted-foreground"}`}>
            <div className="w-3.5 h-3.5 rounded-sm bg-muted-foreground/40" />
            {l}
          </div>
        ))}
      </div>
      <div className="col-span-12 md:col-span-9 lg:col-span-10 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-muted-foreground">Create Assignment</div>
            <div className="text-lg font-bold">Class 10 — Physics Mid-Term</div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-full bg-secondary" />
            <div className="h-8 w-28 rounded-full bg-brand" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Configuration</div>
            {[
              { label: "Easy", val: "5 × 1 mark", color: "easy" },
              { label: "Moderate", val: "4 × 2 marks", color: "moderate" },
              { label: "Challenging", val: "3 × 5 marks", color: "hard" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between bg-background rounded-xl px-3 py-2.5">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    row.color === "easy"
                      ? "bg-easy text-easy-foreground"
                      : row.color === "moderate"
                        ? "bg-moderate text-moderate-foreground"
                        : "bg-hard text-hard-foreground"
                  }`}
                >
                  {row.label}
                </span>
                <span className="text-xs font-medium">{row.val}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between text-sm font-semibold border-t border-border pt-3">
              <span>Total</span>
              <span>25 Marks</span>
            </div>
          </div>

          <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground uppercase">AI Generated Paper</div>
              <div className="text-[10px] font-medium text-brand bg-brand/10 px-2 py-1 rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live
              </div>
            </div>
            {[
              { q: "Define Newton's third law of motion.", tag: "Easy", marks: "1" },
              { q: "Derive the formula for kinetic energy.", tag: "Moderate", marks: "2" },
              { q: "A 2 kg object moves with v = 10 m/s…", tag: "Challenging", marks: "5" },
            ].map((q, i) => (
              <div key={i} className="rounded-xl bg-background border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      q.tag === "Easy"
                        ? "bg-easy text-easy-foreground"
                        : q.tag === "Moderate"
                          ? "bg-moderate text-moderate-foreground"
                          : "bg-hard text-hard-foreground"
                    }`}
                  >
                    {q.tag}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">{q.marks} Marks</span>
                </div>
                <div className="text-xs text-foreground">{i + 1}. {q.q}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function SocialProof() {
  const logos = ["Delhi Public", "Cambridge", "Riverdale", "Oakridge", "St. Xavier's", "Harvard Prep"];
  return (
    <section className="py-16 border-y border-border bg-card/50">
      <p className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground">
        TRUSTED BY INNOVATIVE EDUCATORS AT
      </p>
      <div className="mt-8 overflow-hidden relative">
        <div className="flex gap-16 marquee whitespace-nowrap">
          {[...logos, ...logos, ...logos].map((l, i) => (
            <div
              key={i}
              className="text-2xl font-bold text-muted-foreground/60 grayscale hover:grayscale-0 hover:text-brand transition-all duration-300 shrink-0"
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Features() {
  const items = [
    {
      icon: Sparkles,
      title: "Smart Prompting",
      desc: "Our AI understands your syllabus context, board guidelines, and grade level to craft questions that feel handwritten.",
    },
    {
      icon: Sliders,
      title: "Granular Control",
      desc: "Fine-tune difficulty mix, question types (MCQ, short, long), and mark distribution down to the last point.",
    },
    {
      icon: FileText,
      title: "Export to PDF",
      desc: "Pixel-perfect formatting with school headers, watermark, and answer keys — print-ready in one click.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      desc: "Track question difficulty, class performance, and identify learning gaps with built-in analytics.",
    },
  ];
  return (
    <section id="features" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand">Why VedaAI</div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            Everything you need to assess student potential.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A toolkit built with teachers, for teachers — every detail crafted to give back hours of your week.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="reveal group bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-lift hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Upload or Describe",
      desc: "Drop your syllabus PDF, paste topic notes, or simply describe what you need. VedaAI listens and learns.",
      icon: Upload,
      graphic: <UploadGraphic />,
    },
    {
      n: "02",
      title: "AI Crafts the Questions",
      desc: "Watch as VedaAI structures a perfectly balanced paper — difficulty, marks, and types tuned to your class.",
      icon: Wand2,
      graphic: <GeneratingGraphic />,
    },
    {
      n: "03",
      title: "Review, Edit, and Print",
      desc: "Polish anything you'd like, then export as a beautiful, print-ready PDF with an answer key included.",
      icon: Printer,
      graphic: <PaperGraphic />,
    },
  ];
  return (
    <section id="how" className="py-24 px-5 sm:px-8 bg-card/50 border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand">How It Works</div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            From blank page to brilliant paper in 3 steps.
          </h2>
        </div>

        <div className="mt-16 space-y-20 lg:space-y-28">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`reveal grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <div className="inline-flex items-center gap-2 text-brand font-semibold text-sm">
                  <s.icon className="w-4 h-4" /> STEP {s.n}
                </div>
                <h3 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-md">{s.desc}</p>
              </div>
              <div className="bg-card rounded-3xl border border-border p-8 shadow-soft min-h-[280px] flex items-center justify-center">
                {s.graphic}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UploadGraphic() {
  return (
    <div className="w-full max-w-sm border-2 border-dashed border-brand/40 rounded-2xl p-10 text-center bg-brand/5">
      <Upload className="w-10 h-10 mx-auto text-brand" />
      <div className="mt-4 font-semibold">Drop syllabus.pdf here</div>
      <div className="text-xs text-muted-foreground mt-1">or click to browse</div>
    </div>
  );
}

function GeneratingGraphic() {
  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand">
        <Sparkles className="w-4 h-4 animate-pulse" /> Generating questions…
      </div>
      {[80, 65, 90, 70].map((w, i) => (
        <div key={i} className="h-3 rounded-full bg-secondary overflow-hidden">
          <div className="h-full shimmer rounded-full bg-brand/30" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

function PaperGraphic() {
  return (
    <div className="w-full max-w-sm bg-background rounded-xl border border-border p-5 shadow-card">
      <div className="text-center font-bold text-sm">Physics — Mid Term</div>
      <div className="text-center text-[10px] text-muted-foreground">Class 10 · 25 Marks</div>
      <div className="mt-4 space-y-2">
        {["Define Newton's third law…", "Derive the formula for KE…", "A 2 kg object moves with…"].map((q, i) => (
          <div key={i} className="text-xs text-foreground border-b border-border pb-2">
            Q{i + 1}. {q}
          </div>
        ))}
      </div>
      <button className="btn-press mt-4 w-full bg-brand text-brand-foreground rounded-full py-2 text-xs font-semibold">
        Download PDF
      </button>
    </div>
  );
}
function Testimonials() {
  const reviews = [
    {
      name: "Priya Sharma",
      school: "Delhi Public School, Bokaro",
      quote:
        "VedaAI cut my weekend planning time in half. The quality of the physics questions it generates is indistinguishable from my own.",
    },
    {
      name: "Arjun Mehta",
      school: "Cambridge International, Pune",
      quote:
        "I built a 3-term assessment plan in one afternoon. The difficulty calibration is impressively accurate.",
    },
    {
      name: "Sister Catherine",
      school: "St. Xavier's, Mumbai",
      quote:
        "Our entire science department uses VedaAI now. The PDF export looks better than what we made in Word.",
    },
    {
      name: "Rohan Iyer",
      school: "Oakridge International",
      quote:
        "The analytics view helped me spot a class-wide gap on motion problems I would've missed otherwise.",
    },
  ];
  return (
    <section id="testimonials" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand">Testimonials</div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">Loved by teachers across India.</h2>
        </div>

        <div className="mt-14 columns-1 md:columns-2 lg:columns-2 gap-5 [column-fill:_balance]">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="reveal mb-5 break-inside-avoid bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-lift transition-shadow"
            >
              <div className="flex gap-1 text-brand">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-brand" />
                ))}
              </div>
              <p className="mt-4 text-foreground leading-relaxed">"{r.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-[oklch(0.55_0.18_30)] text-white flex items-center justify-center font-bold">
                  {r.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function BottomCTA() {
  return (
    <section id="pricing" className="px-5 sm:px-8 py-16">
      <div
        className="reveal max-w-6xl mx-auto rounded-[2.5rem] p-12 sm:p-16 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.7 0.19 40), oklch(0.55 0.2 30))",
        }}
      >
        <div aria-hidden className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 20% 20%, white, transparent 40%)" }} />
        <h2 className="relative text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
          Ready to transform your workflow?
        </h2>
        <p className="relative mt-5 text-white/80 text-lg max-w-xl mx-auto">
          Join thousands of educators creating better assessments in less time.
        </p>
        <Link
          to="/create"
          className="btn-press relative inline-flex items-center gap-2 mt-8 bg-white text-brand font-semibold px-7 py-4 rounded-full shadow-lift hover:shadow-xl"
        >
          Create Your First Assignment Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
function Footer() {
  const cols = [
    {
      title: "Product",
      links: ["Features", "Updates", "Pricing", "Roadmap"],
    },
    {
      title: "Resources",
      links: ["Help Center", "Blog", "Tutorials", "API Docs"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Cookies", "Security"],
    },
  ];
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-[oklch(0.55_0.18_30)] flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="text-xl font-bold tracking-tight">VedaAI</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            AI-powered assessment creation for teachers and schools.
          </p>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-sm font-semibold mb-4">{c.title}</div>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-brand transition">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} VedaAI. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-brand hover:border-brand transition">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
