'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function BetaLaunchBanner() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    // Calcular cuenta regresiva (7 días desde hoy)
    useEffect(() => {
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + 10)
        targetDate.setHours(23, 59, 59, 999)

        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const distance = targetDate.getTime() - now

            if (distance < 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 }
            }

            return {
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            }
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setMessage(null)

        try {
            const response = await fetch('/api/beta-waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: '¡Registro exitoso! Revisa tu correo para más información.',
                })
                setEmail('')
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Hubo un error. Por favor, intenta de nuevo.',
                })
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Error de conexión. Por favor, intenta de nuevo.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="beta-launch-banner">
            <div className="beta-container">
                {/* Contador regresivo */}
                <div className="countdown-wrapper">
                    <div className="countdown-grid">
                        <CountdownUnit value={timeLeft.days} label="Días" />
                        <CountdownUnit value={timeLeft.hours} label="Horas" />
                        <CountdownUnit value={timeLeft.minutes} label="Min" />
                        <CountdownUnit value={timeLeft.seconds} label="Seg" />
                    </div>
                </div>

                {/* Contenido principal - envuelto en contenedor Tailwind */}
                <div className="w-full max-w-3xl mx-auto px-4 text-center beta-content">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="beta-text"
                    >
                        <h1 className="beta-title">
                            El futuro de la gestión en salud mental llega en 10 días.
                        </h1>
                        <p className="beta-description">
                            Únete a la versión Beta exclusiva. Orientación inteligente para pacientes y autonomía administrativa total para profesionales.
                        </p>
                    </motion.div>

                    {/* Formulario */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onSubmit={handleSubmit}
                        className="beta-form"
                    >
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isSubmitting}
                                className="email-input"
                                aria-label="Correo electrónico"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="cta-button"
                            >
                                {isSubmitting ? (
                                    <span className="loading-dots">Enviando...</span>
                                ) : (
                                    'Asegurar mi cupo'
                                )}
                            </button>
                        </div>

                        {/* Mensajes de estado */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`message message-${message.type}`}
                            >
                                {message.text}
                            </motion.div>
                        )}

                        {/* Nota de privacidad */}
                        <p className="privacy-note">
                            🔒 Tus datos están protegidos. No compartimos información personal.
                        </p>
                    </motion.form>
                </div>
            </div>

            <style jsx>{`
                .beta-launch-banner {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 2rem 1.5rem;
                    position: relative;
                    overflow: hidden;
                }

                .beta-launch-banner::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
                    pointer-events: none;
                }

                .beta-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                /* Contador regresivo */
                .countdown-wrapper {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: center;
                }

                .countdown-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(80px, 1fr));
                    gap: 1rem;
                    max-width: 560px;
                    width: 100%;
                    justify-items: center;
                }

                /* Contenido principal */
                .beta-content {
                    text-align: center;
                }

                .beta-text {
                    margin-bottom: 2rem;
                }

                .beta-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: white;
                    line-height: 1.2;
                    margin: 0 0 1rem 0;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                }

                .beta-description {
                    font-size: 1.125rem;
                    color: rgba(255, 255, 255, 0.95);
                    line-height: 1.6;
                    margin: 0;
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                }

                /* Formulario */
                .beta-form {
                    max-width: 600px;
                    margin: 0 auto;
                }


                .form-group {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    align-items: center;
                }

                .email-input {
                    flex: 1;
                    padding: 0.9rem 1.25rem;
                    border: 1px solid rgba(34, 37, 56, 0.06);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 1);
                    font-size: 1.05rem;
                    height: 56px;
                    transition: box-shadow 0.2s ease, transform 0.12s ease;
                    outline: none;
                    box-shadow: 0 6px 18px rgba(100, 95, 255, 0.06);
                    color: #222;
                }

                .email-input::placeholder {
                    color: rgba(34,34,34,0.35);
                }

                .email-input:focus {
                    border-color: rgba(102,126,234,0.9);
                    box-shadow: 0 6px 30px rgba(102,126,234,0.12);
                    transform: translateY(-1px);
                    background: #fff;
                }

                .email-input:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }


                .cta-button {
                    padding: 0 1.75rem;
                    background: linear-gradient(90deg, #ffffff 0%, #f7f9ff 100%);
                    color: #4f46e5;
                    border: 0;
                    border-radius: 12px;
                    font-size: 1.05rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: transform 0.18s ease, box-shadow 0.2s ease;
                    white-space: nowrap;
                    box-shadow: 0 8px 30px rgba(79,70,229,0.12);
                    height: 56px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding-left: 28px;
                    padding-right: 28px;
                }

                .cta-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                    background: #f8f9ff;
                }

                .cta-button:active:not(:disabled) {
                    transform: translateY(0);
                }

                .cta-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .loading-dots::after {
                    content: '...';
                    animation: dots 1.5s steps(3, end) infinite;
                }

                @keyframes dots {
                    0%, 20% { content: '.'; }
                    40% { content: '..'; }
                    60%, 100% { content: '...'; }
                }

                /* Mensajes */
                .message {
                    padding: 0.875rem 1.25rem;
                    border-radius: 10px;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    margin-bottom: 1rem;
                }

                .message-success {
                    background: rgba(16, 185, 129, 0.95);
                    color: white;
                }

                .message-error {
                    background: rgba(239, 68, 68, 0.95);
                    color: white;
                }

                .privacy-note {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0;
                    text-align: center;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .beta-launch-banner {
                        padding: 1.5rem 1rem;
                    }

                    .countdown-grid {
                        gap: 0.6rem;
                        max-width: 100%;
                        grid-template-columns: repeat(4, minmax(60px, 1fr));
                    }

                    .beta-title {
                        font-size: 1.5rem;
                    }

                    .beta-description {
                        font-size: 1rem;
                    }

                    .form-group {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .cta-button {
                        width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .countdown-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.75rem;
                    }

                    .beta-title {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </section>
    )
}

// Componente individual de contador
function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="countdown-unit">
            <div className="countdown-value">{String(value).padStart(2, '0')}</div>
            <div className="countdown-label">{label}</div>

            <style jsx>{`
                .countdown-unit {
                    background: rgba(255, 255, 255, 0.14);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    border-radius: 14px;
                    padding: 0.6rem 0.5rem;
                    text-align: center;
                    transition: transform 0.25s ease, background 0.25s ease;
                    width: 100%;
                    max-width: 130px;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.12) inset;
                }

                .countdown-unit:hover {
                    background: rgba(255, 255, 255, 0.22);
                    transform: translateY(-4px);
                }

                .countdown-value {
                    font-size: 2.25rem;
                    font-weight: 900;
                    color: white;
                    line-height: 1;
                    text-shadow: 0 3px 18px rgba(0, 0, 0, 0.28);
                }

                .countdown-label {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.95);
                    margin-top: 0.25rem;
                    text-transform: uppercase;
                    letter-spacing: 0.75px;
                    font-weight: 700;
                }

                @media (max-width: 768px) {
                    .countdown-value {
                        font-size: 1.5rem;
                    }

                    .countdown-label {
                        font-size: 0.625rem;
                    }
                }
            `}</style>
        </div>
    )
}
