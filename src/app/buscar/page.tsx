"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRegionNombre } from "../../constants/chile-data";
import { Header, Footer } from "../../components/layout";
import { PageContainer, CardGrid } from "../../components/layout/shell";
import { PatientWaitlistForm } from "../../components/waitlist/PatientWaitlistForm";
import { MapPin, Sparkles, UserPlus } from "lucide-react";

interface RealProfessional {
  id: string;
  slug: string;
  professionalType: string;
  specialties: string[];
  comuna: string | null;
  region: string | null;
  sessionPrice: number;
  profileImageUrl: string | null;
  bio: string | null;
  modality: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const region = searchParams?.get("region") || "";
  const comuna = searchParams?.get("comuna") || "";
  const modalidad = searchParams?.get("modalidad") || "";

  const [professionals, setProfessionals] = useState<RealProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProfessionals = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (region) query.set("region", region);
        if (comuna) query.set("comuna", comuna);
        if (modalidad) query.set("modalidad", modalidad);

        const res = await fetch(`/api/professionals?${query.toString()}`);
        if (!res.ok) throw new Error("Error loading professionals");
        const data = await res.json();
        if (isMounted) {
          setProfessionals(data.professionals || []);
        }
      } catch (err) {
        if (isMounted) setProfessionals([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfessionals();
    return () => {
      isMounted = false;
    };
  }, [region, comuna, modalidad]);

  const regionNombre = region ? getRegionNombre(region) : "";

  return (
    <PageContainer variant="alt" size="wide" padding="md">
      <div className="border-b border-slate-200/70 bg-white/90 py-8 backdrop-blur-sm">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
              <span>Directorio Oficial de Salud Mental</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              Psicólogos y psiquiatras inscritos en el registro oficial
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Atención online en todo Chile con precios claros y boleta para reembolso en Isapre según tu plan.
            </p>
          </div>
        </div>
      </div>

      <div className="py-8 md:py-12">
        <div className="container-wide">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent align-[-0.125em]" />
              <p className="mt-4 text-sm text-slate-600">Buscando profesionales inscritos...</p>
            </div>
          ) : professionals.length === 0 ? (
            /* Estado Sin Profesionales Reales Aprobados: Página de conversión */
            <div className="mx-auto max-w-2xl text-center py-12">
              <div className="rounded-3xl border border-teal-100 bg-teal-50 p-6 sm:p-10 shadow-sm text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-teal-700 border border-teal-200">
                  <MapPin className="h-8 w-8 text-teal-600" aria-hidden="true" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                  Pronto tendremos profesionales en tu zona
                </h2>

                <p className="text-sm sm:text-base text-[#374151] mb-8 leading-relaxed max-w-lg mx-auto">
                  Estamos incorporando profesionales verificados en el Registro de la Superintendencia de Salud. Déjanos tus datos y te avisamos en cuanto haya disponibilidad en tu comuna.
                </p>

                {/* Formulario de Lista de Espera destacado */}
                <div className="mb-10">
                <PatientWaitlistForm
                    compact
                    title="Únete a la lista de espera"
                    subtitle="Te avisamos cuando haya profesionales disponibles en tu comuna."
                />
                </div>

                <div className="mt-10 pt-8 border-t border-teal-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <span className="text-sm text-slate-600">
                    ¿Eres psicólogo o psiquiatra?
                  </span>
                  <Link
                    href="/registro?tipo=profesional"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Únete como Profesional Fundador</span>
                  </Link>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="/faq"
                    className="text-xs text-slate-500 hover:text-teal-600 underline underline-offset-2"
                  >
                    Preguntas frecuentes
                  </a>
                  <a
                    href="/contacto"
                    className="text-xs text-slate-500 hover:text-teal-600 underline underline-offset-2"
                  >
                    Contactar con nosotros
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Si hay al menos un profesional real aprobado */
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                {region && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                    Región: {regionNombre}
                  </span>
                )}
                {comuna && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    Comuna: {comuna}
                  </span>
                )}
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                  {professionals.length} profesional{professionals.length === 1 ? "" : "es"} inscrito{professionals.length === 1 ? "" : "s"}
                </span>
              </div>

              <CardGrid count={3}>
                {professionals.map((prof) => (
                  <Link
                    key={prof.id}
                    href={`/profesional/${prof.slug}`}
                    className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-400 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        {prof.profileImageUrl || prof.user.image ? (
                          <Image
                            src={prof.profileImageUrl || prof.user.image || ""}
                            alt={prof.user.name || "Profesional"}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                            {(prof.user.name || "P").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 group-hover:text-teal-800 truncate">
                            {prof.user.name}
                          </h3>
                          <p className="text-xs text-teal-700 font-medium truncate">
                            {prof.professionalType === "PSYCHIATRIST" ? "Psiquiatra" : "Psicólogo/a"}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Inscrito en el Registro de la Superintendencia de Salud
                          </p>
                        </div>
                      </div>

                      {prof.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {prof.specialties.slice(0, 3).map((spec) => (
                            <span
                              key={spec}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        📍 {prof.comuna || "Chile"}
                      </span>
                      <span className="font-bold text-slate-900">
                        ${prof.sessionPrice.toLocaleString("es-CL")} CLP
                      </span>
                    </div>
                  </Link>
                ))}
              </CardGrid>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function BuscarLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 text-center text-slate-500">
      Cargando buscador...
    </div>
  );
}

export default function BuscarPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<BuscarLoading />}>
        <SearchContent />
      </Suspense>
      <Footer />
    </>
  );
}