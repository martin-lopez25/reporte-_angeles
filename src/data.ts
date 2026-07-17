import * as XLSX from 'xlsx';
import type { CellValue, DataRow, TablasFormulario } from './types';

const SHEET_ID = '1maRNGDuU9rEFWZLgMdhJS1waAnJxl6ENntm-nyD0tq8';
const GID = '1765182479';

async function fetchBaseClues(): Promise<string[]> {
  const ts = Date.now();

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}base_clues.json?_cb=${ts}`);
    if (!response.ok) return [];

    const payload = await response.json();

    if (Array.isArray(payload)) {
      const clues = payload
        .map((row) => {
          if (typeof row === 'string') return row.trim();
          if (row && typeof row === 'object' && 'clues_imb' in row) return String((row as { clues_imb: unknown }).clues_imb ?? '').trim();
          return '';
        })
        .filter(Boolean);
      return [...new Set(clues)];
    }
  } catch {
    // Si no existe el archivo aun, se usara fallback desde base_an.
  }

  return [];
}

async function fetchBaseMeta(): Promise<{ cluesTotal: number; entidadesEsperadas: number }> {
  const ts = Date.now();

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}base_meta.json?_cb=${ts}`);
    if (!response.ok) return { cluesTotal: 0, entidadesEsperadas: 0 };

    const payload = await response.json();
    const cluesTotal = Number(payload?.clues_total ?? 0);
    const entidadesEsperadas = Number(payload?.entidades_esperadas ?? 0);

    return {
      cluesTotal: Number.isFinite(cluesTotal) ? cluesTotal : 0,
      entidadesEsperadas: Number.isFinite(entidadesEsperadas) ? entidadesEsperadas : 0,
    };
  } catch {
    return { cluesTotal: 0, entidadesEsperadas: 0 };
  }
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toCellValue(value: unknown): CellValue {
  if (value === null || value === undefined || value === '') return null;
  const text = toText(value);
  const low = text.toLowerCase();

  if (low === 'true') return true;
  if (low === 'false') return false;

  const asNumber = Number(text);
  if (!Number.isNaN(asNumber) && text !== '') return asNumber;

  return text;
}

function normalizeQuestion(question: string): string {
  return question.replace(/_\d+$/, '');
}

async function fetchBaseAn(): Promise<DataRow[]> {
  const ts = Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}&_cb=${ts}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('No se pudo descargar la hoja de Google Sheets');
  }

  const csvText = await response.text();
  const workbook = XLSX.read(csvText, { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });

  return rows.map((row) => {
    const normalized: DataRow = {};
    Object.entries(row).forEach(([key, value]) => {
      normalized[key] = toCellValue(value);
    });
    return normalized;
  });
}

