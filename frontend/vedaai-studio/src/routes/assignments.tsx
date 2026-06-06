import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Plus, Search, SlidersHorizontal, MoreVertical, Trash2, Eye } from "lucide-react";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

export const Route = createFileRoute("/assignments")({
  head: () => ({
    meta: [
      { title: "Assignments — VedaAI" },
      { name: "description", content: "Manage and create assignments for your classes." },
    ],
  }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { assignments, isLoading, fetchAssignments, deleteAssignment } = useAssignmentStore(
    useShallow((s) => ({
      assignments: s.assignments,
      isLoading: s.isLoading,
      fetchAssignments: s.fetchAssignments,
      deleteAssignment: s.deleteAssignment,
    }))
  );

  useEffect(() => {
    fetchAssignments().catch((err) => {
      console.error(err);
      toast.error("Failed to load assignments");
    });
  }, [fetchAssignments]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      toast.success("Assignment deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to delete assignment");
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Assignment">
        {isLoading && assignments.length === 0 ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : assignments.length > 0 ? (
          <Populated
            assignments={assignments}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            onDelete={handleDelete}
          />
        ) : (
          <Empty />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}

function Empty() {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 fade-up">
      <div className="relative w-64 h-64 float-slow">
        <div className="absolute inset-0 rounded-full bg-secondary/70" />
        <svg viewBox="0 0 240 240" className="relative w-full h-full">
          <rect x="70" y="55" width="100" height="130" rx="8" fill="white" stroke="#1A1D1E" strokeWidth="2" />
          <rect x="85" y="75" width="55" height="6" rx="2" fill="#1A1D1E" />
          <rect x="85" y="92" width="70" height="3" rx="1.5" fill="#E0E2E6" />
          <rect x="85" y="100" width="60" height="3" rx="1.5" fill="#E0E2E6" />
          <path d="M55 50 Q 40 80, 75 110" stroke="#1A1D1E" strokeWidth="2" fill="none" />
          <rect x="160" y="60" width="50" height="22" rx="4" fill="white" stroke="#E0E2E6" />
          <circle cx="170" cy="71" r="2" fill="#9CA3AF" />
          <circle cx="140" cy="150" r="40" fill="none" stroke="#9B8FB8" strokeWidth="4" />
          <line x1="170" y1="180" x2="195" y2="205" stroke="#9B8FB8" strokeWidth="5" strokeLinecap="round" />
          <path d="M125 135 L155 165 M155 135 L125 165" stroke="#E94560" strokeWidth="6" strokeLinecap="round" />
          <path d="M85 115 L88 122 L95 118 L91 125 L97 130 L89 130 L86 137 L84 130 L77 132 L82 125 L77 119 L84 121 Z" fill="#7BA7C7" opacity="0.6" />
          <circle cx="205" cy="170" r="3" fill="#4A6FA5" />
        </svg>
      </div>
      <h2 className="mt-8 text-2xl font-bold">No assignments yet</h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics,
        define marking criteria, and let AI assist with grading.
      </p>
      <Link
        to="/create"
        className="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-3 font-medium btn-press shadow-card hover:shadow-lift"
      >
        <Plus className="w-4 h-4" />
        Create Your First Assignment
      </Link>
    </div>
  );
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateStr;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          Generating
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Completed
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
          Failed
        </span>
      );
    default:
      return null;
  }
};

interface PopulatedProps {
  assignments: any[];
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
  onDelete: (id: string) => void;
}

function Populated({
  assignments,
  openMenu,
  setOpenMenu,
  onDelete,
}: PopulatedProps) {
  return (
    <div className="fade-up">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <span className="mt-2 w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.18_150)]" />
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-sm text-muted-foreground">Manage and create assignments for your classes.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <button className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full hover:bg-secondary btn-press text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
          Filter By
        </button>
        <div className="sm:ml-auto relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search Assignment"
            className="w-full bg-card rounded-full pl-11 pr-4 py-2.5 text-sm shadow-card outline-none focus:ring-2 focus:ring-brand/40 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map((a, i) => (
          <div
            key={a._id}
            style={{ animationDelay: `${i * 60}ms` }}
            className="fade-up relative bg-card rounded-2xl p-6 shadow-card hover:shadow-lift hover:scale-[1.01] transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <Link to="/view/$id" params={{ id: a._id }} className="text-lg font-bold underline-offset-2 hover:underline">
                  {a.title}
                </Link>
                <div>{getStatusBadge(a.status)}</div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === a._id ? null : a._id)}
                  className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center"
                  aria-label="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openMenu === a._id && (
                  <div className="absolute right-0 mt-2 w-44 bg-popover rounded-xl shadow-lift border border-border p-1.5 scale-in origin-top-right z-20">
                    <Link
                      to="/view/$id"
                      params={{ id: a._id }}
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm"
                    >
                      <Eye className="w-4 h-4" /> View Assignment
                    </Link>
                    <button
                      onClick={() => {
                        onDelete(a._id);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-destructive"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-10 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">Assigned on</span> : {formatDate(a.createdAt)}
              </span>
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">Due</span> : {formatDate(a.dueDate)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:flex justify-center sticky bottom-6 mt-10">
        <Link
          to="/create"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-3 font-medium btn-press shadow-lift"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </Link>
      </div>
    </div>
  );
}
