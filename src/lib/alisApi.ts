// ─────────────────────────────────────────────────────────────────────────────
// API ENGINE — All server communication lives here
// ─────────────────────────────────────────────────────────────────────────────
export const CONFIG = {
  API_BASE: "http://localhost:8081/api",
  MAX_FILE_MB: 10,
  SESSION_KEY: "alis_session_v1",
  TOAST_DURATION_MS: 4500,
};

export type Role = "Deal Maker" | "Legal Practitioner";

export interface SessionUser {
  id?: string | number;
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

async function _req<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const isForm = options.body instanceof FormData;
    const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
      ...options,
      headers: isForm
        ? {}
        : { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: { message: `Network error: ${err.message}` } as any,
    };
  }
}

export const alisApi = {
  // AUTH
  register: (name: string, surname: string, email: string, role: Role, password: string) =>
    _req("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, surname, email, role, password }),
    }),

  login: async (email: string, password: string) => {
    const res = await _req<SessionUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(res.data));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem(CONFIG.SESSION_KEY);
  },

  getCurrentUser: (): SessionUser | null => {
    const data = localStorage.getItem(CONFIG.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  // DEAL MAKER FEATURES
  createDeal: (deal: Record<string, unknown>) =>
    _req("/deals", { method: "POST", body: JSON.stringify(deal) }),
  getMyDeals: () => _req("/deals/my"),

  // LEGAL PRACTITIONER FEATURES
  getAssignedDeals: () => _req("/deals/assigned"),
  reviewDeal: (dealId: string | number, action: "APPROVE" | "REJECT" | "REQUEST_CHANGES") =>
    _req(`/deals/${dealId}/review`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  // OPTIONAL
  getDocuments: (clientId: string | number) => _req(`/documents/client/${clientId}`),
  uploadDocument: (file: File, clientId: string | number) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("clientId", String(clientId));
    return _req("/documents/upload", { method: "POST", body: fd });
  },
  deleteDocument: (id: string | number) => _req(`/documents/${id}`, { method: "DELETE" }),
  getReports: (clientId: string | number) => _req(`/reports/client/${clientId}`),
  getPdfUrl: (reportId: string | number) =>
    `${CONFIG.API_BASE}/reports/${reportId}/download-pdf`,
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
