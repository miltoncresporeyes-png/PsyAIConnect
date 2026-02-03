# 📊 Resumen Ejecutivo - Arquitectura Técnica PsyConnect

## 🎯 Objetivo

Implementar dos pilares estratégicos que diferencian a PsyConnect en el mercado chileno de salud mental:

1. **Matching Financiero Inteligente**: Conectar pacientes con profesionales según cobertura de salud
2. **Automatización Fiscal**: Emisión automática de boletas del SII al confirmar pagos

---

## 💡 Propuesta de Valor

### Para Pacientes
- **Transparencia financiera**: Saber el copago real antes de agendar
- **Máximo ahorro**: Priorizar profesionales con mejor cobertura
- **Sin sorpresas**: Cálculo exacto de reembolsos y bonos

### Para Profesionales
- **Cero gestión fiscal**: Boletas automáticas sin ingresar al SII
- **Más pacientes**: Aparecer en búsquedas por cobertura
- **Compliance automático**: Retenciones calculadas correctamente

---

## 🏗️ Arquitectura de Alto Nivel

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js + React)                 │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │ Búsqueda con    │  │ Config. Fiscal  │  │ Dashboard    │  │
│  │ Filtro Cobertura│  │ Profesional     │  │ Boletas      │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              │ API REST
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                   BACKEND (Next.js API Routes)                │
│                                                                │
│  ┌────────────────────────┐    ┌──────────────────────────┐  │
│  │ Matching Engine        │    │ Invoice Automation       │  │
│  │ - Score Financiero     │    │ - Cálculo Retenciones    │  │
│  │ - Score Especialidad   │    │ - Firma Digital          │  │
│  │ - Priorización         │    │ - Emisión Automática     │  │
│  └────────────────────────┘    └──────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Prisma ORM + SQLite/PostgreSQL             │  │
│  │  - WaitlistEntry    - Invoice                          │  │
│  │  - PatientCoverage  - ProfessionalCertificate          │  │
│  │  - Isapre           - SIIIntegrationLog                │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────┬────────────────────┬─────────────────────┘
                    │                    │
        ┌───────────▼──────────┐  ┌──────▼──────────┐
        │  SimpleDTE API       │  │  Bull Queue     │
        │  - Emisión Boletas   │  │  - Jobs Auto    │
        │  - Descarga PDF      │  │  - Retry Logic  │
        └──────────────────────┘  └─────────────────┘
                    │
        ┌───────────▼──────────┐
        │  SII (Indirecto)     │
        │  - Validación        │
        │  - Registro Folios   │
        └──────────────────────┘
```

---

## 📦 Componentes Principales

### 1️⃣ Sistema de Matching por Previsión

#### Base de Datos

**Nuevas Tablas:**
- `Isapre` - Catálogo de Isapres de Chile (Colmena, Banmédica, Consalud, etc.)
- `FonasaTramo` - Tramos A, B, C, D con % de copago
- `ProfessionalIsapreConvenio` - Convenios que acepta cada profesional
- `ProfessionalFonasaAcceptance` - Aceptación de Fonasa por profesional
- `PatientCoverage` - Cobertura de salud del paciente

#### Algoritmo de Matching

**Pesos del Scoring:**
```python
financial_compatibility: 40%  # Lo más importante
specialty_match:         30%
location_proximity:      15%
professional_rating:     10%
availability:             5%
```

**Scoring Financiero:**
- 100 pts: Bono IMED/Fonasa con copago <10%
- 80 pts: Reembolso ≥70%
- 60 pts: Reembolso 40-70%
- 40 pts: Reembolso <40%
- 20 pts: Sin cobertura

#### Endpoints

```typescript
GET  /api/professionals/search-with-coverage
POST /api/professional/coverage-settings/isapre
POST /api/professional/coverage-settings/fonasa
GET  /api/professional/coverage-settings
POST /api/patient/coverage
GET  /api/patient/coverage
```

---

### 2️⃣ Automatización de Boletas SII

#### Base de Datos

**Nuevas Tablas:**
- `ProfessionalCertificate` - Certificados digitales encriptados
- `Invoice` - Boletas de honorarios
- `CreditNote` - Notas de crédito (anulaciones)
- `SIIIntegrationLog` - Auditoría de integraciones
- `ProfessionalTaxSettings` - Configuración fiscal

#### Flujo Automático

```
1. Pago Confirmado (Flow/Transbank)
   ↓
