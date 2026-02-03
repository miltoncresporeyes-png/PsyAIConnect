/**
 * Professional Fee Calculator Component
 * 
 * Calculates net income for Chilean mental health professionals
 * considering SII retention (15.25% for 2026) and platform commission
 */

'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

// Chilean tax constants for 2026
const SII_RETENTION_RATE = 0.1525 // 15.25% mandatory retention
const PLATFORM_COMMISSION_RATE = 0.114 // 11.4% for PRO tier

interface FeeBreakdown {
    brutAmount: number
    siiRetention: number
    platformCommission: number
    netAmount: number
    percentages: {
        net: number
        sii: number
        commission: number
    }
}

function calculateFees(brutAmount: number): FeeBreakdown {
    const siiRetention = Math.round(brutAmount * SII_RETENTION_RATE)
    const platformCommission = Math.round(brutAmount * PLATFORM_COMMISSION_RATE)
    const netAmount = brutAmount - siiRetention - platformCommission

    return {
        brutAmount,
        siiRetention,
        platformCommission,
        netAmount,
        percentages: {
            net: (netAmount / brutAmount) * 100,
            sii: (siiRetention / brutAmount) * 100,
            commission: (platformCommission / brutAmount) * 100,
        },
    }
}

export default function FeeCalculator() {
    const [sessionPrice, setSessionPrice] = useState(45000)
    const [sessionsPerMonth, setSessionsPerMonth] = useState(20)

    const fees = calculateFees(sessionPrice)
    const monthlyNet = fees.netAmount * sessionsPerMonth
    const monthlyBrut = sessionPrice * sessionsPerMonth

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    💰 Calculadora de Honorarios
                </h2>
                <div className="relative group">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Info className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <p className="font-semibold mb-1">¿Cómo funciona?</p>
                        <p>
                            Calcula tu ingreso líquido real considerando la retención SII
                            obligatoria y la comisión de plataforma.
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Slider */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                    Valor por sesión
                </label>

                <input
                    type="range"
                    min="20000"
                    max="100000"
                    step="1000"
                    value={sessionPrice}
                    onChange={(e) => setSessionPrice(Number(e.target.value))}
                    className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />

                <div className="text-center">
                    <span className="text-4xl font-bold text-indigo-600">
                        ${sessionPrice.toLocaleString('es-CL')}
                    </span>
                </div>
            </div>

            {/* Visual Breakdown - Horizontal Bars */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Desglose por sesión
                </h3>

                {/* Net Amount */}
                <div className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600">Líquido</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                        <div
                            className="h-full bg-green-500 flex items-center justify-end px-3 transition-all duration-300"
                            style={{ width: `${fees.percentages.net}%` }}
                        >
                            <span className="text-white text-sm font-medium">
                                {fees.percentages.net.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    <div className="w-28 text-right font-semibold text-green-600">
                        ${fees.netAmount.toLocaleString('es-CL')}
                    </div>
                </div>

                {/* SII Retention */}
                <div className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600">Retención SII</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                        <div
                            className="h-full bg-amber-500 flex items-center justify-end px-3 transition-all duration-300"
                            style={{ width: `${fees.percentages.sii}%` }}
                        >
                            <span className="text-white text-sm font-medium">
                                {fees.percentages.sii.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="w-28 text-right font-semibold text-amber-600">
                        -${fees.siiRetention.toLocaleString('es-CL')}
                    </div>
                </div>

                {/* Platform Commission */}
                <div className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600">Comisión</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 flex items-center justify-end px-3 transition-all duration-300"
                            style={{ width: `${fees.percentages.commission}%` }}
                        >
                            <span className="text-white text-sm font-medium">
                                {fees.percentages.commission.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    <div className="w-28 text-right font-semibold text-indigo-600">
                        -${fees.platformCommission.toLocaleString('es-CL')}
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown Table */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-gray-700">
                    <span>Monto Bruto</span>
                    <span className="font-semibold">
                        ${fees.brutAmount.toLocaleString('es-CL')}
                    </span>
                </div>

                <div className="flex justify-between text-amber-600">
                    <span>- Retención SII (15.25%)</span>
                    <span className="font-semibold">
                        -${fees.siiRetention.toLocaleString('es-CL')}
                    </span>
                </div>

                <div className="flex justify-between text-indigo-600">
                    <span>- Comisión Plataforma (11.4%)</span>
                    <span className="font-semibold">
                        -${fees.platformCommission.toLocaleString('es-CL')}
                    </span>
                </div>

                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                            Monto Líquido
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">
                                ${fees.netAmount.toLocaleString('es-CL')}
                            </span>
                            <svg
                                className="w-6 h-6 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Projection */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">
                        Sesiones por mes
                    </label>
                    <select
                        value={sessionsPerMonth}
                        onChange={(e) => setSessionsPerMonth(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        {[10, 15, 20, 25, 30, 35, 40].map((n) => (
                            <option key={n} value={n}>
                                {n} sesiones
                            </option>
                        ))}
                    </select>
                </div>

                <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                        📊 Ingreso Mensual Proyectado
                    </div>
                    <div className="text-4xl font-bold text-indigo-600 mb-1">
                        ${monthlyNet.toLocaleString('es-CL')}
                    </div>
                    <div className="text-sm text-gray-500">
                        ({sessionsPerMonth} sesiones × $
                        {fees.netAmount.toLocaleString('es-CL')})
                    </div>
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                        <div className="text-xs text-gray-600">
                            Bruto mensual: ${monthlyBrut.toLocaleString('es-CL')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-start">
                    <svg
                        className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">
                            Cálculo basado en normativa vigente 2026
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-blue-600 text-xs">
                            <li>Retención SII: 15.25% según Ley de Impuesto a la Renta</li>
                            <li>Comisión plataforma: 11.4% (tier PRO)</li>
                            <li>Valores aproximados, consulta con tu contador</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
