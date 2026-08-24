#!/usr/bin/env python3
"""
Medical PDF Generator
====================
Generates professional medical prescriptions and certificates.

Usage:
    python generate_medical_pdf.py --type recipe --appointment_id APPOINTMENT_ID
    python generate_medical_pdf.py --type certificate --appointment_id APPOINTMENT_ID
    python generate_medical_pdf.py --type recipe --content "Medicamento: Sertralina 50mg..."
"""

import os
import sys
import json
import argparse
import base64
from datetime import datetime
from typing import Dict, Any, Optional

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, mm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
except ImportError:
    print("ERROR: reportlab not installed. Install with: pip install reportlab")
    sys.exit(1)

# Configuración
OUTPUT_DIR = os.environ.get('PDF_OUTPUT_DIR', '/tmp/psyai_pdfs')
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:pass@localhost:5432/psyai')

# Colores corporativos
PRIMARY_COLOR = colors.HexColor('#1B4D3E')  # Verde oscuro PsyAI
ACCENT_COLOR = colors.HexColor('#2D7D6F')  # Verde medio
GRAY_LIGHT = colors.HexColor('#F5F5F5')


class MedicalPDFGenerator:
    def __init__(self):
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
    def get_professional_data(self, professional_id: str) -> Optional[Dict]:
        """Obtiene datos del profesional desde la base de datos."""
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("""
                SELECT 
                    p.rut,
                    p.professional_type,
                    p.license_number,
                    p.specialties,
                    p.profile_image_url,
                    u.name as professional_name,
                    u.email
                FROM professionals p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = %s
            """, (professional_id,))
            
            result = cur.fetchone()
            cur.close()
            conn.close()
            
            return dict(result) if result else None
        except Exception as e:
            print(f"Error fetching professional: {e}")
            return None
    
    def get_patient_data(self, appointment_id: str) -> Optional[Dict]:
        """Obtiene datos del paciente desde la base de datos."""
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("""
                SELECT 
                    u.name as patient_name,
                    u.email as patient_email,
                    pp.rut as patient_rut,
                    pp.birth_date,
                    pp.gender
                FROM appointments a
                JOIN users u ON a.patient_id = u.id
                LEFT JOIN patient_profiles pp ON u.id = pp.user_id
                WHERE a.id = %s
            """, (appointment_id,))
            
            result = cur.fetchone()
            cur.close()
            conn.close()
            
            return dict(result) if result else None
        except Exception as e:
            print(f"Error fetching patient: {e}")
            return None

    def generate_recipe(self, 
                       professional_data: Dict,
                       patient_data: Dict,
                       medications: str,
                       appointment_id: str) -> str:
        """Genera una receta médica en PDF."""
        
        filename = f"receta_{appointment_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        doc = SimpleDocTemplate(
            filepath,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        # Estilos personalizados
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=PRIMARY_COLOR,
            alignment=TA_CENTER,
            spaceAfter=10
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.gray,
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        section_style = ParagraphStyle(
            'Section',
            parent=styles['Heading3'],
            fontSize=12,
            textColor=PRIMARY_COLOR,
            spaceBefore=15,
            spaceAfter=5
        )
        
        normal_style = ParagraphStyle(
            'Normal',
            parent=styles['Normal'],
            fontSize=11,
            leading=16,
            spaceAfter=10
        )
        
        # ========== ENCABEZADO ==========
        # Logo y nombre de la plataforma
        logo_text = Paragraph(
            "<b>Psy</b><i>AI</i>",
            ParagraphStyle('Logo', fontSize=24, textColor=PRIMARY_COLOR, alignment=TA_CENTER)
        )
        story.append(logo_text)
        story.append(Spacer(1, 5))
        
        # Título del documento
        story.append(Paragraph("RECETA MÉDICA", title_style))
        story.append(Paragraph("Prescripción de Tratamiento", subtitle_style))
        
        # ========== DATOS DEL PROFESIONAL ==========
        story.append(Paragraph("DATOS DEL PROFESIONAL", section_style))
        
        prof_table_data = [
            ['Nombre:', professional_data.get('professional_name', 'N/A')],
            ['RUT:', professional_data.get('rut', 'N/A')],
            ['Profesión:', professional_data.get('professional_type', 'N/A')],
            ['Título:', professional_data.get('license_number', 'N/A')],
            ['Especialidad:', ', '.join(professional_data.get('specialties', []))],
        ]
        
        prof_table = Table(prof_table_data, colWidths=[50*mm, 120*mm])
        prof_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.gray),
        ]))
        story.append(prof_table)
        
        # ========== DATOS DEL PACIENTE ==========
        story.append(Paragraph("DATOS DEL PACIENTE", section_style))
        
        patient_birth = patient_data.get('birth_date')
        if patient_birth:
            if isinstance(patient_birth, str):
                patient_birth = datetime.fromisoformat(patient_birth.replace('Z', '+00:00'))
            patient_birth = patient_birth.strftime('%d/%m/%Y')
        
        patient_table_data = [
            ['Nombre:', patient_data.get('patient_name', 'N/A')],
            ['RUT:', patient_data.get('patient_rut', 'N/A')],
            ['Fecha de nacimiento:', patient_birth or 'N/A'],
        ]
        
        patient_table = Table(patient_table_data, colWidths=[50*mm, 120*mm])
        patient_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.gray),
        ]))
        story.append(patient_table)
        
        # ========== MEDICAMENTOS ==========
        story.append(Paragraph("PRESCRIPCIÓN", section_style))
        
        # Procesar el contenido de medicamentos
        if isinstance(medications, str):
            med_lines = medications.split('\n')
            for line in med_lines:
                if line.strip():
                    story.append(Paragraph(f"• {line.strip()}", normal_style))
        else:
            story.append(Paragraph(str(medications), normal_style))
        
        # ========== PIE DE PÁGINA ==========
        story.append(Spacer(1, 30))
        
        # Fecha
        fecha_actual = datetime.now().strftime('%d de %B de %Y')
        story.append(Paragraph(f"Santiago, {fecha_actual}", 
            ParagraphStyle('Fecha', fontSize=10, alignment=TA_RIGHT)))
        
        # Firma
        story.append(Spacer(1, 20))
        firma_line = Paragraph(
            "<br/>" * 2 + "_________________________________________<br/>" +
            f"Firma del Profesional<br/>{professional_data.get('professional_name', '')}",
            ParagraphStyle('Firma', fontSize=10, alignment=TA_CENTER)
        )
        story.append(firma_line)
        
        # ========== NOTAS LEGALES ==========
        story.append(Spacer(1, 20))
        notas_legales = Paragraph(
            "<font size=8>Este documento es una prescripción médica válida. "
            "Conservar para futuros controles. En caso de dudas, consulte a su médico tratante.</font>",
            ParagraphStyle('Legal', fontSize=8, textColor=colors.gray, alignment=TA_CENTER)
        )
        story.append(notas_legales)
        
        # Construir PDF
        doc.build(story)
        
        return filepath
    
    def generate_certificate(self,
                           professional_data: Dict,
                           patient_data: Dict,
                           certificate_text: str,
                           diagnosis: str,
                           appointment_id: str) -> str:
        """Genera un certificado médico en PDF."""
        
        filename = f"certificado_{appointment_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        doc = SimpleDocTemplate(
            filepath,
            pagesize=A4,
            rightMargin=25*mm,
            leftMargin=25*mm,
            topMargin=25*mm,
            bottomMargin=25*mm
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        # Estilos
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=PRIMARY_COLOR,
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=12,
            alignment=TA_CENTER,
            spaceAfter=30
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=12,
            leading=18,
            alignment=TA_JUSTIFY,
            spaceAfter=15
        )
        
        # ========== ENCABEZADO ==========
        logo_text = Paragraph(
            "<b>Psy</b><i>AI</i>",
            ParagraphStyle('Logo', fontSize=28, textColor=PRIMARY_COLOR, alignment=TA_CENTER)
        )
        story.append(logo_text)
        story.append(Spacer(1, 10))
        
        # Título
        story.append(Paragraph("CERTIFICADO MÉDICO", title_style))
        story.append(Paragraph("Psicología y Psiquiatría", subtitle_style))
        
        # ========== CUERPO DEL CERTIFICADO ==========
        
        # Quien certifica
        story.append(Paragraph(
            f"Yo, <b>{professional_data.get('professional_name', 'N/A')}</b>, "
            f"RUT {professional_data.get('rut', 'N/A')}, "
            f"profesional {professional_data.get('professional_type', '')}, "
            f"certifico que:", body_style))
        
        story.append(Spacer(1, 10))
        
        # Datos del paciente
        story.append(Paragraph(
            f"El/la paciente <b>{patient_data.get('patient_name', 'N/A')}</b>, "
            f"RUT {patient_data.get('patient_rut', 'N/A')}, "
            f"asistió a consulta de psicología/psiquiatría en esta fecha.", 
            body_style))
        
        # Diagnóstico (si existe)
        if diagnosis:
            story.append(Spacer(1, 10))
            story.append(Paragraph(
                f"<b>Diagnóstico:</b> {diagnosis}", 
                body_style))
        
        # Contenido del certificado
        story.append(Spacer(1, 10))
        if isinstance(certificate_text, str):
            cert_lines = certificate_text.split('\n')
            for line in cert_lines:
                if line.strip():
                    story.append(Paragraph(line.strip(), body_style))
        else:
            story.append(Paragraph(str(certificate_text), body_style))
        
        # ========== FECHA Y FIRMA ==========
        story.append(Spacer(1, 40))
        
        fecha_actual = datetime.now().strftime('%d de %B de %Y')
        story.append(Paragraph(f"Santiago, {fecha_actual}", 
            ParagraphStyle('Fecha', fontSize=12, alignment=TA_RIGHT)))
        
        story.append(Spacer(1, 30))
        
        # Firma
        story.append(Paragraph(
            "<br/><br/>" + "_________________________________________" + "<br/>" +
            f"<b>Firma y Timbre</b><br/>" +
            f"{professional_data.get('professional_name', '')}<br/>" +
            f"RUT: {professional_data.get('rut', '')}",
            ParagraphStyle('Firma', fontSize=11, alignment=TA_CENTER)
        ))
        
        # ========== NOTAS LEGALES ==========
        story.append(Spacer(1, 30))
        story.append(Paragraph(
            "<font size=9>Este certificado tiene validez legal según la normativa chilena vigente. "
            " Cualquier modificación o adulteración invalida este documento.</font>",
            ParagraphStyle('Legal', fontSize=9, textColor=colors.gray, alignment=TA_CENTER)
        ))
        
        # Construir PDF
        doc.build(story)
        
        return filepath
    
    def generate_from_json(self, json_data: Dict) -> Dict[str, Any]:
        """Genera PDF desde JSON recibido."""
        
        doc_type = json_data.get('type', 'recipe')
        professional_id = json_data.get('professional_id')
        appointment_id = json_data.get('appointment_id')
        
        # Obtener datos
        professional_data = self.get_professional_data(professional_id) if professional_id else json_data.get('professional', {})
        patient_data = self.get_patient_data(appointment_id) if appointment_id else json_data.get('patient', {})
        
        if not professional_data:
            return {'error': 'Professional not found'}
        
        if not patient_data and not json_data.get('patient'):
            return {'error': 'Patient not found'}
        
        patient_data = {**patient_data, **json_data.get('patient', {})} if patient_data else json_data.get('patient', {})
        
        # Generar según tipo
        if doc_type == 'recipe':
            medications = json_data.get('medications', json_data.get('content', ''))
            filepath = self.generate_recipe(
                professional_data, patient_data, medications, 
                appointment_id or 'manual'
            )
        elif doc_type == 'certificate':
            certificate_text = json_data.get('content', '')
            diagnosis = json_data.get('diagnosis', '')
            filepath = self.generate_certificate(
                professional_data, patient_data, certificate_text, diagnosis,
                appointment_id or 'manual'
            )
        else:
            return {'error': f'Unknown document type: {doc_type}'}
        
        # Leer y codificar PDF
        with open(filepath, 'rb') as f:
            pdf_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        return {
            'success': True,
            'filename': os.path.basename(filepath),
            'filepath': filepath,
            'pdf_base64': pdf_base64,
            'created_at': datetime.now().isoformat()
        }


def main():
    parser = argparse.ArgumentParser(description='Generate Medical PDFs')
    parser.add_argument('--type', type=str, required=True, 
                       choices=['recipe', 'certificate'],
                       help='Type of document to generate')
    parser.add_argument('--appointment_id', type=str,
                       help='Appointment ID to fetch patient/professional data')
    parser.add_argument('--professional_id', type=str,
                       help='Professional ID (alternative to appointment_id)')
    parser.add_argument('--content', type=str,
                       help='Content for the document (medications or certificate text)')
    parser.add_argument('--diagnosis', type=str, default='',
                       help='Diagnosis for certificate')
    parser.add_argument('--output', type=str,
                       help='Output JSON file path')
    
    args = parser.parse_args()
    
    generator = MedicalPDFGenerator()
    
    # Preparar datos de entrada
    input_data = {
        'type': args.type,
        'appointment_id': args.appointment_id,
        'professional_id': args.professional_id,
        'content': args.content or '',
        'diagnosis': args.diagnosis,
    }
    
    # Generar PDF
    result = generator.generate_from_json(input_data)
    
    # Salida
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"PDF generated: {args.output}")
    else:
        print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
