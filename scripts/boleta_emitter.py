#!/usr/bin/env python3
"""
Boleta Electrónica Emitter
=========================
Emite boletas electrónicas de honorarios al SII usando la API de Lioren.

Uso:
    echo '{"paciente": {...}, "servicio": {...}}' | python boleta_emitter.py
    python boleta_emitter.py --test
"""

import os
import sys
import json
import argparse
import requests
from datetime import datetime
from typing import Dict, Any, Optional

# Configuración desde variables de entorno
LIOREN_API_URL = os.environ.get('LIOREN_API_URL', 'https://api.lioren.cl/v1')
LIOREN_API_KEY = os.environ.get('LIOREN_API_KEY', '')
LIOREN_RUT_EMISOR = os.environ.get('LIOREN_RUT_EMISOR', '')

# Configuración fallback para desarrollo
FALLBACK_MODE = not LIOREN_API_KEY


class BoletaEmitter:
    def __init__(self):
        self.api_key = LIOREN_API_KEY
        self.rut_emisor = LIOREN_RUT_EMISOR
        self.api_url = LIOREN_API_URL
        
    def emit_boleta(self, datos_boleta: Dict[str, Any]) -> Dict[str, Any]:
        """
        Emite una boleta electrónica de honorarios.
        
        Args:
            datos_boleta: Diccionario con datos del paciente y servicio
            
        Returns:
            Diccionario con resultado de la emisión
        """
        
        if FALLBACK_MODE:
            return self._emit_fallback(datos_boleta)
        
        # Construir payload para Lioren
        payload = self._build_lioren_payload(datos_boleta)
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }
        
        try:
            response = requests.post(
                f'{self.api_url}/boletas',
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'numero_documento': result.get('folio', self._generate_folio()),
                    'sii_folio': result.get('folio'),
                    'sii_estado': result.get('estado', 'RECHAZADO'),
                    'sii_track_id': result.get('track_id'),
                    'fecha_emision': result.get('fecha_emision'),
                    'xml': result.get('xml'),
                }
            else:
                return {
                    'success': False,
                    'error': f'Error API Lioren: {response.status_code}',
                    'detalle': response.text,
                }
                
        except requests.exceptions.RequestException as e:
            return self._emit_fallback(datos_boleta, str(e))
    
    def _build_lioren_payload(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        """Construye el payload para la API de Lioren."""
        
        paciente = datos.get('paciente', {})
        servicio = datos.get('servicio', {})
        
        # Calcular montos
        precio = servicio.get('precio_unitario', 0)
        descuento = servicio.get('descuento', 0)
        monto_neto = precio - descuento
        iva = 0  # Servicios psicológicos no tienen IVA
        monto_total = monto_neto + iva
        
        # Calcular retención SII (15.25% para boletas de honorarios)
        retencion = int(monto_neto * 0.1525)
        monto_liquido = monto_neto - retencion
        
        return {
            'encabezado': {
                'rut_emisor': self.rut_emisor,
                'rut_receptor': paciente.get('rut', ''),
                'dv_receptor': self._calculate_dv(paciente.get('rut', '')),
                'tipo_documento': 46,  # Boleta electrónica de honorarios
                'fecha_emision': datetime.now().strftime('%Y-%m-%d'),
            },
            'detalle': [
                {
                    'nombre_item': servicio.get('descripcion', 'Servicio de psicología'),
                    'cantidad': 1,
                    'unidad': 'UN',
                    'precio_unitario': precio,
                    'descuento': descuento,
                    'codigo_item': '999999',  # Código genérico
                }
            ],
            'totales': {
                'neto': monto_neto,
                'iva': iva,
                'total': monto_total,
                'retencion': retencion,
                'monto_neto': monto_neto,
                'monto_liquido': monto_liquido,
            },
            'receptor': {
                'razon_social': paciente.get('nombre', 'Paciente'),
                'giro': 'Particular',
                'direccion': paciente.get('direccion', ''),
                'comuna': 'Santiago',
                'region': 'Metropolitana',
            },
        }
    
    def _calculate_dv(self, rut: str) -> str:
        """Calcula el dígito verificador de un RUT."""
        try:
            rut = str(rut).replace('.', '').replace('-', '')
            if not rut:
                return '0'
            
            rut_num = int(rut[:-1])
            dv_input = rut[-1].upper()
            
            sum_ = 0
            multiplier = 2
            
            while rut_num > 0:
                digit = rut_num % 10
                sum_ += digit * multiplier
                rut_num //= 10
                multiplier = 2 if multiplier == 1 else 1
            
            remainder = sum_ % 11
            expected_dv = 11 - remainder
            
            if expected_dv == 11:
                return '0'
            elif expected_dv == 10:
                return 'K'
            else:
                return str(expected_dv)
        except:
            return '0'
    
    def _generate_folio(self) -> int:
        """Genera un folio temporal."""
        import random
        return int(datetime.now().strftime('%Y%m%d%H%M')) + random.randint(1000, 9999)
    
    def _emit_fallback(self, datos: Dict[str, Any], error_msg: str = '') -> Dict[str, Any]:
        """
        Modo fallback: genera una boleta simulada cuando no hay conexión a Lioren.
        Útil para desarrollo y pruebas.
        """
        
        servicio = datos.get('servicio', {})
        precio = servicio.get('precio_unitario', 0)
        descuento = servicio.get('descuento', 0)
        monto_neto = precio - descuento
        retencion = int(monto_neto * 0.1525)
        
        folio = self._generate_folio()
        
        return {
            'success': True,
            'numero_documento': f'BH-{folio}',
            'sii_folio': folio,
            'sii_estado': 'RECHAZADO' if FALLBACK_MODE else 'PENDIENTE',
            'sii_track_id': f'track_{folio}',
            'fecha_emision': datetime.now().strftime('%Y-%m-%d'),
            'xml': None,
            'fallback': True,
            'fallback_reason': error_msg or 'Modo desarrollo (sin API key)',
            'monto_neto': monto_neto,
            'monto_retencion': retencion,
            'monto_liquido': monto_neto - retencion,
        }
    
    def verificar_estado(self, folio: str) -> Dict[str, Any]:
        """
        Verifica el estado de una boleta en el SII.
        """
        
        if FALLBACK_MODE:
            return {
                'success': True,
                'folio': folio,
                'estado': 'PENDIENTE',
                'mensaje': 'Modo fallback - estado simulado',
            }
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
        }
        
        try:
            response = requests.get(
                f'{self.api_url}/boletas/{folio}/estado',
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'folio': result.get('folio'),
                    'estado': result.get('estado'),
                    'track_id': result.get('track_id'),
                }
            else:
                return {
                    'success': False,
                    'error': f'Error: {response.status_code}',
                }
                
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
            }


