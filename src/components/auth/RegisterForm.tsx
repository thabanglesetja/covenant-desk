import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { alisApi, type UiRole } from "@/lib/alisApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const baseSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  role: z.enum(["Deal Maker", "Legal Practitioner"]),
  password: z.string().min(6, "Min 6 characters").max(100),
  confirm: z.string(),
  // role-specific
  companyName: z.string().trim().max(120).optional(),
  dealSpecialty: z.string().trim().max(120).optional(),
  barNumber: z.string().trim().max(60).optional(),
  lawFirm: z.string().trim().max(120).optional(),
}).refine((d) => d.password === d.confirm, {
  path: ["confirm"],
  message: "Passwords do not match",
}).refine(
  (d) => d.role !== "Deal Maker" || (!!d.companyName && !!d.dealSpecialty),
  { path: ["companyName"], message: "Company name and deal specialty are required" },
).refine(
  (d) => d.role !== "Legal Practitioner" || (!!d.barNumber && !!d.lawFirm),
  { path: ["barNumber"], message: "Bar number and law firm are required" },
);

export const RegisterForm = ({ onRegistered }: { onRegistered: () => void }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "" as UiRole | "",
    password: "",
    confirm: "",
    companyName: "",
    dealSpecialty: "",
    barNumber: "",
    lawFirm: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = baseSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const d = parsed.data;
    const res =
      d.role === "Deal Maker"
        ? await alisApi.registerDealMaker({
            fullName: d.fullName,
            email: d.email,
            password: d.password,
            companyName: d.companyName!,
            dealSpecialty: d.dealSpecialty!,
          })
        : await alisApi.registerLegalPractitioner({
            fullName: d.fullName,
            email: d.email,
            password: d.password,
            barNumber: d.barNumber!,
            lawFirm: d.lawFirm!,
          });
    setLoading(false);
    if (res.ok) {
      toast.success("Account created! Please log in.");
      onRegistered();
    } else {
      toast.error(res.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-fullname">Full name</Label>
        <Input
          id="reg-fullname"
          value={form.fullName}
          onChange={(e) => update("fullName")(e.target.value)}
          placeholder="Thabang Mokoena"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          value={form.email}
          onChange={(e) => update("email")(e.target.value)}
          placeholder="you@company.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-role">Role</Label>
        <Select value={form.role} onValueChange={(v) => update("role")(v)}>
          <SelectTrigger id="reg-role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Deal Maker">Deal Maker</SelectItem>
            <SelectItem value="Legal Practitioner">Legal Practitioner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.role === "Deal Maker" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="reg-company">Company name</Label>
            <Input
              id="reg-company"
              value={form.companyName}
              onChange={(e) => update("companyName")(e.target.value)}
              placeholder="Acme Capital"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-specialty">Deal specialty</Label>
            <Input
              id="reg-specialty"
              value={form.dealSpecialty}
              onChange={(e) => update("dealSpecialty")(e.target.value)}
              placeholder="M&A, Private Equity..."
            />
          </div>
        </div>
      )}

      {form.role === "Legal Practitioner" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="reg-bar">Bar number</Label>
            <Input
              id="reg-bar"
              value={form.barNumber}
              onChange={(e) => update("barNumber")(e.target.value)}
              placeholder="ZA-12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-firm">Law firm</Label>
            <Input
              id="reg-firm"
              value={form.lawFirm}
              onChange={(e) => update("lawFirm")(e.target.value)}
              placeholder="Smith & Partners"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <Input
            id="reg-password"
            type="password"
            value={form.password}
            onChange={(e) => update("password")(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-confirm">Confirm</Label>
          <Input
            id="reg-confirm"
            type="password"
            value={form.confirm}
            onChange={(e) => update("confirm")(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
};