2. Trigger: onPaymentConfirmed()
   ↓
3. Calcular Montos
   - Bruto: $50,000
   - Retención 15.25%: $7,625
   - Neto: $42,375
   - Comisión 8%: $4,000
   - Líquido final: $38,375
   ↓
4. Crear Invoice (status: PENDING)
   ↓
5. Encolar Job en Bull Queue
   ↓
6. Worker Procesa Job
   - Firmar digitalmente
   - Emitir en SimpleDTE
   - Recibir Folio del SII
   ↓
7. Actualizar Invoice (status: ISSUED)
   ↓
8. Descargar PDF y almacenar en S3
   ↓
9. Enviar emails (profesional + paciente)
```

#### Integración SimpleDTE

**Servicio Recomendado:** SimpleDTE ($19.990/mes)

**Ventajas:**
- API REST moderna
- Soporte de boletas + facturas
- Sandbox para testing
- Webhooks de estado
- Genera PDF automáticamente

#### Endpoints

```typescript
POST   /api/professional/certificate/upload
GET    /api/professional/certificate
DELETE /api/professional/certificate/{id}
POST   /api/professional/tax-settings
GET    /api/professional/tax-settings
GET    /api/professional/invoices
POST   /api/professional/invoices/{id}/retry
POST   /api/professional/invoices/{id}/cancel
GET    /api/professional/invoices/{id}/pdf
```

---

## 🔐 Seguridad

### Certificados Digitales

```typescript
// Encriptación AES-256-GCM
- Clave maestra en variable de entorno
- Vector de inicialización aleatorio
- Authentication tag para integridad
- Hash SHA-256 para verificación

// Nunca exponer al frontend:
- Certificado .p12 completo
- Password del certificado
- Clave de encriptación
```

### Datos Sensibles

- **Credenciales de Isapre**: Encriptadas en DB
- **RUT**: Validado con algoritmo DV
- **Certificados**: AES-256-GCM + Storage seguro
- **PDFs**: S3 con pre-signed URLs (expiración 24h)

### Auditoría

- Tabla `SIIIntegrationLog` registra TODAS las interacciones
- Incluye: request, response, IP, user-agent, timestamp
- Retención: 7 años (cumplimiento SII)

---

## 📊 Matriz de Validación de Errores

### Sistema de Matching

| Código | Escenario | HTTP | Retry | Mensaje |
|--------|-----------|------|-------|---------|
| COV001 | Isapre no existe | 400 | No | "Isapre inválida" |
| COV002 | Tramo Fonasa inválido | 400 | No | "Tramo inválido" |
| COV003 | Convenio duplicado | 409 | No | "Ya existe convenio" |
| COV008 | Sin convenios | 200 | No | "Ver todos los profesionales" |

### Sistema de Boletas

| Código | Escenario | HTTP | Retry | Mensaje |
|--------|-----------|------|-------|---------|
| INV003 | Certificado expirado | 403 | No | "Actualiza certificado" |
| INV005 | Boleta duplicada | 409 | No | "Ya existe boleta" |
| INV006 | Error SII/SimpleDTE | 500 | 3x | "Reintentando..." |
| INV008 | Folios agotados | 500 | No | "Contactar SimpleDTE" |

---

## 💰 Cálculos Fiscales (Ejemplo)

### Sesión de $50,000

```
┌─────────────────────────────────────────────┐
│ CÁLCULO DE BOLETA                           │
├─────────────────────────────────────────────┤
│ Monto Bruto (Honorario):        $50,000     │
│ Retención 15.25% (SII):        -$ 7,625     │
│ ─────────────────────────────────────────   │
│ Monto Neto:                     $42,375     │
│                                              │
│ Comisión PsyConnect 8%:        -$ 4,000     │
│ ─────────────────────────────────────────   │
│ LÍQUIDO FINAL PROFESIONAL:      $38,375     │
└─────────────────────────────────────────────┘

