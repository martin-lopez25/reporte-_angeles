import type { CellValue, DataRow, TablasFormulario } from './types';

function toCellValue(value: unknown): CellValue {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value;
  const text = String(value).trim();
  const low = text.toLowerCase();
  if (low === 'true') return true;
  if (low === 'false') return false;
  const asNumber = Number(text);
  if (!Number.isNaN(asNumber) && text !== '') return asNumber;
  return text;
}

function normalizeRows(rows: Record<string, unknown>[]): DataRow[] {
  return rows.map((row) => {
    const out: DataRow = {};
    for (const [k, v] of Object.entries(row)) out[k] = toCellValue(v);
    return out;
  });
}


interface DataJson {
  fetchedAt: string;
  baseAn: Record<string, unknown>[];
  resultado: Record<string, unknown>[];
  resumen: Record<string, unknown>[];
  resumenEntidad: Record<string, unknown>[];
}

export async function cargarTablasFormulario(): Promise<{ tablas: TablasFormulario; fetchedAt: Date }> {
  const response = await fetch('./data.json');
  if (!response.ok) {
    throw new Error('No se encontró data.json. Corre el notebook para generar los datos.');
  }
  const json: DataJson = await response.json();
  return {
    tablas: {
      baseAn:        normalizeRows(json.baseAn),
      resultado:     normalizeRows(json.resultado),
      resumen:       normalizeRows(json.resumen),
      resumenEntidad: normalizeRows(json.resumenEntidad),
    },
    fetchedAt: new Date(json.fetchedAt),
  };
}