def main():
    parser = argparse.ArgumentParser(description='Emitir Boletas Electrónicas')
    parser.add_argument('--test', action='store_true', 
                       help='Ejecutar test de conexión')
    parser.add_argument('--folio', type=str,
                       help='Verificar estado de folio específico')
    parser.add_argument('--verify-env', action='store_true',
                       help='Verificar configuración de variables de entorno')
    
    args = parser.parse_args()
    
    emitter = BoletaEmitter()
    
    if args.verify_env:
        print("=" * 50)
        print("Configuración de Variables de Entorno")
        print("=" * 50)
        print(f"LIOREN_API_URL: {LIOREN_API_URL}")
        print(f"LIOREN_API_KEY: {'*' * 20 if LIOREN_API_KEY else 'NO CONFIGURADA'}")
        print(f"LIOREN_RUT_EMISOR: {LIOREN_RUT_EMISOR or 'NO CONFIGURADO'}")
        print(f"MODO FALLBACK: {FALLBACK_MODE}")
        print("=" * 50)
        return
    
    if args.test:
        # Test de conexión
        print("Ejecutando test de conexión...")
        test_boleta = {
            'paciente': {
                'rut': '12345678',
                'nombre': 'Test Paciente',
                'email': 'test@test.cl',
                'telefono': '+56912345678',
            },
            'servicio': {
                'descripcion': 'Test - Servicio de Psicología',
                'fecha_servicio': datetime.now().strftime('%Y-%m-%d'),
                'precio_unitario': 50000,
                'descuento': 0,
            },
        }
        
        result = emitter.emit_boleta(test_boleta)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return
    
    if args.folio:
        # Verificar estado
        result = emitter.verificar_estado(args.folio)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return
    
    # Leer desde stdin
    input_data = sys.stdin.read()
    
    if not input_data.strip():
        print("Error: No se recibió datos por stdin")
        print("Uso: echo '{}' | python boleta_emitter.py")
        sys.exit(1)
    
    try:
        datos_boleta = json.loads(input_data)
    except json.JSONDecodeError as e:
        print(f"Error: JSON inválido - {e}")
        sys.exit(1)
    
    result = emitter.emit_boleta(datos_boleta)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
