#!/usr/bin/env bash
set -euo pipefail

# ── ZingLang Installer / Uninstaller ──────────────────────────────────
#   Usage:
#     curl -fsSL https://mihai209.github.io/ZingLang/install.sh | sh
#     curl -fsSL https://mihai209.github.io/ZingLang/install.sh | sh -s -- --uninstall
# ───────────────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

info()  { printf "  ${CYAN}→${RESET} %s\n" "$*"; }
ok()    { printf "  ${GREEN}✓${RESET} %s\n" "$*"; }
warn()  { printf "  ${YELLOW}⚠${RESET} %s\n" "$*"; }
err()   { printf "  ${RED}✗${RESET} %s\n" "$*"; }

BIN_DIR="$HOME/.local/bin"
ZING_BIN="$BIN_DIR/zing"
ZPM_BIN="$BIN_DIR/zpm"
CACHE_DIR="$HOME/.zing_modules"
BASE_URL="https://mihai209.github.io/ZingLang/bin"

# ── Uninstall ──────────────────────────────────────────────────────────

uninstall() {
  echo ""; info "Dezinstalare ZingLang..."; echo ""

  local removed=false

  if [ -f "$ZING_BIN" ]; then
    rm -f "$ZING_BIN"
    ok "Eliminat: $ZING_BIN"; removed=true
  fi

  if [ -f "$ZPM_BIN" ]; then
    rm -f "$ZPM_BIN"
    ok "Eliminat: $ZPM_BIN"; removed=true
  fi

  if [ -d "$CACHE_DIR" ]; then
    rm -rf "$CACHE_DIR"
    ok "Eliminat cache: $CACHE_DIR"; removed=true
  fi

  if [ "$removed" = false ]; then
    info "Nicio instalare ZingLang detectată."
  fi

  echo ""; printf "  ${RED}[×]${RESET} ZingLang a fost eliminat din sistem.\n"; echo ""
  exit 0
}

# ── Install ────────────────────────────────────────────────────────────

install() {
  echo ""
  info "Începe instalarea ZingLang..."
  echo ""

  # 1. Create ~/.local/bin if missing
  if [ ! -d "$BIN_DIR" ]; then
    mkdir -p "$BIN_DIR"
    ok "Creat: $BIN_DIR"
  else
    info "Există deja: $BIN_DIR"
  fi

  # 2. Download binaries
  for bin in zing zpm; do
    local url="$BASE_URL/$bin"
    local dest="$BIN_DIR/$bin"
    info "Descărcare: $url"
    if ! curl -fsSL "$url" -o "$dest"; then
      err "Eșec la descărcarea '$bin'. Verifică conexiunea și URL-ul."
      exit 1
    fi
    chmod +x "$dest"
    ok "Instalat: $dest"
  done

  # 3. Check PATH
  case ":$PATH:" in
    *":$BIN_DIR:"*) ;;
    *)
      warn "$BIN_DIR nu este în \$PATH."
      echo ""
      printf "  Adaugă această linie în ~/.bashrc sau ~/.zshrc:\n"
      printf "  ${CYAN}    export PATH=\"\$HOME/.local/bin:\$PATH\"${RESET}\n"
      echo ""
      ;;
  esac

  echo ""
  printf "  ${GREEN}${BOLD}✓ ZingLang și zpm au fost instalate global!${RESET}\n"
  printf "  Rulează ${CYAN}zpm install${RESET} într-un proiect ZingLang.\n"
  echo ""
}

# ── Dispatch ───────────────────────────────────────────────────────────

case "${1:-}" in
  --uninstall|-u|remove) uninstall ;;
  --help|-h)             sed -n '3,7p' "$0"; exit 0 ;;
  *)                     install ;;
esac
