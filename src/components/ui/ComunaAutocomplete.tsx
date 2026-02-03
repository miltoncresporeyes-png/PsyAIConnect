'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, ChevronDown, Check, X } from 'lucide-react'
import { buscarComunas, getComunasPorRegion, type ComunaData } from '@/lib/comunas-chile'

interface ComunaAutocompleteProps {
    value: string
    onChange: (value: string) => void
    region?: string
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function ComunaAutocomplete({
    value,
    onChange,
    region,
    placeholder = 'Escribe tu comuna...',
    disabled = false,
    className = '',
}: ComunaAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const [suggestions, setSuggestions] = useState<ComunaData[]>([])
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Sync input value with external value
    useEffect(() => {
        setInputValue(value)
    }, [value])

    // Update suggestions when input or region changes
    useEffect(() => {
        if (inputValue.trim()) {
            const results = buscarComunas(inputValue, region)
            setSuggestions(results)
        } else if (region) {
            // If region is selected but no input, show first 10 comunas of that region
            const regionComunas = getComunasPorRegion(region)
            setSuggestions(regionComunas.slice(0, 10).map(nombre => ({ nombre, region })))
        } else {
            setSuggestions([])
        }
    }, [inputValue, region])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        setIsOpen(true)
        setHighlightedIndex(-1)

        // Also update parent if typing freely
        onChange(newValue)
    }

    const handleInputFocus = () => {
        setIsOpen(true)
        if (region && !inputValue) {
            // Show region's comunas when focusing empty input with region selected
            const regionComunas = getComunasPorRegion(region)
            setSuggestions(regionComunas.slice(0, 10).map(nombre => ({ nombre, region })))
        }
    }

    const handleSelectComuna = (comuna: ComunaData) => {
        setInputValue(comuna.nombre)
        onChange(comuna.nombre)
        setIsOpen(false)
        setHighlightedIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true)
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
                break
            case 'Enter':
                e.preventDefault()
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleSelectComuna(suggestions[highlightedIndex])
                }
                break
            case 'Escape':
                setIsOpen(false)
                setHighlightedIndex(-1)
                break
        }
    }

    const handleClear = () => {
        setInputValue('')
        onChange('')
        inputRef.current?.focus()
    }

    const showClearButton = inputValue && !disabled

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="input pl-10 pr-10"
                    autoComplete="off"
                />
                {showClearButton ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                ) : (
                    <ChevronDown
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}
            </div>

            {/* Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                    {suggestions.map((comuna, index) => (
                        <button
                            key={`${comuna.nombre}-${comuna.region}`}
                            type="button"
                            onClick={() => handleSelectComuna(comuna)}
                            className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-2 transition-colors
                                ${index === highlightedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'}
                                ${inputValue === comuna.nombre ? 'text-primary-700 font-medium' : 'text-gray-700'}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span>{comuna.nombre}</span>
                            </div>
                            {!region && (
                                <span className="text-xs text-gray-400 truncate max-w-[150px]">
                                    {comuna.region}
                                </span>
                            )}
                            {inputValue === comuna.nombre && (
                                <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {isOpen && inputValue && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center">
                    <p className="text-gray-500 text-sm">
                        No se encontraron comunas que coincidan con &quot;{inputValue}&quot;
                    </p>
                    {region && (
                        <p className="text-gray-400 text-xs mt-1">
                            Buscando en {region}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
