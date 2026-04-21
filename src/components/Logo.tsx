import { Scale } from "lucide-react";

export const Logo = ({ light = false }: { light?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero shadow-elegant">
      <Scale className="h-5 w-5 text-primary-foreground" />
    </div>
    <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-primary-foreground" : "text-foreground"}`}>
      Deal<span className="text-primary">Hub</span>
    </span>
  </div>
);
