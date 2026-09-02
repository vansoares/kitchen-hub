# KitchenHub

Hub de cozinha rodando num Raspberry Pi, com uma tela touchscreen fixada na
parede como "launcher" (Despensa, YouTube, outros atalhos) e a mesma despensa
acessível do celular pela rede/Tailscale — inclusive fora de casa.

Identidade visual inspirada em azulejo português (azul cobalto, branco cru,
terracota), na mesma linha do projeto pessoal "Azulejo" (habit tracker).

## Estrutura

```
KitchenHub/
├── backend/          # API FastAPI + SQLite
│   └── app/
│       ├── main.py       # app FastAPI, monta o frontend buildado
│       ├── models.py     # Item, ConsumptionLog (SQLAlchemy)
│       ├── schemas.py     # Pydantic
│       ├── crud.py        # regras de negocio (status, estoque, historico)
│       └── routers/       # items, history, barcode
├── frontend/         # React + Vite, PWA instalável
│   └── src/
│       ├── pages/          # Launcher, Pantry (Despensa), Streams
│       ├── components/     # ItemCard, ItemForm, BarcodeScanner, Badge
│       └── config/          # atalhos do launcher (editável sem tocar em código)
└── infra/
    ├── systemd/       # servico do backend (systemd)
    └── kiosk/         # script + autostart do Chromium em modo kiosk
```

## Modelo de dados

**Item**: nome, quantidade, unidade, categoria, código de barras, estoque
mínimo, data de validade, data da última compra.

**ConsumptionLog**: todo evento que muda o estoque (criação, compra, consumo,
ajuste manual) fica registrado — é a base do histórico de consumo.

Status de um item é *calculado*, não guardado: `vencido` > `vencendo` (até 3
dias, configurável em `crud.py:EXPIRY_WARNING_DAYS`) > `acabando` (estoque ≤
mínimo) > `ok`.

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/items` | lista (filtros `?search=` e `?category=`) |
| GET | `/api/items/alerts` | itens acabando e/ou vencendo/vencidos |
| GET | `/api/items/categories` | categorias distintas em uso |
| GET/POST | `/api/items/{id}` | detalhe / criar |
| PUT/DELETE | `/api/items/{id}` | editar / remover |
| POST | `/api/items/{id}/purchase` | marca como comprado (`{amount}` soma ao estoque) |
| POST | `/api/items/{id}/consume` | registra consumo (`{amount}` subtrai do estoque) |
| GET | `/api/items/{id}/history` | histórico de um item |
| GET | `/api/history` | histórico global |
| GET | `/api/barcode/lookup/{code}` | consulta Open Food Facts para pré-preencher nome/categoria |

Docs interativas em `http://<host>:8000/docs` (Swagger, gerado pelo FastAPI).

## Rodando em desenvolvimento

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

```bash
# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

O Vite roda em `http://localhost:5173` e faz proxy de `/api` para o backend em
`:8000` (veja `frontend/vite.config.js`). Abra pelo celular na mesma rede
usando o IP da máquina (`npm run dev` já expõe com `--host`).

## Deploy no Raspberry Pi

1. Instale Python 3.11+ e Node 18+ no Pi (`sudo apt install python3-venv nodejs npm`, ou via `nvm` para uma versão mais nova do Node).
2. Clone o projeto no Pi (ex: `/home/pi/KitchenHub`).
3. Backend:
   ```bash
   cd ~/KitchenHub/backend
   python3 -m venv venv
   venv/bin/pip install -r requirements.txt
   ```
4. Build do frontend (pode ser feito no seu PC e copiado, ou direto no Pi):
   ```bash
   cd ~/KitchenHub/frontend
   npm install
   npm run build
   ```
   Isso gera `frontend/dist/`. O backend detecta essa pasta automaticamente e
   passa a servir o app inteiro em `http://<pi>:8000/` — não precisa de nginx.
5. Suba o backend como serviço (inicia sozinho no boot):
   ```bash
   sudo cp infra/systemd/kitchenhub-backend.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now kitchenhub-backend
   ```
6. Confira: `http://<ip-do-pi>:8000` deve mostrar o launcher.

## Modo kiosk (tela touch na parede)

Com o Raspberry Pi OS Desktop instalado e logado automaticamente:

```bash
chmod +x infra/kiosk/kitchenhub-kiosk.sh
mkdir -p ~/.config/autostart
cp infra/kiosk/kitchenhub-kiosk.desktop ~/.config/autostart/
```

Ajuste o caminho `Exec=` do `.desktop` se o projeto não estiver em
`/home/pi/KitchenHub`. No próximo boot, o Chromium abre sozinho em tela cheia
em `http://localhost:8000`, sem barra de endereço e sem protetor de tela.

Para habilitar login automático de desktop: `sudo raspi-config` → *System
Options* → *Boot / Auto Login* → *Desktop Autologin*.

## Acesso remoto seguro (Tailscale)

Em vez de abrir portas no roteador, o Pi entra numa VPN mesh privada — só os
seus dispositivos autenticados enxergam o Pi, de qualquer lugar.

```bash
# No Raspberry Pi
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

O comando imprime um link — abra-o no navegador (uma vez) para autenticar
com sua conta. Depois disso, anote o nome Tailscale do Pi (ex.
`kitchenhub.tailXXXX.ts.net`, veja em `tailscale status`).

No celular, instale o app Tailscale, conecte com a mesma conta, e acesse:

```
http://kitchenhub:8000
```

(ou o IP `100.x.x.x` mostrado em `tailscale status`). Isso funciona de
qualquer rede — inclusive no mercado — sem VPN manual nem porta exposta.

### Instalar como PWA no celular

Acesse `http://kitchenhub:8000` pelo Chrome/Safari do celular → menu → "Adicionar
à tela inicial" / "Instalar app". O manifest já está configurado
(`frontend/vite.config.js`) para abrir em modo standalone, sem barra do
navegador.

## Leitor de código de barras

Na tela de Despensa, ao criar/editar um item, o botão 📷 abre a câmera do
celular (via `html5-qrcode`) e busca o produto na Open Food Facts para
pré-preencher nome e categoria. Funciona melhor no celular (câmera traseira);
no Pi sem câmera, basta digitar o código manualmente.

## Personalizando os atalhos do launcher

Edite `frontend/src/config/launcherConfig.js` — cada atalho é um objeto com
`label`, `icon` (emoji), `tileClass` (cor, veja `theme.css`) e `type`
(`internal` navega dentro do app, `external` abre em nova aba/janela).
