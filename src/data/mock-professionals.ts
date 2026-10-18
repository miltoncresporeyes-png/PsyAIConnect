import { ProfessionalCard } from "@/types/search";

// Pre-lanzamiento: Lista vacía. No inventar datos ficticios ni de prueba.
export const MOCK_PROFESSIONALS: ProfessionalCard[] = [];

export function filterProfessionals(
  professionals: ProfessionalCard[],
  filters: {
    region?: string;
    comuna?: string;
    prevision?: string;
    modalidad?: string;
  }
): ProfessionalCard[] {
  return professionals.filter((p) => {
    if (filters.region && p.region !== filters.region) return false;
    if (filters.comuna && p.comuna.toLowerCase() !== filters.comuna.toLowerCase()) return false;
    if (filters.prevision && !p.previsiones.includes(filters.prevision)) return false;
    if (filters.modalidad && !p.modalidades.includes(filters.modalidad)) return false;
    return true;
  });
}
