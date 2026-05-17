#!/bin/sh
set -eu

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

spinner() {
  pid=$1 msg=$2
  i=0
  while kill -0 "$pid" 2>/dev/null; do
    i=$((i + 1))
    case $((i % 4)) in
      0) s='|' ;;
      1) s='/' ;;
      2) s='-' ;;
      3) s='\' ;;
    esac
    printf "\r  ${CYAN}%s${RESET} %s" "$s" "$msg"
    sleep 0.1
  done
  wait "$pid"
  rc=$?
  if [ $rc -eq 0 ]; then
    printf "\r  ${GREEN}✓${RESET} %s  \n" "$msg"
  else
    printf "\r  ${RED}✗${RESET} %s  \n" "$msg"
  fi
  return $rc
}

BIN_DIR="$HOME/.local/bin"
ZING_BIN="$BIN_DIR/zinglang"
ZPM_BIN="$BIN_DIR/zpm"
CACHE_DIR="$HOME/.zing_modules"
RELEASE_TAG="v1.0"
BASE_URL="https://github.com/mihai209/ZingLang/releases/download/$RELEASE_TAG"

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

  # 1. Detect platform
  local arch=""
  case "$(uname -m)" in
    x86_64|amd64) arch="x86_64" ;;
    aarch64|arm64) arch="aarch64" ;;
    *)
      err "Arhitectură nesuportată: $(uname -m)"
      exit 1
      ;;
  esac

  local os=""
  case "$(uname -s)" in
    Linux)  os="linux" ;;
    Darwin) os="macos" ;;
    *)
      err "Sistem de operare nesuportat: $(uname -s)"
      exit 1
      ;;
  esac

  local asset="zinglang-${os}-${arch}"
  local url="$BASE_URL/$asset"

  # 2. Create ~/.local/bin if missing
  if [ ! -d "$BIN_DIR" ]; then
    mkdir -p "$BIN_DIR"
    ok "Creat: $BIN_DIR"
  else
    info "Există deja: $BIN_DIR"
  fi

  # 3. Download zinglang binary
  info "Detectat: ${os} ${arch}"
  (
    curl -fsSL "$url" -o "$ZING_BIN" 2>/dev/null
  ) &
  if ! spinner $! "Descărcare ${asset}"; then
    err "Eșec la descărcarea '${asset}'. Verifică conexiunea și URL-ul."
    exit 1
  fi
  chmod +x "$ZING_BIN"
  ok "Instalat: ${ZING_BIN}"

  # 4. Install zpm via zinglang --install-tools
  (
    "$ZING_BIN" --install-tools >/dev/null 2>&1
  ) &
  if ! spinner $! "Se instalează zpm..."; then
    warn "zpm nu a putut fi instalat. Rulează 'zinglang --install-tools' manual."
  fi

  # 5. Check PATH
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
  printf "  ${GREEN}${BOLD}✓ ZingLang a fost instalat global!${RESET}\n"
  printf "  Rulează ${CYAN}zinglang${RESET} pentru a începe.\n"
  echo ""
}

# ── Dispatch ───────────────────────────────────────────────────────────

case "${1:-}" in
  --uninstall|-u|remove) uninstall ;;
  --help|-h)             sed -n '3,7p' "$0"; exit 0 ;;
  *)                     install ;;
esac
