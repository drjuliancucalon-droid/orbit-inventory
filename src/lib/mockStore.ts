import type { Profile, Product, Transaction, TeamUser } from "./api";

const STORAGE_KEYS = {
  PRODUCTS: "orbit_mock_products_v2",
  TRANSACTIONS: "orbit_mock_transactions_v2",
  USERS: "orbit_mock_users_v2",
  CURRENT_USER: "orbit_mock_current_user_v2",
};

const INITIAL_USER: Profile = {
  id: "u_demo_1",
  email: "dr.juliancucalon@gmail.com",
  full_name: "Dr. Julián Cucalón",
  organization_id: "org_tornillo",
  organization_name: "Ferretería El Tornillo",
  org_role: "admin",
  is_super_admin: true,
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "Martillo de uña 16oz",
    sku: "MRT-01",
    category: "Herramientas",
    description: "Mango ergonómico de fibra de vidrio anti-vibración",
    quantity: 24,
    cost_price: 22000,
    price: 35000,
    min_stock: 10,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod_2",
    name: "Taladro percutor 650W",
    sku: "TLD-02",
    category: "Eléctrico",
    description: "Velocidad variable reversible y mandril 1/2 pulgada",
    quantity: 8,
    cost_price: 125000,
    price: 185000,
    min_stock: 5,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod_3",
    name: "Juego de destornilladores x6",
    sku: "DST-03",
    category: "Herramientas",
    description: "Puntas magnéticas de cromo-vanadio aisladas",
    quantity: 15,
    cost_price: 26000,
    price: 42000,
    min_stock: 8,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod_4",
    name: "Cinta métrica 5m",
    sku: "CNT-04",
    category: "Herramientas",
    description: "Carcasa resistente a impactos y freno automático",
    quantity: 30,
    cost_price: 9500,
    price: 16000,
    min_stock: 12,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod_5",
    name: "Disco corte metal 4 1/2",
    sku: "DSC-05",
    category: "Abrasivos",
    description: "Grosor 1.0mm ultra fino para amoladora",
    quantity: 3,
    cost_price: 2800,
    price: 4500,
    min_stock: 15,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod_6",
    name: "Pintura esmalte sintético 1gl",
    sku: "PNT-06",
    category: "Pinturas",
    description: "Blanco brillante secado rápido para exteriores",
    quantity: 0,
    cost_price: 52000,
    price: 78000,
    min_stock: 5,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_1",
    product_id: "prod_1",
    product_name: "Martillo de uña 16oz",
    quantity_change: 10,
    type: "IN",
    notes: "Recepción de pedido con proveedor mayorista",
    stock_after: 24,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx_2",
    product_id: "prod_2",
    product_name: "Taladro percutor 650W",
    quantity_change: 2,
    type: "OUT",
    notes: "Venta en mostrador #4829",
    stock_after: 8,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx_3",
    product_id: "prod_5",
    product_name: "Disco corte metal 4 1/2",
    quantity_change: 50,
    type: "IN",
    notes: "Llegada de caja x50 unidades",
    stock_after: 50,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx_4",
    product_id: "prod_5",
    product_name: "Disco corte metal 4 1/2",
    quantity_change: 47,
    type: "OUT",
    notes: "Venta al por mayor a taller de metalmecánica",
    stock_after: 3,
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx_5",
    product_id: "prod_6",
    product_name: "Pintura esmalte sintético 1gl",
    quantity_change: 5,
    type: "OUT",
    notes: "Despacho a proyecto de construcción residencial",
    stock_after: 0,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_USERS: TeamUser[] = [
  {
    id: "u_demo_1",
    full_name: "Dr. Julián Cucalón",
    email: "dr.juliancucalon@gmail.com",
    org_role: "admin",
  },
  {
    id: "u_demo_2",
    full_name: "Carlos Restrepo",
    email: "carlos.restrepo@tornillo.com",
    org_role: "staff",
  },
  {
    id: "u_demo_3",
    full_name: "Mariana Gómez",
    email: "mariana.gomez@tornillo.com",
    org_role: "staff",
  },
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getMockProducts(): Product[] {
  return getStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export function setMockProducts(products: Product[]): void {
  setStored(STORAGE_KEYS.PRODUCTS, products);
}

export function getMockTransactions(): Transaction[] {
  return getStored(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
}

export function setMockTransactions(txs: Transaction[]): void {
  setStored(STORAGE_KEYS.TRANSACTIONS, txs);
}

export function getMockUsers(): TeamUser[] {
  return getStored(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function setMockUsers(users: TeamUser[]): void {
  setStored(STORAGE_KEYS.USERS, users);
}

export function getMockCurrentUser(): Profile {
  return getStored(STORAGE_KEYS.CURRENT_USER, INITIAL_USER);
}

export function setMockCurrentUser(user: Profile | null): void {
  if (user) {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}
