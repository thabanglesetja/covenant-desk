import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { alisApi } from "@/lib/alisApi";
import {
  lawRulesStore,
  RULE_CATEGORIES,
  type LawRule,
  type RiskLevel,
  type RuleStatus,
} from "@/lib/lawRules";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  BarChart3,
  Upload,
  Scale,
  User,
  Settings,
  HelpCircle,
  MessageSquare,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

const emptyForm: Omit<LawRule, "id" | "updatedAt"> = {
  title: "",
  description: "",
  category: "Ethics",
  riskLevel: "Medium",
  status: "Active",
};

const LawRules = () => {
  const navigate = useNavigate();
  const user = alisApi.getCurrentUser();

  const [rules, setRules] = useState<LawRule[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<LawRule | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<LawRule | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    if (user.role !== "LEGAL_PRACTITIONER") {
      toast.error("Only Legal Practitioners can manage Law Rules");
      navigate("/dashboard", { replace: true });
      return;
    }
    setRules(lawRulesStore.list());
  }, [user, navigate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rules.filter((r) => {
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      const matchC = category === "all" || r.category === category;
      return matchQ && matchC;
    });
  }, [rules, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (r: LawRule) => {
    setEditing(r);
    setForm({
      title: r.title,
      description: r.description,
      category: r.category,
      riskLevel: r.riskLevel,
      status: r.status,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    if (editing) {
      lawRulesStore.update(editing.id, form);
      toast.success("Rule updated");
    } else {
      lawRulesStore.create(form);
      toast.success("Rule created");
    }
    setRules(lawRulesStore.list());
    setOpen(false);
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    lawRulesStore.remove(confirmDelete.id);
    setRules(lawRulesStore.list());
    setConfirmDelete(null);
    toast.success("Rule deleted");
  };

  const onLogout = () => {
    alisApi.logout();
    navigate("/", { replace: true });
  };

  if (!user) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight">
              {user.fullName}{" "}
              <span className="font-normal text-muted-foreground">
                (Legal Practitioner)
              </span>
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="flex h-[calc(100vh-4rem)] w-60 flex-col justify-between border-r border-border bg-card p-4">
          <nav className="space-y-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
            <NavItem to="/dashboard" icon={<FileText className="h-4 w-4" />} label="Documents" />
            <NavItem to="/dashboard" icon={<BarChart3 className="h-4 w-4" />} label="Reports" />
            <NavItem to="/dashboard" icon={<Upload className="h-4 w-4" />} label="Upload PDF" />
            <NavItem to="/law-rules" icon={<Scale className="h-4 w-4" />} label="Law Rules" active />
            <NavItem to="/dashboard" icon={<User className="h-4 w-4" />} label="Profile" />
            <NavItem to="/dashboard" icon={<Settings className="h-4 w-4" />} label="Settings" />
          </nav>
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
            <HelpCircle className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-semibold">Need help?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Contact support if you need assistance with the platform.
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              <MessageSquare className="h-3.5 w-3.5" /> Contact Support
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Law Rules
            </h1>
            <p className="mt-1 text-muted-foreground">
              View and manage legal rules and compliance requirements used for
              AI analysis.
            </p>
          </div>

          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search rules by title or keyword..."
                className="pl-9"
              />
            </div>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {RULE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add New Rule
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 w-10">#</th>
                  <th className="px-4 py-3">Rule Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No rules match your filters.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((r, idx) => {
                    const { date, time } = formatDate(r.updatedAt);
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-4 text-muted-foreground">
                          {(safePage - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold">{r.title}</p>
                          <p className="mt-0.5 max-w-md text-xs text-muted-foreground">
                            {r.description}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            {r.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <RiskPill level={r.riskLevel} />
                        </td>
                        <td className="px-4 py-4">
                          <StatusPill status={r.status} />
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          <p>{date}</p>
                          <p className="text-xs">{time}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="rounded-md border border-primary/40 p-2 text-primary transition hover:bg-primary/10"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(r)}
                              className="rounded-md border border-destructive/40 p-2 text-destructive transition hover:bg-destructive/10"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
              <span>
                Showing {(safePage - 1) * PAGE_SIZE + (pageItems.length ? 1 : 0)} to{" "}
                {(safePage - 1) * PAGE_SIZE + pageItems.length} of{" "}
                {filtered.length} rules
              </span>
              <div className="flex items-center gap-1">
                <PageBtn
                  disabled={safePage === 1}
                  onClick={() => setPage(safePage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </PageBtn>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PageBtn
                    key={p}
                    active={p === safePage}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </PageBtn>
                ))}
                <PageBtn
                  disabled={safePage === totalPages}
                  onClick={() => setPage(safePage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </PageBtn>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Rule" : "Add New Rule"}</DialogTitle>
            <DialogDescription>
              Define a legal rule the ALIS AI engine will use during compliance
              analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Rule title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Client Confidentiality Rule"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe what this rule enforces..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Risk level</Label>
                <Select
                  value={form.riskLevel}
                  onValueChange={(v: RiskLevel) =>
                    setForm({ ...form, riskLevel: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: RuleStatus) =>
                    setForm({ ...form, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? "Save changes" : "Create rule"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this rule?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.title}" will be permanently removed from the AI
              analysis ruleset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const NavItem = ({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    )}
  >
    {icon}
    {label}
  </Link>
);

const RiskPill = ({ level }: { level: RiskLevel }) => {
  const map = {
    Low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    Medium: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    High: "bg-red-500/10 text-red-500 border-red-500/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2.5 py-1 text-xs font-medium",
        map[level],
      )}
    >
      {level}
    </span>
  );
};

const StatusPill = ({ status }: { status: RuleStatus }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        status === "Active" ? "bg-emerald-500" : "bg-muted-foreground",
      )}
    />
    {status}
  </span>
);

const PageBtn = ({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm transition",
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card hover:bg-muted",
      disabled && "opacity-40 cursor-not-allowed",
    )}
  >
    {children}
  </button>
);

export default LawRules;
