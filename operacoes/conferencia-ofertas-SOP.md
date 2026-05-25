# SOP — Conferência de Ofertas (Facebook Ads Library)

## Objetivo
Coletar automaticamente a contagem de anúncios ativos de cada produto na Facebook Ads Library e registrar na planilha "Acompanhamento Ofertas" para o dia especificado.

## Estrutura de Pastas
```
Claude (Host)/
├── operacoes/
│   ├── conferencia-ofertas-SOP.md (este arquivo)
│   ├── conferencia-ofertas.js (orquestrador principal)
│   ├── coleta_robusta.py (coleta de dados)
│   └── escrita_robusta.js (escrita na planilha)
├── coleta_python.json (saída da coleta)
└── [ficheiros de auth]
```

## Fluxo de Execução

### Passo 1: Executar Coleta
```bash
cd "C:\Users\Administrador.LAURAFERREIRA\Downloads\Claude (Host)"
python coleta_robusta.py
```
Saída: `coleta_python.json` com estrutura `[{rowIdx, colDia, valor, produto}, ...]`

### Passo 2: Executar Escrita
```bash
node escrita_robusta.js
```
Verifica:
- Autenticação Google Sheets
- Integridade dos dados em `coleta_python.json`
- Mapeia corretamente rowIdx → linha do Sheets
- Escreve valores na coluna correta (DIA 1, DIA 2, etc.)

### Passo 3: Verificação
```bash
node read_sheet.js > verificacao.json
```
Abre verificacao.json e revisa:
- rowIdx 39 (Airfryer): deve ter o valor coletado
- rowIdx 40 (Saude): deve ter o valor coletado
- Nenhum desalinhamento de uma linha

## Problemas Resolvidos

### ❌ Problema 1: Bash Heredoc com Quotes
**Sintoma:** `/usr/bin/bash: -c: line 31: unexpected EOF while looking for matching ''`
**Causa:** Node.js inline com heredoc conflita com quotes
**Solução:** Usar Python para coleta, Node.js para orquestração

### ❌ Problema 2: Unicode no Windows Console
**Sintoma:** `UnicodeEncodeError: 'charmap' codec can't encode character '\U0001f4f1'`
**Causa:** Emoji não suportado em Windows PowerShell
**Solução:** Remover emoji, usar apenas ASCII ([*], OK, ERRO)

### ❌ Problema 3: Desalinhamento de Linhas
**Sintoma:** Row 39 (Airfryer) mostrava 37 em vez de 10
**Causa:** Mapping rowIdx → G{rowIdx+1} estava errado na escrita
**Solução:** Usar direto `G${rowIdx + 1}` sem sheet name no range

### ❌ Problema 4: Range com Espaço no Nome da Sheet
**Sintoma:** "Unable to parse range: Acompanhamento Ofertas!G2:G67"
**Causa:** Sheet name com espaço precisa estar entre aspas simples
**Solução:** Usar `'Acompanhamento Ofertas'!G2:G67` ou omitir sheet name

## Checklist Pré-Coleta

- [ ] Planilha "Acompanhamento Ofertas" aberta e verificada
- [ ] Token de autenticação Google válido em `.gdrive-server-credentials.json`
- [ ] Coleta.py e escrita_robusta.js no mesmo diretório
- [ ] Node.js v22+ instalado (`node --version`)
- [ ] Python 3.10+ instalado (`python --version`)
- [ ] Todas as dependências instaladas (`npm install playwright google-apis @google-cloud/local-auth`)

## Checklist Pós-Coleta

- [ ] `coleta_python.json` criado com 48 registros
- [ ] Valores numéricos sensatos (não negativos, < 1000)
- [ ] Arquivo `verificacao.json` gerado sem erros
- [ ] Verificar 5 produtos aleatórios manualmente no navegador
- [ ] Comparar valores: rowIdx 39 (Airfryer), rowIdx 53 (Calistenia), rowIdx 65 (Português)
- [ ] Confirmar que DIA correspondente está preenchido corretamente

## Próximas Execuções (DIA 2+)

Para DIA 2 (26/05), o script deve:
1. Detectar automaticamente qual DIA executar (baseado em IDENTIFICADO)
2. Usar colDia = 7 (DIA 2) em vez de colDia = 6 (DIA 1)
3. Reaproveitar mesma lista de produtos

**Modificação necessária:** Atualizar read_sheet.js para retornar próximo `diaNome` a ser preenchido automaticamente.

## Troubleshooting

| Erro | Solução |
|------|---------|
| "ENOENT: no such file" | Verificar se `coleta_python.json` foi gerado |
| "Unable to parse range" | Sheet name com espaço → usar aspas simples ou omitir |
| "Invalid_grant" | Token expirado → correr `reauth.js` |
| "Cannot find module" | Rodar `npm install` novamente |
| Valores muito altos (>500) | Verificar regex em coleta.py ou site mudou formato |
| Nenhum anúncio encontrado | Verificar se URL está correta em coleta.py |

## Contato & Documentação

- **SOP versão:** 2.0 (25/05/2026)
- **Última atualização:** Quando foi corrigido desalinhamento de linhas
- **Próxima revisão:** Após DIA 2 executar com sucesso