function buildTables(
  baseAn: DataRow[],
  baseClues: string[],
  baseMeta: { cluesTotal: number; entidadesEsperadas: number },
): TablasFormulario {
  const unidadByClues = new Map<string, DataRow>();

  for (const row of baseAn) {
    if (toText(row.tipo_registro) !== 'unidad') continue;
    const clues = toText(row.clues_imb);
    if (!clues || unidadByClues.has(clues)) continue;

    unidadByClues.set(clues, {
      entidad: row.entidad ?? null,
      clues_imb: row.clues_imb ?? null,
      nombre_de_la_unidad: row.nombre_de_la_unidad ?? null,
      internet: row.internet ?? null,
      consultorios_habilitados: row.consultorios_habilitados ?? null,
    });
  }

  const resultadoMap = new Map<string, DataRow>();
  const dynamicColumns = new Set<string>();

  for (const row of baseAn) {
    if (toText(row.tipo_registro) !== 'respuesta') continue;

    const entidad = toText(row.entidad);
    const clues = toText(row.clues_imb);
    const consultorio = toText(row.consultorio);
    const questionRaw = toText(row.pregunta);

    if (!entidad || !clues || !consultorio || !questionRaw) continue;

    const question = normalizeQuestion(questionRaw);
    const key = `${entidad}__${clues}__${consultorio}`;

    if (!resultadoMap.has(key)) {
      const unidad = unidadByClues.get(clues);
      resultadoMap.set(key, {
        entidad,
        clues_imb: clues,
        nombre_de_la_unidad: unidad?.nombre_de_la_unidad ?? null,
        internet: unidad?.internet ?? null,
        consultorios_habilitados: unidad?.consultorios_habilitados ?? null,
        consultorio: toCellValue(consultorio),
      });
    }

    const target = resultadoMap.get(key);
    if (!target) continue;

    target[question] = toCellValue(row.valor);
    dynamicColumns.add(question);
  }

  const sortedDynamicColumns = [...dynamicColumns].sort();

  const resultado = [...resultadoMap.values()].map((row) => {
    const enriched: DataRow = { ...row };

    for (const col of sortedDynamicColumns) {
      if (!(col in enriched)) enriched[col] = null;

      if (col !== 'turno_consultorio') {
        const maybeNumeric = Number(enriched[col]);
        if (!Number.isNaN(maybeNumeric) && enriched[col] !== null && enriched[col] !== '') {
          enriched[col] = maybeNumeric;
        }
      }
    }

    return enriched;
  });

  const resumenByClues = new Map<string, DataRow>();

  for (const row of resultado) {
    const clues = toText(row.clues_imb);
    if (!clues) continue;

    if (!resumenByClues.has(clues)) {
      resumenByClues.set(clues, {
        clues_imb: row.clues_imb ?? null,
        entidad: row.entidad ?? null,
        nombre_de_la_unidad: row.nombre_de_la_unidad ?? null,
        internet: row.internet ?? null,
        consultorios_habilitados: row.consultorios_habilitados ?? null,
        consultorio: row.consultorio ?? null,
      });
    }

    const target = resumenByClues.get(clues);
    if (!target) continue;

    const currentConsultorio = Number(target.consultorio ?? 0);
    const rowConsultorio = Number(row.consultorio ?? 0);
    target.consultorio = Math.max(currentConsultorio, rowConsultorio);

    for (const col of sortedDynamicColumns) {
      if (col === 'turno_consultorio') {
        const current = toText(target[col]);
        const next = toText(row[col]);
        target[col] = [current, next].filter(Boolean).join(' | ');
        continue;
      }

      const current = Number(target[col] ?? 0);
      const next = Number(row[col] ?? 0);
      target[col] = (Number.isNaN(current) ? 0 : current) + (Number.isNaN(next) ? 0 : next);
    }
  }

  const resumen = [...resumenByClues.values()];

  // Construye resumen_entidad: agrupa resumen por entidad sumando todas las columnas
  // numericas (excluye entidad, clues_imb, nombre_de_la_unidad, turno_consultorio)
  const columnas_excluir = new Set(['entidad', 'clues_imb', 'nombre_de_la_unidad', 'turno_consultorio']);
  const resumenEntidadMap = new Map<string, DataRow>();

  for (const row of resumen) {
    const entidad = toText(row.entidad) || 'Sin entidad';
    if (!resumenEntidadMap.has(entidad)) {
      resumenEntidadMap.set(entidad, { entidad });
    }
    const agg = resumenEntidadMap.get(entidad)!;
    for (const [key, value] of Object.entries(row)) {
      if (columnas_excluir.has(key)) continue;
      const currentNum = typeof agg[key] === 'number' ? (agg[key] as number) : 0;
      let internetVal = value;
      if (key === 'internet') {
        const t = toText(value).toLowerCase();
        internetVal = t === 'true' || t === '1' ? 1 : 0;
      }
      const addNum = typeof internetVal === 'number' ? internetVal : Number(internetVal ?? 0);
      agg[key] = currentNum + (Number.isNaN(addNum) ? 0 : addNum);
    }
  }

  return {
    baseClues,
    baseMeta,
    baseAn,
    resultado,
    resumen,
    resumenEntidad: [...resumenEntidadMap.values()],
  };
}

export async function cargarTablasFormulario(): Promise<{ tablas: TablasFormulario; fetchedAt: Date }> {
  const [baseAn, baseClues, baseMeta] = await Promise.all([fetchBaseAn(), fetchBaseClues(), fetchBaseMeta()]);
  const tablas = buildTables(baseAn, baseClues, baseMeta);
  return { tablas, fetchedAt: new Date() };
}
