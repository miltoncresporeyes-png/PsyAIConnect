'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MessageSquarePlus, X } from 'lucide-react'
import { FeedbackForm } from '@/components/support/FeedbackForm'

/**
 * Boton flotante "Enviar feedback" con un dialogo para crear un ticket sin salir de la pagina.
 * Va abajo a la izquierda para no tapar el boton de WhatsApp (abajo a la derecha).
 */
export function FeedbackWidget() {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const closeRef = useRef<HTMLButtonElement>(null)

    useEffect(() => setMounted(true), [])

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKey)
        closeRef.current?.focus()
        return () => {
            window.removeEventListener('keydown', onKey)
            document.body.style.overflow = previousOverflow
        }
    }, [open])

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg shadow-slate-900/10 transition hover:border-teal-300 hover:text-teal-800 print:hidden"
            >
                <MessageSquarePlus className="h-4 w-4 text-teal-700" aria-hidden />
                <span className="hidden sm:inline">Enviar feedback</span>
                <span className="sm:hidden">Feedback</span>
            </button>

            {open && mounted && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="feedback-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setOpen(false)
                    }}
                >
                    <div className="relative max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar"
                            className="absolute right-3 top-3 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h2 id="feedback-title" className="pr-8 text-lg font-semibold text-slate-900">Cuéntanos qué piensas</h2>
                        <p className="mb-4 mt-1 text-sm text-slate-500">Tu opinión nos ayuda a mejorar PsyDoctor.</p>
                        <FeedbackForm />
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

export default FeedbackWidget
