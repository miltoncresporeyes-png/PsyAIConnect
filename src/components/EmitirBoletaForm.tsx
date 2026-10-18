/**
 * Componente de ejemplo para emitir boletas desde el frontend
 * Demuestra cómo integrar con la API route /api/emitir-boleta
 */

'use client'

import { useState } from 'react'

interface BoletaFormData {
  paciente: {
    rut: string
    nombre: string
    email: string
    telefono: string
  }
  servicio: {
    descripcion: string
    fecha_servicio: string
    precio_unitario: number
    descuento: number
  }
  notas_adicionales: string
}

interface APIResponse {
  success?: boolean
  error?: string
  numero_documento?: string
  url_pdf?: string
  url_xml?: string
  total?: number
}

export default function EmitirBoletaForm() {
  const [formData, setFormData] = useState<BoletaFormData>({
    paciente: {
      rut: '',
      nombre: '',
      email: '',
      telefono: ''
    },
    servicio: {
      descripcion: '',
      fecha_servicio: new Date().toISOString().split('T')[0], // Fecha de hoy
      precio_unitario: 0,
      descuento: 0
    },
    notas_adicionales: ''
  })

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<APIResponse | null>(null)
  const [error, setError] = useState<string>('')

  const handlePacienteChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      paciente: {
        ...prev.paciente,
        [field]: value
      }
    }))
  }

  const handleServicioChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      servicio: {
        ...prev.servicio,
        [field]: field === 'precio_unitario' || field === 'descuento' ? Number(value) : value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const res = await fetch('/api/emitir-boleta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data: APIResponse = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al emitir boleta')
      }

      setResponse(data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = formData.servicio.precio_unitario
  const total = Math.max(0, subtotal - formData.servicio.descuento)

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Banner de Estado: En etapa de implementación */}
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 text-amber-950">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-amber-900">
                Módulo en etapa de implementación (Próximamente)
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                Pronto a liberar
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-amber-800 leading-relaxed">
              La conexión directa para la emisión automática de Boletas de Honorarios Electrónicas ante el Servicio de Impuestos Internos (SII) se encuentra actualmente en fase de pruebas e integración técnica. Estará disponible para todos los profesionales una vez finalizadas las certificaciones correspondientes.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Emitir Boleta Electrónica
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos del Paciente */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Datos del Paciente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUT *
              </label>
              <input
                type="text"
                required
                placeholder="11111111-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.paciente.rut}
                onChange={(e) => handlePacienteChange('rut', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Juan Pérez González"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.paciente.nombre}
                onChange={(e) => handlePacienteChange('nombre', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="juan@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.paciente.email}
                onChange={(e) => handlePacienteChange('email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+56912345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.paciente.telefono}
                onChange={(e) => handlePacienteChange('telefono', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Datos del Servicio */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Datos del Servicio
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Servicio *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Sesión de psicoterapia individual de 50 minutos"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.servicio.descripcion}
                onChange={(e) => handleServicioChange('descripcion', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Servicio *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.servicio.fecha_servicio}
                  onChange={(e) => handleServicioChange('fecha_servicio', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Unitario (CLP) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="35000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.servicio.precio_unitario || ''}
                  onChange={(e) => handleServicioChange('precio_unitario', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento (CLP)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.servicio.descuento || ''}
                  onChange={(e) => handleServicioChange('descuento', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notas Adicionales */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas Adicionales
          </label>
          <textarea
            rows={2}
            placeholder="Información adicional para la boleta..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.notas_adicionales}
            onChange={(e) => setFormData(prev => ({ ...prev, notas_adicionales: e.target.value }))}
          />
        </div>

        {/* Resumen y Total */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Resumen</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-600">Subtotal:</p>
              <p className="text-2xl font-bold text-blue-800">
                ${subtotal.toLocaleString('es-CL')}
              </p>
            </div>
            {formData.servicio.descuento > 0 && (
              <div className="text-center">
                <p className="text-sm text-red-600">Descuento:</p>
                <p className="text-lg font-semibold text-red-600">
                  -${formData.servicio.descuento.toLocaleString('es-CL')}
                </p>
              </div>
            )}
            <div className="text-right">
              <p className="text-sm text-blue-600">Total a Pagar:</p>
              <p className="text-3xl font-bold text-blue-800">
                ${total.toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Emitiendo Boleta...' : 'Emitir Boleta Electrónica'}
          </button>
        </div>
      </form>

      {/* Resultado */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Boleta Emitida Exitosamente
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600">Número de Boleta:</p>
              <p className="font-mono text-lg font-semibold text-green-800">
                {response.numero_documento}
              </p>
            </div>

            <div>
              <p className="text-sm text-green-600">Total:</p>
              <p className="text-lg font-semibold text-green-800">
                ${response.total?.toLocaleString('es-CL')}
              </p>
            </div>
          </div>

          {response.url_pdf && (
            <div className="mt-4">
              <a
                href={response.url_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📄 Descargar PDF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}