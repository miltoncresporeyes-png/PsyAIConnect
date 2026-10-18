'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout/shell'
import { BackToDashboard } from '@/components/ui/BackToDashboard'
import ImmediateHelpModal from '@/components/dashboard/ImmediateHelpModal'
import {
  Shield,
  Lock,
  Download,
  Trash2,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Eye,
  RefreshCw,
} from 'lucide-react'

export default function PrivacidadYConsentimientosPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [shareHistoryOnSwitch, setShareHistoryOnSwitch] = useState(false)
  const [rightsType, setRightsType] = useState('acceso')
  const [rightsReason, setRightsReason] = useState('')
  const [rightsSubmitting, setRightsSubmitting] = useState(false)
  const [rightsSuccess, setRightsSuccess] = useState<string | null>(null)
  const [downloadingData, setDownloadingData] = useState(false)

  const loadPrivacyData = async () => {
    try {
      const res = await fetch('/api/paciente/privacidad')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Error loading privacy data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrivacyData()
  }, [])

  const handleRightsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rightsReason.trim()) return

    setRightsSubmitting(true)
    setRightsSuccess(null)

    try {
      const res = await fetch('/api/paciente/solicitud-derechos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoDerecho: rightsType,
          motivo: rightsReason,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        setRightsSuccess(json.trackingNumber)
        setRightsReason('')
        loadPrivacyData()
      }
    } catch {
      // Manejar error silenciosamente
    } finally {
      setRightsSubmitting(false)
    }
  }

  const handleDownloadExport = async () => {
    setDownloadingData(true)
    try {
      const res = await fetch('/api/usuario/exportar-datos')
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mis_datos_psydoctor_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
    } catch (err) {
      console.error('Error downloading data export:', err)
    } finally {
      setDownloadingData(false)
    }
  }

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
          title="Privacidad y consentimientos"
          description="Transparencia total sobre tus datos, con quién los compartes y ejercicio de tus derechos"
        />

        {/* Texto de Seguridad Obligatorio */}
        <div className="p-4 bg-teal-50/70 border border-teal-200/90 rounded-2xl mb-6 text-xs text-teal-950 leading-relaxed flex items-start gap-3">
          <Shield className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Protección de tu información:</p>
            <p className="text-teal-900/90">
              Tus datos de salud se tratan con medidas de seguridad y según nuestra Política de Privacidad.
            </p>
          </div>
        </div>

        {/* 1. Qué datos tiene PsyDoctor sobre mí */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            1. Qué datos guarda PsyDoctor sobre ti
          </h3>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Mantenemos únicamente la información estrictamente necesaria para facilitar tus citas y la facturación electrónica:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 mb-3">
            <li>Datos de contacto y perfil: Nombre, correo electrónico y teléfono.</li>
            <li>Historial de citas: Fechas, horarios y modalidad acordada con el profesional.</li>
            <li>Comprobantes de pago y boletas de honorarios emitidas para tus reembolsos.</li>
            <li>Consentimientos legales y fecha exacta en que los aceptaste.</li>
          </ul>
          <p className="text-[11px] text-slate-500 italic">
            Las anotaciones clínicas que tu terapeuta realice son de custodia reservada y no se utilizan para fines de analítica ni publicidad.
          </p>
        </div>

        {/* 2. Con quién comparto mi información */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            2. Con quién compartes tu información
          </h3>
          {data?.assignedProfessional ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {data.assignedProfessional.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Acceso activo para fines de tu atención psicológica / psiquiátrica
                </p>
              </div>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-medium">
                Vigente
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Actualmente no estás compartiendo información con ningún profesional activo.
            </p>
          )}

          {/* Compartir historial al cambiar de profesional (por defecto desactivado) */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareHistoryOnSwitch}
                onChange={(e) => setShareHistoryOnSwitch(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-teal-800 focus:ring-teal-700"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Compartir mi historial de sesiones si decido cambiar de profesional
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Por defecto viene desactivado. Si lo marcas, solo se compartirá con el nuevo especialista si tú lo autorizas expresamente al momento del cambio.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 3. Indicaciones de mi profesional (visible solo si existen) */}
        {data?.indications && data.indications.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Indicaciones de mi profesional
            </h3>
            <div className="space-y-2">
              {data.indications.map((ind: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  {ind.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Descarga de datos y Ejercicio de Derechos ARCO */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            3. Descarga de datos y ejercicio de tus derechos
          </h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Puedes solicitar copia de tu expediente de datos personales, rectificación, supresión o revocación de autorizaciones:
          </p>

          <div className="flex flex-wrap gap-3 mb-5">
            <button
              onClick={handleDownloadExport}
              disabled={downloadingData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              {downloadingData ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Descargar mis datos (JSON)</span>
            </button>

            <Link
              href="/dashboard/cuenta#eliminar"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Solicitar eliminación de cuenta</span>
            </Link>
          </div>

          {/* Formulario de Derechos */}
          <form onSubmit={handleRightsSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Formulario de Solicitud de Derechos
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tipo de solicitud:
                </label>
                <select
                  value={rightsType}
                  onChange={(e) => setRightsType(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="acceso">Acceso a mis datos</option>
                  <option value="rectificacion">Rectificación de datos erróneos</option>
                  <option value="supresion">Supresión / Cancelación</option>
                  <option value="oposicion">Oposición al tratamiento</option>
                  <option value="portabilidad">Portabilidad de datos</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Canal directo de privacidad:
                </label>
                <p className="text-xs text-slate-500 py-2">
                  privacidad@psydoctor.cl
                </p>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Motivo o detalle de tu solicitud:
              </label>
              <textarea
                rows={2}
                required
                value={rightsReason}
                onChange={(e) => setRightsReason(e.target.value)}
                placeholder="Indica qué datos necesitas actualizar o consultar..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            {rightsSuccess && (
              <div className="mb-3 p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  Solicitud registrada exitosamente con código de seguimiento: <strong>{rightsSuccess}</strong>
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={rightsSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition"
            >
              {rightsSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Enviar solicitud de derechos</span>
            </button>
          </form>
        </div>

        {/* 5. Historial de Consentimientos Aceptados */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            4. Consentimientos vigentes
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Registro de versiones y fechas en que aceptaste los términos de PsyDoctor:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Términos y Condiciones de Uso</p>
                <p className="text-[11px] text-slate-500">Versión 1.0 • Aceptado al registrarse</p>
              </div>
              <Link href="/terminos" target="_blank" className="text-teal-700 hover:underline flex items-center gap-1 font-medium">
                <span>Ver documento</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Política de Privacidad y Tratamiento de Datos</p>
                <p className="text-[11px] text-slate-500">Versión 1.0 • Aceptado al registrarse</p>
              </div>
              <Link href="/privacidad" target="_blank" className="text-teal-700 hover:underline flex items-center gap-1 font-medium">
                <span>Ver documento</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}
