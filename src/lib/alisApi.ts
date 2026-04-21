// ─────────────────────────────────────────────────────────────────────────────
// ALIS API ENGINE — Remote backend integration
// ─────────────────────────────────────────────────────────────────────────────
export const CONFIG = {
  API_BASE: "https://alis-backend.example.com/api",
  MAX_FILE_MB: 10,
  SESSION_KEY: "alis_session_v1",
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

interface ApiResult<T = any> {
  ok: boolean;
  status: number;
  data: T & { message?: string };
}

// ── helpers ──────────────────────────────────────────────────────────────────
const getToken = (): string | null => {
  const u = session.load();
  return u?.token ?? null;
};

const request = async <T = any>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> => {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${CONFIG.API_BASE}${path}`, { ...options, headers });
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : { message: await res.text() };
    return { ok: res.ok, status: res.status, data: data as any };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: { message: err?.message || "Network error" } as any,
    };
  }
};

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
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, surname, email, role, password }),
    });
  },

  login: async (email: string, password: string): Promise<ApiResult<SessionUser>> => {
    const res = await request<SessionUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok && res.data) {
      session.save(res.data as SessionUser);
      localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(res.data));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem(CONFIG.SESSION_KEY);
    session.clear();
  },

  getCurrentUser: (): SessionUser | null => {
    const data = localStorage.getItem(CONFIG.SESSION_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return session.load();
  },

  // DEAL MAKER FEATURES
  createDeal: async (deal: Record<string, unknown>): Promise<ApiResult> => {
    return request("/deals", {
      method: "POST",
      body: JSON.stringify(deal),
    });
  },
  getMyDeals: async (): Promise<ApiResult> => {
    return request("/deals/mine", { method: "GET" });
  },

  // LEGAL PRACTITIONER FEATURES
  getAssignedDeals: async (): Promise<ApiResult> => {
    return request("/deals/assigned", { method: "GET" });
  },
  reviewDeal: async (
    dealId: string,
    action: "APPROVE" | "REJECT" | "REQUEST_CHANGES",
  ): Promise<ApiResult> => {
    return request(`/deals/${dealId}/review`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SESSION PERSISTENCE
// ─────────────────────────────────────────────────────────────────────────────
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
