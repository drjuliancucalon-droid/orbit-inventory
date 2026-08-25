import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import {
  IconClose,
  IconDownload,
  IconUpload,
  IconCheck,
  IconAlert,
  IconFileSpreadsheet,
  IconClipboard,
  IconTable,
  IconPlus,
  IconTrash,
} from "./Icons";
import {
  downloadExcelTemplate,
  downloadCSVTemplate,
  parseFileProducts,
  parseTextProducts,
  type ParsedProductRow,
} from "../lib/csvHelper";
import { api, ApiError } from "../lib/api";
import { formatCOP } from "../lib/format";

type ImportTab = "table" | "paste" | "upload";

const INITIAL_SAMPLE_ROWS: ParsedProductRow[] = [
  {
    sku: "MRT-01",
    name: "Martillo de uña 16oz",
    category: "Herramientas",
    cost_price: 22000,
    price: 35000,
    quantity: 20,
    min_stock: 5,
    description: "Mango ergonómico de fibra de vidrio",
    valid: true,
  },
  {
    sku: "TLD-02",
    name: "Taladro percutor 650W",
    category: "Eléctrico",
    cost_price: 125000,
    price: 185000,
    quantity: 8,
    min_stock: 3,
    description: "Velocidad variable reversible 1/2 pulgada",
    valid: true,
  },
  {
    sku: "PNT-06",
    name: "Pintura esmalte sintético 1gl",
    category: "Pinturas",
    cost_price: 52000,
    price: 78000,
    quantity: 12,
    min_stock: 4,
    description: "Blanco brillante secado rápido exterior",
    valid: true,
  },
];

