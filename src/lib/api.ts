// Cliente API para Orbit/Stocket. Habla con un backend Cloudflare Worker + D1
// multi-tenant (organization_id / org_role / is_super_admin) — ver stocket-be.
//
// La URL base se inyecta en tiempo de compilación (Vite) vía VITE_API_URL,
// igual que en inventory-fe.

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  organization_id: string | null;
  organization_name: string | null;
  org_role: "admin" | "staff" | null;
  is_super_admin: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  product_id: string;
  product_name?: string;
  quantity_change: number;
  type: "IN" | "OUT";
  created_by?: string;
  created_at: string;
};

export type DashboardMetrics = {
  total_products: number;
  total_value: number;
  recent_transactions: number;
  low_stock_products: number;
};

export type TopProduct = { id: string; name: string; transactions: number };

export type TeamUser = {
  id: string;
  full_name: string;
  email: string;
  org_role: "admin" | "staff";
};

const TOKEN_KEY = "orbit_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Error ${res.status}`;
    throw new ApiError(message, res.status);
  }
  return data as T;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function requireApiUrl() {
  if (!API_URL) {
    throw new ApiError(
      "VITE_API_URL no está configurada — el build no sabe a qué backend conectarse.",
      0
    );
  }
}

type AuthResponse = { access_token: string; token_type: string; user: Profile };

export const api = {
  auth: {
    async register(input: { email: string; password: string; full_name: string; organization_name: string }) {
      requireApiUrl();
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await handleResponse<AuthResponse>(res);
      setToken(data.access_token);
      return data.user;
    },
    async login(email: string, password: string) {
      requireApiUrl();
      const params = new URLSearchParams({ email, password });
      const res = await fetch(`${API_URL}/auth/login?${params.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await handleResponse<AuthResponse>(res);
      setToken(data.access_token);
      return data.user;
    },
    async me() {
      requireApiUrl();
      const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
      return handleResponse<Profile>(res);
    },
    async logout() {
      requireApiUrl();
      try {
        await fetch(`${API_URL}/auth/logout`, { method: "POST", headers: authHeaders() });
      } finally {
        clearToken();
      }
    },
  },

  users: {
    async getAll() {
      requireApiUrl();
      const res = await fetch(`${API_URL}/auth/users`, { headers: authHeaders() });
      const data = await handleResponse<{ users: TeamUser[] }>(res);
      return data.users;
    },
    async create(input: { email: string; password: string; full_name: string; org_role: "admin" | "staff" }) {
      requireApiUrl();
      const res = await fetch(`${API_URL}/auth/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
      });
      return handleResponse<TeamUser>(res);
    },
  },

  products: {
    async getAll(search?: string) {
      requireApiUrl();
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${API_URL}/products${qs}`, { headers: authHeaders() });
      return handleResponse<Product[]>(res);
    },
    async get(id: string) {
      requireApiUrl();
      const res = await fetch(`${API_URL}/products/${id}`, { headers: authHeaders() });
      return handleResponse<Product>(res);
    },
    async create(input: { name: string; description?: string; quantity: number; price: number }) {
      requireApiUrl();
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
      });
      return handleResponse<Product>(res);
    },
    async update(id: string, input: Partial<Pick<Product, "name" | "description" | "price" | "quantity">>) {
      requireApiUrl();
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
      });
      return handleResponse<Product>(res);
    },
    async remove(id: string) {
      requireApiUrl();
      const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE", headers: authHeaders() });
      return handleResponse<{ ok: true }>(res);
    },
  },

  transactions: {
    async create(input: { product_id: string; quantity_change: number; type: "IN" | "OUT" }) {
      requireApiUrl();
      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
      });
      return handleResponse<Transaction>(res);
    },
    async getAll(productId?: string) {
      requireApiUrl();
      const qs = productId ? `?product_id=${encodeURIComponent(productId)}` : "";
      const res = await fetch(`${API_URL}/transactions${qs}`, { headers: authHeaders() });
      return handleResponse<Transaction[]>(res);
    },
  },

  dashboard: {
    async metrics() {
      requireApiUrl();
      const res = await fetch(`${API_URL}/dashboard/metrics`, { headers: authHeaders() });
      return handleResponse<DashboardMetrics>(res);
    },
    async topProducts() {
      requireApiUrl();
      const res = await fetch(`${API_URL}/dashboard/top-products`, { headers: authHeaders() });
      return handleResponse<TopProduct[]>(res);
    },
    async recentTransactions() {
      requireApiUrl();
      const res = await fetch(`${API_URL}/dashboard/recent-transactions`, { headers: authHeaders() });
      return handleResponse<Transaction[]>(res);
    },
  },
};

export { ApiError };
