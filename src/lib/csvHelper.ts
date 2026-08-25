import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { Product } from "./api";

export type ParsedProductRow = {
  name: string;
  sku?: string;
  category?: string;
  cost_price?: number;
  price: number;
  quantity: number;
  min_stock?: number;
  description?: string;
  valid: boolean;
  error?: string;
};

// Descargar un Blob en el navegador
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 1. Descargar Plantilla Excel (.xlsx) Nativa 100% compatible sin advertencias
export function downloadExcelTemplate(filename = "plantilla_productos_orbit.xlsx"): void {
  const headers = [
    "SKU",
    "Nombre del Producto *",
    "Categoría",
    "Costo Unitario ($)",
    "Precio Venta ($) *",
    "Cantidad Inicial",
    "Stock Mínimo",
    "Descripción / Notas",
  ];

  const data = [
    headers,
    [
      "MRT-01",
      "Martillo de uña 16oz",
      "Herramientas",
      22000,
      35000,
      20,
      5,
      "Mango ergonómico de fibra de vidrio",
    ],
    [
      "TLD-02",
      "Taladro percutor 650W",
      "Eléctrico",
      125000,
      185000,
      8,
      3,
      "Velocidad variable reversible 1/2 pulgada",
    ],
    [
      "PNT-06",
      "Pintura esmalte sintético 1gl",
      "Pinturas",
      52000,
      78000,
      12,
      4,
      "Blanco brillante secado rápido exterior",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Configurar anchos de columna para que en Excel se vea espacioso y ordenado
  ws["!cols"] = [
    { wch: 14 }, // SKU
    { wch: 32 }, // Nombre
    { wch: 18 }, // Categoría
    { wch: 18 }, // Costo Unitario
    { wch: 18 }, // Precio Venta
    { wch: 16 }, // Cantidad Inicial
    { wch: 14 }, // Stock Mínimo
    { wch: 42 }, // Descripción
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Productos");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, filename);
}

// 2. Exportar Catálogo completo a Excel (.xlsx) Nativo
export function exportProductsToExcel(products: Product[], filename = "inventario_orbit.xlsx"): void {
  const headers = [
    "SKU",
    "Nombre del Producto",
    "Categoría",
    "Costo Unitario ($)",
    "Precio Venta ($)",
    "Stock Actual",
    "Stock Mínimo",
    "Margen Ganancia %",
    "Valor Total a Costo ($)",
    "Valor Total a Venta ($)",
    "Descripción",
  ];

  const rows = products.map((p) => {
    const cost = p.cost_price ?? 0;
    const price = p.price ?? 0;
    const qty = p.quantity ?? 0;
    const marginPct = price > 0 && cost > 0 ? Math.round(((price - cost) / price) * 100) : 0;
    const totalCost = cost * qty;
    const totalSale = price * qty;

    return [
      p.sku ?? "",
      p.name,
      p.category ?? "General",
      cost,
      price,
      qty,
      p.min_stock ?? 5,
      `${marginPct}%`,
      totalCost,
      totalSale,
      p.description ?? "",
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  ws["!cols"] = [
    { wch: 14 }, // SKU
    { wch: 32 }, // Nombre
    { wch: 18 }, // Categoría
    { wch: 18 }, // Costo
    { wch: 18 }, // Precio
    { wch: 14 }, // Stock
    { wch: 14 }, // Stock Mínimo
    { wch: 18 }, // Margen %
    { wch: 22 }, // Total Costo
    { wch: 22 }, // Total Venta
    { wch: 38 }, // Descripción
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario Orbit");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, filename);
}

// 3. Descargar Plantilla CSV con UTF-8 BOM y sep=; para compatibilidad
export function downloadCSVTemplate(filename = "plantilla_productos_orbit.csv"): void {
  const headers = [
    "SKU",
    "Nombre",
    "Categoría",
    "Costo_Unitario",
    "Precio_Venta",
    "Cantidad_Inicial",
    "Stock_Minimo",
    "Descripcion",
  ];

  const sampleRows = [
    ["MRT-01", "Martillo de uña 16oz", "Herramientas", "22000", "35000", "20", "5", "Mango ergonómico de fibra de vidrio"],
    ["TLD-02", "Taladro percutor 650W", "Eléctrico", "125000", "185000", "8", "3", "Velocidad variable reversible 1/2 pulgada"],
    ["PNT-06", "Pintura esmalte sintético 1gl", "Pinturas", "52000", "78000", "12", "4", "Blanco brillante secado rápido exterior"],
  ];

  const csvBody = Papa.unparse({ fields: headers, data: sampleRows }, { delimiter: ";" });
  const csvContent = "\uFEFFsep=;\r\n" + csvBody;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

// 4. Exportar productos a CSV
export function exportProductsToCSV(products: Product[], filename = "inventario_orbit.csv"): void {
  const headers = [
    "SKU",
    "Nombre",
    "Categoría",
    "Costo Unitario",
    "Precio Venta",
    "Stock Actual",
    "Stock Mínimo",
    "Margen %",
    "Valor a Costo",
    "Valor a Venta",
    "Descripción",
  ];

  const data = products.map((p) => {
    const cost = p.cost_price ?? 0;
    const price = p.price ?? 0;
    const qty = p.quantity ?? 0;
    const marginPct = price > 0 && cost > 0 ? Math.round(((price - cost) / price) * 100) : 0;
    const totalCost = cost * qty;
    const totalSale = price * qty;

    return [
      p.sku ?? "",
      p.name,
      p.category ?? "",
      cost,
      price,
      qty,
      p.min_stock ?? 5,
      `${marginPct}%`,
      totalCost,
      totalSale,
      p.description ?? "",
    ];
  });

  const csvBody = Papa.unparse({ fields: headers, data }, { delimiter: ";" });
  const csvContent = "\uFEFFsep=;\r\n" + csvBody;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

// Limpiador numérico inteligente (acepta números, strings con $, comas, puntos colombianos/latinos)
function parseNumberClean(raw: unknown): number {
  if (typeof raw === "number") {
    return isNaN(raw) ? 0 : raw;
  }
  if (!raw) return 0;

  const str = String(raw).trim();
  if (!str) return 0;

  // Remover símbolos de moneda y espacios
  let clean = str.replace(/[$€COP\s]/gi, "");

  // Si tiene formato latino con puntos de miles e.g. "125.000,50" o "125.000"
  if (clean.includes(".") && clean.includes(",")) {
    clean = clean.replace(/\./g, "").replace(/,/g, ".");
  } else if (clean.includes(".") && !clean.includes(",")) {
    // Si tiene un punto y más de 2 dígitos después del punto (e.g. 22.000 o 125.000), es separador de miles
    const parts = clean.split(".");
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      clean = clean.replace(/\./g, "");
    }
  } else if (clean.includes(",") && !clean.includes(".")) {
    // Si tiene coma pero 3 digitos e.g. "22,000" o decimal "22,5"
    const parts = clean.split(",");
    if (parts.length > 1 && parts[parts.length - 1].length === 3 && parts[0].length <= 3) {
      clean = clean.replace(/,/g, "");
    } else {
      clean = clean.replace(/,/g, ".");
    }
  }

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

// Mapea una matriz 2D de filas (desde Excel o CSV) a ParsedProductRow
export function processRawMatrix(matrix: unknown[][]): ParsedProductRow[] {
  if (!matrix || matrix.length === 0) return [];

  // Filtrar filas completamente vacías
  const nonEmptyRows = matrix.filter((row) =>
    Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "")
  );

  if (nonEmptyRows.length === 0) return [];

  // Primera fila como potenciales encabezados
  const headerRow = nonEmptyRows[0].map((h) =>
    String(h || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "")
  );

  const findIdx = (keywords: string[]): number => {
    return headerRow.findIndex((h) => keywords.some((k) => h.includes(k)));
  };

  const nameIdx = findIdx(["nombre", "name", "producto", "item", "articulo", "descripcioncorta"]);
  const skuIdx = findIdx(["sku", "codigo", "code", "barcode", "referencia", "ref"]);
  const catIdx = findIdx(["categoria", "category", "seccion", "tipo", "rubro"]);
  const costIdx = findIdx(["costo", "cost", "compra", "costounitario", "preciocosto"]);
  const priceIdx = findIdx(["precio", "price", "precioventa", "venta", "pvp"]);
  const qtyIdx = findIdx(["cantidad", "quantity", "stock", "cant", "stockinicial", "cantidadinicial"]);
  const minStockIdx = findIdx(["minimo", "minstock", "stockminimo", "min", "alerta"]);
  const descIdx = findIdx(["descripcion", "description", "detalle", "notas", "observacion"]);

  const hasRecognizedHeader = nameIdx !== -1 || priceIdx !== -1 || skuIdx !== -1;
  const startIdx = hasRecognizedHeader ? 1 : 0;

  const results: ParsedProductRow[] = [];

  for (let i = startIdx; i < nonEmptyRows.length; i++) {
    const row = nonEmptyRows[i];

    const rawSku = skuIdx !== -1 ? row[skuIdx] : row[0] && String(row[0]).length < 15 && isNaN(Number(row[0])) ? row[0] : "";
    const rawName = nameIdx !== -1 ? row[nameIdx] : hasRecognizedHeader ? row[1] || row[0] : row[1] || row[0];
    const rawCat = catIdx !== -1 ? row[catIdx] : "";
    const rawCost = costIdx !== -1 ? row[costIdx] : "";
    const rawPrice = priceIdx !== -1 ? row[priceIdx] : row[4] || row[3] || row[2] || "";
    const rawQty = qtyIdx !== -1 ? row[qtyIdx] : row[5] || row[4] || 0;
    const rawMinStock = minStockIdx !== -1 ? row[minStockIdx] : 5;
    const rawDesc = descIdx !== -1 ? row[descIdx] : row[7] || row[6] || "";

    const name = String(rawName || "").trim();
    const price = parseNumberClean(rawPrice);
    const cost_price = rawCost !== "" && rawCost !== undefined ? parseNumberClean(rawCost) : undefined;
    const quantity = Math.max(0, Math.floor(parseNumberClean(rawQty)));
    const min_stock = rawMinStock !== "" && rawMinStock !== undefined ? Math.max(0, Math.floor(parseNumberClean(rawMinStock))) : 5;

    if (!name) {
      results.push({
        name: "",
        price: 0,
        quantity: 0,
        valid: false,
        error: `Fila ${i + 1}: El nombre del producto es obligatorio.`,
      });
      continue;
    }

    if (price < 0 || isNaN(price)) {
      results.push({
        name,
        price: 0,
        quantity: 0,
        valid: false,
        error: `Fila ${i + 1}: El precio de venta debe ser un número válido.`,
      });
      continue;
    }

    results.push({
      name,
      sku: String(rawSku || "").trim() || undefined,
      category: String(rawCat || "").trim() || undefined,
      cost_price: cost_price !== undefined ? cost_price : Math.round(price * 0.65),
      price,
      quantity,
      min_stock,
      description: String(rawDesc || "").trim() || undefined,
      valid: true,
    });
  }

  return results;
}

// Analizador de archivo binario (.xlsx, .xls, .ods) o texto (.csv, .tsv, .txt)
export async function parseFileProducts(file: File): Promise<ParsedProductRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // 1. Si es archivo binario de Excel (.xlsx, .xls, .ods)
  if (["xlsx", "xls", "ods", "xlsm", "xlsb"].includes(extension)) {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) return [];

    const sheet = wb.Sheets[firstSheetName];
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
    return processRawMatrix(matrix);
  }

  // 2. Si es archivo de texto / CSV / TSV
  const text = await file.text();
  return parseTextProducts(text);
}

// Analizador de texto (CSV o pegado de portapapeles)
export function parseTextProducts(rawInput: string): ParsedProductRow[] {
  let text = rawInput.replace(/^\uFEFF/, "").trim();
  if (!text) return [];

  // Remover posibles directivas sep=;
  text = text.replace(/^sep=[;,]\r?\n/i, "");

  // Usar PapaParse para interpretar de forma robusta comas, puntos y comas, o tabulaciones de Excel
  const parsed = Papa.parse<unknown[]>(text, {
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (parsed.data && parsed.data.length > 0) {
    return processRawMatrix(parsed.data as unknown[][]);
  }

  return [];
}
