// ─────────────────────────────────────────────────────────────────────────────
// LOCAL MOCK API ENGINE — Stores users & deals in localStorage
// ─────────────────────────────────────────────────────────────────────────────
export const CONFIG = {
  MAX_FILE_MB: 10,
  SESSION_KEY: "alis_session_v1",
  USERS_KEY: "alis_users_v1",
  DEALS_KEY: "alis_deals_v1",
  TOAST_DURATION_MS: 4500,
};

export type Role = "Deal Maker" | "Legal Practitioner";

export interface SessionUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: Role;
  token?: string;
  [key: string]: unknown;
}

interface StoredUser extends SessionUser {
  password: string;
}

interface ApiResult<T = any> {
  ok: boolean;
  status: number;
  data: T & { message?: string };
}

// ── helpers ──────────────────────────────────────────────────────────────────
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

const readUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.USERS_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeUsers = (users: StoredUser[]) =>
  localStorage.setItem(CONFIG.USERS_KEY, JSON.stringify(users));

const readDeals = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.DEALS_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeDeals = (deals: any[]) =>
  localStorage.setItem(CONFIG.DEALS_KEY, JSON.stringify(deals));

const ok = <T,>(data: T, status = 200): ApiResult<T> => ({ ok: true, status, data: data as any });
const fail = (message: string, status = 400): ApiResult<any> => ({
  ok: false,
  status,
  data: { message },
});

// ─────────────────────────────────────────────────────────────────────────────
export const alisApi = {
  // AUTH
  register: async (
    name: string,
    surname: string,
    email: string,
    role: Role,
    password: string,
  ): Promise<ApiResult> => {
    await delay();
    const users = readUsers();
    const normalized = email.trim().toLowerCase();
    if (users.find((u) => u.email.toLowerCase() === normalized)) {
      return fail("An account with that email already exists", 409);
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      surname: surname.trim(),
      email: normalized,
      role,
      password,
    };
    users.push(newUser);
    writeUsers(users);
    return ok({ message: "Registered successfully", id: newUser.id }, 201);
  },

  login: async (email: string, password: string): Promise<ApiResult<SessionUser>> => {
    await delay();
    const users = readUsers();
    const normalized = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === normalized);
    if (!found) return fail("No account found with that email", 404);
    if (found.password !== password) return fail("Incorrect password", 401);
    const { password: _pw, ...session } = found;
    const sessionUser: SessionUser = { ...session, token: crypto.randomUUID() };
    localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(sessionUser));
    return ok(sessionUser);
  },

  logout: () => {
    localStorage.removeItem(CONFIG.SESSION_KEY);
  },

  getCurrentUser: (): SessionUser | null => {
    const data = localStorage.getItem(CONFIG.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  // DEAL MAKER FEATURES
  createDeal: async (deal: Record<string, unknown>): Promise<ApiResult> => {
    await delay();
    const user = alisApi.getCurrentUser();
    if (!user) return fail("Not authenticated", 401);
    const deals = readDeals();
    const newDeal = {
      id: crypto.randomUUID(),
      ownerId: user.id,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      ...deal,
    };
    deals.push(newDeal);
    writeDeals(deals);
    return ok(newDeal, 201);
  },
  getMyDeals: async (): Promise<ApiResult> => {
    await delay(150);
    const user = alisApi.getCurrentUser();
    if (!user) return fail("Not authenticated", 401);
    return ok(readDeals().filter((d) => d.ownerId === user.id));
  },

  // LEGAL PRACTITIONER FEATURES
  getAssignedDeals: async (): Promise<ApiResult> => {
    await delay(150);
    return ok(readDeals().filter((d) => d.status === "PENDING"));
  },
  reviewDeal: async (
    dealId: string,
    action: "APPROVE" | "REJECT" | "REQUEST_CHANGES",
  ): Promise<ApiResult> => {
    await delay();
    const deals = readDeals();
    const idx = deals.findIndex((d) => d.id === dealId);
    if (idx === -1) return fail("Deal not found", 404);
    deals[idx].status = action;
    writeDeals(deals);
    return ok(deals[idx]);
  },
};

// SESSION PERSISTENCE (sessionStorage shadow)
export const session = {
  save: (u: SessionUser) => {
    try {
      sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(u));
    } catch {}
  },
  load: (): SessionUser | null => {
    try {
      const v = sessionStorage.getItem(CONFIG.SESSION_KEY);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(CONFIG.SESSION_KEY);
    } catch {}
  },
};
