export type CellValue = string | number | boolean | null;
export type DataRow = Record<string, CellValue>;

export interface TablasFormulario {
  baseAn: DataRow[];
  resultado: DataRow[];
  resumen: DataRow[];
  resumenEntidad: DataRow[];
}

export interface DashboardStats {
  registrosBase: number;
  filasResultado: number;
  unidadesResumen: number;
  entidades: number;
  unidadesInternet: number;
}

export interface TopUnidadChart {
  clues: string;
  total: number;
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
}
