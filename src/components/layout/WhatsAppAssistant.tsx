'use client'

import React, { useState } from 'react'
import { X, MessageCircle, Send } from 'lucide-react'

export function WhatsAppAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<'patient' | 'professional' | null>(null)
    const [step, setStep] = useState(1)

    const whatsappNumber = '56983414730'

    const handleSelectRole = (role: 'patient' | 'professional') => {
        setSelectedRole(role)
        setStep(2)
    }

    const handleRedirect = () => {
        let text = ''
        if (selectedRole === 'patient') {
            text = 'Hola, soy Paciente y me interesa recibir información o agendar una hora en PsyDoctor.'
        } else {
            text = 'Hola, soy Profesional de la salud mental y me interesa conocer más sobre cómo unirme a PsyDoctor.'
        }
        
        const encodedText = encodeURIComponent(text)
        const url = `https://wa.me/${whatsappNumber}?text=${encodedText}`
        window.open(url, '_blank', 'noopener,noreferrer')
        
        // Reset state and close
        setIsOpen(false)
        setStep(1)
        setSelectedRole(null)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 ease-out origin-bottom-right">
                    {/* Header */}
                    <div className="bg-teal-600 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                                    PD
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm leading-none">Asistente PsyDoctor</h4>
                                <span className="text-xs text-teal-100 font-medium">En línea ahora</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-teal-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="p-4 bg-gray-50 min-h-[220px] max-h-[320px] overflow-y-auto flex flex-col gap-3">
                        {/* Welcome Message */}
                        <div className="flex gap-2 max-w-[85%]">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-gray-800 shadow-sm border border-gray-100">
                                ¡Hola! 👋 Bienvenido/a a PsyDoctor. ¿Cómo te podemos ayudar hoy? Selecciona una opción para conectarte con un ejecutivo de inmediato.
                            </div>
                        </div>

                        {step === 1 && (
                            <div className="flex flex-col gap-2 mt-2 w-full">
                                <button
                                    onClick={() => handleSelectRole('patient')}
                                    className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-left text-sm font-medium border border-teal-100 transition-all active:scale-[0.98]"
                                >
                                    🙋‍♂️ Busco psicólogo o psiquiatra
                                </button>
                                <button
                                    onClick={() => handleSelectRole('professional')}
                                    className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-left text-sm font-medium border border-gray-200 transition-all active:scale-[0.98]"
                                >
                                    🩺 Soy profesional y deseo unirme
                                </button>
                            </div>
                        )}

                        {step === 2 && selectedRole && (
                            <>
                                {/* User Choice */}
                                <div className="flex gap-2 max-w-[85%] self-end">
                                    <div className="bg-teal-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-sm">
                                        {selectedRole === 'patient' 
                                            ? '🙋‍♂️ Busco psicólogo o psiquiatra' 
                                            : '🩺 Soy profesional y deseo unirme'}
                                    </div>
                                </div>

                                {/* Assistant response */}
                                <div className="flex gap-2 max-w-[85%]">
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-gray-800 shadow-sm border border-gray-100">
                                        {selectedRole === 'patient'
                                            ? '¡Perfecto! Te derivaremos con un ejecutivo para asistirte personalmente en tu búsqueda y agendamiento.'
                                            : 'Excelente. Te conectaremos con nuestro equipo de admisiones profesionales para ayudarte a ingresar a PsyDoctor.'}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer / CTA Action */}
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-end">
                        {step === 1 ? (
                            <span className="text-xs text-gray-400 mr-auto pl-2">Selecciona una opción arriba</span>
                        ) : (
                            <div className="flex gap-2 w-full justify-between items-center">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-xs text-gray-500 hover:underline px-2 py-1"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={handleRedirect}
                                    className="flex items-center gap-1.5 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl text-sm transition-all active:scale-[0.98] shadow-md shadow-green-100"
                                >
                                    <span>Ir a WhatsApp</span>
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Bubble Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative group p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out active:scale-95 flex items-center justify-center"
                aria-label="Abrir asistente de WhatsApp"
            >
                {/* Ping notification effect */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500 border border-white"></span>
                    </span>
                )}
                {isOpen ? (
                    <X className="w-7 h-7" />
                ) : (
                    <MessageCircle className="w-7 h-7 fill-white text-green-500 stroke-[2]" />
                )}
            </button>
        </div>
    )
}
