// src/routes/create.tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft, ArrowRight, Calendar, Mic, Minus, Plus, Sparkles, UploadCloud, X } from "lucide-react";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { useGroupStore } from "@/store/useGroupStore";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { useShallow } from "zustand/react/shallow";
import { apiClient } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "Create Assignment — VedaAI" }] }),
  component: CreatePage,
});

type Row = { id: number; type: string; count: number; marks: number };
const TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions"
];

function CreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { groups, fetchGroups } = useGroupStore(
    useShallow((s) => ({
      groups: s.groups,
      fetchGroups: s.fetchGroups,
    }))
  );

  const {
    generationStatus,
    uploadProgress,
    setUploadProgress,
    setGenerationStatus,
    setErrorReason,
    addAssignment,
    resetCreationState,
  } = useAssignmentStore(
    useShallow((s) => ({
      generationStatus: s.generationStatus,
      uploadProgress: s.uploadProgress,
      setUploadProgress: s.setUploadProgress,
      setGenerationStatus: s.setGenerationStatus,
      setErrorReason: s.setErrorReason,
      addAssignment: s.addAssignment,
      resetCreationState: s.resetCreationState,
    }))
  );
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [className, setClassName] = useState("Grade 10");
  const [timeAllowed, setTimeAllowed] = useState(60);
  const [dueDate, setDueDate] = useState("");
  const [groupId, setGroupId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [rows, setRows] = useState<Row[]>([
    { id: 1, type: TYPES[0], count: 4, marks: 1 },
    { id: 2, type: TYPES[1], count: 3, marks: 2 },
    { id: 3, type: TYPES[2], count: 5, marks: 5 },
    { id: 4, type: TYPES[3], count: 5, marks: 5 },
  ]);

  const totalQ = rows.reduce((s, r) => s + r.count, 0);
  const totalM = rows.reduce((s, r) => s + r.count * r.marks, 0);

  useEffect(() => {
    fetchGroups().catch(console.error);
    resetCreationState();
  }, [fetchGroups, resetCreationState]);

  const update = (id: number, patch: Partial<Row>) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  
  const remove = (id: number) => setRows((r) => r.filter((x) => x.id !== id));
  
  const add = () =>
    setRows((r) => [...r, { id: Date.now(), type: TYPES[0], count: 1, marks: 1 }]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.type === "text/plain") {
        setFile(droppedFile);
      } else {
        toast.error("Invalid file format. Please upload a PDF or TXT file.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf" || selectedFile.type === "text/plain") {
        setFile(selectedFile);
      } else {
        toast.error("Invalid file format. Please upload a PDF or TXT file.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please provide an assignment title.");
      return;
    }
    if (!dueDate) {
      toast.error("Please provide a due date.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please provide a subject.");
      return;
    }
    if (!className.trim()) {
      toast.error("Please provide a class name.");
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append("document", file);
    }
    formData.append("title", title);
    formData.append("dueDate", new Date(dueDate).toISOString());
    if (instructions) {
      formData.append("instructions", instructions);
    }
    if (groupId) {
      formData.append("groupId", groupId);
    }

    const config = {
      subject,
      className,
      timeAllowedMinutes: Number(timeAllowed),
      totalMarks: totalM,
      sections: rows.map((r, idx) => ({
        sectionName: r.type,
        instructions: `Please answer all questions in Section ${String.fromCharCode(65 + idx)}.`,
        questionCount: r.count,
        marksPerQuestion: r.marks,
        difficulty: "Mixed",
        topics: [subject],
      })),
    };

    formData.append("config", JSON.stringify(config));

    setUploadProgress(0);
    setGenerationStatus("uploading");
    setErrorReason(null);

    try {
      const response = await apiClient.post("/assignments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
          if (percentCompleted >= 100) {
            setGenerationStatus("pending");
          }
        },
      });

      const newAssignment = response.data.data || response.data;
      addAssignment(newAssignment);
      toast.success("Assignment created! Initializing generation...");
      
      navigate({ to: "/view/$id", params: { id: newAssignment._id } });
    } catch (err: any) {
      setGenerationStatus("idle");
      const errMsg = err.response?.data?.error || err.message || "Failed to create assignment.";
      setErrorReason(errMsg);
      toast.error(errMsg);
    }
  };

  if (generationStatus !== "idle" && generationStatus !== "completed" && generationStatus !== "failed") {
    return (
      <ProtectedRoute>
        <AppShell title="Assignment">
          <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4 fade-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse text-primary">
              <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: "3s" }} />
            </div>

            {generationStatus === "uploading" && (
              <div className="w-full space-y-4">
                <h2 className="text-xl font-bold">Uploading Reference Materials</h2>
                <p className="text-sm text-muted-foreground">Uploading files to secure VedaAI repository...</p>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums text-primary">{uploadProgress}%</span>
              </div>
            )}

            {generationStatus === "pending" && (
              <div className="w-full space-y-4">
                <h2 className="text-xl font-bold">In Generation Queue</h2>
                <p className="text-sm text-muted-foreground">Your assignment request is queued. AI engine is spawning...</p>
                <div className="flex justify-center gap-1.5 mt-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell title="Assignment">
        <form onSubmit={handleSubmit} className="fade-up max-w-4xl mx-auto pb-12">
          <div className="flex items-start gap-3 mb-2">
            <span className="mt-2 w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.18_150)]" />
            <div>
              <h1 className="text-2xl font-bold">Create Assignment</h1>
              <p className="text-sm text-muted-foreground">Set up a new assignment for your students</p>
            </div>
          </div>

          <div className="mt-6 bg-card rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <h2 className="text-lg font-bold">Assignment Details</h2>
            <p className="text-sm text-muted-foreground -mt-4">Basic information about your assignment</p>

        
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl py-8 px-6 text-center hover:border-brand/60 transition cursor-pointer bg-background/40 ${
                dragActive ? "border-brand bg-brand/10" : "border-border"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={handleFileSelect}
              />
              <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              {file ? (
                <div>
                  <p className="font-semibold text-primary">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Choose a reference document (PDF/TXT) or drag &amp; drop it here</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF or TXT up to 10MB</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Physics Midterm Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full bg-secondary border border-transparent rounded-full px-5 py-3 text-sm outline-none focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Due Date</label>
                <div className="mt-2 relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-secondary border border-transparent rounded-full px-5 py-3 text-sm outline-none focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Physics, History"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-2 w-full bg-secondary border border-transparent rounded-full px-5 py-3 text-sm outline-none focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 10-A"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="mt-2 w-full bg-secondary border border-transparent rounded-full px-5 py-3 text-sm outline-none focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Time Allowed (Minutes)</label>
                <input
                  type="number"
                  placeholder="e.g. 60"
                  value={timeAllowed}
                  onChange={(e) => setTimeAllowed(Number(e.target.value))}
                  className="mt-2 w-full bg-secondary border border-transparent rounded-full px-5 py-3 text-sm outline-none focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Assign to Class Group (Optional)</label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="mt-2 w-full h-[46px] bg-secondary border border-transparent rounded-full px-5 text-sm outline-none focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
                >
                  <option value="">Do not assign</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} ({group.subject})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold mb-3 block">Question Blueprint</label>
              <div className="grid grid-cols-12 gap-3 text-sm font-semibold px-2">
                <div className="col-span-12 sm:col-span-7">Question Type</div>
                <div className="hidden sm:block sm:col-span-3 text-center">No. of Questions</div>
                <div className="hidden sm:block sm:col-span-2 text-center">Marks</div>
              </div>

              <div className="mt-3 space-y-3">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="fade-up grid grid-cols-12 gap-3 items-center bg-background/50 sm:bg-transparent rounded-2xl p-3 sm:p-0"
                  >
                    <div className="col-span-12 sm:col-span-7 flex items-center gap-2">
                      <select
                        value={row.type}
                        onChange={(e) => update(row.id, { type: e.target.value })}
                        className="flex-1 bg-secondary border border-transparent rounded-full px-4 py-2.5 text-sm outline-none focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
                      >
                        {TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
                        aria-label="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Stepper
                        value={row.count}
                        onChange={(v) => update(row.id, { count: v })}
                        label="No. of Questions"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <Stepper
                        value={row.marks}
                        onChange={(v) => update(row.id, { marks: v })}
                        label="Marks"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={add}
                className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full pl-1 pr-4 py-1 text-sm font-medium btn-press"
              >
                <span className="w-7 h-7 rounded-full bg-card text-primary flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </span>
                Add Question Type
              </button>

              <div className="mt-4 text-right text-sm">
                <div>Total Questions : <span className="font-semibold">{totalQ}</span></div>
                <div>Total Marks : <span className="font-semibold">{totalM}</span></div>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold">Additional Information / Instructions</label>
              <div className="mt-2 relative">
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                  className="w-full bg-secondary border border-transparent rounded-2xl px-5 py-3 text-sm outline-none focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 resize-none transition-all"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Link
              to="/assignments"
              className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2.5 text-sm font-medium btn-press hover:bg-secondary"
            >
              <ArrowLeft className="w-4 h-4" /> Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium btn-press shadow-card hover:bg-primary/90 transition-colors"
            >
              Generate Paper <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </form>
      </AppShell>
    </ProtectedRoute>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label?: string }) {
  return (
    <div className="bg-secondary border border-transparent rounded-full px-3 py-1.5 flex items-center justify-between gap-2 focus-within:border-brand transition">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-6 h-6 rounded-full hover:bg-card flex items-center justify-center text-muted-foreground"
        aria-label={`Decrease ${label}`}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-6 h-6 rounded-full hover:bg-card flex items-center justify-center text-muted-foreground"
        aria-label={`Increase ${label}`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
