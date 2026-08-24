"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Shield, Monitor, ChevronDown } from "lucide-react";
import {
  CHILE_REGIONS,
  PREVISIONS,
  MODALIDADES,
  getComunasByRegion,
} from "@/constants/chile-data";

const SelectField = ({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) => (
  <div className="flex-1 flex flex-col">
    <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="relative h-10 flex items-center bg-gray-100 rounded-lg ring-2 ring-transparent focus-within:ring-purple-200 transition-shadow">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-full text-sm text-gray-900 bg-transparent focus:outline-none cursor-pointer appearance-none px-3 pr-8"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const UbicacionSection = ({
  region,
  setRegion,
  comuna,
  setComuna,
}: {
  region: string;
  setRegion: (v: string) => void;
  comuna: string;
  setComuna: (v: string) => void;
}) => {
  const comunas = region ? getComunasByRegion(region) : [];

  return (
    <div className="flex-1 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-l-xl">
      <div className="flex items-center gap-1.5 text-gray-400 mb-2">
        <MapPin className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Ubicación
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative h-10 flex items-center bg-gray-100 rounded-lg ring-2 ring-transparent focus-within:ring-purple-200 transition-shadow">
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setComuna("");
            }}
            className="w-full h-full text-sm text-gray-900 bg-transparent focus:outline-none cursor-pointer appearance-none px-3 pr-8"
          >
            <option value="">Región</option>
            {CHILE_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative h-10 flex items-center bg-gray-100 rounded-lg ring-2 ring-transparent focus-within:ring-purple-200 transition-shadow">
          <select
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            disabled={!region}
            className="w-full h-full text-sm text-gray-900 bg-transparent focus:outline-none cursor-pointer appearance-none px-3 pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Comuna</option>
            {comunas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default function SearchBar() {
  const router = useRouter();
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [prevision, setPrevision] = useState("");
  const [modalidad, setModalidad] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (comuna) params.set("comuna", comuna);
    if (prevision) params.set("prevision", prevision);
    if (modalidad) params.set("modalidad", modalidad);

    router.push(`/buscar?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-2">
        <div className="flex flex-col md:flex-row md:items-stretch gap-2">
          <div className="flex-1 flex flex-col md:flex-row md:items-stretch">
            <UbicacionSection
              region={region}
              setRegion={setRegion}
              comuna={comuna}
              setComuna={setComuna}
            />

            <div className="w-px h-auto md:h-10 bg-gray-200 md:self-center hidden md:block" />

            <div className="flex-1 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors md:self-center">
              <SelectField
                label="Previsión"
                icon={Shield}
                value={prevision}
                onChange={setPrevision}
                options={PREVISIONS.map((p) => ({ value: p.id, label: p.label }))}
                placeholder="Todas"
              />
            </div>

            <div className="w-px h-auto md:h-10 bg-gray-200 md:self-center hidden md:block" />

            <div className="flex-1 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-r-xl md:self-center">
              <SelectField
                label="Modalidad"
                icon={Monitor}
                value={modalidad}
                onChange={setModalidad}
                options={MODALIDADES.map((m) => ({ value: m.id, label: m.label }))}
                placeholder="Todas"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 cursor-pointer md:self-center"
          >
            <Search className="w-5 h-5" />
            <span>Buscar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
