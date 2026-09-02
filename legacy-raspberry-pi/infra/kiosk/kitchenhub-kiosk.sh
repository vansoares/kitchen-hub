#!/bin/bash
# Abre o Chromium em modo kiosk apontando para o KitchenHub local.
# Pensado para rodar no boot da tela touch fixada na parede.
#
# Instalar (Raspberry Pi OS Desktop, Bookworm ou anterior):
#   mkdir -p ~/.config/autostart
#   cp infra/kiosk/kitchenhub-kiosk.desktop ~/.config/autostart/
#   chmod +x infra/kiosk/kitchenhub-kiosk.sh

set -e

URL="http://localhost:8000"

# Desliga o gerenciamento de energia/protetor de tela da sessao X,
# senao a tela apaga sozinha depois de alguns minutos parada.
xset s off
xset s noblank
xset -dpms

# Espera o backend responder antes de abrir o navegador (o systemd pode
# ainda estar subindo o uvicorn quando o desktop autostart dispara).
for i in $(seq 1 30); do
  if curl -sf "$URL/api/health" > /dev/null; then
    break
  fi
  sleep 1
done

exec chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --app="$URL"
