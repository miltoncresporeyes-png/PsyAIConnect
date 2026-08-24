#!/usr/bin/env python3
"""
Clinical Notes Analytics Script
================================
Data mining para extraer información de notas clínicas.

Uso:
    python analyze_notes.py --type medications
    python analyze_notes.py --type diagnoses
    python analyze_notes.py --type patterns

Tipos de análisis disponibles:
- medications: Extrae medicamentos mencionados
- diagnoses: Extrae diagnósticos
- patterns: Analiza patrones de tratamiento
- outcomes: Analiza resultados por profesional
"""

import os
import re
import json
import argparse
from datetime import datetime, timedelta
from collections import Counter, defaultdict
from typing import Dict, List, Tuple, Any

# Configuración de base de datos
import psycopg2
from psycopg2.extras import RealDictCursor

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:pass@localhost:5432/psyai')

# Palabras clave para extracción
MEDICATION_KEYWORDS = [
    'sertralina', 'fluoxetina', 'escitalopram', 'paroxetina', 'citalopram',
    'venlafaxina', 'duloxetina', 'milnacipran', 'pregabalina', 'gabapentina',
    'alprazolam', 'clonazepam', 'lorazepam', 'diazepam', 'bromazepam',
    'risperidona', 'olanzapina', 'quetiapina', 'aripiprazol', 'paliperidona',
    'metilfenidato', 'atomoxetina', 'lisdexanfetamina',
    'tramadol', 'codeína', 'paracetamol', 'ibuprofeno', 'naproxeno',
    'lamotrigina', 'valproato', 'carbamazepina', 'litio', 'topiramato',
    'bupropion', 'mirtazapina', 'trazodona', 'buspirona',
    'sustitutivo', 'pastilla', 'mg', 'ml', 'dosis', 'comprimido',
]

DIAGNOSIS_KEYWORDS = [
    'depresión', 'depresivo', 'trastorno depresivo', 'episodio depresivo',
    'ansiedad', 'trastorno de ansiedad', 'gad', 'tag', 'fobia',
    'bipolar', 'trastorno bipolar', 'manía', 'hipomanía',
    'esquizofrenia', 'psicosis', 'trastorno psicótico',
    'tdah', 'add', 'hiperactividad', 'déficit de atención',
    'insomnio', 'trastorno del sueño',
    'toc', 'obsesiones', 'compulsiones',
    'eptsd', 'stress', 'trauma', 'traumático',
    'ataque de pánico', 'agorafobia',
    'bulimia', 'anorexia', 'trastorno alimentario',
    'personalidad', 'borderline', 'narcisista',
    'autismo', 'asperger', 'tea',
    'demencia', 'alzheimer',
]

TREATMENT_PATTERNS = [
    r'psicoterapia',
    r'cognitivo-conductual',
    r'tcc',
    r'psicoanálisis',
    r'gestalt',
    r'humanista',
    r'familytherapy|terapia familiar',
    r'couplestherapy|terapia de pareja',
    r'mindfulness',
    r'meditación',
    r'relajación',
    r'exposición',
    r'emdr',
]


# =============================================================================
# BASE DE DATOS
# =============================================================================

def get_db_connection():
    """Establece conexión con la base de datos."""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def fetch_clinical_notes(professional_id: str = None, days: int = 90) -> List[Dict]:
    """
    Obtiene notas clínicas de los últimos N días.
    
    Args:
        professional_id: Filtrar por profesional específico (opcional)
        days: Número de días hacia atrás a buscar
    
    Returns:
        Lista de notas clínicas con contenido desencriptado
    """
    query = """
        SELECT 
            cn.id,
            cn.appointment_id,
            cn.professional_id,
            cn.content,
            cn.created_at,
            cn.updated_at,
            p.user_id as professional_user_id,
            u.name as professional_name
        FROM clinical_notes cn
        JOIN professionals p ON cn.professional_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE cn.deleted_at IS NULL
          AND cn.created_at >= %s
    """
    
    params = [datetime.now() - timedelta(days=days)]
    
    if professional_id:
        query += " AND cn.professional_id = %s"
        params.append(professional_id)
    
    query += " ORDER BY cn.created_at DESC"
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()


