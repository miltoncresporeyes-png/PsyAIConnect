'use client'

import { useState, useRef } from 'react'
import { Camera, User, Loader2, X } from 'lucide-react'

interface ProfilePhotoUploadProps {
    value?: string
    onChange: (value: string) => void
    error?: string
}

export function ProfilePhotoUpload({ value, onChange, error }: ProfilePhotoUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Por favor sube una imagen válida')
            return
        }

        // Validate size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen es muy pesada (máximo 5MB)')
            return
        }

        setIsUploading(true)
        try {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                onChange(base64String)
                setIsUploading(false)
            }
            reader.readAsDataURL(file)
        } catch (err) {
            console.error('Error reading file:', err)
            setIsUploading(false)
        }
    }

    const clearImage = () => {
        onChange('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className={`
                    w-32 h-32 rounded-full border-4 overflow-hidden bg-gray-100 flex items-center justify-center transition-all
                    ${error ? 'border-red-200 shadow-sm shadow-red-100' : 'border-white shadow-lg'}
                    ${!value ? 'bg-primary-50' : ''}
                `}>
                    {value ? (
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-16 h-16 text-primary-200" />
                    )}

                    {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}

                    {/* Overlay on hover (LinkedIn Style) */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-medium"
                    >
                        <Camera className="w-6 h-6 mb-1" />
                        {value ? 'Cambiar foto' : 'Subir foto'}
                    </button>
                </div>

                {value && (
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border border-gray-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="text-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                {!value && (
                    <p className={`text-xs font-medium transition-colors ${error ? 'text-red-500' : 'text-primary-600'}`}>
                        * Foto de perfil obligatoria
                    </p>
                )}
                {error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
                {!error && !value && (
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                        Recomendado: 400x400px (JPG, PNG)
                    </p>
                )}
            </div>
        </div>
    )
}
