// ─────────────────────────────────────────────────────────────────────────────
// ALIS Legal Compliance API — client
// Matches OpenAPI spec: ALIS Legal Compliance API v1.0.0
// ─────────────────────────────────────────────────────────────────────────────
export const CONFIG = {
  API_BASE: "http://localhost:8081",
  SESSION_KEY: "alis_session_v1",
  TOAST_DURATION_MS: 4500,
};

// ── API enums / types ────────────────────────────────────────────────────────
export type ApiRole =
  | "ADMIN"
  | "ATTORNEY"
  | "PARALEGAL"
  | "USER"
  | "LEGAL_PRACTITIONER"
  | "DEAL_MAKER";

export type UiRole = "Deal Maker" | "Legal Practitioner";

export const uiToApiRole = (r: UiRole): ApiRole =>
  r === "Deal Maker" ? "DEAL_MAKER" : "LEGAL_PRACTITIONER";

export const apiToUiRole = (r: string): UiRole =>
  r === "DEAL_MAKER" ? "Deal Maker" : "Legal Practitioner";

export interface AuthResponse {
  message?: string;
  clientId?: number;
  email?: string;
  fullName?: string;
  role?: string;
  success?: boolean;
}

export interface SessionUser {
  clientId: number;
  fullName: string;
  email: string;
  role: ApiRole;
  token?: string;
}

export interface DealMakerRequest {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  dealSpecialty: string;
}

export interface LegalPractitionerRequest {
  fullName: string;
  email: string;
  password: string;
  barNumber: string;
  lawFirm: string;
}

export interface DocumentResponseDTO {
  documentId: number;
  title: string;
  status: string;
  ingestionSource: string;
  uploadedAt: string;
  filePath: string;
  fileUrl: string;
  clientId: number;
}

export interface ReportInfoDTO {
  reportId: number;
  documentId: number;
  documentTitle: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  analysisStatus: "PENDING" | "COMPLETED" | "FAILED";
  aiRecommendation: string;
  generatedAt: string;
  modelVersion: string;
}

export interface ApiResult<T = any> {
  ok: boolean;
  status: number;
  data: (T & { message?: string }) | any;
}

// ── helpers ──────────────────────────────────────────────────────────────────
const getToken = (): string | null => session.load()?.token ?? null;

const request = async <T = any>(
  path: string,
  options: RequestInit = {},
  isJson = true,
): Promise<ApiResult<T>> => {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(options.headers as Record<string, string> | undefined),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${CONFIG.API_BASE}${path}`, { ...options, headers });
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : { message: await res.text() };
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: { message: err?.message || "Network error" },
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const alisApi = {
  // ── AUTH ───────────────────────────────────────────────────────────────────
  registerBasic: (fullName: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    }),

  registerDealMaker: (body: DealMakerRequest) =>
    request("/api/dealmakers", { method: "POST", body: JSON.stringify(body) }),

  registerLegalPractitioner: (body: LegalPractitionerRequest) =>
    request("/api/legal-practitioners", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: async (
    emailOrUsername: string,
    password: string,
  ): Promise<ApiResult<AuthResponse>> => {
    const res = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: emailOrUsername,
        username: emailOrUsername,
        password,
      }),
    });
    if (res.ok && res.data?.success !== false && res.data?.clientId) {
      const u: SessionUser = {
        clientId: res.data.clientId,
        fullName: res.data.fullName ?? "",
        email: res.data.email ?? emailOrUsername,
        role: (res.data.role as ApiRole) ?? "USER",
      };
      session.save(u);
      localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(u));
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

  // ── DOCUMENTS ──────────────────────────────────────────────────────────────
  uploadDocument: async (clientId: number, file: File): Promise<ApiResult> => {
    const fd = new FormData();
    fd.append("file", file);
    return request(
      `/api/documents/upload?clientId=${clientId}`,
      { method: "POST", body: fd },
      false,
    );
  },

  getDocumentsByClient: (clientId: number) =>
    request<DocumentResponseDTO[]>(`/api/documents/client/${clientId}`),

  getAllDocuments: () => request<DocumentResponseDTO[]>("/api/documents/all"),

  getDocumentById: (id: number) =>
    request<DocumentResponseDTO>(`/api/documents/${id}`),

  deleteDocument: (id: number) =>
    request(`/api/documents/${id}`, { method: "DELETE" }),

  // ── REPORTS (AI compliance results) ────────────────────────────────────────
  getReportsByClient: (clientId: number) =>
    request<ReportInfoDTO[]>(`/api/reports/client/${clientId}`),

  getReportsByDocument: (documentId: number) =>
    request<ReportInfoDTO[]>(`/api/reports/document/${documentId}`),

  getReportById: (reportId: number) =>
    request<ReportInfoDTO>(`/api/reports/${reportId}`),

  downloadReportPdf: (reportId: number) =>
    `${CONFIG.API_BASE}/api/reports/${reportId}/download-pdf`,

  // ── PROFILES ───────────────────────────────────────────────────────────────
  getDealMakers: () => request("/api/dealmakers"),
  getLegalPractitioners: () => request("/api/legal-practitioners"),

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  getAdminDashboard: () => request("/api/admin/dashboard"),
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
