// src/routes/view.$id.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { useAssignmentSync } from "@/hooks/useAssignmentSync";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useShallow } from "zustand/react/shallow";
import { Download, Sparkles, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/view/$id")({
  head: () => ({ meta: [{ title: "Question Paper — VedaAI" }] }),
  component: ViewPage,
});

function ViewPage() {
  const { id } = Route.useParams();

  useAssignmentSync(id);

  const { activeAssignment, generationStatus, errorReason } = useAssignmentStore(
    useShallow((s) => ({
      activeAssignment: s.activeAssignment,
      generationStatus: s.generationStatus,
      errorReason: s.errorReason,
    }))
  );

  const paperData = activeAssignment?.paperData;

  const renderContent = () => {
    switch (generationStatus) {
      case "idle":
        return (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Loading assignment...</p>
          </div>
        );
      case "uploading":
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-card rounded-3xl shadow-card space-y-4 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <h3 className="font-bold text-lg">Uploading files...</h3>
            <p className="text-sm text-muted-foreground">Uploading references to VedaAI repository.</p>
          </div>
        );

      case "pending":
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-card rounded-3xl shadow-card space-y-4 text-center">
            <div className="flex gap-1.5 justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <h3 className="font-bold text-lg">Queued for generation</h3>
            <p className="text-sm text-muted-foreground">Waiting for VedaAI engine instance to spawn...</p>
          </div>
        );

      case "processing":
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-card rounded-3xl shadow-card space-y-4 text-center">
            <Sparkles className="w-8 h-8 animate-pulse text-brand" />
            <h3 className="font-bold text-lg">VedaAI is writing your exam...</h3>
            <p className="text-sm text-muted-foreground">Generating questions and structured blueprint matching guidelines...</p>
            <div className="w-full max-w-xs space-y-3 mt-4">
              <div className="h-4 rounded bg-secondary animate-pulse w-3/4 mx-auto" />
              <div className="h-4 rounded bg-secondary animate-pulse w-1/2 mx-auto" />
              <div className="h-4 rounded bg-secondary animate-pulse w-5/6 mx-auto" />
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-card rounded-3xl shadow-card border border-destructive/20 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-destructive">Assessment Generation Failed</h3>
            <p className="text-sm max-w-md text-muted-foreground">
              {errorReason || "AI engine encountered an unexpected error."}
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <Link
                to="/create"
                className="inline-flex bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 btn-press"
              >
                Go back &amp; Edit
              </Link>
            </div>
          </div>
        );

      case "completed":
        if (!paperData) {
          return (
            <div className="flex flex-col items-center justify-center p-8 bg-card rounded-3xl shadow-card text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <h3 className="font-bold text-lg">No content generated</h3>
              <p className="text-sm text-muted-foreground">We couldn't retrieve the structured blueprint details.</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="bg-primary text-primary-foreground rounded-3xl p-5 sm:p-6 shadow-card">
              <p className="text-sm leading-relaxed">
                Certainly! Here is your custom question paper blueprint generated for your classes.
              </p>
              {paperData.pdfUrl ? (
                <a
                  href={paperData.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-card text-foreground rounded-full px-5 py-2.5 text-sm font-medium btn-press hover:bg-secondary transition"
                >
                  <Download className="w-4 h-4" />
                  Download Printable PDF
                </a>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-white/80 bg-white/10 px-4 py-2 rounded-full w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Compiling PDF print layout...
                </div>
              )}
            </div>

            <div className="bg-card rounded-3xl p-6 sm:p-10 shadow-card">
              <div className="text-center border-b border-border pb-6">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {paperData.institutionName || "VedaAI Academy"}
                </h2>
                <p className="text-base mt-2 font-semibold text-primary">{paperData.title}</p>
                <div className="mt-2 flex justify-center gap-6 text-sm text-muted-foreground font-medium">
                  <span>Subject: {paperData.subject}</span>
                  <span>Class: {paperData.className}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Time Allowed: {paperData.timeAllowedMinutes} Mins</span>
                <span>Maximum Marks: {paperData.totalMarks} Marks</span>
              </div>

              <div className="mt-6 space-y-3 text-xs border border-border/60 bg-background/40 rounded-2xl p-4 max-w-sm">
                <div>Candidate Name: <span className="inline-block border-b border-border w-48 align-middle" /></div>
                <div>Roll Number: <span className="inline-block border-b border-border w-40 align-middle" /></div>
              </div>

              <div className="mt-8 space-y-8">
                {paperData.sections.map((section, secIdx) => (
                  <div key={secIdx} className="space-y-4">
                    <h3 className="font-bold border-b border-border pb-1.5 text-sm tracking-wide uppercase text-primary">
                      Section {String.fromCharCode(65 + secIdx)}: {section.sectionName}
                    </h3>
                    {section.instructions && (
                      <p className="text-xs italic text-muted-foreground">{section.instructions}</p>
                    )}
                    <ol className="space-y-4 text-sm list-decimal pl-6">
                      {section.questions.map((q, qIdx) => (
                        <li key={qIdx} className="leading-relaxed">
                          <div className="flex items-start justify-between gap-4">
                            <span className="flex-1">
                              <span className={`inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full mr-2 ${
                                q.difficulty === "Easy" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                q.difficulty === "Moderate" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}>
                                {q.difficulty}
                              </span>
                              {q.questionText}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0 font-semibold">
                              [{q.marks} Marks]
                            </span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            {paperData.pdfUrl && (
              <div className="border border-border rounded-3xl overflow-hidden shadow-card">
                <div className="bg-muted px-6 py-3 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-sm">Print Layout Preview</span>
                  <a
                    href={paperData.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand hover:underline font-medium"
                  >
                    Open fullscreen
                  </a>
                </div>
                <iframe
                  src={paperData.pdfUrl}
                  className="w-full h-[600px] bg-white"
                  title="Question Paper Preview"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="View Paper" icon={<Sparkles className="w-4 h-4" />}>
        <div className="max-w-3xl mx-auto fade-up space-y-6 pb-12">
          <div className="flex items-center gap-2">
            <Link
              to="/assignments"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to assignments
            </Link>
          </div>

          {renderContent()}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
