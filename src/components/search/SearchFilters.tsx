'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const REGIONS_COMUNAS: Record<string, string[]> = {
    'Arica y Parinacota': ['Arica', 'Camarones', 'Putre', 'General Lagos'],
    'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'],
    'Antofagasta': ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'],
    'Atacama': ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco'],
    'Coquimbo': ['La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado'],
    'Valparaíso': ['Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Viña del Mar', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada', 'San Esteban', 'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Quillota', 'Calera', 'Hijuelas', 'La Cruz', 'Nogales', 'San Antonio', 'Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llaillay', 'Panquehue', 'Putaendo', 'Santa María', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana'],
    'Región Metropolitana': ['Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Tiltil', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor'],
    "O'Higgins": ['Rancagua', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí', 'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo', 'Requínoa', 'San Vicente', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue', 'Navidad', 'Paredones', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua', 'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz'],
    'Maule': ['Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas'],
    'Ñuble': ['Chillán', 'Bulnes', 'Cobquecura', 'Coelemu', 'Coihueco', 'Chillán Viejo', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'],
    'Biobío': ['Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío'],
    'La Araucanía': ['Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria'],
    'Los Ríos': ['Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno'],
    'Los Lagos': ['Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Ancud', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena'],
    'Aysén': ['Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Cochrane', "O'Higgins", 'Tortel', 'Chile Chico', 'Río Ibáñez'],
    'Magallanes': ['Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos', 'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine'],
}

const modalityLabels: Record<string, string> = {
    ONLINE: 'Solo online',
    IN_PERSON: 'Solo presencial',
    BOTH: 'Ambas modalidades',
}

interface SearchFiltersProps {
    selectedRegion: string
    selectedComuna: string
    selectedModalidad: string
}

export function SearchFilters({
    selectedRegion,
    selectedComuna,
    selectedModalidad,
}: SearchFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString())

            Object.entries(updates).forEach(([name, value]) => {
                if (value) {
                    params.set(name, value)
                } else {
                    params.delete(name)
                }
            })

            return params.toString()
        },
        [searchParams]
    )

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const region = e.target.value
        // Reset comuna when region changes
        const queryString = createQueryString({ region, comuna: '' })
        router.push(`${pathname}?${queryString}`)
    }

    const handleComunaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const comuna = e.target.value
        const queryString = createQueryString({ comuna })
        router.push(`${pathname}?${queryString}`)
    }

    const handleModalidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const modalidad = e.target.value
        const queryString = createQueryString({ modalidad })
        router.push(`${pathname}?${queryString}`)
    }

    const regions = Object.keys(REGIONS_COMUNAS).sort()
    const comunas = selectedRegion ? REGIONS_COMUNAS[selectedRegion] || [] : []

    return (
        <div className="flex gap-4 flex-wrap items-center">
            {/* Region Filter */}
            <select
                name="region"
                className="input w-auto min-w-[180px]"
                value={selectedRegion}
                onChange={handleRegionChange}
            >
                <option value="">Todas las regiones</option>
                {regions.map((region) => (
                    <option key={region} value={region}>
                        {region}
                    </option>
                ))}
            </select>

            {/* Comuna Filter */}
            <select
                name="comuna"
                className="input w-auto min-w-[180px]"
                value={selectedComuna}
                onChange={handleComunaChange}
                disabled={!selectedRegion}
            >
                <option value="">Todas las comunas</option>
                {comunas.map((comuna) => (
                    <option key={comuna} value={comuna}>
                        {comuna}
                    </option>
                ))}
            </select>

            {/* Modality Filter */}
            <select
                name="modalidad"
                className="input w-auto"
                value={selectedModalidad}
                onChange={handleModalidadChange}
            >
                <option value="">Cualquier modalidad</option>
                {Object.entries(modalityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    )
}
