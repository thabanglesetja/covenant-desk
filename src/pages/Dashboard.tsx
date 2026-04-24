import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  alisApi,
  apiToUiRole,
  type DocumentResponseDTO,
  type ReportInfoDTO,
} from "@/lib/alisApi";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LogOut,
  FileText,
  ShieldCheck,
  Upload,
  Briefcase,
  Gavel,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = alisApi.getCurrentUser();
  const fileInput = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentResponseDTO[]>([]);
  const [reports, setReports] = useState<ReportInfoDTO[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;
    setLoadingData(true);
    const [docs, reps] = await Promise.all([
      alisApi.getDocumentsByClient(user.clientId),
      alisApi.getReportsByClient(user.clientId),
    ]);
    if (docs.ok && Array.isArray(docs.data)) setDocuments(docs.data);
    if (reps.ok && Array.isArray(reps.data)) setReports(reps.data);
    setLoadingData(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const uiRole = apiToUiRole(user.role);
  const isDealMaker = user.role === "DEAL_MAKER";
  const isLegalPractitioner = user.role === "LEGAL_PRACTITIONER";

  const onLogout = () => {
    alisApi.logout();
    toast.success("Logged out");
    navigate("/", { replace: true });
  };

  const onUploadClick = () => fileInput.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    setUploading(true);
    const res = await alisApi.uploadDocument(user.clientId, f);
    setUploading(false);
    e.target.value = "";
    if (res.ok) {
      toast.success(
        isLegalPractitioner
          ? "PDF uploaded — AI compliance analysis started"
          : "PDF uploaded successfully",
      );
      loadData();
    } else {
      toast.error(res.data?.message || "Upload failed");
    }
  };

  const riskTone = (level: ReportInfoDTO["riskLevel"]) => {
    if (level === "HIGH") return "destructive" as const;
    if (level === "MEDIUM") return "default" as const;
    return "secondary" as const;
  };

  const completedReports = reports.filter((r) => r.analysisStatus === "COMPLETED").length;
  const pendingReports = reports.filter((r) => r.analysisStatus === "PENDING").length;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {user.fullName}{" "}
                <span className="text-muted-foreground">({uiRole})</span>
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {isDealMaker ? (
                <Briefcase className="mr-1 h-3 w-3" />
              ) : (
                <Gavel className="mr-1 h-3 w-3" />
              )}
              {uiRole} workspace
            </Badge>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Welcome, {user.fullName.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground">
              {isLegalPractitioner
                ? "Upload PDFs for automated compliance analysis powered by ALIS AI."
                : "Upload deal documents and track their compliance status."}
            </p>
          </div>
          <div>
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf"
              hidden
              onChange={onFileChange}
            />
            <Button
              variant="hero"
              size="lg"
              onClick={onUploadClick}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Documents
              </CardTitle>
              <CardDescription>Total uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{documents.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Analyses complete
              </CardTitle>
              <CardDescription>AI compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completedReports}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-primary" />
                Pending
              </CardTitle>
              <CardDescription>Awaiting AI processing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingReports}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your documents</CardTitle>
              <CardDescription>
                PDFs you have uploaded to ALIS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
                  No documents yet — upload your first PDF.
                </div>
              ) : (
                <ul className="space-y-3">
                  {documents.map((d) => (
                    <li
                      key={d.documentId}
                      className="flex items-center justify-between rounded-lg border bg-card p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{d.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(d.uploadedAt).toLocaleString()} · {d.status}
                        </p>
                      </div>
                      {d.fileUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={d.fileUrl} target="_blank" rel="noreferrer">
                            View
                          </a>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance reports</CardTitle>
              <CardDescription>
                AI risk analysis generated by the ALIS engine.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : reports.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
                  No reports yet.
                </div>
              ) : (
                <ul className="space-y-3">
                  {reports.map((r) => (
                    <li
                      key={r.reportId}
                      className="rounded-lg border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {r.documentTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.analysisStatus} ·{" "}
                            {new Date(r.generatedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={riskTone(r.riskLevel)}>
                          {r.riskLevel}
                        </Badge>
                      </div>
                      {r.aiRecommendation && (
                        <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                          {r.aiRecommendation}
                        </p>
                      )}
                      <div className="mt-3">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={alisApi.downloadReportPdf(r.reportId)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="h-3 w-3" /> PDF
                          </a>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
