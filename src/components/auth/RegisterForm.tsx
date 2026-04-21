import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { alisApi, type Role } from "@/lib/alisApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  surname: z.string().trim().min(1, "Surname is required").max(60),
  email: z.string().trim().email("Invalid email").max(255),
  role: z.enum(["Deal Maker", "Legal Practitioner"]),
  password: z.string().min(6, "Min 6 characters").max(100),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  path: ["confirm"],
  message: "Passwords do not match",
});

export const RegisterForm = ({ onRegistered }: { onRegistered: () => void }) => {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    role: "" as Role | "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (v: string) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { name, surname, email, role, password } = parsed.data;
    const res = await alisApi.register(name, surname, email, role, password);
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-name">Name</Label>
          <Input id="reg-name" value={form.name} onChange={(e) => update("name")(e.target.value)} placeholder="Thabang" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-surname">Surname</Label>
          <Input id="reg-surname" value={form.surname} onChange={(e) => update("surname")(e.target.value)} placeholder="Mokoena" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" value={form.email} onChange={(e) => update("email")(e.target.value)} placeholder="you@company.com" />
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <Input id="reg-password" type="password" value={form.password} onChange={(e) => update("password")(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-confirm">Confirm</Label>
          <Input id="reg-confirm" type="password" value={form.confirm} onChange={(e) => update("confirm")(e.target.value)} placeholder="••••••••" />
        </div>
      </div>
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
};
