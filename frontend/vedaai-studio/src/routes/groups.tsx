// src/routes/groups.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Plus, Search, MoreVertical, Users, X, ClipboardList, Archive, FileText } from "lucide-react";
import { useGroupStore } from "@/store/useGroupStore";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { useShallow } from "zustand/react/shallow";
import { IRosterStudent } from "@/types/api.types";
import { toast } from "sonner";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "My Groups — VedaAI" },
      { name: "description", content: "Manage your student groups and classes." },
    ],
  }),
  component: GroupsPage,
});

const avatarColors = [
  "bg-brand text-white",
  "bg-easy-foreground text-white",
  "bg-moderate-foreground text-white",
  "bg-hard-foreground text-white",
  "bg-primary text-primary-foreground",
];

function GroupsPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { groups, isLoading, fetchGroups, createGroup, deleteGroup } = useGroupStore(
    useShallow((s) => ({
      groups: s.groups,
      isLoading: s.isLoading,
      fetchGroups: s.fetchGroups,
      createGroup: s.createGroup,
      deleteGroup: s.deleteGroup,
    }))
  );

  useEffect(() => {
    fetchGroups().catch((err) => {
      console.error(err);
      toast.error("Failed to load classes");
    });
  }, [fetchGroups]);
  const safeGroups = Array.isArray(groups) ? groups : [];
  const filtered = safeGroups.filter(
    (g) =>
      g?.name?.toLowerCase().includes(query.toLowerCase()) ||
      g?.subject?.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreate = async (name: string, subject: string, roster: IRosterStudent[]) => {
    try {
      await createGroup({ name, subject, roster });
      toast.success(`Class group "${name}" created successfully`);
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to create class group");
    }
  };

  const handleArchive = async (id: string, name: string) => {
    try {
      await deleteGroup(id);
      toast.success(`Class group "${name}" archived successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to archive class group");
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="My Groups" icon={<Users className="w-5 h-5" />}>
        {isLoading && safeGroups.length === 0 ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : safeGroups.length === 0 ? (
          <EmptyState onCreate={() => setModalOpen(true)} />
        ) : (
          <div className="max-w-7xl mx-auto py-6 fade-up">
            <div className="bg-card rounded-2xl shadow-card p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search groups..."
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
                />
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="btn-press inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-brand text-brand-foreground font-semibold shadow-card hover:opacity-95"
              >
                <Plus className="w-4 h-4" /> Create New Class
              </button>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((g, idx) => (
                <GroupCard
                  key={g._id}
                  group={g}
                  idx={idx}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  onArchive={() => handleArchive(g._id, g.name)}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                No groups match "{query}".
              </div>
            )}
          </div>
        )}

        {modalOpen && (
          <CreateClassModal
            onClose={() => setModalOpen(false)}
            onCreate={handleCreate}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}

function GroupCard({
  group,
  idx,
  openMenu,
  setOpenMenu,
  onArchive,
}: {
  group: any;
  idx: number;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
  onArchive: () => void;
}) {
  const isOpen = openMenu === group._id;

  
  const initialsList = (group.roster || []).map((s: IRosterStudent) => {
    const parts = s.studentName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return s.studentName.slice(0, 2).toUpperCase();
  });

  return (
    <div
      className="bg-card rounded-2xl shadow-card p-5 transition-all hover:shadow-lift hover:-translate-y-0.5 fade-up relative"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-lg tracking-tight truncate">{group.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{group.subject}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpenMenu(isOpen ? null : group._id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary"
            aria-label="Card actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {isOpen && (
            <div className="absolute right-0 top-9 z-10 w-48 bg-card border border-border rounded-xl shadow-lift py-1 scale-in">
              <MenuItem icon={ClipboardList} onClick={() => setOpenMenu(null)}>
                Manage Roster
              </MenuItem>
              <MenuItem icon={FileText} onClick={() => setOpenMenu(null)}>
                View Assignments
              </MenuItem>
              <MenuItem icon={Archive} danger onClick={() => { onArchive(); setOpenMenu(null); }}>
                Archive Class
              </MenuItem>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-easy text-easy-foreground text-xs font-semibold">
          <Users className="w-3 h-3" /> {group.roster?.length || 0} Students
        </span>
      </div>

      <div className="mt-4 flex items-center">
        {initialsList.slice(0, 5).map((init: string, i: number) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full ring-2 ring-card text-[10px] font-semibold flex items-center justify-center ${
              avatarColors[i % avatarColors.length]
            }`}
            style={{ marginLeft: i === 0 ? 0 : -8 }}
          >
            {init}
          </div>
        ))}
        {(group.roster?.length || 0) > 5 && (
          <div
            className="w-8 h-8 rounded-full ring-2 ring-card bg-secondary text-[10px] font-semibold text-muted-foreground flex items-center justify-center"
            style={{ marginLeft: -8 }}
          >
            +{group.roster.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  children,
  danger,
  onClick,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition text-left ${
        danger ? "text-hard-foreground font-semibold" : "text-foreground"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 fade-up">
      <svg viewBox="0 0 200 140" className="w-48 h-32 mb-6" aria-hidden>
        <rect x="20" y="40" width="160" height="80" rx="8" fill="oklch(0.96 0.005 250)" />
        <rect x="30" y="50" width="40" height="30" rx="4" fill="oklch(0.92 0.005 250)" />
        <rect x="80" y="50" width="40" height="30" rx="4" fill="oklch(0.92 0.005 250)" />
        <rect x="130" y="50" width="40" height="30" rx="4" fill="oklch(0.92 0.005 250)" />
        <circle cx="50" cy="65" r="6" fill="var(--brand)" opacity="0.6" />
        <circle cx="100" cy="65" r="6" fill="var(--brand)" opacity="0.4" />
        <circle cx="150" cy="65" r="6" fill="var(--brand)" opacity="0.5" />
        <rect x="60" y="100" width="80" height="6" rx="3" fill="oklch(0.85 0.005 250)" />
        <path d="M100 15 L110 35 L90 35 Z" fill="var(--brand)" />
      </svg>
      <h2 className="text-2xl font-bold tracking-tight">No classes managed yet</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        Class groups let you assign assessments and track student progress in one place.
      </p>
      <button
        onClick={onCreate}
        className="btn-press mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-brand text-brand-foreground font-semibold shadow-card"
      >
        <Plus className="w-4 h-4" /> Create Your First Class Group
      </button>
    </div>
  );
}

function CreateClassModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, subject: string, roster: IRosterStudent[]) => void;
}) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [roster, setRoster] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const parseRoster = (raw: string): IRosterStudent[] =>
    raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((studentName, i) => ({
        studentName,
        rollNumber: `ROL-${String(i + 1).padStart(3, "0")}`,
      }));

  const studentsList = parseRoster(roster);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm fade-up" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-lift p-6 lg:p-8 scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-secondary"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold tracking-tight">Create new class</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up a group and optionally add your roster.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onCreate(name, subject, studentsList);
          }}
          className="mt-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Class name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Class 9-A"
                className="mt-2 w-full h-11 px-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Subject
              </span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2 w-full h-11 px-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all"
              >
                {["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Computer Science"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  )
                )}
              </select>
            </label>
          </div>

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student roster (optional)
              </span>
              <span className="text-xs text-muted-foreground">{studentsList.length} detected</span>
            </div>
            <textarea
              value={roster}
              onChange={(e) => setRoster(e.target.value)}
              rows={5}
              placeholder="Paste names separated by commas or new lines…"
              className="mt-2 w-full p-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 transition-all resize-none"
            />
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-press px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-press px-5 py-2.5 rounded-xl bg-brand text-brand-foreground text-sm font-semibold shadow-card hover:opacity-95"
            >
              Create class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
