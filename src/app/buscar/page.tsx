"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import SearchBar from "@/components/hero/SearchBar";
import { MOCK_PROFESSIONALS, filterProfessionals } from "@/data/mock-professionals";
import { getRegionNombre } from "@/constants/chile-data";
import { PREVISIONS, MODALIDADES } from "@/constants/chile-data";
import { X, Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Check, Loader2, AlertCircle } from "lucide-react";
import { ProfessionalCard } from "@/types/search";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}-${month}-${year}, ${hours}:${minutes}`;
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Nombres de los días de la semana
const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function ProfessionalModal({ 
  professional, 
  onClose 
}: { 
  professional: ProfessionalCard | null; 
  onClose: () => void;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // Febrero 2026
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgendar = async () => {
    if (!selectedDate || !selectedTime || !professional) {
      router.push("/registro?tipo=paciente");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Crear pre-reserva
      const response = await fetch('/api/pre-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: professional.id,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'SLOT_TAKEN' || data.code === 'SLOT_BOOKED') {
          setError(data.error);
          // Resetear selección
          setSelectedTime(null);
        } else {
          setError(data.error || 'Error al reservar el horario');
        }
        return;
      }

      // Pre-reserva creada exitosamente, redirigir con el token
      router.push(
        `/registro?tipo=paciente&token=${data.preReservation.token}&profesional=${professional.id}`
      );
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!professional) return null;

  // Obtener los días del mes actual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dayDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const hasSlots = professional.availableSlots?.some(slot => slot.date === dayDate);
      days.push({ day: i, date: dayDate, hasSlots });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const selectedSlot = professional.availableSlots?.find(slot => slot.date === selectedDate);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[28px] shadow-[0_30px_100px_rgba(15,23,42,0.22)] max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-slate-200/70"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 text-white p-5 md:p-6 rounded-t-[28px] relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            {professional.foto_url ? (
              <img
                src={professional.foto_url}
                alt={professional.nombre}
                className="w-16 h-16 rounded-full object-cover border-4 border-white/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {professional.nombre.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{professional.nombre}</h2>
              <p className="text-teal-50/90">{professional.especialidad}</p>
              <p className="text-sm text-teal-50/80 mt-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                {professional.comuna}, {getRegionNombre(professional.region)}
              </p>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="p-5 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Selecciona fecha y hora
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendario */}
            <div className="bg-gray-50 rounded-xl p-4">
              {/* Header del calendario */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="font-semibold text-gray-900">
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => (
                  <div key={idx} className="aspect-square">
                    {day ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (day.hasSlots) {
                            setSelectedDate(day.date);
                            setSelectedTime(null);
                          }
                        }}
                        disabled={!day.hasSlots}
                        className={`w-full h-full rounded-lg text-sm font-medium transition-all ${
                          selectedDate === day.date
                            ? 'bg-teal-600 text-white'
                            : day.hasSlots
                            ? 'bg-white hover:bg-teal-50 text-gray-900 border border-gray-200'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {day.day}
                        {day.hasSlots && selectedDate !== day.date && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mx-auto mt-0.5" />
                        )}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Leyenda */}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Disponible
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  No disponible
                </div>
              </div>
            </div>

            {/* Horarios disponibles */}
            <div>
              {selectedDate ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Horarios disponibles para el <strong>{formatDateShort(selectedDate)}</strong>:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedSlot?.times.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                          selectedTime === time
                            ? 'bg-teal-600 text-white'
                            : 'bg-white border border-gray-200 hover:border-teal-400 hover:bg-teal-50 text-gray-700'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {time}
                        {selectedTime === time && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>

                  {selectedTime && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Cita seleccionada:
                      </p>
                      <p className="text-green-700 text-lg font-semibold mt-1">
                        {formatDateShort(selectedDate)} a las {selectedTime}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Valor: ${professional.precio_consulta.toLocaleString('es-CL')} {professional.moneda}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Selecciona una fecha en el calendario</p>
                    <p className="text-sm mt-1">Los días con punto verde tienen horarios disponibles</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cerrar
            </button>
            <button 
              type="button"
              onClick={handleAgendar}
              disabled={!selectedDate || !selectedTime || isLoading}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                selectedDate && selectedTime && !isLoading
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Reservando...
                </>
              ) : (
                selectedDate && selectedTime ? 'Confirmar y agendar' : 'Selecciona fecha y hora'
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const region = searchParams?.get("region") || "";
  const comuna = searchParams?.get("comuna") || "";
  const prevision = searchParams?.get("prevision") || "";
  const modalidad = searchParams?.get("modalidad") || "";
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalCard | null>(null);

  const filters = { region, comuna, prevision, modalidad };
  const results = filterProfessionals(MOCK_PROFESSIONALS, filters);

  const regionNombre = region ? getRegionNombre(region) : "";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f4fbfa_0%,_#f8fafc_24%,_#ffffff_100%)]">
      <ProfessionalModal 
        professional={selectedProfessional} 
        onClose={() => setSelectedProfessional(null)} 
      />
      <div className="border-b border-slate-200/70 bg-white/90 py-6 backdrop-blur-sm">
        <div className="container-wide">
          <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Encuentra tu profesional
          </h1>
          <p className="text-gray-600 mb-5 max-w-2xl">
            Explora opciones verificadas, compara disponibilidad real y agenda sin friccion.
          </p>
          <SearchBar />
          </div>
        </div>
      </div>

      <div className="container-wide py-6 md:py-8">
        <div className="dashboard-panel p-5 md:p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {region && (
              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                Región: {regionNombre}
              </span>
            )}
            {comuna && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Comuna: {comuna}
              </span>
            )}
            {prevision && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Previsión: {PREVISIONS.find(p => p.id === prevision)?.label}
              </span>
            )}
            {modalidad && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                Modalidad: {MODALIDADES.find(m => m.id === modalidad)?.label}
              </span>
            )}
            {(region || comuna || prevision || modalidad) && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                {results.length} profesionales encontrados
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No se encontraron profesionales con esos filtros.
              </p>
              <p className="text-gray-400 mt-2">
                Intenta con menos filtros para ver más resultados.
              </p>
            </div>
          ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => setSelectedProfessional(prof)}
                  className="rounded-[22px] border border-slate-200 p-4 hover:shadow-lg hover:shadow-teal-100/60 hover:border-teal-300 transition-all cursor-pointer group bg-white"
                >
                  <div className="flex items-start gap-4">
                    {prof.foto_url ? (
                      <img
                        src={prof.foto_url}
                        alt={prof.nombre}
                        className="w-16 h-16 rounded-full object-cover group-hover:ring-2 group-hover:ring-teal-400 transition-all"
                      />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center group-hover:ring-2 group-hover:ring-teal-400 transition-all">
                         <span className="text-teal-600 font-bold text-xl">
                          {prof.nombre.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">{prof.nombre}</h3>
                      <p className="text-sm text-teal-600">{prof.especialidad}</p>
                      <p className="text-sm font-medium mt-1">
                        ${prof.precio_consulta.toLocaleString("es-CL")} {prof.moneda}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      📍 {prof.comuna}, {getRegionNombre(prof.region)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      🏥 Prev: {prof.previsiones.map(p => PREVISIONS.find(pre => pre.id === p)?.label).join(", ")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      💻 Modal: {prof.modalidades.map(m => MODALIDADES.find(mod => mod.id === m)?.label).join(", ")}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Próxima: {formatDate(prof.proxima_hora)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BuscarLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Encuentra tu profesional
        </h1>
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-2">
            <div className="flex flex-col md:flex-row md:items-stretch gap-2">
              <div className="flex-1 flex flex-col md:flex-row md:items-stretch">
                <div className="flex-1 px-4 py-3 rounded-l-xl">
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="w-px h-auto md:h-10 bg-gray-200 md:self-center hidden md:block" />
                <div className="flex-1 px-4 py-3 md:self-center">
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="w-px h-auto md:h-10 bg-gray-200 md:self-center hidden md:block" />
                <div className="flex-1 px-4 py-3 rounded-r-xl md:self-center">
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-full md:w-36" />
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8">Cargando...</div>
      </div>
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<BuscarLoading />}>
      <SearchContent />
    </Suspense>
  );
}
