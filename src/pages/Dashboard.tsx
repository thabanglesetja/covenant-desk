import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { alisApi } from "@/lib/alisApi";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, FileText, ShieldCheck, Plus, Briefcase, Gavel } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = alisApi.getCurrentUser();

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const isDealMaker = user.role === "Deal Maker";

  const onLogout = () => {
    alisApi.logout();
    toast.success("Logged out");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {user.name} {user.surname}{" "}
                <span className="text-muted-foreground">({user.role})</span>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              {isDealMaker ? <Briefcase className="mr-1 h-3 w-3" /> : <Gavel className="mr-1 h-3 w-3" />}
              {user.role} workspace
            </Badge>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-muted-foreground">
              {isDealMaker
                ? "Create and manage your deals. Assign legal experts to review."
                : "Review deals assigned to you and provide legal guidance."}
            </p>
          </div>
          {isDealMaker && (
            <Button variant="hero" size="lg">
              <Plus className="h-4 w-4" /> New Deal
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                {isDealMaker ? "My Deals" : "Assigned Deals"}
              </CardTitle>
              <CardDescription>
                {isDealMaker ? "Deals you have created" : "Deals awaiting your review"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {isDealMaker ? "Approved" : "Reviewed"}
              </CardTitle>
              <CardDescription>Completed actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-primary" />
                Pending
              </CardTitle>
              <CardDescription>Awaiting action</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{isDealMaker ? "Your deals" : "Deals to review"}</CardTitle>
            <CardDescription>
              Connect to the API at <code className="rounded bg-muted px-1.5 py-0.5 text-xs">http://localhost:8081/api</code> to start managing data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
              No deals yet.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
