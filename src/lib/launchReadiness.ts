export type LaunchPhase =
  | 'PHASE_0'
  | 'PHASE_1'
  | 'PHASE_2'
  | 'PHASE_3'
  | 'PHASE_4'
  | 'PHASE_5'

export type LaunchTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

export interface LaunchTask {
  id: string
  phase: LaunchPhase
  title: string
  description: string
  owner: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: LaunchTaskStatus
}

export interface GoNoGoCriteria {
  code: string
  name: string
  target: string
  status: LaunchTaskStatus
  notes?: string
}

export const currentLaunchPhase: LaunchPhase = 'PHASE_4'

export const launchPhaseOrder: LaunchPhase[] = [
  'PHASE_0',
  'PHASE_1',
  'PHASE_2',
  'PHASE_3',
  'PHASE_4',
  'PHASE_5',
]

export const launchTasks: LaunchTask[] = [
  {
    id: 'P0-001',
    phase: 'PHASE_0',
    title: 'Congelar alcance MVP clinico',
    description:
      'Definir alcance final para registro, reserva, pago, consentimiento y dashboard.',
    owner: 'Product + Tech Lead',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P0-002',
    phase: 'PHASE_0',
    title: 'Definir criterio Go/No-Go',
    description:
      'Establecer criterios medibles para habilitar produccion sin ambiguedad.',
    owner: 'CTO',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P0-003',
    phase: 'PHASE_0',
    title: 'Acordar metricas operativas base',
    description:
      'Alinear metricas de errores P1, salud de pagos y flujo completo de reserva.',
    owner: 'Tech Lead + Ops',
    priority: 'MEDIUM',
    status: 'DONE',
  },
  {
    id: 'P1-001',
    phase: 'PHASE_1',
    title: 'Blindar confirmacion de pre-reserva',
    description:
      'Requerir sesion autenticada y evitar confirmaciones por userId inyectado desde cliente.',
    owner: 'Backend',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P1-002',
    phase: 'PHASE_1',
    title: 'Eliminar password en query params',
    description:
      'Mover credenciales temporales a storage de sesion y evitar exposicion en URL/logs.',
    owner: 'Frontend',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P1-003',
    phase: 'PHASE_1',
    title: 'Alinear registro profesional por codigo',
    description:
      'Crear placeholder de profesional en flujo verify-code para rol profesional.',
    owner: 'Backend',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P1-004',
    phase: 'PHASE_1',
    title: 'Unificar contrato de consentimiento clinico',
    description:
      'Validar payload unico en frontend/backend y evitar doble escritura de consentimiento.',
    owner: 'Frontend + Backend',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P2-001',
    phase: 'PHASE_2',
    title: 'Aplicar rate limiting en APIs criticas',
    description:
      'Proteger endpoints de auth, reserva y consentimiento contra abuso y automatizacion.',
    owner: 'Backend',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P2-002',
    phase: 'PHASE_2',
    title: 'Endurecer headers de seguridad',
    description:
      'Actualizar CSP, Permissions-Policy y cabeceras para entorno productivo.',
    owner: 'Platform',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P2-003',
    phase: 'PHASE_2',
    title: 'Aislar rutas de seed/admin sensibles',
    description:
      'Restringir uso de endpoints de seed y utilidades internas fuera de desarrollo.',
    owner: 'Backend',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P3-001',
    phase: 'PHASE_3',
    title: 'Automatizar pruebas de seguridad de rutas criticas',
    description:
      'Agregar tests para rate limiting y endpoints sensibles de consentimiento y pre-reserva.',
    owner: 'QA + Backend',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P3-002',
    phase: 'PHASE_3',
    title: 'Formalizar runbook de incidentes P1',
    description:
      'Documentar respuesta operativa para caidas en auth, reserva y pagos.',
    owner: 'Ops',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P3-003',
    phase: 'PHASE_3',
    title: 'Ejecutar simulaciones P1 con evidencia',
    description:
      'Correr drills operativos y registrar tiempos de deteccion/mitigacion.',
    owner: 'Ops + Tech Lead',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P4-001',
    phase: 'PHASE_4',
    title: 'Configurar observabilidad de produccion',
    description:
      'Instrumentar errores, latencia y trazas en rutas core con alertas accionables.',
    owner: 'Platform + Backend',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P4-002',
    phase: 'PHASE_4',
    title: 'Ejecutar smoke tests de go-live',
    description:
      'Validar registro, reserva, pago y dashboard en entorno preproduccion con evidencia.',
    owner: 'QA',
    priority: 'HIGH',
    status: 'DONE',
  },
  {
    id: 'P4-003',
    phase: 'PHASE_4',
    title: 'Completar checklist operacional de despliegue',
    description:
      'Verificar backup, plan de rollback, rotacion de secretos y monitoreo activo.',
    owner: 'Ops',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
  },
  {
    id: 'P5-001',
    phase: 'PHASE_5',
    title: 'Monitorear estabilizacion post-lanzamiento',
    description:
      'Controlar error budget, incidentes y tiempos de respuesta durante la primera semana.',
    owner: 'Ops + Tech Lead',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
  },
  {
    id: 'P5-002',
    phase: 'PHASE_5',
    title: 'Medir KPIs de conversion y cobertura',
    description:
      'Analizar conversion de busqueda a reserva y calidad del matching por previsiones.',
    owner: 'Product + Data',
    priority: 'MEDIUM',
    status: 'PENDING',
  },
  {
    id: 'P5-003',
    phase: 'PHASE_5',
    title: 'Priorizar backlog de hardening y UX',
    description:
      'Convertir hallazgos de soporte y observabilidad en plan de mejoras priorizado.',
    owner: 'Product + Engineering',
    priority: 'MEDIUM',
    status: 'PENDING',
  },
]

