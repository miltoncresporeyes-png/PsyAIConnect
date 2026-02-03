# 🏥 Sistema de Matching por Previsión - Arquitectura Técnica

## 📋 Índice
1. [Esquema de Base de Datos](#esquema-de-base-de-datos)
2. [Lógica de Matching](#lógica-de-matching)
3. [Endpoints de API](#endpoints-de-api)
4. [Matriz de Validación](#matriz-de-validación)
5. [Flujos de Casos de Uso](#flujos-de-casos-de-uso)

---

## 1️⃣ Esquema de Base de Datos

### 1.1 Tablas Principales

```prisma
// ============================================
// SISTEMA DE PREVISIÓN
// ============================================

// Catálogo de Isapres en Chile
model Isapre {
  id                  String                    @id @default(cuid())
  code                String                    @unique // Código oficial (ej: "COL" para Colmena)
  name                String                    // "Colmena Golden Cross"
  legalName           String                    // Razón social oficial
  rut                 String                    @unique
  isActive            Boolean                   @default(true)
  createdAt           DateTime                  @default(now())
  updatedAt           DateTime                  @updatedAt
  
  // Relaciones
  professionalConvenios ProfessionalIsapreConvenio[]
  patientCoverages    PatientCoverage[]
  
  @@index([code])
  @@index([isActive])
}

// Planes de Fonasa
model FonasaTramo {
  id                  String                    @id @default(cuid())
  tramo               String                    @unique // "A", "B", "C", "D"
  name                String                    // "Grupo A - Indigentes"
  description         String?
  copaymentPercentage Int                       // % de copago
  isActive            Boolean                   @default(true)
  
  // Relaciones
  professionalAcceptance ProfessionalFonasaAcceptance[]
  patientCoverages    PatientCoverage[]
}

// ============================================
// CONVENIOS DEL PROFESIONAL
// ============================================

// Convenios con Isapres que acepta el profesional
model ProfessionalIsapreConvenio {
  id                  String                    @id @default(cuid())
  professionalId      String
  isapreId            String
  
  // Detalles del convenio
  acceptsBono         Boolean                   @default(false) // Acepta Bono IMED
  acceptsReembolso    Boolean                   @default(false) // Acepta reembolso
  
  // Información del convenio
  convenioCode        String?                   // Código del convenio
  prestacionCode      String?                   // Código de prestación
  bonoAmount          Int?                      // Monto del bono (en pesos)
  copaymentAmount     Int?                      // Copago del paciente
  
  // Configuración de reembolso
  reembolsoPercentage Int?                      // % de reembolso (ej: 70%)
  
  // Control
  isActive            Boolean                   @default(true)
  validFrom           DateTime?
  validUntil          DateTime?
  notes               String?                   // Notas internas
  
  createdAt           DateTime                  @default(now())
  updatedAt           DateTime                  @updatedAt
  
  // Relaciones
  professional        Professional              @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  isapre              Isapre                    @relation(fields: [isapreId], references: [id])
  
  @@unique([professionalId, isapreId])
  @@index([professionalId])
  @@index([isapreId])
  @@index([isActive])
}

// Aceptación de Fonasa por el profesional
model ProfessionalFonasaAcceptance {
  id                  String                    @id @default(cuid())
  professionalId      String
  fonasaTramoId       String
  
  // Configuración
  acceptsMLE          Boolean                   @default(false) // Acepta Modalidad Libre Elección
  acceptsBonoArancel  Boolean                   @default(false) // Acepta Bono Nivel 1, 2, 3
  
  // Detalles financieros
  bonoLevel           String?                   // "NIVEL_1", "NIVEL_2", "NIVEL_3"
  bonoAmount          Int?                      // Monto del bono
  copaymentPercentage Int?                      // % de copago del paciente
  
  isActive            Boolean                   @default(true)
  notes               String?
  
  createdAt           DateTime                  @default(now())
  updatedAt           DateTime                  @updatedAt
  
  // Relaciones
  professional        Professional              @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  fonasaTramo         FonasaTramo               @relation(fields: [fonasaTramoId], references: [id])
  
  @@unique([professionalId, fonasaTramoId])
  @@index([professionalId])
  @@index([fonasaTramoId])
}

// ============================================
// COBERTURA DEL PACIENTE
// ============================================

model PatientCoverage {
  id                  String                    @id @default(cuid())
  patientProfileId    String                    @unique
  
  // Tipo de previsión
  healthSystem        HealthSystem              // FONASA, ISAPRE, PRIVATE, NONE
  
  // Datos de Isapre
  isapreId            String?
  isapre              Isapre?                   @relation(fields: [isapreId], references: [id])
  isaprePlan          String?                   // Nombre del plan
  hasBonoIMED         Boolean                   @default(false)
  
  // Datos de Fonasa
  fonasaTramoId       String?
  fonasaTramo         FonasaTramo?              @relation(fields: [fonasaTramoId], references: [id])
  
  // Documentación
  credentialNumber    String?                   // N° de credencial
  validUntil          DateTime?
  
  // Verificación
  isVerified          Boolean                   @default(false)
  verifiedAt          DateTime?
  verificationMethod  String?                   // "MANUAL", "API", "DOCUMENT"
  
  createdAt           DateTime                  @default(now())
  updatedAt           DateTime                  @updatedAt
  
  // Relaciones
  patientProfile      PatientProfile            @relation(fields: [patientProfileId], references: [id], onDelete: Cascade)
  
  @@index([isapreId])
  @@index([fonasaTramoId])
  @@index([healthSystem])
}
```

### 1.2 Enums Necesarios

```prisma
enum HealthSystem {
  FONASA
  ISAPRE
  PRIVATE
  NONE
}

enum FonasaBonoLevel {
  NIVEL_1
  NIVEL_2
  NIVEL_3
}

enum PaymentMethod {
  BONO_IMED      // Bono electrónico Isapre
  REEMBOLSO      // Reembolso manual posterior
  BONO_FONASA    // Bono Fonasa
  COPAGO         // Copago directo
  PRIVATE        // Pago particular completo
}
```

---

## 2️⃣ Lógica de Matching

### 2.1 Algoritmo de Scoring

```python
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class PatientPreference:
    patient_id: str
    health_system: str  # "FONASA", "ISAPRE", "PRIVATE", "NONE"
    isapre_id: Optional[str] = None
    fonasa_tramo_id: Optional[str] = None
    has_bono_imed: bool = False
    max_copayment: Optional[int] = None
    specialties: List[str] = None
    modality: str = "BOTH"  # "ONLINE", "IN_PERSON", "BOTH"

@dataclass
class ProfessionalMatch:
    professional_id: str
    name: str
    score: float  # 0-100
    financial_compatibility: str  # "PERFECT", "GOOD", "PARTIAL", "LOW"
    payment_method: str
    estimated_cost: int
    copayment: int
    coverage_details: Dict
    
class MatchingEngine:
    """
    Motor de matching que prioriza compatibilidad financiera
    """
    
    # Pesos del algoritmo de scoring
    WEIGHTS = {
        'financial_match': 0.40,      # 40% - Compatibilidad financiera
        'specialty_match': 0.30,      # 30% - Especialidad
        'location_match': 0.15,       # 15% - Ubicación
        'rating': 0.10,               # 10% - Calificación
        'availability': 0.05,         # 5% - Disponibilidad
    }
    
    def match_professionals(
        self, 
        patient_pref: PatientPreference,
        professionals: List[Dict]
    ) -> List[ProfessionalMatch]:
        """
        Encuentra los mejores matches priorizando compatibilidad financiera
        """
        matches = []
        
        for prof in professionals:
            score = self._calculate_score(patient_pref, prof)
            financial_comp = self._get_financial_compatibility(patient_pref, prof)
            payment_details = self._calculate_payment_details(patient_pref, prof)
            
            match = ProfessionalMatch(
                professional_id=prof['id'],
                name=prof['name'],
                score=score,
                financial_compatibility=financial_comp['level'],
                payment_method=financial_comp['payment_method'],
                estimated_cost=payment_details['total_cost'],
                copayment=payment_details['copayment'],
                coverage_details=financial_comp
            )
            
            matches.append(match)
        
        # Ordenar por score descendente
        matches.sort(key=lambda x: x.score, reverse=True)
        
        return matches
    
    def _calculate_score(
        self, 
        patient: PatientPreference, 
        professional: Dict
    ) -> float:
        """
        Calcula el score total del match
        """
        scores = {}
        
        # 1. Score Financiero (40%)
        scores['financial'] = self._financial_score(patient, professional)
        
        # 2. Score de Especialidad (30%)
        scores['specialty'] = self._specialty_score(patient, professional)
        
        # 3. Score de Ubicación (15%)
        scores['location'] = self._location_score(patient, professional)
        
        # 4. Score de Rating (10%)
        scores['rating'] = professional.get('rating', 4.0) * 20  # Escala a 100
        
        # 5. Score de Disponibilidad (5%)
        scores['availability'] = self._availability_score(professional)
        
        # Cálculo ponderado
        total_score = sum(
            scores[key] * self.WEIGHTS[f'{key}_match'] 
            if key != 'rating' and key != 'availability'
            else scores[key] * self.WEIGHTS[key]
            for key in scores.keys()
        )
        
        return min(100, total_score)
    
    def _financial_score(
        self, 
        patient: PatientPreference, 
        professional: Dict
    ) -> float:
        """
        Score basado en compatibilidad financiera
        
        Scoring:
        - 100 pts: Bono IMED/Fonasa completo (mínimo copago)
        - 80 pts: Reembolso alto (>70%)
        - 60 pts: Reembolso medio (40-70%)
        - 40 pts: Reembolso bajo (<40%)
        - 20 pts: Sin cobertura pero precio razonable
        - 0 pts: Sin compatibilidad
        """
        
        # CASO 1: Paciente con Isapre
        if patient.health_system == "ISAPRE" and patient.isapre_id:
            convenios = professional.get('isapre_convenios', [])
            
            # Buscar convenio con la Isapre del paciente
            patient_convenio = next(
                (c for c in convenios if c['isapre_id'] == patient.isapre_id),
                None
            )
            
            if patient_convenio:
                # Acepta Bono IMED
                if patient_convenio['accepts_bono'] and patient.has_bono_imed:
                    copayment_ratio = patient_convenio['copayment_amount'] / professional['session_price']
                    if copayment_ratio < 0.1:  # Copago < 10%
                        return 100
                    elif copayment_ratio < 0.3:  # Copago < 30%
                        return 90
                    else:
                        return 80
                
                # Acepta Reembolso
                if patient_convenio['accepts_reembolso']:
                    reembolso_pct = patient_convenio['reembolso_percentage']
                    if reembolso_pct >= 70:
                        return 80
                    elif reembolso_pct >= 40:
                        return 60
                    else:
                        return 40
            
            return 20  # Isapre pero sin convenio
        
        # CASO 2: Paciente con Fonasa
        elif patient.health_system == "FONASA" and patient.fonasa_tramo_id:
            fonasa_acceptance = professional.get('fonasa_acceptance', [])
            
            patient_tramo = next(
                (f for f in fonasa_acceptance if f['fonasa_tramo_id'] == patient.fonasa_tramo_id),
                None
            )
            
            if patient_tramo:
                # Acepta Bono Fonasa
                if patient_tramo['accepts_bono_arancel']:
                    bono_amount = patient_tramo['bono_amount']
                    coverage_ratio = bono_amount / professional['session_price']
                    
                    if coverage_ratio >= 0.8:  # Cubre 80%+
                        return 100
                    elif coverage_ratio >= 0.5:  # Cubre 50%+
                        return 85
                    else:
                        return 70
                
                # MLE (Modalidad Libre Elección)
                if patient_tramo['accepts_mle']:
                    return 60
            
            return 30  # Fonasa pero sin aceptación
        
        # CASO 3: Pago particular
        elif patient.health_system == "PRIVATE":
            # Score basado en precio razonable
            price = professional['session_price']
            
            if price <= 30000:
                return 70
            elif price <= 50000:
                return 50
            else:
                return 30
        
        # CASO 4: Sin previsión
        return 20
    
    def _specialty_score(
        self, 
        patient: PatientPreference, 
        professional: Dict
    ) -> float:
        """
        Score basado en match de especialidad
        """
        if not patient.specialties:
            return 50  # Neutral si no hay preferencia
        
        prof_specialties = set(professional.get('specialties', []))
        patient_specialties = set(patient.specialties)
        
        # Intersección de especialidades
        match_count = len(prof_specialties & patient_specialties)
        
        if match_count >= 2:
            return 100
        elif match_count == 1:
            return 80
        else:
            return 30
    
    def _location_score(
        self, 
        patient: PatientPreference, 
        professional: Dict
    ) -> float:
        """
        Score basado en ubicación y modalidad
        """
        # Si acepta online, siempre es compatible
        if professional['modality'] in ['ONLINE', 'BOTH']:
            if patient.modality in ['ONLINE', 'BOTH']:
                return 100
        
        # TODO: Implementar cálculo de distancia geográfica
        # Por ahora, compatibilidad básica
        return 50
    
    def _availability_score(self, professional: Dict) -> float:
        """
        Score basado en disponibilidad
        """
        # Verificar si tiene slots disponibles en próximos 7 días
        available_slots = professional.get('available_slots_7d', 0)
        
        if available_slots >= 10:
            return 100
        elif available_slots >= 5:
            return 70
        elif available_slots >= 1:
            return 40
        else:
            return 10
    
    def _get_financial_compatibility(
        self, 
        patient: PatientPreference, 
        professional: Dict
    ) -> Dict:
        """
        Analiza la compatibilidad financiera y retorna detalles
        """
        result = {
            'level': 'LOW',  # PERFECT, GOOD, PARTIAL, LOW
            'payment_method': 'PRIVATE',
            'coverage_percentage': 0,
            'requires_upfront_payment': True,
            'estimated_reimbursement_days': None,
        }
        
        # Lógica de Isapre
        if patient.health_system == "ISAPRE" and patient.isapre_id:
            convenios = professional.get('isapre_convenios', [])
            convenio = next(
                (c for c in convenios if c['isapre_id'] == patient.isapre_id),
                None
            )
            
            if convenio:
                if convenio['accepts_bono'] and patient.has_bono_imed:
                    result['level'] = 'PERFECT'
                    result['payment_method'] = 'BONO_IMED'
                    result['requires_upfront_payment'] = False
                    result['coverage_percentage'] = int(
                        (1 - convenio['copayment_amount'] / professional['session_price']) * 100
                    )
                elif convenio['accepts_reembolso']:
                    reembolso_pct = convenio['reembolso_percentage']
                    result['level'] = 'GOOD' if reembolso_pct >= 60 else 'PARTIAL'
                    result['payment_method'] = 'REEMBOLSO'
                    result['coverage_percentage'] = reembolso_pct
                    result['estimated_reimbursement_days'] = 15  # Promedio
        
        # Lógica de Fonasa
        elif patient.health_system == "FONASA" and patient.fonasa_tramo_id:
            fonasa = professional.get('fonasa_acceptance', [])
            tramo = next(
                (f for f in fonasa if f['fonasa_tramo_id'] == patient.fonasa_tramo_id),
                None
            )
            
            if tramo:
                if tramo['accepts_bono_arancel']:
                    result['level'] = 'PERFECT'
                    result['payment_method'] = 'BONO_FONASA'
                    result['requires_upfront_payment'] = False
                    result['coverage_percentage'] = int(
                        (tramo['bono_amount'] / professional['session_price']) * 100
                    )
                elif tramo['accepts_mle']:
                    result['level'] = 'GOOD'
                    result['payment_method'] = 'COPAGO'
                    result['coverage_percentage'] = 50  # Aproximado
        
        return result
    
    def _calculate_payment_details(
        self, 
        patient: PatientPreference, 
        professional: Dict
    ) -> Dict:
        """
        Calcula los detalles de pago para el paciente
        """
        session_price = professional['session_price']
        
        compatibility = self._get_financial_compatibility(patient, professional)
        
        if compatibility['payment_method'] == 'BONO_IMED':
            # Buscar el convenio
            convenios = professional.get('isapre_convenios', [])
            convenio = next(
                (c for c in convenios if c['isapre_id'] == patient.isapre_id),
                None
            )
            copayment = convenio['copayment_amount'] if convenio else session_price
            
            return {
                'total_cost': session_price,
                'copayment': copayment,
                'covered_by_insurance': session_price - copayment,
                'payment_method': 'BONO_IMED'
            }
        
        elif compatibility['payment_method'] == 'REEMBOLSO':
            reembolso_amount = int(
                session_price * compatibility['coverage_percentage'] / 100
            )
            
            return {
                'total_cost': session_price,
                'copayment': session_price,  # Paga todo inicialmente
                'estimated_reimbursement': reembolso_amount,
                'out_of_pocket': session_price - reembolso_amount,
                'payment_method': 'REEMBOLSO'
            }
        
        elif compatibility['payment_method'] == 'BONO_FONASA':
            fonasa = professional.get('fonasa_acceptance', [])
            tramo = next(
                (f for f in fonasa if f['fonasa_tramo_id'] == patient.fonasa_tramo_id),
                None
            )
            bono_amount = tramo['bono_amount'] if tramo else 0
            copayment = max(0, session_price - bono_amount)
            
            return {
                'total_cost': session_price,
                'copayment': copayment,
                'covered_by_bonos': bono_amount,
                'payment_method': 'BONO_FONASA'
            }
        
        else:  # PRIVATE
            return {
                'total_cost': session_price,
                'copayment': session_price,
                'payment_method': 'PRIVATE'
            }
```

---

## 3️⃣ Endpoints de API

### 3.1 Búsqueda con Matching Financiero

```typescript
// GET /api/professionals/search-with-coverage
interface SearchWithCoverageRequest {
  // Filtros clásicos
  specialties?: string[]
  modality?: 'ONLINE' | 'IN_PERSON' | 'BOTH'
  region?: string
  comuna?: string
  
  // Filtros financieros
  healthSystem?: 'FONASA' | 'ISAPRE' | 'PRIVATE' | 'NONE'
  isapreId?: string
  fonasaTramoId?: string
  hasBonoIMED?: boolean
  maxCopayment?: number
  
  // Paginación
  page?: number
  limit?: number
}

interface SearchWithCoverageResponse {
  professionals: Array<{
    id: string
    name: string
    profileImage: string
    specialties: string[]
    rating: number
    sessionPrice: number
    
    // Información de matching
    matchScore: number  // 0-100
    financialCompatibility: 'PERFECT' | 'GOOD' | 'PARTIAL' | 'LOW'
    
    // Detalles de pago
    paymentMethod: string
    estimatedCost: number
    copayment: number
    coveragePercentage: number
    
    // Badges visuales
    badges: string[]  // ["BONO_IMED", "REEMBOLSO_70", "FONASA_NIVEL_2"]
  }>
  
  meta: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
  
  filters: {
    availableIsapres: Array<{ id: string, name: string }>
    availableFonasaTramos: Array<{ id: string, tramo: string }>
  }
}
```

### 3.2 Configuración de Convenios (Profesional)

```typescript
// POST /api/professional/coverage-settings/isapre
interface AddIsapreConvenioRequest {
  isapreId: string
  acceptsBono: boolean
  acceptsReembolso: boolean
  convenioCode?: string
  prestacionCode?: string
  bonoAmount?: number
  copaymentAmount?: number
  reembolsoPercentage?: number
  validFrom?: string  // ISO date
  validUntil?: string
  notes?: string
}

// POST /api/professional/coverage-settings/fonasa
interface AddFonasaAcceptanceRequest {
  fonasaTramoId: string
  acceptsMLE: boolean
  acceptsBonoArancel: boolean
  bonoLevel?: 'NIVEL_1' | 'NIVEL_2' | 'NIVEL_3'
  bonoAmount?: number
  copaymentPercentage?: number
  notes?: string
}

// GET /api/professional/coverage-settings
interface GetCoverageSettingsResponse {
  isapreConvenios: Array<{
    id: string
    isapre: { id: string, name: string, code: string }
    acceptsBono: boolean
    acceptsReembolso: boolean
    bonoAmount?: number
    copaymentAmount?: number
    reembolsoPercentage?: number
    isActive: boolean
  }>
  
  fonasaAcceptance: Array<{
    id: string
    fonasaTramo: { id: string, tramo: string, name: string }
    acceptsMLE: boolean
    acceptsBonoArancel: boolean
    bonoLevel?: string
    bonoAmount?: number
    isActive: boolean
  }>
}
```

### 3.3 Configuración de Cobertura (Paciente)

```typescript
// POST /api/patient/coverage
interface UpdatePatientCoverageRequest {
  healthSystem: 'FONASA' | 'ISAPRE' | 'PRIVATE' | 'NONE'
  
  // Si es Isapre
  isapreId?: string
  isaprePlan?: string
  hasBonoIMED?: boolean
  credentialNumber?: string
  
  // Si es Fonasa
  fonasaTramoId?: string
  
  // Validez
  validUntil?: string
}

// GET /api/patient/coverage
interface GetPatientCoverageResponse {
  healthSystem: string
  isapre?: {
    id: string
    name: string
    code: string
    plan: string
    hasBonoIMED: boolean
  }
  fonasaTramo?: {
    id: string
    tramo: string
    name: string
  }
  isVerified: boolean
  verifiedAt?: string
}
```

---

## 4️⃣ Matriz de Validación de Errores

| Código | Tipo | Descripción | Acción del Sistema | Mensaje al Usuario |
|--------|------|-------------|-------------------|-------------------|
| `COV001` | Validación | Isapre no encontrada | Return 400 | "La Isapre seleccionada no existe" |
| `COV002` | Validación | Tramo Fonasa inválido | Return 400 | "El tramo de Fonasa es inválido" |
| `COV003` | Negocio | Convenio duplicado | Return 409 | "Ya existe un convenio con esta Isapre" |
| `COV004` | Negocio | Monto de bono mayor al precio | Return 400 | "El monto del bono no puede superar el precio de sesión" |
| `COV005` | Negocio | Porcentaje de reembolso inválido | Return 400 | "El porcentaje debe estar entre 0 y 100" |
| `COV006` | Autorización | Profesional no verificado | Return 403 | "Debes verificar tu identidad para agregar convenios" |
| `COV007` | Datos | Cobertura del paciente expirada | Warning | "Tu cobertura ha expirado. Actualiza tus datos" |
| `COV008` | Negocio | Sin convenios disponibles | Return 200 (vacío) | "No encontramos profesionales con tu cobertura. Ver todos" |
| `COV009` | Validación | Credencial inválida | Return 400 | "Formato de credencial inválido" |
| `COV010` | Sistema | Error consulta matching | Return 500 | "Error temporal. Intenta nuevamente" |

---

## 5️⃣ Flujos de Casos de Uso

### 5.1 Flujo: Paciente busca profesional con su Isapre

```
1. Paciente ingresa sus datos de Isapre en su perfil
   - Selecciona Isapre (ej: Colmena)
   - Indica si tiene Bono IMED
   - Ingresa N° de credencial

2. Sistema valida y guarda en PatientCoverage

3. Paciente busca profesionales
   - Sistema ejecuta matching algorithm
   - Prioriza profesionales con convenio Colmena
   
4. Resultados ordenados por score
   - Badge: "Acepta tu Bono IMED" (si aplica)
   - Muestra copago estimado
   - Indica método de pago

5. Paciente selecciona profesional
   - Ve detalles de cobertura
   - Confirma si desea usar bono o pago particular
```

### 5.2 Flujo: Profesional configura convenios

```
1. Profesional accede a "Configuración de Pagos"

2. Agrega convenio con Isapre
   - Selecciona Isapre
   - Indica si acepta Bono IMED
   - Ingresa código de convenio y prestación
   - Define monto de bono y copago
   - Guarda

3. Sistema valida:
   - Convenio no duplicado
   - Montos coherentes
   - Profesional verificado

4. Confirma y activa convenio

5. Profesionales con este convenio aparecen
   en búsquedas de pacientes de esa Isapre
```

---

## 📈 KPIs y Métricas

### Métricas de Producto
- **Conversion Rate by Coverage**: % de conversión por tipo de cobertura
- **Average Copayment**: Copago promedio por tipo de previsión
- **Coverage Match Rate**: % de búsquedas con match perfecto

### Métricas de Negocio
- **Revenue by Payment Method**: Ingresos segmentados por método de pago
- **Professional Coverage Adoption**: % de profesionales con convenios configurados
- **Patient Coverage Completion**: % de pacientes con cobertura verificada

---

## 🔐 Consideraciones de Seguridad

1. **Datos sensibles**: Credenciales de previsión encriptadas en DB
2. **Verificación**: Validar credenciales contra APIs de Isapres (futuro)
3. **Auditoría**: Log de cambios en convenios
4. **GDPR/LOPD**: Consentimiento explícito para uso de datos de salud

---

## 🚀 Roadmap de Implementación

### Fase 1 (MVP)
- ✅ Modelos de BD
- ✅ Algoritmo de matching básico
- ✅ Endpoints CRUD de convenios
- ✅ UI de configuración profesional

### Fase 2 (Optimización)
- 🔄 Integración con APIs de Isapres (validación real-time)
- 🔄 Cache de resultados de matching
- 🔄 A/B testing de algoritmo de scoring

### Fase 3 (Avanzado)
- 🔮 ML para predecir mejor compatibilidad
- 🔮 Integración con sistemas hospitalarios
- 🔮 Pre-autorización automática de bonos

---

**Autor**: CTO PsyConnect  
**Fecha**: Enero 2026  
**Versión**: 1.0
