# 🤖 Gemini Multi-Agents v3.0

## Agents disponibles (9)

| Agent | Rôle | Quand l'utiliser |
|-------|------|-----------------|
| `orchestrator` | Chef de projet | Démarrer une feature, planifier |
| `architect` | Conception système | Architecture, patterns, structure |
| `coder` | Développement | Implémenter, corriger du code |
| `database` | Données | Schémas, migrations, requêtes |
| `devops` | Infrastructure | Docker, CI/CD, déploiement |
| `qa` | Qualité & Sécurité | Tests, audits OWASP |
| `reviewer` | Code Review | Review, refactoring |
| `documenter` | Documentation | README, API docs, changelog |
| `github` | Git-Flow | Branches, PRs, issues, releases |

## Scripts disponibles (10)

| Script | Usage |
|--------|-------|
| `invoke.sh` | Invoquer n'importe quel agent |
| `new-feature.sh` | Planifier une feature (orchestrateur) |
| `audit.sh [--fix]` | Audit QA + sécurité (avec auto-correction) |
| `document.sh` | Générer la documentation |
| `branch.sh` | Créer une branche Git-Flow (avec stash auto) |
| `pr.sh` | Ouvrir une Pull Request |
| `issue.sh [--start]` | Créer une Issue (+ branche avec --start) |
| `release.sh` | Préparer une release |
| `tag.sh` | Publier un tag GitHub |
| `explore.sh` | Explorer l'état du repo |
| `security-scan.sh` | Scanner les secrets avant PR |
| `setup-env.sh` | Gérer le .env.example |

## 🧠 Mémoire Projet

Si `ARCHITECTURE.md` existe à la racine, il est **automatiquement injecté**
dans tous les agents via `invoke.sh`, `audit.sh` et `new-feature.sh`.

```bash
# Générer ARCHITECTURE.md la première fois
.gemini/scripts/invoke.sh architect "Documente l'architecture de ce projet"
# → Sauvegarder le résultat dans ARCHITECTURE.md
# → Désormais tous les agents connaissent les décisions d'architecture
```

## Workflow complet (du zéro à la prod)

```bash
# ─── Phase 1 : Setup ──────────────────────────────────────────────
.gemini/scripts/setup-env.sh --generate      # créer .env.example
.gemini/scripts/invoke.sh architect "Conçois l'architecture"  # → ARCHITECTURE.md

# ─── Phase 2 : Feature ────────────────────────────────────────────
.gemini/scripts/issue.sh feature "Auth JWT" --start   # issue + branche
.gemini/scripts/invoke.sh coder "Implémente le service JWT"
.gemini/scripts/audit.sh src/services/AuthService.js --fix

# ─── Phase 3 : PR ─────────────────────────────────────────────────
.gemini/scripts/security-scan.sh src/         # scan avant PR
.gemini/scripts/pr.sh                         # ouvre la PR

# ─── Phase 4 : Release ────────────────────────────────────────────
.gemini/scripts/release.sh 1.1.0
.gemini/scripts/tag.sh 1.1.0 "Ajout Auth JWT"

# ─── Exploration ──────────────────────────────────────────────────
.gemini/scripts/explore.sh status
.gemini/scripts/explore.sh issues open
```
