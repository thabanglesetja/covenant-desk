// Law Rules — local CRUD store (frontend-only persistence)
// The ALIS backend does not yet expose law-rule endpoints, so we persist
// in localStorage so Legal Practitioners can manage rules end-to-end.

export type RiskLevel = "Low" | "Medium" | "High";
export type RuleStatus = "Active" | "Inactive";

export interface LawRule {
  id: string;
  title: string;
  description: string;
  category: string;
  riskLevel: RiskLevel;
  status: RuleStatus;
  updatedAt: string; // ISO
}

const KEY = "alis_law_rules_v1";

export const RULE_CATEGORIES = [
  "Ethics",
  "Professional Conduct",
  "Procedural",
  "Compliance",
  "Data Protection",
  "Litigation",
  "Contract",
] as const;

const seed = (): LawRule[] => [
  {
    id: crypto.randomUUID(),
    title: "Client Confidentiality Rule",
    description:
      "Ensure all client information is kept confidential and not disclosed.",
    category: "Ethics",
    riskLevel: "High",
    status: "Active",
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Conflict of Interest Rule",
    description:
      "Avoid representing clients with conflicting interests in the same matter.",
    category: "Professional Conduct",
    riskLevel: "Medium",
    status: "Active",
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Court Filing Deadline Rule",
    description:
      "All legal documents must be filed within the prescribed deadline.",
    category: "Procedural",
    riskLevel: "Medium",
    status: "Active",
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Anti-Bribery and Corruption Rule",
    description:
      "Prohibit giving or receiving anything of value to influence official actions.",
    category: "Compliance",
    riskLevel: "High",
    status: "Active",
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Data Protection and Privacy Rule",
    description:
      "Ensure personal data is collected, stored, and processed in compliance with data laws.",
    category: "Data Protection",
    riskLevel: "Low",
    status: "Active",
    updatedAt: new Date().toISOString(),
  },
];

export const lawRulesStore = {
  list(): LawRule[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        const s = seed();
        localStorage.setItem(KEY, JSON.stringify(s));
        return s;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  save(rules: LawRule[]) {
    localStorage.setItem(KEY, JSON.stringify(rules));
  },
  create(input: Omit<LawRule, "id" | "updatedAt">): LawRule {
    const rules = this.list();
    const r: LawRule = {
      ...input,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    rules.unshift(r);
    this.save(rules);
    return r;
  },
  update(id: string, input: Partial<Omit<LawRule, "id">>): LawRule | null {
    const rules = this.list();
    const i = rules.findIndex((r) => r.id === id);
    if (i === -1) return null;
    rules[i] = { ...rules[i], ...input, updatedAt: new Date().toISOString() };
    this.save(rules);
    return rules[i];
  },
  remove(id: string) {
    this.save(this.list().filter((r) => r.id !== id));
  },
};
