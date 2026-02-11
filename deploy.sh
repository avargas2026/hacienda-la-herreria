#!/bin/bash
echo "🚀 Iniciando despliegue de Hacienda La Herrería..."

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Iniciar sesión en Vercel
echo "🔐 Por favor, inicia sesión en Vercel (si se te solicita)..."
vercel login

# Desplegar
echo "☁️ Desplegando a Vercel..."
vercel --prod

echo "✅ Despliegue completado."
