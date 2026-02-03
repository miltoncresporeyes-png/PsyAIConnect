'use client'

import { useState, useEffect } from 'react'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Loader2, FileText, Download, FileCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ReimbursementRequest {
    id: string
    month: number
    year: number
    status: string
    totalAmount: number
    appointments: any[]
}

export default function DocumentsPage() {
    const [loading, setLoading] = useState(true)
    const [requests, setRequests] = useState<ReimbursementRequest[]>([])
    const [downloading, setDownloading] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/reembolsos')
                if (!res.ok) throw new Error('Error fetching requests')
                const data = await res.json()
                setRequests(data)
            } catch (error) {
                console.error('Error loading documents:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleDownloadKit = async (requestId: string, month: number, year: number) => {
        setDownloading(requestId)
        try {
            const res = await fetch(`/api/reembolsos/${requestId}/generate-kit`, {
                method: 'POST'
            })

            if (res.ok) {
                const data = await res.json()

                // Convertir base64 a Blob
                try {
                    const base64Data = data.kitUrl.split(',')[1] || data.kitUrl
                    const byteCharacters = atob(base64Data)
                    const byteNumbers = new Array(byteCharacters.length)
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i)
                    }
                    const byteArray = new Uint8Array(byteNumbers)
                    const blob = new Blob([byteArray], { type: 'application/pdf' })

                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    const filename = data.filename || `kit-reembolso-${getMonthName(month)}-${year}.pdf`
                    link.setAttribute('download', filename)
                    document.body.appendChild(link)
                    link.click()

                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                } catch (e) {
                    console.error('Error downloading blob:', e)
                    alert('Error al procesar el archivo PDF')
                }
            } else {
                alert('Error al descargar el kit')
            }
        } catch (error) {
            console.error('Error downloading kit:', error)
            alert('Error de conexión')
        } finally {
            setDownloading(null)
        }
    }

    const getMonthName = (month: number) => {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        return months[month - 1] || 'Mes'
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="container-wide max-w-5xl mx-auto px-4">
                    <div className="mb-8">
                        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary-600 mb-2 inline-block">
                            ← Volver al Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Documentos Compartidos</h1>
                        <p className="text-gray-600">Accede a tus kits de reembolso y documentos importantes</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No hay documentos disponibles</h3>
                            <p className="text-gray-500 mb-6">Los documentos de tus sesiones aparecerán aquí.</p>
                            <Link href="/dashboard/reembolsos/nuevo">
                                <Button variant="outline">Solicitar Reembolso</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Documento</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Período</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                            <FileCheck className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <span className="block font-medium text-gray-900">Kit de Reembolso</span>
                                                            <span className="text-xs text-gray-500 uppercase">{req.status}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {getMonthName(req.month)} {req.year}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        PDF
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                                                        onClick={() => handleDownloadKit(req.id, req.month, req.year)}
                                                        disabled={downloading === req.id}
                                                    >
                                                        {downloading === req.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Download className="w-4 h-4" />
                                                        )}
                                                        <span className="ml-2">Descargar</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