def fetch_drafts_for_analysis(professional_id: str = None, days: int = 90) -> List[Dict]:
    """Obtiene borradores de notas clínicas."""
    query = """
        SELECT 
            cnd.id,
            cnd.appointment_id,
            cnd.professional_id,
            cnd.content,
            cnd.created_at,
            cnd.updated_at
        FROM clinical_note_drafts cnd
        WHERE cnd.updated_at >= %s
    """
    
    params = [datetime.now() - timedelta(days=days)]
    
    if professional_id:
        query += " AND cnd.professional_id = %s"
        params.append(professional_id)
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()


def save_analytics_results(professional_id: str, analysis_type: str, results: Dict, sample_size: int):
    """Guarda los resultados del análisis en la base de datos."""
    query = """
        INSERT INTO clinical_analytics 
            (professional_id, analysis_type, results, sample_size, generated_at)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (
                professional_id,
                analysis_type,
                json.dumps(results),
                sample_size,
                datetime.now()
            ))
            conn.commit()


# =============================================================================
# ANALIZADORES
# =============================================================================

def extract_soap_sections(text: str) -> Dict[str, str]:
    """Extrae las secciones S, O, A, P del formato SOAP."""
    sections = {'S': '', 'O': '', 'A': '', 'P': ''}
    
    if not text:
        return sections
    
    # Patrones para identificar secciones
    patterns = {
        'S': r'(?:S\.?\s*(?:SUBJETIVO)?|SUBJETIVO)[:\s]*(.*?)(?:O\.?|OBJETIVO|$)',
        'O': r'(?:O\.?\s*(?:OBJETIVO)?|OBJETIVO)[:\s]*(.*?)(?:A\.?|ANÁLISIS|$)',
        'A': r'(?:A\.?\s*(?:ANÁLISIS|ANÁLISE|ANÁLISIS)?)[:\s]*(.*?)(?:P\.?|PLAN|$)',
        'P': r'(?:P\.?\s*(?:PLAN)?|PLAN)[:\s]*(.*)',
    }
    
    for section, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            sections[section] = match.group(1).strip()
    
    return sections


def extract_medications(text: str) -> List[Dict[str, Any]]:
    """Extrae medicamentos mencionados en el texto."""
    if not text:
        return []
    
    text_lower = text.lower()
    found_medications = []
    
    for med in MEDICATION_KEYWORDS:
        if med in text_lower:
            # Buscar contexto (dosis, frecuencia)
            pattern = rf'.{{0,50}}{re.escape(med)}.{{0,50}}'
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            
            for match in matches:
                found_medications.append({
                    'medication': med.title(),
                    'context': match.strip(),
                    'section': 'unknown'
                })
    
    # Identificar sección SOAP
    sections = extract_soap_sections(text)
    for med in found_medications:
        for section_name, section_text in sections.items():
            if med['context'].lower() in section_text.lower():
                med['section'] = section_name
                break
    
    return found_medications


def extract_diagnoses(text: str) -> List[Dict[str, str]]:
    """Extrae diagnósticos mencionados en el texto."""
    if not text:
        return []
    
    text_lower = text.lower()
    found_diagnoses = []
    
    for diag in DIAGNOSIS_KEYWORDS:
        if diag in text_lower:
            found_diagnoses.append({
                'diagnosis': diag.title(),
                'keyword_found': diag
            })
    
    return found_diagnoses


def analyze_treatment_patterns(text: str) -> List[str]:
    """Analiza patrones de tratamiento mencionados."""
    if not text:
        return []
    
    patterns_found = []
    
    for pattern in TREATMENT_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            patterns_found.append(pattern)
    
    return patterns_found


def calculate_outcomes(notes: List[Dict]) -> Dict[str, Any]:
    """Calcula métricas de resultados por profesional."""
    professional_stats = defaultdict(lambda: {
        'total_sessions': 0,
        'with_medication': 0,
        'with_diagnosis': 0,
        'medications': [],
        'diagnoses': []
    })
    
    for note in notes:
        prof_id = note.get('professional_id', 'unknown')
        content = note.get('content', '') or ''
        
        professional_stats[prof_id]['total_sessions'] += 1
        
        meds = extract_medications(content)
        diags = extract_diagnoses(content)
        
        if meds:
            professional_stats[prof_id]['with_medication'] += 1
            professional_stats[prof_id]['medications'].extend([m['medication'] for m in meds])
        
        if diags:
            professional_stats[prof_id]['with_diagnosis'] += 1
            professional_stats[prof_id]['diagnoses'].extend([d['diagnosis'] for d in diags])
    
    results = {}
    for prof_id, stats in professional_stats.items():
        total = stats['total_sessions']
        if total > 0:
            results[prof_id] = {
                'total_sessions': total,
                'medication_rate': round(stats['with_medication'] / total * 100, 1),
                'diagnosis_rate': round(stats['with_diagnosis'] / total * 100, 1),
                'top_medications': Counter(stats['medications']).most_common(5),
                'top_diagnoses': Counter(stats['diagnoses']).most_common(5),
            }
    
    return results


# =============================================================================
# ANALISIS PRINCIPALES
# =============================================================================

def analyze_medications(notes: List[Dict], professional_id: str = None) -> Dict[str, Any]:
    """Análisis principal: Medicamentos más utilizados."""
    all_medications = []
    medications_by_section = {'S': [], 'O': [], 'A': [], 'P': [], 'unknown': []}
    
    for note in notes:
        content = note.get('content', '') or ''
        soap = extract_soap_sections(content)
        
        # Analizar cada sección
        for section, text in soap.items():
            meds = extract_medications(text)
            for med in meds:
                med['appointment_id'] = note.get('appointment_id')
                medications_by_section[section].append(med)
                all_medications.append(med)
        
        # También buscar en texto completo
        if not any(medications_by_section.values()):
            meds = extract_medications(content)
            all_medications.extend(meds)
    
    # Agregar resultados por sección P (Plan) - donde usualmente van los medicamentos
    plan_meds = medications_by_section['P']
    plan_med_counter = Counter([m['medication'] for m in plan_meds])
    
    # Resultados generales
    med_counter = Counter([m['medication'] for m in all_medications])
    
    return {
        'summary': {
            'total_mentions': len(all_medications),
            'unique_medications': len(med_counter),
            'notes_with_medications': len(set(m['appointment_id'] for m in all_medications if m.get('appointment_id'))),
        },
        'top_medications': med_counter.most_common(20),
        'medications_in_plan_section': plan_med_counter.most_common(15),
        'medications_by_section': {
            section: Counter([m['medication'] for m in meds]).most_common(10)
            for section, meds in medications_by_section.items()
            if meds
        },
        'total_notes_analyzed': len(notes),
    }


def analyze_diagnoses(notes: List[Dict], professional_id: str = None) -> Dict[str, Any]:
    """Análisis principal: Diagnósticos más comunes."""
    all_diagnoses = []
    diagnoses_by_section = {'S': [], 'O': [], 'A': [], 'P': [], 'unknown': []}
    
    for note in notes:
        content = note.get('content', '') or ''
        soap = extract_soap_sections(content)
        
        for section, text in soap.items():
            diags = extract_diagnoses(text)
            for diag in diags:
                diag['appointment_id'] = note.get('appointment_id')
                diagnoses_by_section[section].append(diag)
                all_diagnoses.append(diag)
        
        if not any(diagnoses_by_section.values()):
            diags = extract_diagnoses(content)
            all_diagnoses.extend(diags)
    
    diag_counter = Counter([d['diagnosis'] for d in all_diagnoses])
    analysis_section = diagnoses_by_section['A']
    analysis_diag_counter = Counter([d['diagnosis'] for d in analysis_section])
    
    return {
        'summary': {
            'total_mentions': len(all_diagnoses),
            'unique_diagnoses': len(diag_counter),
            'notes_with_diagnosis': len(set(d['appointment_id'] for d in all_diagnoses if d.get('appointment_id'))),
        },
        'top_diagnoses': diag_counter.most_common(20),
        'diagnoses_in_analysis_section': analysis_diag_counter.most_common(15),
        'total_notes_analyzed': len(notes),
    }


def analyze_patterns(notes: List[Dict], professional_id: str = None) -> Dict[str, Any]:
    """Análisis principal: Patrones de tratamiento."""
    all_patterns = []
    
    for note in notes:
        content = note.get('content', '') or ''
        patterns = analyze_treatment_patterns(content)
        all_patterns.extend([(p, note.get('appointment_id')) for p in patterns])
    
    pattern_counter = Counter([p[0] for p in all_patterns])
    
    return {
        'summary': {
            'total_mentions': len(all_patterns),
            'unique_patterns': len(pattern_counter),
        },
        'top_patterns': pattern_counter.most_common(15),
        'total_notes_analyzed': len(notes),
    }


# =============================================================================
# MAIN
# =============================================================================

def run_analysis(analysis_type: str = 'medications', professional_id: str = None, days: int = 90):
    """Ejecuta el análisis solicitado."""
    print(f"🔍 Ejecutando análisis: {analysis_type}")
    print(f"   Período: últimos {days} días")
    if professional_id:
        print(f"   Profesional: {professional_id}")
    print()
    
    # Obtener notas clínicas
    notes = fetch_clinical_notes(professional_id, days)
    print(f"📄 Notas clínicas obtenidas: {len(notes)}")
    
    # También incluir borradores recientes
    drafts = fetch_drafts_for_analysis(professional_id, days)
    print(f"📝 Borradores obtenidos: {len(drafts)}")
    
    # Combinar notas y borradores
    all_notes = notes + [{'content': d['content'], 'appointment_id': d['appointment_id'], 
                         'professional_id': d['professional_id']} for d in drafts]
    
    if not all_notes:
        print("⚠️ No hay notas para analizar")
        return None
    
    # Ejecutar análisis según tipo
    if analysis_type == 'medications':
        results = analyze_medications(all_notes, professional_id)
    elif analysis_type == 'diagnoses':
        results = analyze_diagnoses(all_notes, professional_id)
    elif analysis_type == 'patterns':
        results = analyze_patterns(all_notes, professional_id)
    elif analysis_type == 'outcomes':
        results = calculate_outcomes(notes)
    else:
        print(f"❌ Tipo de análisis desconocido: {analysis_type}")
        return None
    
    # Guardar resultados
    if results:
        save_analytics_results(professional_id, analysis_type, results, len(all_notes))
        print(f"✅ Resultados guardados en base de datos")
    
    # Mostrar resultados
    print("\n📊 RESULTADOS:")
    print("=" * 50)
    print(json.dumps(results, indent=2, ensure_ascii=False))
    
    return results


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Análisis de notas clínicas')
    parser.add_argument('--type', type=str, default='medications',
                       choices=['medications', 'diagnoses', 'patterns', 'outcomes'],
                       help='Tipo de análisis a ejecutar')
    parser.add_argument('--professional-id', type=str, default=None,
                       help='ID del profesional (opcional)')
    parser.add_argument('--days', type=int, default=90,
                       help='Días hacia atrás a analizar')
    
    args = parser.parse_args()
    run_analysis(args.type, args.professional_id, args.days)
