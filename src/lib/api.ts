// Cliente API para Orbit/Stocket.
// Conecta con un backend Cloudflare Worker + D1 cuando VITE_API_URL está definida,
// o utiliza un almacén local en memoria / localStorage cuando opera de forma autónoma.

import {
  getMockProducts,
  setMockProducts,
  getMockTransactions,
  setMockTransactions,
  getMockUsers,
  setMockUsers,
  getMockCurrentUser,
  setMockCurrentUser,
} from "./mockStore";

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
  sku?: string | null;           // código interno / barras
  category?: string | null;      // categoría de producto
  description: string | null;
  quantity: number;              // SOLO LECTURA en PUT /products/:id — cambia via transactions
  cost_price?: number;           // precio de adquisición / costo unitario
  price: number;                 // precio de venta unitario
  min_stock?: number;            // umbral personalizado para alertas de stock bajo
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
  notes?: string | null;         // motivo del movimiento (auditoría)
  stock_after?: number;          // stock del producto tras aplicar este movimiento
  created_by?: string;
  created_at: string;
};

export type DashboardMetrics = {
  total_products: number;
  total_value: number;           // Valor de venta total proyectado
  total_cost_value?: number;     // Valor a costo total
  potential_profit?: number;     // Utilidad bruta potencial
  avg_margin_pct?: number;       // Margen bruto promedio %
  recent_transactions: number;
  low_stock_products: number;
  out_of_stock_products?: number;
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

export class ApiError extends Error {
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

type AuthResponse = { access_token: string; token_type: string; user: Profile };

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  auth: {
    async register(input: { email: string; password: string; full_name: string; organization_name: string }) {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          const data = await handleResponse<AuthResponse>(res);
          setToken(data.access_token);
          return data.user;
        } catch (e) {
          if (e instanceof ApiError) throw e;
          // Fallback to mock on network error
        }
      }

      await delay(120);
      const user: Profile = {
        id: `u_${Date.now()}`,
        email: input.email,
        full_name: input.full_name,
        organization_id: `org_${Date.now()}`,
        organization_name: input.organization_name,
        org_role: "admin",
        is_super_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setMockCurrentUser(user);
      setToken("mock_session_token_" + Date.now());
      return user;
    },

    async login(email: string, password: string) {
      if (API_URL) {
        try {
          const params = new URLSearchParams({ email, password });
          const res = await fetch(`${API_URL}/auth/login?${params.toString()}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const data = await handleResponse<AuthResponse>(res);
          setToken(data.access_token);
          return data.user;
        } catch (e) {
          if (e instanceof ApiError) throw e;
          // Fallback to mock on network error
        }
      }

      await delay(120);
      const existing = getMockCurrentUser();
      const user: Profile = {
        ...existing,
        email: email || existing.email,
      };
      setMockCurrentUser(user);
      setToken("mock_session_token_" + Date.now());
      return user;
    },

    async me() {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
          return await handleResponse<Profile>(res);
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) throw e;
          // Fallback to mock on network error
        }
      }

      await delay(50);
      const token = getToken();
      if (!token) {
        throw new ApiError("No autenticado", 401);
      }
      return getMockCurrentUser();
    },

    async logout() {
      if (API_URL) {
        try {
          await fetch(`${API_URL}/auth/logout`, { method: "POST", headers: authHeaders() });
        } catch {
          // ignore
        }
      }
      clearToken();
      setMockCurrentUser(null);
    },
  },

  users: {
    async getAll() {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/auth/users`, { headers: authHeaders() });
          const data = await handleResponse<{ users: TeamUser[] }>(res);
          return data.users;
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(80);
      return getMockUsers();
    },

    async create(input: { email: string; password: string; full_name: string; org_role: "admin" | "staff" }) {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/auth/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(input),
          });
          return await handleResponse<TeamUser>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(120);
      const newUser: TeamUser = {
        id: `u_${Date.now()}`,
        full_name: input.full_name,
        email: input.email,
        org_role: input.org_role,
      };
      const users = getMockUsers();
      users.push(newUser);
      setMockUsers(users);
      return newUser;
    },
  },

  products: {
    async getAll(search?: string, category?: string) {
      if (API_URL) {
        try {
          const params = new URLSearchParams();
          if (search) params.append("search", search);
          if (category) params.append("category", category);
          const qs = params.toString() ? `?${params.toString()}` : "";
          const res = await fetch(`${API_URL}/products${qs}`, { headers: authHeaders() });
          return await handleResponse<Product[]>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(60);
      let list = getMockProducts();
      if (category && category !== "all") {
        list = list.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const query = search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.sku && p.sku.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query))
        );
      }
      return list;
    },

    async get(id: string) {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/products/${id}`, { headers: authHeaders() });
          return await handleResponse<Product>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(50);
      const prod = getMockProducts().find((p) => p.id === id);
      if (!prod) throw new ApiError("Producto no encontrado", 404);
      return prod;
    },

    async create(input: {
      name: string;
      description?: string;
      quantity: number;
      price: number;
      cost_price?: number;
      min_stock?: number;
      category?: string;
      sku?: string;
    }) {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(input),
          });
          return await handleResponse<Product>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(100);
      const newProd: Product = {
        id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: input.name,
        sku: input.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: input.category || null,
        description: input.description || null,
        quantity: input.quantity || 0,
        cost_price: input.cost_price !== undefined ? input.cost_price : Math.round((input.price || 0) * 0.65),
        price: input.price || 0,
        min_stock: input.min_stock !== undefined ? input.min_stock : 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const list = [newProd, ...getMockProducts()];
      setMockProducts(list);

      if (newProd.quantity > 0) {
        const tx: Transaction = {
          id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          product_id: newProd.id,
          product_name: newProd.name,
          quantity_change: newProd.quantity,
          type: "IN",
          notes: "Inventario inicial",
          stock_after: newProd.quantity,
          created_at: new Date().toISOString(),
        };
        setMockTransactions([tx, ...getMockTransactions()]);
      }

      return newProd;
    },

    async bulkCreate(items: Array<{
      name: string;
      description?: string;
      quantity: number;
      price: number;
      cost_price?: number;
      min_stock?: number;
      category?: string;
      sku?: string;
    }>) {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/products/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ items }),
          });
          return await handleResponse<{ imported: number }>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(200);
      const currentList = getMockProducts();
      const currentTxs = getMockTransactions();
      const newProducts: Product[] = [];
      const newTxs: Transaction[] = [];

      let seq = 0;
      for (const item of items) {
        seq++;
        const p: Product = {
          id: `prod_${Date.now()}_${seq}`,
          name: item.name,
          sku: item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          category: item.category || null,
          description: item.description || null,
          quantity: item.quantity || 0,
          cost_price: item.cost_price !== undefined ? item.cost_price : Math.round((item.price || 0) * 0.65),
          price: item.price || 0,
          min_stock: item.min_stock !== undefined ? item.min_stock : 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        newProducts.push(p);

        if (p.quantity > 0) {
          newTxs.push({
            id: `tx_${Date.now()}_${seq}`,
            product_id: p.id,
            product_name: p.name,
            quantity_change: p.quantity,
            type: "IN",
            notes: "Carga masiva inicial",
            stock_after: p.quantity,
            created_at: new Date().toISOString(),
          });
        }
      }

      setMockProducts([...newProducts, ...currentList]);
      setMockTransactions([...newTxs, ...currentTxs]);
      return { imported: newProducts.length };
    },

    async update(
      id: string,
      input: Partial<Pick<Product, "name" | "description" | "price" | "cost_price" | "min_stock" | "category" | "sku">>
    ) {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(input),
          });
          return await handleResponse<Product>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(100);
      const list = getMockProducts();
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) throw new ApiError("Producto no encontrado", 404);

      const updated: Product = {
        ...list[idx],
        ...input,
        updated_at: new Date().toISOString(),
      };
      list[idx] = updated;
      setMockProducts(list);
      return updated;
    },

    async remove(id: string) {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE", headers: authHeaders() });
          return await handleResponse<{ ok: true }>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(100);
      const list = getMockProducts().filter((p) => p.id !== id);
      setMockProducts(list);
      return { ok: true as const };
    },
  },

  transactions: {
    async create(input: {
      product_id: string;
      quantity_change: number;
      type: "IN" | "OUT";
      notes?: string;
    }) {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(input),
          });
          return await handleResponse<Transaction>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(100);
      const products = getMockProducts();
      const product = products.find((p) => p.id === input.product_id);
      if (!product) throw new ApiError("Producto no encontrado", 404);

      const delta = input.quantity_change * (input.type === "IN" ? 1 : -1);
      const newQty = product.quantity + delta;
      if (newQty < 0) {
        throw new ApiError("No hay suficiente stock para realizar esta salida.", 400);
      }

      product.quantity = newQty;
      product.updated_at = new Date().toISOString();
      setMockProducts(products);

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        quantity_change: input.type === "IN" ? input.quantity_change : -input.quantity_change,
        type: input.type,
        notes: input.notes || null,
        stock_after: newQty,
        created_at: new Date().toISOString(),
      };
      setMockTransactions([tx, ...getMockTransactions()]);
      return tx;
    },

    async getAll(productId?: string) {
      if (API_URL) {
        try {
          const qs = productId ? `?product_id=${encodeURIComponent(productId)}` : "";
          const res = await fetch(`${API_URL}/transactions${qs}`, { headers: authHeaders() });
          return await handleResponse<Transaction[]>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(80);
      const list = getMockTransactions();
      if (productId) {
        return list.filter((t) => t.product_id === productId);
      }
      return list;
    },
  },

  dashboard: {
    async metrics() {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/dashboard/metrics`, { headers: authHeaders() });
          return await handleResponse<DashboardMetrics>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(80);
      const prods = getMockProducts();
      const txs = getMockTransactions();
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      const recentCount = txs.filter((t) => new Date(t.created_at).getTime() >= cutoff).length;

      const totalSaleValue = prods.reduce((sum, p) => sum + p.price * p.quantity, 0);
      const totalCostValue = prods.reduce((sum, p) => sum + (p.cost_price ?? p.price * 0.65) * p.quantity, 0);
      const potentialProfit = Math.max(0, totalSaleValue - totalCostValue);
      const avgMarginPct = totalSaleValue > 0 ? Math.round((potentialProfit / totalSaleValue) * 100) : 0;

      const lowStockCount = prods.filter((p) => p.quantity > 0 && p.quantity <= (p.min_stock ?? 5)).length;
      const outStockCount = prods.filter((p) => p.quantity === 0).length;

      return {
        total_products: prods.length,
        total_value: totalSaleValue,
        total_cost_value: totalCostValue,
        potential_profit: potentialProfit,
        avg_margin_pct: avgMarginPct,
        recent_transactions: recentCount,
        low_stock_products: lowStockCount,
        out_of_stock_products: outStockCount,
      };
    },

    async topProducts() {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/dashboard/top-products`, { headers: authHeaders() });
          return await handleResponse<TopProduct[]>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(80);
      const prods = getMockProducts();
      const txs = getMockTransactions();
      const map = new Map<string, number>();

      for (const t of txs) {
        map.set(t.product_id, (map.get(t.product_id) || 0) + 1);
      }

      const list: TopProduct[] = prods.map((p) => ({
        id: p.id,
        name: p.name,
        transactions: map.get(p.id) || 0,
      }));

      return list.sort((a, b) => b.transactions - a.transactions);
    },

    async recentTransactions() {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/dashboard/recent-transactions`, { headers: authHeaders() });
          return await handleResponse<Transaction[]>(res);
        } catch (e) {
          if (e instanceof ApiError) throw e;
        }
      }

      await delay(80);
      return getMockTransactions();
    },
  },
};
