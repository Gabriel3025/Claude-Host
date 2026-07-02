# Conferência de Ofertas — Execução

## Próxima Coleta (DIA 2+)

### Método Automático (Recomendado)

Execute o orquestrador que faz TUDO em uma linha:

```bash
cd "C:\Users\Administrador.LAURAFERREIRA\Downloads\Claude (Host)"
node conferencia-ofertas.js
```

Isso executa:
1. ✅ Coleta robusta (`coleta_robusta.py`)
2. ✅ Escrita na planilha (`escrita_robusta.js`)
3. ✅ Gera relatório (`relatorio_ofertas.json`)

**Tempo estimado:** 5-8 minutos

---

## Método Manual (Passo a Passo)

Se preferir executar separadamente:

### Passo 1: Coleta
```bash
python coleta_robusta.py
```
Gera: `coleta_python.json`

### Passo 2: Escrita
```bash
node escrita_robusta.js
```
Escreve na planilha e valida dados

### Passo 3: Verificação
```bash
node read_sheet.js > verificacao.json
```
Abre `verificacao.json` e verifica alguns produtos:
- rowIdx 39 (Airfryer): deve mostrar o valor coletado
- rowIdx 65 (Português): deve mostrar o valor coletado

---

## O que Mudou (vs. DIA 1)

✅ **coleta_robusta.py**
- Melhor logging com timestamps
- Validação de valores (0-1000)
- Tratamento robusto de erros
- Relato de sucessos/falhas

✅ **escrita_robusta.js**
- Valida dados ANTES de escrever
- Verifica autenticação
- Detecta valores null e ignora
- Relato detalhado

✅ **conferencia-ofertas.js** (NOVO)
- Orquestrador único que faz tudo
- Gera relatório JSON automático
- Mostra estatísticas
- Tempo total de execução

✅ **operacoes/conferencia-ofertas-SOP.md** (NOVO)
- Documentação completa
- Troubleshooting
- Checklist pré/pós coleta
- Problemas resolvidos

---

## Checklist Pré-Coleta

```
[ ] Planilha aberta em navegador
[ ] Node.js v22+ instalado (node --version)
[ ] Python 3.10+ instalado (python --version)
[ ] Dependências OK (npm install já foi feito)
[ ] Token Google válido em .gdrive-server-credentials.json
[ ] Internet funcionando normalmente
```

---

## Se Houver Problema

### Erro: "coleta_python.json nao encontrado"
👉 Execute: `python coleta_robusta.py` primeiro

### Erro: "Credentials nao encontrado"
👉 Execute: `node reauth.js` para renovar token Google

### Erro: Playwright timeout
👉 Aumentar timeout em coleta_robusta.py (linha ~70: `timeout=40000`)

### Valores suspeitos (muito altos ou 0 em tudo)
👉 Verificar se Facebook Ads Library mudou formato
👉 Testar URL manualmente no navegador

### Script preso/lento
👉 Ctrl+C para cancelar
👉 Verificar conexão internet
👉 Tentar novamente em 5 minutos

---

## Output Esperado

**Arquivo: `relatorio_ofertas.json`**
```json
{
  "timestamp": "25/05/2026 11:30:45",
  "status": "SUCESSO",
  "totals": {
    "produtosColetados": 48,
    "produtosComValor": 30,
    "totalAnuncios": 1032,
    "mediaAnunciosPorProduto": "21.5"
  },
  "topProdutos": [
    {
      "rowIdx": 65,
      "produto": "Português",
      "anuncios": 180
    },
    ...
  ],
  "erros": []
}
```

---

## Frequência de Execução

| Quando | Executar |
|--------|----------|
| Toda manhã | `node conferencia-ofertas.js` |
| Próxima semana | Mesmo comando (detecta DIA 2, 3, ..., 10 automaticamente) |
| Após 10 dias | Produtos saem da janela (sem coleta necessária) |

---

## Próxima Melhoria (Automática)

Para DIA 2+ sem precisar mudar nada:
- [ ] Atualizar read_sheet.js para detectar próximo DIA automaticamente
- [ ] Script cron que executa `conferencia-ofertas.js` todos os dias às 6:00 AM

---

## Contato

Se algo não funcionar:
1. Verificar checklist acima
2. Ver troubleshooting em `operacoes/conferencia-ofertas-SOP.md`
3. Checar último `relatorio_ofertas.json` para status

Última execução bem-sucedida: **25/05/2026** (DIA 1)
