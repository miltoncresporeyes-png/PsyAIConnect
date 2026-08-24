import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  currentLaunchPhase,
  getGoNoGoSummary,
  getPhaseCompletion,
  getRoadmapProgress,
  goNoGoCriteria,
  launchTasks,
} from '@/lib/launchReadiness'
import { captureApiError, getRequestId } from '@/lib/observability'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestId = getRequestId(request)
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const phaseCompletion = getPhaseCompletion(currentLaunchPhase)
    const goNoGo = getGoNoGoSummary()

    const phaseTitles: Record<string, string> = {
      PHASE_0: 'Definicion y Criterios',
      PHASE_1: 'Cierre de Bloqueantes',
      PHASE_2: 'Hardening de Seguridad',
      PHASE_3: 'QA y Fiabilidad',
      PHASE_4: 'Go-Live Readiness',
      PHASE_5: 'Post-Lanzamiento',
    }

    return NextResponse.json({
      phase: {
        code: currentLaunchPhase,
        title: phaseTitles[currentLaunchPhase] || 'Fase de Lanzamiento',
        completion: phaseCompletion,
      },
      tasks: launchTasks.filter(task => task.phase === currentLaunchPhase),
      roadmap: getRoadmapProgress(),
      goNoGoCriteria,
      goNoGo,
    })
  } catch (error) {
    await captureApiError('/api/admin/launch-readiness', error, requestId)
    return NextResponse.json(
      { error: 'Error al obtener estado de lanzamiento', requestId },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}
