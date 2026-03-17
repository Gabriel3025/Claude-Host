# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repositório GitHub

Este projeto está sincronizado com: https://github.com/Gabriel3025/Claude-Host

## Sincronização Automática

A cada vez que uma sessão do Claude Code termina, um hook automático executa:

```bash
git add .
git commit -m "Auto-update: <data e hora>"
git push origin master
```

Isso garante que todas as alterações feitas pelo Claude sejam enviadas automaticamente ao GitHub.

O hook está configurado em `.claude/settings.json` (evento `Stop`).

## Notas

Não há código-fonte, scripts de build, testes automatizados ou dependências neste diretório. Atualmente contém:

- `Primeiro teste.xlsx` — planilha Excel de testes iniciais.

Caso arquivos de código sejam adicionados futuramente, este arquivo deve ser atualizado com:

- Comandos de build, lint e testes
- Arquitetura e estrutura do projeto
- Como executar o projeto localmente