Boleta emitida por: $50,000
IVA Retenido: $7,625 (pagado al SII)
Neto Profesional: $42,375
Comisión Plataforma: $4,000
```

---

## 📈 KPIs y Métricas

### Matching
- **Conversion Rate by Coverage**: % conversión Isapre vs Fonasa vs Particular
- **Avg Copayment**: Copago promedio por cobertura
- **Perfect Match Rate**: % búsquedas con score >90

### Boletas
- **Auto-Issue Success Rate**: Target >95%
- **Avg Issue Time**: Target <10 segundos
- **Failure Rate**: Target <2%
- **Certificate Expiry Alerts**: 30 días antes

---

## 🗓️ Plan de Implementación

### Fase 1: MVP Matching (3 semanas)

**Semana 1: Base de Datos**
- ✅ Crear modelos Prisma
- ✅ Migración BD
- ✅ Seeders con Isapres reales

**Semana 2: Backend**
- ✅ Algoritmo de matching
- ✅ Endpoints CRUD convenios
- ✅ Testing unitario

**Semana 3: Frontend**
- ✅ UI filtros de búsqueda
- ✅ Cards con badges cobertura
- ✅ Config convenios profesional

### Fase 2: Sistema Boletas (4 semanas)

**Semana 1: Certificados**
- ✅ Upload certificado
- ✅ Encriptación AES-256
- ✅ Validación fechas

**Semana 2: Integración SimpleDTE**
- ✅ Servicio de integración
- ✅ Testing en sandbox
- ✅ Manejo de errores

**Semana 3: Automatización**
- ✅ Queue con Bull
- ✅ Worker de emisión
- ✅ Trigger post-pago

**Semana 4: UI + Testing**
- ✅ Dashboard boletas
- ✅ Config fiscal
- ✅ Testing E2E
- ✅ Certificación producción

### Fase 3: Optimización (2 semanas)

**Optimización de Performance**
- Cache de resultados matching
- Índices de BD optimizados
- CDN para PDFs

**Monitoreo y Alertas**
- Sentry para errores
- Datadog/New Relic
- Slack notifications

---

## 💡 Ventajas Competitivas

### vs. Competidores

| Feature | PsyConnect | GetFlow | Bienesta | Agenda Pro |
|---------|------------|---------|----------|------------|
| Filtro por Isapre | ✅ | ❌ | ❌ | ❌ |
| Cálculo Copago | ✅ | ❌ | ❌ | ❌ |
| Boletas Auto | ✅ | ❌ | Parcial | ❌ |
| Matching IA | ✅ | ❌ | ❌ | ❌ |

### ROI para Profesionales

```
Profesional promedio:
- 20 sesiones/mes
- 15 minutos por boleta manual = 5 horas/mes
- Valor hora profesional: $30,000
- Ahorro: $150,000/mes

Costo PsyConnect:
- Comisión 8% sobre $50k = $4,000/sesión
- Total mes: $80,000

AHORRO NETO: $70,000/mes + 5 horas de tiempo
```

---

## 🚨 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| SimpleDTE caída | Media | Alto | Retry automático + alerta Slack |
| Certificado vencido | Baja | Medio | Alert 30 días antes + email |
| Cambio tasas SII | Media | Medio | Config en BD (no hardcoded) |
| Isapre cambia convenios | Alta | Bajo | Actualización manual trimestral |
| Ataque certificados | Muy baja | Crítico | Encriptación AES-256 + auditoría |

---

## 📚 Documentación Técnica

### Documentos Creados

1. **`ARQUITECTURA_MATCHING_PREVISION.md`**
   - Esquema de BD completo
   - Algoritmo de matching con código Python
   - Endpoints detallados
   - Casos de uso

2. **`ARQUITECTURA_AUTOMATIZACION_BOLETAS_SII.md`**
   - Esquema de BD de boletas
   - Integración SimpleDTE
   - Manejo seguro de certificados
   - Flujos automáticos

3. **`RESUMEN_EJECUTIVO_ARQUITECTURA.md`** (este documento)
   - Visión general
   - Plan de implementación
   - KPIs y métricas

---

## 🎯 Próximos Pasos Inmediatos

### Para el Equipo de Desarrollo

1. **Revisar arquitectura propuesta** (esta semana)
2. **Aprobar stack tecnológico** (SimpleDTE, Bull, etc.)
3. **Crear cuenta SimpleDTE** y obtener credenciales sandbox
4. **Iniciar Sprint 1** de matching (próxima semana)

### Para el Negocio

1. **Contactar Isapres** para validar códigos de convenio
2. **Definir precios** de comisión final (8% propuesto)
3. **Preparar materiales** onboarding profesionales
4. **Legal**: Revisar T&C de manejo de certificados

---

## 📞 Contacto Técnico

**Equipo de Arquitectura PsyConnect**
- CTO: Responsable de decisiones técnicas
- Tech Lead: Implementación y code reviews
- DevOps: Infraestructura y seguridad

---

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Status**: ✅ Aprobado para implementación
