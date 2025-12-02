#!/usr/bin/env python3
"""
Script para iniciar el servidor de AI FastAPI
"""

import os
import sys
from pathlib import Path

# Agregar el directorio raíz al path
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

if __name__ == "__main__":
    import uvicorn

    # Configuración del servidor
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    print("=" * 60)
    print("🤖 Iniciando servidor de AI - Psicólogo Virtual")
    print("=" * 60)
    print(f"📍 Host: {host}")
    print(f"🔌 Puerto: {port}")
    print(f"📁 Directorio: {ROOT}")
    print(f"🧠 Modelo: {ROOT / 'models' / 'Meta-Llama-3-8B-Instruct.Q5_K_M.gguf'}")
    print("=" * 60)
    print("\n⚡ El servidor se está iniciando...")
    print("⏳ Cargando modelos (esto puede tomar unos minutos)...\n")

    # Iniciar servidor
    uvicorn.run(
        "api.main:app",
        host=host,
        port=port,
        reload=False,  # No recargar en producción para mantener el modelo en memoria
        log_level="info",
    )
