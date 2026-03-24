#!/usr/bin/env bash
# Usage : ./.gemini/scripts/invoke.sh <agent> "<prompt>"

AGENT=$1; PROMPT=$2
AGENTS=(orchestrator architect coder database devops qa reviewer documenter github)

[ -z "$AGENT" ] && { echo "❌ Agent requis. Disponibles : ${AGENTS[*]}"; exit 1; }

SKILL_FILE=".gemini/skills/$AGENT/SKILL.md"
[ ! -f "$SKILL_FILE" ] && { echo "❌ Agent '$AGENT' introuvable."; exit 1; }

SYSTEM=$(cat "$SKILL_FILE")

# Injection mémoire projet
if [ -f "ARCHITECTURE.md" ]; then
  ARCH=$(cat "ARCHITECTURE.md")
  SYSTEM="$SYSTEM

---
## 📐 Contexte Architecture du Projet (ARCHITECTURE.md)
$ARCH"
  echo "  ℹ Mémoire projet injectée (ARCHITECTURE.md)"
fi

echo "🤖 Agent: $AGENT | Prompt: $PROMPT"
echo "─────────────────────────────────────────"
gemini -p "### ROLE: $AGENT
$SYSTEM

### TASK
$PROMPT"
