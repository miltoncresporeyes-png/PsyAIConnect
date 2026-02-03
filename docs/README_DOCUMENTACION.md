# 📚 Documentación Técnica PsyConnect - Índice General

## 🎯 Visión General

Este conjunto de documentos contiene la **arquitectura técnica completa** de los dos pilares estratégicos de PsyConnect:

1. **Sistema de Matching por Previsión de Salud**
2. **Automatización de Boletas de Honorarios del SII**

---

## 📖 Documentos Disponibles

### 1️⃣ **ARQUITECTURA_MATCHING_PREVISION.md**
**Propósito**: Diseño completo del sistema de matching financiero

**Contenido**:
- ✅ Esquema completo de base de datos (Isapre, Fonasa, PatientCoverage, etc.)
- ✅ Algoritmo de scoring con código Python funcional
- ✅ Pesos del matching (40% financiero, 30% especialidad, etc.)
- ✅ Endpoints de API con TypeScript interfaces
- ✅ Matriz de validación de errores
- ✅ Casos de uso y flujos de negocio
- ✅ KPIs y métricas de producto

**Para quién**: Desarrolladores Backend, Arquitectos de Software

---

### 2️⃣ **ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md**
**Propósito**: Diseño del sistema de emisión automática de boletas del SII

**Contenido**:
- ✅ Marco legal y fiscal chileno 2026
- ✅ Cálculo de retenciones (15.25%)
- ✅ Esquema de BD (Invoice, Certificate, CreditNote, etc.)
- ✅ Arquitectura de integración con SimpleDTE
- ✅ Flujo automático post-pago
- ✅ Manejo seguro de certificados digitales (AES-256-GCM)
- ✅ Worker de emisión en background
- ✅ Matriz de errores y reintentos
- ✅ Auditoría completa (SIIIntegrationLog)

**Para quién**: Desarrolladores Backend, DevOps, Compliance

---

### 3️⃣ **RESUMEN_EJECUTIVO_ARQUITECTURA.md**
**Propósito**: Visión consolidada para stakeholders

**Contenido**:
- ✅ Propuesta de valor (pacientes y profesionales)
- ✅ Diagrama de arquitectura de alto nivel
- ✅ Componentes principales explicados
- ✅ Plan de implementación por fases (9 semanas)
- ✅ Ventajas competitivas vs. competencia
- ✅ ROI calculado para profesionales
- ✅ Riesgos y mitigaciones
- ✅ Próximos pasos concretos

**Para quién**: CTO, CEO, Product Manager, Inversionistas

---

### 4️⃣ **CODIGO_EJEMPLOS_QUICK_START.md**
**Propósito**: Código funcional listo para implementar

**Contenido**:
- ✅ Endpoint completo de búsqueda con cobertura
- ✅ Funciones de scoring (financiero, especialidad)
- ✅ Trigger de emisión post-pago
- ✅ Endpoint de listado de boletas
- ✅ Componente React de ProfessionalCard
- ✅ Dashboard de boletas para profesionales
- ✅ Todo con TypeScript types completos

**Para quién**: Desarrolladores Frontend/Backend (implementación inmediata)

---

### 5️⃣ **BETA_LAUNCH_IMPLEMENTATION.md**
**Propósito**: Guía de implementación del banner de lanzamiento Beta

**Contenido**:
- ✅ Componente de banner con contador regresivo
- ✅ API de captura de emails
- ✅ Templates de email para confirmaciones
- ✅ Integración con servicios de email (Resend, Formspree)
- ✅ Estrategia de growth hacking
- ✅ KPIs de conversión

**Para quién**: Marketing, Growth, Frontend Developers

---

## 🗂️ Estructura de Archivos

```
c:\workspace\PsyAI\docs\
├── ARQUITECTURA_MATCHING_PREVISION.md          (75 KB)
├── ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md  (82 KB)
├── RESUMEN_EJECUTIVO_ARQUITECTURA.md           (45 KB)
├── CODIGO_EJEMPLOS_QUICK_START.md              (38 KB)
├── BETA_LAUNCH_IMPLEMENTATION.md               (28 KB)
└── README_DOCUMENTACION.md                     (este archivo)
```

---

## 🚀 Roadmap de Implementación

### **Fase 1: Matching por Previsión** (3 semanas)

| Semana | Tareas | Documento de Referencia |
|--------|--------|------------------------|
| 1 | Crear modelos de BD (Isapre, Fonasa, etc.) | ARQUITECTURA_MATCHING_PREVISION.md |
| 1 | Ejecutar migraciones Prisma | ARQUITECTURA_MATCHING_PREVISION.md |
| 1 | Crear seeders con Isapres reales | CODIGO_EJEMPLOS_QUICK_START.md |
| 2 | Implementar algoritmo de matching | CODIGO_EJEMPLOS_QUICK_START.md |
| 2 | Crear endpoints de búsqueda | CODIGO_EJEMPLOS_QUICK_START.md |
| 2 | Testing unitario de scoring | ARQUITECTURA_MATCHING_PREVISION.md |
| 3 | UI de búsqueda con filtros | CODIGO_EJEMPLOS_QUICK_START.md |
| 3 | Cards con badges de cobertura | CODIGO_EJEMPLOS_QUICK_START.md |
| 3 | Config de convenios (profesional) | ARQUITECTURA_MATCHING_PREVISION.md |