export const goNoGoCriteria: GoNoGoCriteria[] = [
  {
    code: 'GATE-SEC-001',
    name: 'Bloqueantes criticos de seguridad',
    target: '0 hallazgos abiertos',
    status: 'DONE',
    notes: 'Incluye auth, consentimiento, flujo de pre-reserva y proteccion de credenciales.',
  },
  {
    code: 'GATE-QUAL-001',
    name: 'Pruebas E2E en flujos core',
    target: '100% de escenarios criticos en verde',
    status: 'IN_PROGRESS',
    notes: 'Registro, reserva, pago y dashboard en perfiles paciente/profesional.',
  },
  {
    code: 'GATE-OPS-001',
    name: 'Respuesta a incidentes P1 simulados',
    target: '2/2 simulaciones resueltas segun runbook',
    status: 'DONE',
  },
  {
    code: 'GATE-OPS-002',
    name: 'Alertamiento productivo activo',
    target: 'Webhook real + umbrales calibrados en staging/prod',
    status: 'BLOCKED',
    notes: 'Actualmente existe configuracion placeholder de OPS_ALERT_WEBHOOK_URL.',
  },
]

export function getPhaseCompletion(phase: LaunchPhase) {
  const phaseTasks = launchTasks.filter(task => task.phase === phase)

  if (phaseTasks.length === 0) {
    return {
      total: 0,
      done: 0,
      progressPercent: 0,
    }
  }

  const done = phaseTasks.filter(task => task.status === 'DONE').length
  const progressPercent = Math.round((done / phaseTasks.length) * 100)

  return {
    total: phaseTasks.length,
    done,
    progressPercent,
  }
}

export function getGoNoGoSummary() {
  const total = goNoGoCriteria.length
  const done = goNoGoCriteria.filter(gate => gate.status === 'DONE').length
  const blocked = goNoGoCriteria.filter(gate => gate.status === 'BLOCKED').length

  return {
    total,
    done,
    blocked,
    readyForProduction: total > 0 && done === total,
  }
}

export function getRoadmapProgress() {
  return launchPhaseOrder.map(phase => ({
    phase,
    completion: getPhaseCompletion(phase),
  }))
}
