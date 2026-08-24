export interface SearchFilters {
  region?: string;
  comuna?: string;
  prevision?: string;
  modalidad?: string;
}

export interface ProfessionalCard {
  id: string;
  nombre: string;
  foto_url?: string;
  especialidad: string;
  precio_consulta: number;
  moneda: string;
  proxima_hora: string;
  region: string;
  comuna: string;
  previsiones: string[];
  modalidades: string[];
  // Campos adicionales para el resumen del profesional
  bio?: string;
  yearsExperience?: number;
  education?: string;
  specializations?: string[];
  publications?: string[];
  workHistory?: string[];
  // Disponibilidad de horarios
  availableSlots?: {
    date: string; // formato YYYY-MM-DD
    times: string[]; // formato HH:MM
  }[];
}

export interface SearchResponse {
  professionals: ProfessionalCard[];
  total: number;
  page: number;
  per_page: number;
}