### **Fase 2: Automatización de Boletas** (4 semanas)

| Semana | Tareas | Documento de Referencia |
|--------|--------|------------------------|
| 4 | Modelos de BD (Invoice, Certificate) | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 4 | Upload de certificados + encriptación | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 4 | Validación de certificados | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 5 | Integración con SimpleDTE | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 5 | Testing en sandbox | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 5 | Manejo de errores y reintentos | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 6 | Worker de emisión (Bull Queue) | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 6 | Trigger post-pago | CODIGO_EJEMPLOS_QUICK_START.md |
| 6 | Almacenamiento de PDFs | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 7 | Dashboard de boletas (UI) | CODIGO_EJEMPLOS_QUICK_START.md |
| 7 | Config fiscal profesional | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 7 | Testing E2E + Certificación | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |

### **Fase 3: Optimización y Lanzamiento** (2 semanas)

| Semana | Tareas | Documento de Referencia |
|--------|--------|------------------------|
| 8 | Cache de resultados matching | RESUMEN_EJECUTIVO_ARQUITECTURA.md |
| 8 | Optimización de índices BD | ARQUITECTURA_MATCHING_PREVISION.md |
| 8 | CDN para PDFs | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 9 | Monitoreo (Sentry, Datadog) | RESUMEN_EJECUTIVO_ARQUITECTURA.md |
| 9 | Alertas Slack | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| 9 | Deploy a producción | RESUMEN_EJECUTIVO_ARQUITECTURA.md |

---

## 🎨 Diagramas y Assets

### Diagrama de Arquitectura General
![Arquitectura](../artifacts/arquitectura_psyconnect_completa.png)

**Ubicación**: `c:\workspace\PsyAI\artifacts\arquitectura_psyconnect_completa.png`

**Descripción**: Diagrama visual que muestra:
- Capa de usuarios (Paciente/Profesional)
- Frontend (Next.js + React)
- Backend (API Routes)
- Base de datos (Prisma + PostgreSQL)
- Servicios externos (SimpleDTE, SII, Bull Queue)

---

## 📊 Datos Técnicos Clave

### Tecnologías Utilizadas

| Componente | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| Frontend | Next.js + React | 14.2.0 | UI/UX |
| Backend | Next.js API Routes | 14.2.0 | REST API |
| Base de Datos | Prisma + PostgreSQL | Latest | ORM + DB |
| Queue | Bull/BullMQ | Latest | Jobs async |
| Email | Resend | Latest | Confirmaciones |
| Boletas | SimpleDTE | API v2 | Emisión SII |
| Storage | AWS S3 | - | PDFs |
| Monitoring | Sentry + Datadog | - | Observabilidad |

### Cálculos Fiscales (Chile 2026)

```
Ejemplo: Sesión de $50,000

┌───────────────────────────────────────┐
│ Monto Bruto:           $50,000        │
│ Retención SII (15.25%): -$7,625       │
│ Monto Neto:             $42,375       │
│ Comisión PsyConnect (8%): -$4,000     │
│ LÍQUIDO PROFESIONAL:    $38,375       │
└───────────────────────────────────────┘
```

### Pesos del Algoritmo de Matching

```python
WEIGHTS = {
    'financial_match':  40%  # Compatibilidad financiera
    'specialty_match':  30%  # Match de especialidad
    'location_match':   15%  # Proximidad geográfica
    'rating':           10%  # Rating del profesional
    'availability':      5%  # Disponibilidad de agenda
}
```

---

## 🔐 Seguridad y Compliance

### Certificados Digitales
- **Encriptación**: AES-256-GCM
- **Storage**: Nunca en texto plano
- **Auditoría**: Todos los usos registrados
- **Expiración**: Alertas 30 días antes

### Datos Sensibles
- **RUT**: Validación con algoritmo DV
- **Credenciales Isapre**: Encriptadas en DB
- **PDFs**: S3 con pre-signed URLs (24h)

### Compliance
- ✅ Ley de Protección de Datos Personales (Ley 19.628)
- ✅ Normativa SII Chile
- ✅ Retención obligatoria 15.25%
- ✅ Auditoría 7 años

---

## 📈 Métricas y KPIs

### Sistema de Matching

| Métrica | Target | Documento |
|---------|--------|-----------|
| Perfect Match Rate | >60% | ARQUITECTURA_MATCHING_PREVISION.md |
| Avg Match Score | >75 | ARQUITECTURA_MATCHING_PREVISION.md |
| Conversion w/ Coverage | >25% | RESUMEN_EJECUTIVO_ARQUITECTURA.md |

