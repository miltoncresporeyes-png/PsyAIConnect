export interface Region {
  id: string;
  nombre: string;
  comunas: string[];
}

export const CHILE_REGIONS: Region[] = [
  {
    id: "rm",
    nombre: "Metropolitana de Santiago",
    comunas: [
      "Santiago",
      "Cerrillos",
      "Cerro Navia",
      "Conchalí",
      "El Bosque",
      "Estación Central",
      "Huechuraba",
      "Independencia",
      "La Cisterna",
      "La Florida",
      "La Granja",
      "La Pintana",
      "La Reina",
      "Las Condes",
      "Lo Barnechea",
      "Lo Espejo",
      "Lo Prado",
      "Macul",
      "Maipú",
      "Ñuñoa",
      "Pedro Aguirre Cerda",
      "Peñalolén",
      "Providencia",
      "Pudahuel",
      "Quilicura",
      "Quinta Normal",
      "Recoleta",
      "Renca",
      "San Joaquín",
      "San Miguel",
      "San Ramón",
      "Vitacura",
    ],
  },
  {
    id: "i",
    nombre: "Tarapacá",
    comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  },
  {
    id: "ii",
    nombre: "Antofagasta",
    comunas: ["Antofagasta", "Calama", "Tocopilla", "María Elena", "San Pedro de Atacama", "Ollagüe", "Sierra Gorda"],
  },
  {
    id: "iii",
    nombre: "Atacama",
    comunas: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Freirina", "Huasco"],
  },
  {
    id: "iv",
    nombre: "Coquimbo",
    comunas: ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Vicuña", "Salamanca", "Los Vilos", "Andacollo", "Monte Patria", "Rio Hurtado"],
  },
  {
    id: "v",
    nombre: "Valparaíso",
    comunas: [
      "Valparaíso",
      "Viña del Mar",
      "Quillota",
      "San Antonio",
      "San Felipe",
      "Los Andes",
      "Petorca",
      "La Ligua",
      "Quilpué",
      "Villa Alemana",
      "Limache",
      "Olmué",
      "Cabrero",
      "Río Bueno",
    ],
  },
  {
    id: "vi",
    nombre: "Libertador General Bernardo O'Higgins",
    comunas: ["Rancagua", "San Fernando", "Pichilemu", "Santa Cruz", "Chimbarongo", "Graneros", "Mostazal", "Doñihue", "Coinco", "Coltauco"],
  },
  {
    id: "vii",
    nombre: "Maule",
    comunas: ["Talca", "Curicó", "Linares", "Cauquenes", "Molina", "Parral", "San Clemente", "San Javier", "Constitución", "Teno"],
  },
  {
    id: "viii",
    nombre: "Biobío",
    comunas: ["Concepción", "Talcahuano", "Chillán", "Los Ángeles", "Coronel", "San Pedro de la Paz", "Hualpén", "Penco", "Lota", "Arauco"],
  },
  {
    id: "ix",
    nombre: "La Araucanía",
    comunas: ["Temuco", "Villarrica", "Angol", "Pucón", "Carahue", "Lautaro", "Pitrufquén", "Collipulli", "Traiguén", " Freire"],
  },
  {
    id: "x",
    nombre: "Los Lagos",
    comunas: ["Puerto Montt", "Osorno", "Valdivia", "Castro", "Ancud", "Quellón", "Frutillar", "Puerto Varas", "Los Muermos"],
  },
  {
    id: "xi",
    nombre: "Aysén del General Carlos Ibáñez del Campo",
    comunas: ["Coyhaique", "Puerto Aysén", "Chile Chico", "Guaitecas", "Lago Verde", "Río Ibáñez", "Cisnes"],
  },
  {
    id: "xii",
    nombre: "Magallanes y de la Antártica Chilena",
    comunas: ["Punta Arenas", "Puerto Natales", "Porvenir", "Cabo de Hornos", "Torres del Paine", "San Gregorio", "Laguna Blanca"],
  },
  {
    id: "xiv",
    nombre: "Los Ríos",
    comunas: ["Valdivia", "La Unión", "Río Bueno", "Panguipulli", "Lanco", "Los Lagos", "Mafil", "Paillaco", "Futrono", "Lago Ranco"],
  },
  {
    id: "xv",
    nombre: "Arica y Parinacota",
    comunas: ["Arica", "Putre", "Camarones", "General Lagos"],
  },
];

export const PREVISIONS = [
  { id: "fonasa", label: "Fonasa" },
  { id: "isapre", label: "Isapre" },
  { id: "particular", label: "Particular" },
];

export const MODALIDADES = [
  { id: "online", label: "Online" },
  { id: "presencial", label: "Presencial" },
  { id: "domicilio", label: "Domicilio" },
];

export const getComunasByRegion = (regionId: string): string[] => {
  const region = CHILE_REGIONS.find((r) => r.id === regionId);
  return region ? region.comunas : [];
};

export const getRegionNombre = (regionId: string): string => {
  const region = CHILE_REGIONS.find((r) => r.id === regionId);
  return region ? region.nombre : "";
};
