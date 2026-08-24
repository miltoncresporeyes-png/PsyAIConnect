import { ProfessionalCard } from "@/types/search";

// Genera fechas disponibles a partir de hoy
function generateAvailableSlots(startDaysFromNow: number): { date: string; times: string[] }[] {
  const slots = [];
  const today = new Date();
  
  for (let i = startDaysFromNow; i < startDaysFromNow + 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Saltar fines de semana
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const possibleTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const availableTimes = possibleTimes.filter((_, idx) => (i + idx) % 2 === 0);
    
    if (availableTimes.length > 0) {
      slots.push({
        date: `${year}-${month}-${day}`,
        times: availableTimes.length > 0 ? availableTimes : ['10:00', '15:00'],
      });
    }
  }
  
  return slots;
}

function getNextSlotIso(startDaysFromNow: number, time: string = "10:00:00"): string {
  const date = new Date();
  date.setDate(date.getDate() + startDaysFromNow);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${time}`;
}

export const MOCK_PROFESSIONALS: ProfessionalCard[] = [
  {
    id: "1",
    nombre: "Dra. María González Pérez",
    foto_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
    especialidad: "Psicóloga Clínica",
    precio_consulta: 25000,
    moneda: "CLP",
    proxima_hora: getNextSlotIso(1, "10:00:00"),
    region: "rm",
    comuna: "Providencia",
    previsiones: ["fonasa", "isapre"],
    modalidades: ["online", "presencial"],
    bio: "Psicóloga clínica con más de 12 años de experiencia en el tratamiento de trastornos de ansiedad y depresión. Mi enfoque se basa en la terapia cognitivo-conductual, adaptando cada tratamiento a las necesidades individuales del paciente.",
    yearsExperience: 12,
    education: "Doctorado en Psicología Clínica, Universidad de Chile",
    specializations: ["Ansiedad", "Depresión", "Estrés laboral", "Autoestima"],
    publications: ["Manejo del estrés en el trabajo moderno (2023)", "Técnicas de mindfulness para la ansiedad (2021)"],
    workHistory: ["Hospital Clínico U. de Chile (2014-2020)", "Consulta privada (2020-presente)"],
    availableSlots: generateAvailableSlots(1),
  },
  {
    id: "2",
    nombre: "Dr. Carlos Ramírez Silva",
    foto_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
    especialidad: "Psiquiatra",
    precio_consulta: 35000,
    moneda: "CLP",
    proxima_hora: getNextSlotIso(1, "14:30:00"),
    region: "rm",
    comuna: "Santiago",
    previsiones: ["fonasa", "particular"],
    modalidades: ["online"],
    bio: "Psiquiatra con especialización en trastornos del ánimo y psicofarmacología. Ofrezco un enfoque integral combinando tratamiento farmacológico con psicoterapia breve para resultados óptimos.",
    yearsExperience: 15,
    education: "Especialidad en Psiquiatría Adultos, Pontificia Universidad Católica de Chile",
    specializations: ["Trastornos del ánimo", "Psicofarmacología", "Trastornos de ansiedad"],
    publications: ["Nuevos enfoques en psicofarmacología (2022)", "Depresión resistente al tratamiento (2020)"],
    workHistory: ["Clínica Las Condes (2010-2018)", "Instituto Psiquiátrico José Horwitz (2018-2022)"],
    availableSlots: generateAvailableSlots(1),
  },
  {
    id: "3",
    nombre: "Mtra. Ana Martínez López",
    foto_url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop",
    especialidad: "Psicoterapeuta",
    precio_consulta: 20000,
    moneda: "CLP",
    proxima_hora: getNextSlotIso(2, "09:00:00"),
    region: "rm",
    comuna: "Las Condes",
    previsiones: ["isapre", "particular"],
    modalidades: ["online", "presencial", "domicilio"],
    bio: "Psicoterapeuta humanista con énfasis en desarrollo personal y autoconocimiento. Creo en el potencial de cada persona para transformar su vida a través del autoentendimiento y la aceptación.",
    yearsExperience: 8,
    education: "Magíster en Psicoterapia Humanista, Universidad Diego Portales",
    specializations: ["Desarrollo personal", "Autoestima", "Crisis existenciales", "Manejo del duelo"],
    publications: [],
    workHistory: ["Centro de Desarrollo Integral (2016-2020)", "Consulta privada (2020-presente)"],
    availableSlots: generateAvailableSlots(2),
  },
  {
    id: "4",
    nombre: "Dr. Pedro Fernández Rojas",
    foto_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop",
    especialidad: "Psicólogo Infantil",
    precio_consulta: 28000,
    moneda: "CLP",
    proxima_hora: getNextSlotIso(2, "11:00:00"),
    region: "rm",
    comuna: "Ñuñoa",
    previsiones: ["fonasa"],
    modalidades: ["presencial"],
    bio: "Psicólogo especializado en infancia y adolescencia. Trabajo con enfoque lúdico y terapia de juego para ayudar a niños y sus familias a superar dificultades emocionales y conductuales.",
    yearsExperience: 10,
    education: "Magíster en Psicología Infantil, Universidad de los Andes",
    specializations: ["TDAH", "Problemas de conducta", "Ansiedad infantil", "Terapia familiar"],
    publications: ["El juego como herramienta terapéutica (2019)"],
    workHistory: ["Fundación Mi Casa (2014-2019)", "Hospital Exequiel González Cortés (2019-2023)"],
    availableSlots: generateAvailableSlots(2),
  },
  {
    id: "5",
    nombre: "Dra. Carolina Herrera Mendoza",
    foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    especialidad: "Psicóloga de Pareja",
    precio_consulta: 30000,
    moneda: "CLP",
    proxima_hora: getNextSlotIso(3, "16:00:00"),
    region: "rm",
    comuna: "Vitacura",
    previsiones: ["particular"],
    modalidades: ["online", "presencial"],
    bio: "Terapeuta de pareja y familia con formación en terapia sistémica. Ayudo a parejas a mejorar su comunicación, resolver conflictos y fortalecer su vínculo emocional.",
    yearsExperience: 9,
    education: "Diplomado en Terapia de Pareja, Instituto Chileno de Terapia Familiar",
    specializations: ["Terapia de pareja", "Comunicación efectiva", "Infidelidad", "Crisis matrimoniales"],
    publications: ["Comunicación en la pareja moderna (2022)", "Reconstruyendo la confianza (2020)"],
    workHistory: ["Centro de la Familia (2015-2020)", "Consulta privada (2020-presente)"],
    availableSlots: generateAvailableSlots(3),
  },
  {
    id: "6",
    nombre: "Dr. Andrés Vásquez Navarro",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    especialidad: "Psiquiatra Adulto",
    precio_consulta: 40000,
    moneda: "CLP",
    proxima_hora: getNextSlotIso(3, "10:30:00"),
    region: "v",
    comuna: "Viña del Mar",
    previsiones: ["fonasa", "isapre"],
    modalidades: ["online", "presencial"],
    bio: "Psiquiatra con amplia experiencia en el tratamiento de trastornos de ansiedad, depresión y trastornos del sueño. Ofrezco atención integral con enfoque biopsicosocial.",
    yearsExperience: 18,
    education: "Especialidad en Psiquiatría, Universidad de Valparaíso",
    specializations: ["Trastornos de ansiedad", "Depresión mayor", "Trastornos del sueño", "Adicciones"],
    publications: ["Insomnio crónico: abordaje integral (2021)", "Ansiedad generalizada en adultos (2019)"],
    workHistory: ["Hospital Gustavo Fricke (2008-2018)", "Clínica Reñaca (2018-presente)"],
    availableSlots: generateAvailableSlots(3),
  },
];

export const filterProfessionals = (
  professionals: ProfessionalCard[],
  filters: {
    region?: string;
    comuna?: string;
    prevision?: string;
    modalidad?: string;
  }
): ProfessionalCard[] => {
  return professionals.filter((p) => {
    if (filters.region && p.region !== filters.region) return false;
    if (filters.comuna && p.comuna !== filters.comuna) return false;
    if (filters.prevision && !p.previsiones.includes(filters.prevision)) return false;
    if (filters.modalidad && !p.modalidades.includes(filters.modalidad)) return false;
    return true;
  });
};
