'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout/shell'
import { BackToDashboard } from '@/components/ui/BackToDashboard'
import ImmediateHelpModal from '@/components/dashboard/ImmediateHelpModal'
import {
  DollarSign,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
} from 'lucide-react'

interface PaymentItem {
  id: string
  amount: number
  status: string
  createdAt: string
  appointment: {
    scheduledAt: string
    professional: {
      user: {
        name: string
      }
    }
    invoice?: {
      id: string
      invoiceNumber: string
      issueDate: string
      netAmount: number
    } | null
  }
}

export default function PagosYBoletasPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch('/api/paciente/pagos')
        if (res.ok) {
          const data = await res.json()
          setPayments(data.payments || [])
        }
      } catch (err) {
        console.error('Error fetching payments:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    )
  }

  return (
    <>
      <Header />
      <PageContainer variant="dashboard" size="medium">
        <div className="flex items-center justify-between mb-4">
          <BackToDashboard />
          <ImmediateHelpModal />
        </div>

        <PageHeader
          title="Pagos y boletas"
          description="Historial de consultas abonadas y boletas de honorarios para tu reembolso"
        />

        {/* Bloque Informativo Legal Obligatorio */}
        <div className="p-4 bg-teal-50/70 border border-teal-200/90 rounded-2xl mb-6 text-xs text-teal-950 leading-relaxed flex items-start gap-3">
          <FileText className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Información sobre reembolsos médicos:</p>
            <p className="text-teal-900/90">
              Con tu boleta puedes solicitar reembolso a tu Isapre o seguro complementario, según las condiciones de tu plan. PsyDoctor no gestiona ni garantiza reembolsos.
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Aún no tienes pagos registrados
            </h3>
            <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
              Cuando reserves y confirmes tus sesiones con profesionales, aquí encontrarás el detalle de pagos y las boletas de honorarios para descargar.
            </p>
            <Link
              href="/buscar"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition"
            >
              Encontrar apoyo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => {
              const dateStr = new Date(p.createdAt).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        Sesión con {p.appointment?.professional?.user?.name || 'Profesional'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          p.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.status === 'COMPLETED' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Fecha: {dateStr} • Monto: ${(p.amount || 0).toLocaleString('es-CL')} CLP
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.appointment?.invoice ? (
                      <Link
                        href={`/dashboard/reembolsos/${p.appointment.invoice.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Boleta {p.appointment.invoice.invoiceNumber}</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Boleta en emisión
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </PageContainer>
      <Footer />
    </>
  )
}