export function ImportModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (importedCount: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<ImportTab>("table");
  const [rows, setRows] = useState<ParsedProductRow[]>(INITIAL_SAMPLE_ROWS);
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validación de una fila específica
  const validateRow = (r: ParsedProductRow): { valid: boolean; error?: string } => {
    if (!r.name || !r.name.trim()) {
      return { valid: false, error: "El nombre es obligatorio" };
    }
    if (isNaN(r.price) || r.price < 0) {
      return { valid: false, error: "El precio de venta debe ser ≥ 0" };
    }
    return { valid: true };
  };

  // Actualizar una celda en la tabla interactiva
  const updateCell = (index: number, field: keyof ParsedProductRow, value: string | number) => {
    setRows((prev) => {
      const next = [...prev];
      const current = { ...next[index], [field]: value };

      // Revalidar
      const v = validateRow(current);
      current.valid = v.valid;
      current.error = v.error;

      next[index] = current;
      return next;
    });
  };

  // Agregar una fila vacía para rellenar
  const addEmptyRow = () => {
    setRows((prev) => [
      ...prev,
      {
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: "",
        category: "",
        cost_price: 0,
        price: 0,
        quantity: 0,
        min_stock: 5,
        description: "",
        valid: false,
        error: "Completa el nombre y precio",
      },
    ]);
  };

  // Eliminar una fila
  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Cargar datos de ejemplo
  const loadSamples = () => {
    setRows(INITIAL_SAMPLE_ROWS);
    setError("");
  };

  // Limpiar tabla
  const clearTable = () => {
    setRows([]);
    setFileName("");
    setPastedText("");
    setError("");
  };

  // Procesar texto pegado desde Excel o Google Sheets
  const handlePasteProcess = () => {
    if (!pastedText.trim()) {
      setError("Pega el texto copiado de Excel en el cuadro antes de continuar.");
      return;
    }
    try {
      const parsed = parseTextProducts(pastedText);
      if (parsed.length === 0) {
        setError("No se detectaron filas válidas en el texto pegado.");
        return;
      }
      setRows(parsed);
      setActiveTab("table");
      setError("");
    } catch {
      setError("Error al procesar los datos pegados. Verifica el formato.");
    }
  };

  // Procesar archivo seleccionado o arrastrado (.xlsx, .xls, .csv, .txt)
  const handleFile = async (file: File) => {
    setError("");
    setFileName(file.name);
    setParsingFile(true);

    try {
      const parsed = await parseFileProducts(file);
      if (parsed.length === 0) {
        setError("No se encontraron registros válidos con nombre de producto en el archivo.");
      } else {
        setRows(parsed);
        setActiveTab("table");
      }
    } catch (err) {
      console.error(err);
      setError("Error al abrir el archivo. Asegúrate de que sea un archivo válido de Excel (.xlsx, .xls) o CSV.");
    } finally {
      setParsingFile(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const totalCostSum = validRows.reduce((sum, r) => sum + (r.cost_price ?? 0) * (r.quantity ?? 0), 0);
  const totalSaleSum = validRows.reduce((sum, r) => sum + (r.price ?? 0) * (r.quantity ?? 0), 0);

  const confirmImport = async () => {
    if (validRows.length === 0) {
      setError("No hay productos válidos con nombre y precio para importar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const itemsToImport = validRows.map((r) => ({
        name: r.name.trim(),
        sku: r.sku?.trim() || undefined,
        category: r.category?.trim() || undefined,
        cost_price: Number(r.cost_price) >= 0 ? Number(r.cost_price) : 0,
        price: Number(r.price) || 0,
        quantity: Number(r.quantity) >= 0 ? Number(r.quantity) : 0,
        min_stock: Number(r.min_stock) >= 0 ? Number(r.min_stock) : 5,
        description: r.description?.trim() || undefined,
      }));

      const res = await api.products.bulkCreate(itemsToImport);
      onDone(res.imported);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al importar productos.");
      setLoading(false);
    }
  };

  return (
    <div className="overlay-backdrop center" onClick={onClose}>
      <div className="panel-wrap import-modal-wrap" onClick={(e) => e.stopPropagation()}>
        <div className="slide-panel glass import-modal-content">
          
          {/* Cabecera */}
          <div className="panel-head-row">
            <div>
              <div className="panel-title font-display" style={{ fontSize: 21 }}>
                Carga Masiva de Productos
              </div>
              <div className="page-sub" style={{ marginTop: 2 }}>
                100% compatible con Microsoft Excel (.XLSX y .CSV), Google Sheets o editor en línea.
              </div>
            </div>
            <button className="close-btn" onClick={onClose} type="button" aria-label="Cerrar">
              <IconClose size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {/* Barra de Descarga de Plantillas Oficiales */}
          <div className="template-download-banner">
            <div className="template-banner-info">
              <div className="template-banner-title">Descarga la Plantilla Oficial de Excel (.xlsx):</div>
              <div className="template-banner-sub">
                Formato estándar oficial de Excel con columnas ordenadas, tipos numéricos y anchos ajustados (sin errores de formato al abrir).
              </div>
            </div>
            <div className="template-banner-buttons">
              <button
                type="button"
                className="btn-template-excel"
                onClick={() => downloadExcelTemplate()}
                title="Descargar plantilla nativa de Excel (.xlsx)"
              >
                <IconFileSpreadsheet size={15} style={{ color: "#10b981" }} />
                <span>Plantilla Excel (.XLSX)</span>
              </button>
              <button
                type="button"
                className="btn-template-csv"
                onClick={() => downloadCSVTemplate()}
                title="Descargar archivo CSV universal"
              >
                <IconDownload size={14} />
                <span>Plantilla CSV (.CSV)</span>
              </button>
            </div>
          </div>

          {/* Selector de Pestañas de Carga */}
          <div className="import-tabs-bar">
            <button
              type="button"
              className={`import-tab-btn ${activeTab === "table" ? "active" : ""}`}
              onClick={() => setActiveTab("table")}
            >
              <IconTable size={15} />
              <span>Editor de Tabla en Pantalla ({rows.length})</span>
            </button>
            <button
              type="button"
              className={`import-tab-btn ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              <IconUpload size={15} />
              <span>Subir Archivo (.xlsx / .csv)</span>
            </button>
            <button
              type="button"
              className={`import-tab-btn ${activeTab === "paste" ? "active" : ""}`}
              onClick={() => setActiveTab("paste")}
            >
              <IconClipboard size={15} />
              <span>Pegar desde Excel (Copiar y Pegar)</span>
            </button>
          </div>

          {error && <div className="form-error" style={{ marginTop: 12 }}>{error}</div>}

          {/* CONTENIDO SEGÚN PESTAÑA */}

          {/* Pestaña 1: Editor de Tabla Interactivo */}
          {activeTab === "table" && (
            <div className="tab-table-content">
              <div className="table-toolbar">
                <div className="toolbar-left">
                  <button type="button" className="btn-table-action add" onClick={addEmptyRow}>
                    <IconPlus size={13} /> Agregar Fila
                  </button>
                  <button type="button" className="btn-table-action" onClick={loadSamples}>
                    Cargar 3 Ejemplos
                  </button>
                  {rows.length > 0 && (
                    <button type="button" className="btn-table-action text-danger" onClick={clearTable}>
                      Limpiar Tabla
                    </button>
                  )}
                </div>

                <div className="toolbar-right">
                  <span className="stat-pill good">
                    <IconCheck size={12} /> {validRows.length} listos
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="stat-pill bad">
                      <IconAlert size={12} /> {invalidRows.length} por corregir
                    </span>
                  )}
                </div>
              </div>

              {rows.length === 0 ? (
                <div className="table-empty-notice">
                  <IconFileSpreadsheet size={32} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>La tabla está vacía</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    Haz clic en "Agregar Fila", sube tu archivo Excel o pega tus datos desde tu hoja de cálculo.
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
                    <button type="button" className="btn-primary" onClick={addEmptyRow}>
                      <IconPlus size={13} style={{ color: "#0a0c13" }} /> Agregar Fila
                    </button>
                    <button type="button" className="btn-ghost" onClick={loadSamples}>
                      Cargar Ejemplos
                    </button>
                  </div>
                </div>
              ) : (
                <div className="interactive-grid-wrap">
                  <table className="interactive-grid">
                    <thead>
                      <tr>
                        <th style={{ width: 42, textAlign: "center" }}>#</th>
                        <th style={{ width: 100 }}>SKU</th>
                        <th style={{ minWidth: 170 }}>Nombre del Producto *</th>
                        <th style={{ width: 120 }}>Categoría</th>
                        <th style={{ width: 110, textAlign: "right" }}>Costo ($)</th>
                        <th style={{ width: 115, textAlign: "right" }}>Precio Venta *</th>
                        <th style={{ width: 85, textAlign: "center" }}>Margen</th>
                        <th style={{ width: 80, textAlign: "center" }}>Stock</th>
                        <th style={{ width: 75, textAlign: "center" }}>Mínimo</th>
                        <th style={{ minWidth: 150 }}>Descripción</th>
                        <th style={{ width: 38, textAlign: "center" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => {
                        const cost = Number(row.cost_price) || 0;
                        const price = Number(row.price) || 0;
                        const profit = price - cost;
                        const marginPct = price > 0 && cost > 0 ? Math.round((profit / price) * 100) : 0;

                        return (
                          <tr key={idx} className={row.valid ? "" : "row-invalid"}>
                            <td className="row-num" style={{ textAlign: "center" }}>
                              {idx + 1}
                            </td>
                            <td>
                              <input
                                className="grid-input code"
                                value={row.sku ?? ""}
                                onChange={(e) => updateCell(idx, "sku", e.target.value)}
                                placeholder="MRT-01"
                              />
                            </td>
                            <td>
                              <input
                                className={`grid-input name ${!row.name.trim() ? "input-err" : ""}`}
                                value={row.name}
                                onChange={(e) => updateCell(idx, "name", e.target.value)}
                                placeholder="Nombre requerido *"
                                required
                              />
                            </td>
                            <td>
                              <input
                                className="grid-input"
                                value={row.category ?? ""}
                                onChange={(e) => updateCell(idx, "category", e.target.value)}
                                placeholder="Categoría"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                className="grid-input num"
                                value={row.cost_price === undefined ? "" : row.cost_price}
                                onChange={(e) => updateCell(idx, "cost_price", parseFloat(e.target.value) || 0)}
                                placeholder="0"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                className={`grid-input num price ${isNaN(row.price) || row.price < 0 ? "input-err" : ""}`}
                                value={row.price === undefined ? "" : row.price}
                                onChange={(e) => updateCell(idx, "price", parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                required
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <span className={`grid-margin-pill ${marginPct >= 30 ? "good" : marginPct > 0 ? "norm" : "warn"}`}>
                                {marginPct}%
                              </span>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                className="grid-input num qty"
                                value={row.quantity === undefined ? "" : row.quantity}
                                onChange={(e) => updateCell(idx, "quantity", parseInt(e.target.value, 10) || 0)}
                                placeholder="0"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                className="grid-input num"
                                value={row.min_stock === undefined ? "" : row.min_stock}
                                onChange={(e) => updateCell(idx, "min_stock", parseInt(e.target.value, 10) || 5)}
                                placeholder="5"
                              />
                            </td>
                            <td>
                              <input
                                className="grid-input desc"
                                value={row.description ?? ""}
                                onChange={(e) => updateCell(idx, "description", e.target.value)}
                                placeholder="Detalles u observaciones"
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                className="btn-del-row"
                                onClick={() => removeRow(idx)}
                                title="Eliminar fila"
                              >
                                <IconTrash size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Resumen financiero del lote */}
              {validRows.length > 0 && (
                <div className="import-batch-summary">
                  <div className="summary-stat">
                    <span className="label">Total Artículos</span>
                    <span className="val font-display">{validRows.length}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="label">Unidades en Stock</span>
                    <span className="val font-display">
                      {validRows.reduce((s, r) => s + (r.quantity || 0), 0)}
                    </span>
                  </div>
                  <div className="summary-stat">
                    <span className="label">Costo Inversión Lote</span>
                    <span className="val font-display">{formatCOP(totalCostSum)}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="label">Valor Proyectado Venta</span>
                    <span className="val font-display" style={{ color: "var(--accent)" }}>
                      {formatCOP(totalSaleSum)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pestaña 2: Subir Archivo */}
          {activeTab === "upload" && (
            <div className="tab-upload-content">
              <div
                className={`dropzone ${isDragging ? "dragging" : ""} ${fileName ? "has-file" : ""}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  accept=".xlsx,.xls,.csv,.txt,.tsv,.ods"
                  style={{ display: "none" }}
                />
                <div className="dropzone-icon">
                  {parsingFile ? (
                    <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                  ) : fileName ? (
                    <IconFileSpreadsheet size={28} style={{ color: "#10b981" }} />
                  ) : (
                    <IconUpload size={28} style={{ color: "var(--accent)" }} />
                  )}
                </div>
                <div className="dropzone-text">
                  {parsingFile ? (
                    <div className="dropzone-title">Analizando archivo Excel / CSV...</div>
                  ) : fileName ? (
                    <>
                      <div className="dropzone-filename">{fileName}</div>
                      <div className="dropzone-hint">Archivo procesado con éxito. Haz clic aquí si deseas cambiarlo.</div>
                    </>
                  ) : (
                    <>
                      <div className="dropzone-title">Arrastra tu archivo Excel (.XLSX) o CSV aquí</div>
                      <div className="dropzone-hint">Compatible con Microsoft Excel (.xlsx, .xls), Google Sheets, LibreOffice y CSV universal</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pestaña 3: Pegar directo desde Excel */}
          {activeTab === "paste" && (
            <div className="tab-paste-content">
              <div className="paste-instructions">
                <b>Instrucciones sencillas:</b> Abre tu archivo de Excel, selecciona cualquier grupo de celdas o columnas con tu inventario, pulsa <code>Ctrl + C</code> (Copiar) y pégalo en este recuadro con <code>Ctrl + V</code>. El sistema detectará automáticamente los nombres, precios y cantidades.
              </div>

              <textarea
                className="paste-textarea"
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="SKU	Nombre	Categoría	Costo	Precio	Cantidad	Stock_Minimo	Descripcion&#10;MRT-01	Martillo de uña 16oz	Herramientas	22000	35000	20	5	Mango ergonómico...&#10;TLD-02	Taladro percutor 650W	Eléctrico	125000	185000	8	3	Velocidad..."
              />

              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" className="btn-ghost" onClick={() => setPastedText("")}>
                  Borrar texto
                </button>
                <button type="button" className="btn-primary" onClick={handlePasteProcess}>
                  <IconTable size={14} style={{ color: "#0a0c13" }} />
                  Procesar y Ver en Tabla
                </button>
              </div>
            </div>
          )}

          <div className="spacer" style={{ minHeight: 20 }} />

          {/* Botones de Acción Final */}
          <div className="modal-actions-row">
            <button className="btn-cancel" onClick={onClose} type="button" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button
              className="btn-confirm"
              onClick={confirmImport}
              type="button"
              disabled={loading || validRows.length === 0}
              style={{ flex: 2, marginBottom: 0 }}
            >
              {loading ? "Importando a la base de datos…" : `Guardar e Importar ${validRows.length} Producto${validRows.length === 1 ? "" : "s"}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
