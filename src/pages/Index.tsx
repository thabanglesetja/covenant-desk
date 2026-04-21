import { useState } from "react";
import { Navigate } from "react-router-dom";
import heroImg from "@/assets/deal-hero.jpg";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { alisApi } from "@/lib/alisApi";

type Mode = "login" | "register";

const Index = () => {
  const [mode, setMode] = useState<Mode>("login");

  if (alisApi.getCurrentUser()) {
    return <Navigate to="/dashboard" replace />;
  }

  const ToggleCard = ({
    active,
    onClick,
    icon: Icon,
    title,
    subtitle,
  }: {
    active: boolean;
    onClick: () => void;
    icon: typeof LogIn;
    title: string;
    subtitle: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-5 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant",
        active
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
          active ? "bg-gradient-hero text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );

  return (
    <main className="min-h-screen bg-background lg:p-6">
      <div className="mx-auto grid min-h-screen max-w-7xl overflow-hidden rounded-none bg-background lg:min-h-[calc(100vh-3rem)] lg:grid-cols-2 lg:rounded-3xl lg:shadow-card">
        {/* LEFT — auth */}
        <section className="flex flex-col px-6 py-10 sm:px-12 lg:px-16 lg:py-14">
          <Logo />

          <div className="mx-auto mt-12 w-full max-w-md flex-1">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Get Started
            </h1>
            <p className="mt-3 text-muted-foreground">
              Access your account as a Deal Maker or Legal Practitioner
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <ToggleCard
                active={mode === "login"}
                onClick={() => setMode("login")}
                icon={LogIn}
                title="Log In"
                subtitle="Welcome back"
              />
              <ToggleCard
                active={mode === "register"}
                onClick={() => setMode("register")}
                icon={UserPlus}
                title="Register"
                subtitle="Create new account"
              />
            </div>

            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {mode === "login" ? "Sign in to continue" : "Create your account"}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {mode === "login" ? (
              <LoginForm />
            ) : (
              <RegisterForm onRegistered={() => setMode("login")} />
            )}
          </div>

          <p className="mt-10 text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a className="font-medium text-foreground hover:text-primary" href="#">Terms of Service</a> and{" "}
            <a className="font-medium text-foreground hover:text-primary" href="#">Privacy Policy</a>.
          </p>
        </section>

        {/* RIGHT — hero */}
        <aside className="relative hidden overflow-hidden bg-gradient-card p-10 lg:flex lg:flex-col lg:justify-end">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(hsl(var(--primary)/0.4)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.4)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="absolute left-1/2 top-12 -translate-x-1/2 rounded-3xl bg-background/5 p-4 shadow-elegant ring-1 ring-primary-foreground/10 backdrop-blur">
            <img
              src={heroImg}
              alt="Deal Maker and Legal Practitioner collaborating on a contract"
              width={384}
              height={448}
              className="h-[420px] w-[360px] rounded-2xl object-cover"
            />
          </div>
          <div className="relative max-w-md text-primary-foreground">
            <h2 className="font-display text-3xl font-bold leading-tight">
              Connect Deal Makers with Legal Experts
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/70">
              Collaborate and manage deals securely with role-based access. Create, assign, and review with confidence — all in one workspace.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary-foreground/40" />
              <span className="h-2 w-6 rounded-full bg-primary-foreground" />
              <span className="h-2 w-2 rounded-full bg-primary-foreground/40" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Index;
