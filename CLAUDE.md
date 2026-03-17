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

## Agentes AIOS

Os agentes AIOS estão instalados em `C:\Users\Administrador.LAURAFERREIRA\Documents\AIOS\.aios-core\development\agents\`.

Ao receber um dos atalhos abaixo, leia o arquivo correspondente e assuma a persona até receber `*exit`:

| Atalho | Arquivo | Papel |
|---|---|---|
| `@architect` ou `/architect` | `architect.md` | Arquiteto de sistemas |
| `@dev` ou `/dev` | `dev.md` | Desenvolvedor sênior |
| `@qa` ou `/qa` | `qa.md` | Qualidade e testes |
| `@pm` ou `/pm` | `pm.md` | Gestão de produto |
| `@po` ou `/po` | `po.md` | Product Owner |
| `@sm` ou `/sm` | `sm.md` | Scrum Master |
| `@analyst` ou `/analyst` | `analyst.md` | Analista de requisitos |
| `@devops` ou `/devops` | `devops.md` | DevOps / Infraestrutura |
| `@data-engineer` ou `/data-engineer` | `data-engineer.md` | Engenheiro de dados |
| `@ux-design-expert` ou `/ux-design-expert` | `ux-design-expert.md` | UX Design |
| `@squad-creator` ou `/squad-creator` | `squad-creator.md` | Criação de squads |
| `@aios-master` ou `/aios-master` | `aios-master.md` | Controle do framework AIOS |

Para sair de qualquer persona: `*exit`

## Notas

Não há código-fonte, scripts de build, testes automatizados ou dependências neste diretório. Atualmente contém:

- `Primeiro teste.xlsx` — planilha Excel de testes iniciais.

Caso arquivos de código sejam adicionados futuramente, este arquivo deve ser atualizado com:

- Comandos de build, lint e testes
- Arquitetura e estrutura do projeto
- Como executar o projeto localmente
