'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Phone } from 'lucide-react'

// Country codes data
const COUNTRY_CODES = [
    { code: '+56', country: 'Chile', flag: '🇨🇱', digits: 9, format: '9 XXXX XXXX' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷', digits: 10, format: 'XX XXXX XXXX' },
    { code: '+51', country: 'Perú', flag: '🇵🇪', digits: 9, format: 'XXX XXX XXX' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴', digits: 10, format: 'XXX XXX XXXX' },
    { code: '+52', country: 'México', flag: '🇲🇽', digits: 10, format: 'XX XXXX XXXX' },
    { code: '+55', country: 'Brasil', flag: '🇧🇷', digits: 11, format: 'XX XXXXX XXXX' },
    { code: '+1', country: 'USA', flag: '🇺🇸', digits: 10, format: 'XXX XXX XXXX' },
    { code: '+34', country: 'España', flag: '🇪🇸', digits: 9, format: 'XXX XXX XXX' },
]

interface PhoneInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    error?: string
    showValidation?: boolean
}

export function PhoneInput({
    value,
    onChange,
    placeholder = 'Número de teléfono',
    disabled = false,
    className = '',
    error,
    showValidation = true,
}: PhoneInputProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]) // Chile by default
    const [phoneNumber, setPhoneNumber] = useState('')
    const [validationError, setValidationError] = useState('')

    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Parse initial value and update on external change
    useEffect(() => {
        if (value) {
            // Try to find matching country code
            const matchingCountry = COUNTRY_CODES.find(c => value.startsWith(c.code))
            if (matchingCountry) {
                setSelectedCountry(matchingCountry)
                setPhoneNumber(value.slice(matchingCountry.code.length).replace(/\s/g, ''))
            } else {
                // If no country code match, assume it's just the number
                setPhoneNumber(value.replace(/[^\d]/g, ''))
            }
        } else {
            setPhoneNumber('')
        }
    }, [value])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Validate and update parent
    const handlePhoneChange = (newNumber: string) => {
        // Only allow digits
        const digitsOnly = newNumber.replace(/[^\d]/g, '')
        setPhoneNumber(digitsOnly)

        // Validate length
        if (showValidation && digitsOnly.length > 0) {
            if (digitsOnly.length < selectedCountry.digits) {
                setValidationError(`Faltan ${selectedCountry.digits - digitsOnly.length} dígitos`)
            } else if (digitsOnly.length > selectedCountry.digits) {
                setValidationError(`Sobran ${digitsOnly.length - selectedCountry.digits} dígitos`)
            } else {
                setValidationError('')
            }
        } else {
            setValidationError('')
        }

        // Update parent with full phone number
        if (digitsOnly) {
            onChange(`${selectedCountry.code}${digitsOnly}`)
        } else {
            onChange('')
        }
    }

    const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
        setSelectedCountry(country)
        setIsDropdownOpen(false)

        // Re-validate with new country
        if (phoneNumber.length > 0) {
            if (phoneNumber.length !== country.digits) {
                if (phoneNumber.length < country.digits) {
                    setValidationError(`Faltan ${country.digits - phoneNumber.length} dígitos`)
                } else {
                    setValidationError(`Sobran ${phoneNumber.length - country.digits} dígitos`)
                }
            } else {
                setValidationError('')
            }
        }

        // Update parent with new country code
        if (phoneNumber) {
            onChange(`${country.code}${phoneNumber}`)
        }

        // Focus input after selection
        inputRef.current?.focus()
    }

    const isValid = phoneNumber.length === selectedCountry.digits
    const showError = showValidation && validationError && phoneNumber.length > 0
    const displayError = error || (showError ? validationError : '')

    return (
        <div className={className}>
            <div className="flex">
                {/* Country Code Selector */}
                <div ref={dropdownRef} className="relative">
                    <button
                        type="button"
                        onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
                        disabled={disabled}
                        className={`
                            flex items-center gap-1 px-3 py-2 
                            border-2 border-r-0 rounded-l-lg
                            bg-gray-50 hover:bg-gray-100 
                            transition-colors
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            ${displayError ? 'border-red-300' : 'border-gray-200'}
                        `}
                    >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                            {COUNTRY_CODES.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountrySelect(country)}
                                    className={`
                                        w-full px-3 py-2 text-left flex items-center gap-3
                                        hover:bg-gray-50 transition-colors
                                        ${selectedCountry.code === country.code ? 'bg-primary-50' : ''}
                                    `}
                                >
                                    <span className="text-lg">{country.flag}</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">{country.country}</div>
                                        <div className="text-xs text-gray-500">{country.code}</div>
                                    </div>
                                    {selectedCountry.code === country.code && (
                                        <span className="text-primary-600">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={selectedCountry.digits + 2} // Allow some buffer
                        className={`
                            w-full px-3 py-2 
                            border-2 rounded-r-lg
                            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                            transition-colors
                            ${disabled ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-white'}
                            ${displayError ? 'border-red-300' : isValid && phoneNumber ? 'border-green-300' : 'border-gray-200'}
                        `}
                    />

                    {/* Validation indicator */}
                    {showValidation && phoneNumber && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValid ? (
                                <span className="text-green-500 text-sm">✓</span>
                            ) : (
                                <span className="text-xs text-gray-400">
                                    {phoneNumber.length}/{selectedCountry.digits}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Error/Help message */}
            {displayError && (
                <p className="mt-1 text-xs text-red-500">{displayError}</p>
            )}
            {!displayError && showValidation && !phoneNumber && (
                <p className="mt-1 text-xs text-gray-400">
                    Formato: {selectedCountry.format} ({selectedCountry.digits} dígitos)
                </p>
            )}
        </div>
    )
}

// Utility function to validate Chilean phone numbers
export function isValidChileanPhone(phone: string): boolean {
    const digitsOnly = phone.replace(/[^\d]/g, '')
    // Chilean phones: country code 56 + 9 digits (starting with 9 for mobile)
    return /^56?9\d{8}$/.test(digitsOnly)
}

// Utility function to format phone for display
export function formatPhoneDisplay(phone: string): string {
    if (!phone) return ''

    // Try to find matching country
    const country = COUNTRY_CODES.find(c => phone.startsWith(c.code))
    if (country) {
        const number = phone.slice(country.code.length)
        return `${country.flag} ${country.code} ${number}`
    }

    return phone
}
