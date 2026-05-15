#!/bin/bash
# Double-clic sur ce fichier dans le Finder pour lancer JARVIS
# (macOS uniquement)

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     J.A.R.V.I.S. — DÉMARRAGE        ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Vérifier Node.js
if ! command -v node &>/dev/null; then
  echo "❌ Node.js non trouvé. Installe-le sur https://nodejs.org"
  echo "   Puis relance ce fichier."
  read -p "Appuie sur Entrée pour fermer..."
  exit 1
fi

echo "✅ Node.js $(node --version)"

# Installer les dépendances si besoin
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install --silent
fi

echo "🚀 Lancement de JARVIS..."
echo ""
npm start