### Sistema de Boletas

| Métrica | Target | Documento |
|---------|--------|-----------|
| Auto-Issue Success Rate | >95% | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| Avg Issue Time | <10s | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |
| Failure Rate | <2% | ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md |

---

## 🆘 Soporte y Contacto

### Para Desarrolladores

**Dudas técnicas**:
- Revisar `CODIGO_EJEMPLOS_QUICK_START.md` primero
- Check matriz de errores en cada documento
- Logs: `SIIIntegrationLog` table

**Issues comunes**:
- Certificado expirado → Alert automático 30 días antes
- Error SimpleDTE → Revise `ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md` sección de errores
- Matching sin resultados → Ajustar pesos en config

### Para Product/Negocio

**Decisiones de producto**:
- Ver `RESUMEN_EJECUTIVO_ARQUITECTURA.md`
- ROI y ventajas competitivas incluidas

**Onboarding profesionales**:
- Usar `BETA_LAUNCH_IMPLEMENTATION.md` para estrategia
- Templates de email incluidos

---

## 🎯 Decisiones de Arquitectura (ADR)

### ADR-001: SimpleDTE vs API SII Directa
**Decisión**: Usar SimpleDTE  
**Razón**: 
- Abstracción de complejidad del SII
- Manejo automático de folios
- Soporte técnico incluido
- Menor time-to-market

**Trade-off**: Costo mensual $19.990 vs gratis (API directa)

---

### ADR-002: Encriptación de Certificados
**Decisión**: AES-256-GCM con clave en env var  
**Razón**:
- Estándar de industria
- Authentication tag incluido
- Compatible con FIPS 140-2

**Alternativa rechazada**: Almacenar en AWS KMS (overhead innecesario para MVP)

---

### ADR-003: Pesos del Matching
**Decisión**: 40% financiero, 30% especialidad  
**Razón**:
- Priorizar ahorro del paciente (diferenciador)
- Especialidad sigue siendo crítica
- Validado con user research

**Ajustable**: Via config en BD (no hardcoded)

---

## 📚 Glosario

| Término | Definición |
|---------|-----------|
| **BHE** | Boleta de Honorarios Electrónica (Código SII: 41) |
| **Bono IMED** | Bono electrónico de Isapre para prestaciones médicas |
| **MLE** | Modalidad Libre Elección (Fonasa) |
| **DTE** | Documento Tributario Electrónico |
| **SimpleDTE** | Servicio intermediario para emitir documentos al SII |
| **Folio** | Número secuencial único de boleta asignado por el SII |
| **Retención** | Impuesto retenido (15.25% en 2026 sobre honorarios) |
| **Tramo Fonasa** | Clasificación socioeconómica (A, B, C, D) para beneficiarios Fonasa |
| **Copago** | Monto que paga el paciente después de cobertura |
| **Reembolso** | Devolución posterior de dinero por parte de Isapre |

---

## ✅ Checklist de Implementación

### Pre-requisitos
- [ ] Cuenta en SimpleDTE (sandbox + producción)
- [ ] Credenciales API SimpleDTE
- [ ] Base de datos PostgreSQL configurada
- [ ] Redis instalado (para Bull Queue)
- [ ] AWS S3 bucket creado
- [ ] Variables de entorno configuradas

### Matching por Previsión
- [ ] Modelos Prisma creados
- [ ] Migración ejecutada
- [ ] Seeders de Isapres corridos
- [ ] Endpoint de búsqueda implementado
- [ ] Tests unitarios pasando
- [ ] UI de filtros funcionando

### Boletas Automáticas
- [ ] Certificado de prueba cargado
- [ ] Encriptación testeada
- [ ] SimpleDTE sandbox conectado
- [ ] Worker de emisión funcionando
- [ ] Trigger post-pago integrado
- [ ] Dashboard de boletas implementado

---

## 🔄 Actualizaciones

### v1.0 - Enero 2026
- ✅ Arquitectura inicial completa
- ✅ Documentación técnica detallada
- ✅ Código de ejemplo funcional
- ✅ Diagramas de arquitectura

### v1.1 - Planificado (Febrero 2026)
- 🔄 Integración ML para matching predictivo
- 🔄 API pública de validación de Isapres
- 🔄 Dashboard analítico para admin

---

## 📞 Contacto del Equipo

**Arquitectura y Desarrollo**:
- CTO: Responsable de decisiones técnicas
- Tech Lead: Code reviews y mentoring
- Backend Team: Implementación API
- Frontend Team: UI/UX components

**Producto y Negocio**:
- Product Manager: Roadmap y priorización
- Growth Lead: Estrategia de lanzamiento
- Compliance: Legal y fiscal

---

**Última actualización**: Enero 2026  
**Versión documentación**: 1.0  
**Status**: ✅ Aprobado para implementación

---

¡Éxito con la implementación de PsyConnect! 🚀
