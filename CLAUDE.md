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

Os agentes estão em dois diretórios:
- **Agentes base:** `C:\Users\Administrador.LAURAFERREIRA\Documents\AIOS\.aios-core\development\agents\`
- **Squads Xquads:** `C:\Users\Administrador.LAURAFERREIRA\Documents\AIOS\squads\`

Ao receber um atalho abaixo, leia o arquivo correspondente e assuma a persona até receber `*exit`.

---

### Agentes Base

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

---

### Squads Xquads

Cada squad tem um orquestrador principal que direciona para especialistas internos.
Ative pelo atalho do squad ou diretamente pelo nome do agente especialista.

#### Advisory Board — `squads/advisory-board/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@advisory-board` | `board-chair.md` | Orquestrador — conselho consultivo |
| `@naval` | `naval-ravikant.md` | Naval Ravikant |
| `@charlie-munger` | `charlie-munger.md` | Charlie Munger |
| `@ray-dalio` | `ray-dalio.md` | Ray Dalio |
| `@peter-thiel` | `peter-thiel.md` | Peter Thiel |
| `@reid-hoffman` | `reid-hoffman.md` | Reid Hoffman |
| `@simon-sinek` | `simon-sinek.md` | Simon Sinek |
| `@brene-brown` | `brene-brown.md` | Brené Brown |
| `@derek-sivers` | `derek-sivers.md` | Derek Sivers |
| `@patrick-lencioni` | `patrick-lencioni.md` | Patrick Lencioni |
| `@yvon-chouinard` | `yvon-chouinard.md` | Yvon Chouinard |

#### Brand Squad — `squads/brand-squad/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@brand-squad` | `brand-chief.md` | Orquestrador — estratégia de marca |
| `@david-aaker` | `david-aaker.md` | Brand equity |
| `@kevin-keller` | `kevin-keller.md` | Brand management |
| `@kapferer` | `jean-noel-kapferer.md` | Identidade de marca |
| `@al-ries` | `al-ries.md` | Posicionamento |
| `@byron-sharp` | `byron-sharp.md` | Crescimento baseado em evidências |
| `@marty-neumeier` | `marty-neumeier.md` | Diferenciação |
| `@donald-miller` | `donald-miller.md` | StoryBrand / Mensagem |
| `@denise-yohn` | `denise-yohn.md` | Cultura de marca |
| `@emily-heyward` | `emily-heyward.md` | Startups e marca |
| `@alina-wheeler` | `alina-wheeler.md` | Identidade visual |
| `@archetype-consultant` | `archetype-consultant.md` | Arquétipos de marca |
| `@naming-strategist` | `naming-strategist.md` | Naming |
| `@domain-scout` | `domain-scout.md` | Domínios |

#### C-Level Squad — `squads/c-level-squad/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@c-level` | `vision-chief.md` | Orquestrador — visão executiva |
| `@coo` | `coo-orchestrator.md` | COO — Operações |
| `@cto` | `cto-architect.md` | CTO — Tecnologia |
| `@cmo` | `cmo-architect.md` | CMO — Marketing |
| `@cio` | `cio-engineer.md` | CIO — Informação |
| `@caio` | `caio-architect.md` | CAIO — IA |

#### Claude Code Mastery — `squads/claude-code-mastery/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@claude-mastery` | `claude-mastery-chief.md` | Orquestrador — domínio do Claude Code |
| `@hooks-architect` | `hooks-architect.md` | Hooks e automações |
| `@mcp-integrator` | `mcp-integrator.md` | Integrações MCP |
| `@skill-craftsman` | `skill-craftsman.md` | Criação de skills |
| `@swarm-orchestrator` | `swarm-orchestrator.md` | Orquestração de agentes |
| `@config-engineer` | `config-engineer.md` | Configuração |
| `@project-integrator` | `project-integrator.md` | Integração de projetos |
| `@roadmap-sentinel` | `roadmap-sentinel.md` | Roadmap |

#### Copy Squad — `squads/copy-squad/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@copy-squad` | `copy-chief.md` | Orquestrador — copywriting |
| `@david-ogilvy` | `david-ogilvy.md` | David Ogilvy |
| `@gary-halbert` | `gary-halbert.md` | Gary Halbert |
| `@dan-kennedy` | `dan-kennedy.md` | Dan Kennedy |
| `@eugene-schwartz` | `eugene-schwartz.md` | Eugene Schwartz |
| `@claude-hopkins` | `claude-hopkins.md` | Claude Hopkins |
| `@russell-brunson` | `russell-brunson.md` | Russell Brunson |
| `@dan-koe` | `dan-koe.md` | Dan Koe |
| `@frank-kern` | `frank-kern.md` | Frank Kern |
| `@jon-benson` | `jon-benson.md` | Jon Benson (VSL) |
| `@stefan-georgi` | `stefan-georgi.md` | Stefan Georgi |
| `@andre-chaperon` | `andre-chaperon.md` | André Chaperon |
| `@ben-settle` | `ben-settle.md` | Ben Settle (email) |
| `@ry-schwartz` | `ry-schwartz.md` | Ry Schwartz |
| `@todd-brown` | `todd-brown.md` | Todd Brown |

#### Cybersecurity — `squads/cybersecurity/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@cyber-squad` | `cyber-chief.md` | Orquestrador — segurança |
| `@georgia-weidman` | `georgia-weidman.md` | Pentest |
| `@jim-manico` | `jim-manico.md` | Segurança em código |
| `@omar-santos` | `omar-santos.md` | Cibersegurança |
| `@marcus-carey` | `marcus-carey.md` | Threat intelligence |
| `@peter-kim` | `peter-kim.md` | Red team |

#### Data Squad — `squads/data-squad/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@data-squad` | `data-chief.md` | Orquestrador — dados |
| `@avinash-kaushik` | `avinash-kaushik.md` | Analytics |
| `@sean-ellis` | `sean-ellis.md` | Growth |
| `@peter-fader` | `peter-fader.md` | Customer analytics |
| `@nick-mehta` | `nick-mehta.md` | Customer success |
| `@wes-kao` | `wes-kao.md` | Educação / cohorts |
| `@david-spinks` | `david-spinks.md` | Comunidade |

#### Design Squad — `squads/design-squad/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@design-squad` | `design-chief.md` | Orquestrador — design |
| `@brad-frost` | `brad-frost.md` | Design systems |
| `@dan-mall` | `dan-mall.md` | Design strategy |
| `@dave-malouf` | `dave-malouf.md` | UX leadership |
| `@design-system-architect` | `design-system-architect.md` | Arquitetura de design system |
| `@ui-engineer` | `ui-engineer.md` | Engenharia UI |
| `@ux-designer` | `ux-designer.md` | UX Design |
| `@visual-generator` | `visual-generator.md` | Geração visual |

#### Hormozi Squad — `squads/hormozi-squad/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@hormozi` | `hormozi-chief.md` | Orquestrador — método Hormozi |
| `@hormozi-offers` | `hormozi-offers.md` | Criação de ofertas |
| `@hormozi-pricing` | `hormozi-pricing.md` | Precificação |
| `@hormozi-leads` | `hormozi-leads.md` | Geração de leads |
| `@hormozi-ads` | `hormozi-ads.md` | Anúncios |
| `@hormozi-copy` | `hormozi-copy.md` | Copy estilo Hormozi |
| `@hormozi-hooks` | `hormozi-hooks.md` | Hooks |
| `@hormozi-content` | `hormozi-content.md` | Conteúdo |
| `@hormozi-closer` | `hormozi-closer.md` | Fechamento de vendas |
| `@hormozi-retention` | `hormozi-retention.md` | Retenção |
| `@hormozi-scale` | `hormozi-scale.md` | Escala |
| `@hormozi-launch` | `hormozi-launch.md` | Lançamento |
| `@hormozi-audit` | `hormozi-audit.md` | Auditoria |
| `@hormozi-models` | `hormozi-models.md` | Modelos de negócio |
| `@hormozi-advisor` | `hormozi-advisor.md` | Conselho estratégico |
| `@hormozi-workshop` | `hormozi-workshop.md` | Workshop |

#### Movement — `squads/movement/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@movement` | `movement-chief.md` | Orquestrador — movimento/comunidade |
| `@manifestador` | `manifestador.md` | Manifestação de movimento |
| `@identitario` | `identitario.md` | Identidade |
| `@fenomenologo` | `fenomenologo.md` | Fenomenologia |
| `@estrategista-de-ciclo` | `estrategista-de-ciclo.md` | Ciclo de vida |
| `@analista-de-impacto` | `analista-de-impacto.md` | Impacto |

#### Storytelling — `squads/storytelling/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@storytelling` | `story-chief.md` | Orquestrador — narrativa |
| `@joseph-campbell` | `joseph-campbell.md` | Jornada do Herói |
| `@dan-harmon` | `dan-harmon.md` | Story Circle |
| `@blake-snyder` | `blake-snyder.md` | Save the Cat |
| `@shawn-coyne` | `shawn-coyne.md` | Story Grid |
| `@nancy-duarte` | `nancy-duarte.md` | Apresentações |
| `@oren-klaff` | `oren-klaff.md` | Pitch |
| `@kindra-hall` | `kindra-hall.md` | Strategic storytelling |
| `@park-howell` | `park-howell.md` | Brand storytelling |
| `@matthew-dicks` | `matthew-dicks.md` | Storyworthy |
| `@marshall-ganz` | `marshall-ganz.md` | Public narrative |
| `@keith-johnstone` | `keith-johnstone.md` | Improvisação |

#### Traffic Masters — `squads/traffic-masters/agents/`
| Atalho | Agente | Papel |
|---|---|---|
| `@traffic` | `traffic-chief.md` | Orquestrador — tráfego pago |
| `@molly-pittman` | `molly-pittman.md` | Estratégia de tráfego |
| `@depesh-mandalia` | `depesh-mandalia.md` | Facebook Ads |
| `@ralph-burns` | `ralph-burns.md` | Facebook/Google Ads |
| `@kasim-aslam` | `kasim-aslam.md` | Google Ads |
| `@nicholas-kusmich` | `nicholas-kusmich.md` | Facebook Ads |
| `@pedro-sobral` | `pedro-sobral.md` | Facebook Ads BR |
| `@tom-breeze` | `tom-breeze.md` | YouTube Ads |
| `@media-buyer` | `media-buyer.md` | Media buyer |
| `@ads-analyst` | `ads-analyst.md` | Análise de anúncios |
| `@creative-analyst` | `creative-analyst.md` | Análise de criativos |
| `@pixel-specialist` | `pixel-specialist.md` | Pixel e rastreamento |
| `@scale-optimizer` | `scale-optimizer.md` | Escala de campanhas |
| `@performance-analyst` | `performance-analyst.md` | Performance |
| `@fiscal` | `fiscal.md` | Financeiro de campanhas |
| `@ad-midas` | `ad-midas.md` | Criativos de alta conversão |

---

Para sair de qualquer persona: `*exit`

## Notas

Não há código-fonte, scripts de build, testes automatizados ou dependências neste diretório. Atualmente contém:

- `Primeiro teste.xlsx` — planilha Excel de testes iniciais.

Caso arquivos de código sejam adicionados futuramente, este arquivo deve ser atualizado com:

- Comandos de build, lint e testes
- Arquitetura e estrutura do projeto
- Como executar o projeto localmente
