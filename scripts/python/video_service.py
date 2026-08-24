"""
Daily.co Video Service for PsyAI
Gestión de salas de videollamada
"""

import httpx
import os
from datetime import datetime, timedelta
from typing import Optional

DAILY_API_KEY = os.getenv("DAILY_API_KEY")
DAILY_API_URL = "https://api.daily.co/v1"

ROOM_EXPIRY_MINUTES = 60


class DailyCoService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or DAILY_API_KEY
        self.base_url = DAILY_API_URL
    
    def _headers(self) -> dict:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
    
    def create_room(self, appointment_id: str) -> dict:
        """
        Crea una sala efímera de Daily.co
        
        Args:
            appointment_id: ID de la cita para naming
            
        Returns:
            dict con room_url, room_name, etc.
        """
        if not self.api_key:
            raise ValueError("DAILY_API_KEY no configurada")
        
        # Nombre efímero basado en appointment
        room_name = f"psyai-{appointment_id}"
        
        # Calcular expiración (1 hora)
        now = datetime.utcnow()
        exp_timestamp = int((now + timedelta(hours=ROOM_EXPIRY_MINUTES)).timestamp())
        nbf_timestamp = int(now.timestamp())
        
        payload = {
            "name": room_name,
            "privacy": "private",
            "properties": {
                "max_participants": 2,
                "enable_screenshare": True,
                "enable_chat": True,
                "enable_knocking": False,
                "start_video_off": False,
                "start_audio_off": False,
                "enable_recording": False,
                "eject_at_room_exp": True,
                "enable_prejoin_ui": True,
                "enable_network_ui": True,
                "lang": "es",
                "nbf": nbf_timestamp,
                "exp": exp_timestamp,
            }
        }
        
        with httpx.Client() as client:
            response = client.post(
                f"{self.base_url}/rooms",
                json=payload,
                headers=self._headers(),
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise Exception(f"Error creating room: {response.text}")
            
            data = response.json()
            return {
                "room_url": data["room"]["url"],
                "room_name": data["room"]["name"],
                "expires_at": exp_timestamp,
            }
    
    def delete_room(self, room_name: str) -> bool:
        """
        Elimina una sala de Daily.co
        """
        if not self.api_key:
            raise ValueError("DAILY_API_KEY no configurada")
        
        with httpx.Client() as client:
            response = client.delete(
                f"{self.base_url}/rooms/{room_name}",
                headers=self._headers(),
            )
            
            # 404 es OK (la sala ya no existe)
            return response.status_code in [200, 404]
    
    def get_room(self, room_name: str) -> Optional[dict]:
        """
        Obtiene información de una sala existente
        """
        if not self.api_key:
            raise ValueError("DAILY_API_KEY no configurada")
        
        with httpx.Client() as client:
            response = client.get(
                f"{self.base_url}/rooms/{room_name}",
                headers=self._headers(),
            )
            
            if response.status_code == 404:
                return None
            
            if response.status_code != 200:
                raise Exception(f"Error getting room: {response.text}")
            
            return response.json()
    
    def create_token(
        self, 
        room_name: str, 
        user_name: str, 
        user_id: str,
        is_owner: bool = False
    ) -> str:
        """
        Crea un token de acceso para una sala
        """
        if not self.api_key:
            raise ValueError("DAILY_API_KEY no configurada")
        
        # Token válido por 2 horas
        exp_timestamp = int((datetime.utcnow() + timedelta(hours=2)).timestamp())
        
        payload = {
            "properties": {
                "room_name": room_name,
                "user_name": user_name,
                "user_id": user_id,
                "is_owner": is_owner,
                "exp": exp_timestamp,
                "enable_screenshare": True,
                "start_video_off": False,
                "start_audio_off": False,
            }
        }
        
        with httpx.Client() as client:
            response = client.post(
                f"{self.base_url}/meeting-tokens",
                json=payload,
                headers=self._headers(),
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise Exception(f"Error creating token: {response.text}")
            
            return response.json()["token"]


# Instancia singleton
daily_service = DailyCoService()
