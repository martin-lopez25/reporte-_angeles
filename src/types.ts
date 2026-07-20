export type CellValue = string | number | boolean | null;
export type DataRow = Record<string, CellValue>;

export interface TablasFormulario {
  baseClues: string[];
  baseMeta: {
    cluesTotal: number;
    entidadesEsperadas: number;
    scriptLastRunAt?: string;
  };
  baseAn: DataRow[];
  resultado: DataRow[];
  resumen: DataRow[];
  resumenEntidad: DataRow[];
}

export interface DashboardStats {
  registrosBase: number;
  registrosUnidad: number;
  registrosRespuesta: number;
  baseCluesEsperadas: number;
  baseEntidadesEsperadas: number;
  cluesCapturadas: number;
  entidadesCapturadas: number;
  unidadesInternet: number;
  pctLlenado: number;
}

export interface TopUnidadChart {
  clues: string;
  total: number;
}

export interface TopFaltanteChart {
  item: string;
  faltantes: number;
  pct: number;
}

export interface InternetPieItem {
  name: string;
  value: number;
}

export interface EntidadChart {
  entidad: string;
  unidades: number;
  consultoriosHabilitados: number;
  consultoriosLevantados: number;
  pctLlenado: number;
}
