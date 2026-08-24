'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
    Loader2, Check, AlertCircle, Edit3, Lock, FileText, 
    ChevronDown, Stethoscope, Target, UserPlus, Plus, X,
    Receipt, FileCheck, CreditCard, Sparkles
} from 'lucide-react'

interface ClinicalNoteEditorProps {
    appointmentId: string
    professionalId: string
    onFinalize?: () => void
    isProfessional?: boolean
    isFirstSession?: boolean
}

interface Template {
    id: string
    name: string
    description: string | null
    content: string
    category: string
    isGlobal: boolean
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'unsaved' | 'error' | 'conflict'

export default function ClinicalNoteEditor({
    appointmentId,
    professionalId,
    onFinalize,
    isProfessional = false,
    isFirstSession = false,
}: ClinicalNoteEditorProps) {
    const [content, setContent] = useState('')
    const [status, setStatus] = useState<SaveStatus>('idle')
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isDirty, setIsDirty] = useState(false)
    const [isLockedByOther, setIsLockedByOther] = useState(false)
    const [showTemplateMenu, setShowTemplateMenu] = useState(false)
    const [showNewTemplateModal, setShowNewTemplateModal] = useState(false)
    const [showReplaceModal, setShowReplaceModal] = useState(false)
    const [selectedTemplateForInsert, setSelectedTemplateForInsert] = useState<Template | null>(null)
    const [templates, setTemplates] = useState<Template[]>([])
    const [loadingTemplates, setLoadingTemplates] = useState(true)
    const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)
    const [newTemplateName, setNewTemplateName] = useState('')
    const [newTemplateContent, setNewTemplateContent] = useState('')
    const [showSessionCompleteModal, setShowSessionCompleteModal] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)
    const [completeOptions, setCompleteOptions] = useState({
        generateRecipe: false,
        recipeContent: '',
        generateCertificate: false,
        certificateContent: '',
        diagnosis: '',
        emitInvoice: true,
    })
    const [completeResult, setCompleteResult] = useState<any>(null)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastContentRef = useRef('')
    const menuRef = useRef<HTMLDivElement>(null)

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'soap':
            case 'clinical':
                return <Stethoscope className="w-4 h-4" />
            case 'grow':
            case 'coaching':
                return <Target className="w-4 h-4" />
            case 'intake':
            case 'ingreso':
                return <UserPlus className="w-4 h-4" />
            default:
                return <FileText className="w-4 h-4" />
        }
    }

    const getCategoryColor = (category: string, isGlobal: boolean) => {
        const baseColor = isGlobal ? 'text-blue-600' : 'text-purple-600'
        const bgColor = isGlobal ? 'bg-blue-50' : 'bg-purple-50'
        return { icon: baseColor, bg: bgColor }
    }

    const fetchTemplates = useCallback(async () => {
        if (!isProfessional) return

        try {
            const response = await fetch('/api/notes/templates')
            if (!response.ok) throw new Error('Error fetching templates')
            const data = await response.json()
            setTemplates(data.templates || [])
        } catch (error) {
            console.error('Fetch templates error:', error)
        } finally {
            setLoadingTemplates(false)
        }
    }, [isProfessional])

    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowTemplateMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const saveDraft = useCallback(async (contentToSave: string, isAutoSave = false) => {
        if (!isProfessional) return

        try {
            setStatus('saving')

            const response = await fetch(`/api/notes/draft/${appointmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: contentToSave,
                    templateId: currentTemplateId,
                }),
            })

            if (response.status === 409) {
                setIsLockedByOther(true)
                setStatus('conflict')
                return
            }

            if (!response.ok) {
                throw new Error('Error al guardar')
            }

            const data = await response.json()
            setLastSaved(new Date(data.updatedAt))
            setIsDirty(false)
            setStatus('saved')
            setIsLockedByOther(false)

            if (!isAutoSave) {
                setTimeout(() => setStatus('idle'), 2000)
            }
        } catch (error) {
            console.error('Save draft error:', error)
            setStatus('error')
        }
    }, [appointmentId, isProfessional, currentTemplateId])

    useEffect(() => {
        if (!isProfessional) return

        const loadDraft = async () => {
            try {
                setStatus('saving')
                const response = await fetch(`/api/notes/draft/${appointmentId}`)

                if (!response.ok) {
                    throw new Error('Error al cargar')
                }

                const data = await response.json()

                if (data.draft?.content) {
                    setContent(data.draft.content)
                    lastContentRef.current = data.draft.content
                    setLastSaved(new Date(data.draft.updatedAt))
                }

                if (data.draft?.templateId) {
                    setCurrentTemplateId(data.draft.templateId)
                }

                if (data.locked) {
                    setIsLockedByOther(true)
                    setStatus('conflict')
                } else {
                    setStatus('idle')
                }
            } catch (error) {
                console.error('Load draft error:', error)
                setStatus('error')
            }
        }

        loadDraft()
    }, [appointmentId, isProfessional])

    useEffect(() => {
        if (!isProfessional || !isDirty) return

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveDraft(content, true)
        }, 30000)

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [content, isDirty, isProfessional, saveDraft])

    useEffect(() => {
        return () => {
            if (!isProfessional) return

            fetch(`/api/notes/draft/${appointmentId}`, {
                method: 'DELETE',
            }).catch(console.error)
        }
    }, [appointmentId, isProfessional])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value
        setContent(newContent)

        if (newContent !== lastContentRef.current) {
            setIsDirty(true)
            setStatus('unsaved')
        }
    }

    const handleTemplateSelect = (template: Template) => {
        if (content && content !== lastContentRef.current) {
            setSelectedTemplateForInsert(template)
            setShowReplaceModal(true)
            setShowTemplateMenu(false)
        } else {
            applyTemplate(template, 'replace')
        }
    }

    const applyTemplate = (template: Template, mode: 'replace' | 'append') => {
        if (mode === 'replace') {
            setContent(template.content)
            lastContentRef.current = template.content
        } else {
            setContent((prev) => prev + '\n\n' + template.content)
            lastContentRef.current = content + '\n\n' + template.content
        }
        setCurrentTemplateId(template.id)
        setIsDirty(true)
        setStatus('unsaved')
        setShowReplaceModal(false)
        setSelectedTemplateForInsert(null)
    }

    const handleCreateTemplate = async () => {
        if (!newTemplateName.trim() || !newTemplateContent.trim()) return

        try {
            const response = await fetch('/api/notes/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTemplateName,
                    content: newTemplateContent,
                    category: 'custom',
                }),
            })

            if (!response.ok) throw new Error('Error creating template')

            await fetchTemplates()
            setShowNewTemplateModal(false)
            setNewTemplateName('')
            setNewTemplateContent('')
        } catch (error) {
            console.error('Create template error:', error)
        }
    }

    const handleManualSave = () => {
        if (isDirty) {
            lastContentRef.current = content
            saveDraft(content, false)
        }
    }

    const handleFinalize = () => {
        if (!isProfessional) return
        setShowSessionCompleteModal(true)
    }

    const handleSessionComplete = async () => {
        if (!isProfessional) return

        setIsCompleting(true)
        setCompleteResult(null)

        try {
            // First save the draft if dirty
            if (isDirty) {
                await saveDraft(content, false)
            }

            const response = await fetch('/api/notes/session-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId,
                    ...completeOptions,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Error al completar sesión')
            }

            const result = await response.json()
            setCompleteResult(result)
            
            // Close modal after short delay
            setTimeout(() => {
                setShowSessionCompleteModal(false)
                onFinalize?.()
            }, 2000)
        } catch (error) {
            console.error('Complete session error:', error)
            setStatus('error')
        } finally {
            setIsCompleting(false)
        }
    }

    const getStatusDisplay = () => {
        switch (status) {
            case 'saving':
                return (
                    <span className="flex items-center gap-1 text-sm text-blue-600">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Guardando...
                    </span>
                )
            case 'unsaved':
                return (
                    <span className="flex items-center gap-1 text-sm text-orange-500">
                        <AlertCircle className="w-3 h-3" />
                        Cambios sin guardar
                    </span>
                )
            case 'saved':
                return (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                        <Check className="w-3 h-3" />
                        {lastSaved
                            ? `Guardado a las ${lastSaved.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Guardado'}
                    </span>
                )
            case 'error':
                return (
                    <span className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        Error al guardar
                    </span>
                )
            case 'conflict':
                return (
                    <span className="flex items-center gap-1 text-sm text-red-600">
                        <Lock className="w-3 h-3" />
                        Abriendo en otro dispositivo...
                    </span>
                )
            default:
                return (
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                        <Edit3 className="w-3 h-3" />
                        Listo para editar
                    </span>
                )
        }
    }

    const currentTemplate = templates.find(t => t.id === currentTemplateId)

    if (!isProfessional) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Esta sección es solo para el profesional</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="font-semibold text-gray-900">Nota Clínica</h3>
                        <div className="mt-1">{getStatusDisplay()}</div>
                    </div>
                    
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                            disabled={loadingTemplates}
                            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                        >
                            <FileText className="w-3 h-3" />
                            {loadingTemplates ? 'Cargando...' : currentTemplate ? currentTemplate.name : 'Cargar Plantilla'}
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {showTemplateMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[280px] max-h-[400px] overflow-y-auto">
                                <div className="p-2 border-b border-gray-100">
                                    <button
                                        onClick={() => {
                                            setShowNewTemplateModal(true)
                                            setShowTemplateMenu(false)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nueva Plantilla Personalizada
                                    </button>
                                </div>
                                
                                {templates.filter(t => t.isGlobal).length > 0 && (
                                    <>
                                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                                            Plantillas Globales
                                        </div>
                                        {templates.filter(t => t.isGlobal).map(template => (
                                            <button
                                                key={template.id}
                                                onClick={() => handleTemplateSelect(template)}
                                                className={`w-full flex items-start gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                                    currentTemplateId === template.id ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <div className={`mt-0.5 p-1 rounded ${getCategoryColor(template.category, template.isGlobal).bg}`}>
                                                    {getCategoryIcon(template.category)}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-medium text-gray-900">{template.name}</div>
                                                    {template.description && (
                                                        <div className="text-xs text-gray-500">{template.description}</div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}
                                
                                {templates.filter(t => !t.isGlobal).length > 0 && (
                                    <>
                                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                                            Mis Plantillas
                                        </div>
                                        {templates.filter(t => !t.isGlobal).map(template => (
                                            <button
                                                key={template.id}
                                                onClick={() => handleTemplateSelect(template)}
                                                className={`w-full flex items-start gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                                    currentTemplateId === template.id ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <div className={`mt-0.5 p-1 rounded ${getCategoryColor(template.category, template.isGlobal).bg}`}>
                                                    {getCategoryIcon(template.category)}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-medium text-gray-900">{template.name}</div>
                                                    {template.description && (
                                                        <div className="text-xs text-gray-500">{template.description}</div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {isLockedByOther && (
                        <span className="flex items-center gap-1 text-xs text-orange-600">
                            <Lock className="w-3 h-3" />
                            Sincronizando...
                        </span>
                    )}
                    <button
                        onClick={handleManualSave}
                        disabled={!isDirty || status === 'saving'}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Guardar
                    </button>
                    <button
                        onClick={handleFinalize}
                        disabled={status === 'saving'}
                        className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                        <Check className="w-4 h-4" />
                        Finalizar y Firmar
                    </button>
                </div>
            </div>
            
            <div className="flex-1 p-4">
                <textarea
                    value={content}
                    onChange={handleChange}
                    placeholder="Selecciona una plantilla o comienza a escribir..."
                    className="w-full h-full resize-none border-0 focus:ring-0 text-gray-700 leading-relaxed placeholder:text-gray-400 font-mono text-sm"
                    disabled={isLockedByOther}
                />
            </div>
            
            <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                <span>Auto-guardado cada 30 segundos</span>
                <span>{currentTemplate ? currentTemplate.name : 'Sin plantilla'}</span>
            </div>

            {showReplaceModal && selectedTemplateForInsert && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold mb-2">¿Cómo deseas insertar la plantilla?</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Ya tienes contenido en el editor. ¿Deseas reemplazar todo o agregar la plantilla al final?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => applyTemplate(selectedTemplateForInsert, 'replace')}
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                            >
                                Reemplazar
                            </button>
                            <button
                                onClick={() => applyTemplate(selectedTemplateForInsert, 'append')}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                            >
                                Agregar al final
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setShowReplaceModal(false)
                                setSelectedTemplateForInsert(null)
                            }}
                            className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {showNewTemplateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Nueva Plantilla Personalizada</h3>
                            <button
                                onClick={() => setShowNewTemplateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la plantilla
                                </label>
                                <input
                                    type="text"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="Ej: Evaluación follow-up"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contenido de la plantilla
                                </label>
                                <textarea
                                    value={newTemplateContent}
                                    onChange={(e) => setNewTemplateContent(e.target.value)}
                                    placeholder="Escribe el contenido de tu plantilla..."
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowNewTemplateModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateTemplate}
                                disabled={!newTemplateName.trim() || !newTemplateContent.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Crear Plantilla
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {showSessionCompleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-600" />
                                Finalizar Sesión
                            </h3>
                            <button
                                onClick={() => setShowSessionCompleteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {completeResult ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    ¡Sesión Completada!
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    La nota ha sido firmada y los documentos han sido generados.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 text-sm mb-4">
                                    Selecciona los documentos que deseas generar:
                                </p>

                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={completeOptions.emitInvoice}
                                            onChange={(e) => setCompleteOptions(prev => ({ ...prev, emitInvoice: e.target.checked }))}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                <CreditCard className="w-4 h-4 text-blue-600" />
                                                Emitir Boleta Electrónica
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Se generará la boleta de honorarios automáticamente
                                            </div>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={completeOptions.generateRecipe}
                                            onChange={(e) => setCompleteOptions(prev => ({ ...prev, generateRecipe: e.target.checked }))}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                <Receipt className="w-4 h-4 text-purple-600" />
                                                Generar Receta Médica
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Receta con los medicamentos recetados
                                            </div>
                                        </div>
                                    </label>

                                    {completeOptions.generateRecipe && (
                                        <textarea
                                            value={completeOptions.recipeContent}
                                            onChange={(e) => setCompleteOptions(prev => ({ ...prev, recipeContent: e.target.value }))}
                                            placeholder="Medicamentos:&#10;- Sertralina 50mg - 1 comprimido al día&#10;- Lorazepam 1mg - Si requiere"
                                            rows={4}
                                            className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                                        />
                                    )}

                                    <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={completeOptions.generateCertificate}
                                            onChange={(e) => setCompleteOptions(prev => ({ ...prev, generateCertificate: e.target.checked }))}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                <FileCheck className="w-4 h-4 text-emerald-600" />
                                                Generar Certificado
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Certificado de atención médica
                                            </div>
                                        </div>
                                    </label>

                                    {completeOptions.generateCertificate && (
                                        <div className="space-y-2 pl-9">
                                            <input
                                                type="text"
                                                value={completeOptions.diagnosis}
                                                onChange={(e) => setCompleteOptions(prev => ({ ...prev, diagnosis: e.target.value }))}
                                                placeholder="Diagnóstico principal"
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                            />
                                            <textarea
                                                value={completeOptions.certificateContent}
                                                onChange={(e) => setCompleteOptions(prev => ({ ...prev, certificateContent: e.target.value }))}
                                                placeholder="Contenido del certificado..."
                                                rows={3}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowSessionCompleteModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSessionComplete}
                                        disabled={isCompleting}
                                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isCompleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Completar Sesión
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
