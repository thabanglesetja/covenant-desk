import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
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
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <section className="flex w-full max-w-xl flex-col rounded-3xl bg-card px-6 py-10 shadow-card sm:px-12 lg:py-14">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

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

        <p className="mt-10 text-xs text-muted-foreground text-center">
          By continuing, you agree to our{" "}
          <a className="font-medium text-foreground hover:text-primary" href="#">Terms of Service</a> and{" "}
          <a className="font-medium text-foreground hover:text-primary" href="#">Privacy Policy</a>.
        </p>
      </section>
    </main>
  );
};

export default Index;
