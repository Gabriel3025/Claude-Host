# PROSPECTOR

Aplicativo local de captação e qualificação de leads comerciais. Busca empresas no Google Maps, verifica se elas têm site, calcula um score de 0 a 100 indicando a chance de venderem um site novo, e organiza tudo para você começar a ligar.

## Como usar (sem programação)

1. Dê **duplo-clique em `start.bat`**.
   - Na primeira vez, ele instala tudo sozinho (pode levar alguns minutos). Nas próximas vezes é instantâneo.
   - O navegador abre automaticamente em `http://127.0.0.1:8517`.
2. Na primeira vez, abra **Configurações** e cole seu token da Apify (veja abaixo como conseguir).
3. Volte ao **Painel**, escolha o nicho, cidade/UF e quantidade de leads, e clique em **INICIAR BUSCA**.

## Como conseguir o token da Apify

1. Crie uma conta gratuita em https://apify.com
2. Vá em **Settings → Integrations** e copie o **API token**.
3. Cole em PROSPECTOR → Configurações → campo do token → **Salvar** → **Testar conexão**.

O plano gratuito da Apify cobra aproximadamente **US$ 0,004 por lead coletado** (100 leads ≈ US$ 0,40).

## Requisitos (instalados automaticamente pelo `start.bat` se já existirem no sistema)

- Python 3.11 ou superior — https://python.org
- Node.js 18 ou superior — https://nodejs.org

## Limitações conhecidas

- O Actor da Apify pode retornar menos leads que o solicitado em cidades pequenas ou nichos raros.
- Horário de funcionamento e algumas informações de detalhe não são coletados na v1 (exigem add-ons pagos da Apify).
- A detecção de "site fraco" é heurística — os motivos do score sempre explicam o porquê.
- Sites protegidos por Cloudflare ou similares podem aparecer como erro de conexão — isso ainda indica fricção técnica no site do lead.
- Números fixos não geram botão de WhatsApp (por design).

## Estrutura do projeto

```
backend/    API FastAPI, pipeline de coleta/scoring, integração Apify
frontend/   Interface React (Vite)
data/       Banco SQLite e logs (criado automaticamente, não versionado)
tests/      Testes automatizados (pytest)
```

## Rodando os testes

```
venv\Scripts\python.exe -m pytest tests\ -v
```
