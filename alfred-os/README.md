# ALFRED OS — Second Brain OS

Painel de operações para o vault de conhecimento pessoal, com mapa radial de agentes AIOS, visualização de dados ao vivo e controle por voz.

## Desenvolvimento

```bash
npm run dev
```

Sobe:
- Vite dev em `http://localhost:5173`
- Backend em `http://localhost:4317`
- Proxy de `/api` e `/ws` do Vite para o backend

## Produção

```bash
npm start
```

Faz build e serve em `http://localhost:4317` (origem única, sem CORS).

## Estrutura

```
src/
├── components/
│   ├── Sidebar.tsx          Navegação entre views
│   ├── TopBar.tsx           Modo, tabs, status
│   └── VoiceBar.tsx         Controle de voz
├── canvas/
│   ├── Nebula.ts            Fundo nebuloso (WebGL)
│   ├── RadialField.ts       Campo radial (núcleo + clusters)
│   └── useCanvas.ts         Hook de ciclo de vida
├── views/
│   ├── Radial.tsx           Visualização radial com interação
│   └── Home.tsx             Container do fundo (em construção)
├── App.tsx
├── main.tsx
└── theme.css                Variáveis de design

server/
├── index.js                 Servidor Express + WebSocket
└── [vault.js, agents.js, watcher.js] — Fase 4+

index.html
vite.config.ts
package.json
```

## Fases Completadas

- **Fase 1** ✅ Shell com sidebar, topbar, navegação
- **Fase 2** ✅ Fundo nebuloso animado (WebGL/shader)
- **Fase 3** ✅ Campo radial (núcleo + 6 clusters + ramificações)

## Próximas Fases

- **Fase 4** — Dados do vault em tempo real (chokidar + watcher)
- **Fase 5** — Controle de voz (Wake word "Alfred")
- **Fase 6** — Executar agentes e acompanhar em tempo real

## Design

Paleta escura futurista com tons azuis/ciano + amarelo/laranja para clusters.

```
--bg-deep:      #030711
--accent:       #4da3ff
--accent-glow:  #7fd4ff
--warn:         #ffb84d
```

## Notas

- Sem Tailwind: CSS puro com variáveis tema.
- Sem react-router: navegação por `useState`.
- Fundo em duas camadas: WebGL (nebula) + Canvas 2D (stars, radial field).
- Interação: hover nos clusters muda glow; clique abre painel lateral.
