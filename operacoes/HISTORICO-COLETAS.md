# Histórico de Coletas — Conferência de Ofertas

## DIA 1 (25/05/2026)

| Métrica | Valor |
|---------|-------|
| **Status** | ✅ SUCESSO (corrigido) |
| **Timestamp** | 25/05/2026 ~11:30 |
| **Total de Produtos** | 48 |
| **Produtos com Anúncios** | 30 |
| **Total de Anúncios** | 1.032 |
| **Média por Produto** | 21,5 |
| **Erros Detectados** | 1 (desalinhamento de linhas) |
| **Tempo de Execução** | ~6 min |
| **Problema Resolvido** | ✅ Sim (linhas realinhadas) |

### Top 3 Produtos
1. **Português** — 180 anúncios
2. **Organização** — 150 anúncios
3. **Calistenia** — 100 anúncios

### Problemas Encontrados & Resolvidos
- ❌ Desalinhamento de linhas: rowIdx 39-40 tinham valores trocados
- ✅ Solução: Corrigido mapping G{rowIdx+1} na escrita
- ✅ Verificação: Confirmado que Airfryer (rowIdx 39) = 10 anúncios

---

## DIA 2 (26/05/2026)

*Próxima coleta*

| Métrica | Valor |
|---------|-------|
| **Status** | ⏳ Pendente |
| **Timestamp** | — |
| **Total de Produtos** | — |
| **Produtos com Anúncios** | — |
| **Total de Anúncios** | — |
| **Erros Detectados** | — |
| **Tempo de Execução** | — |

### Checklist Pré-Execução
- [ ] Conectado à internet
- [ ] Planilha verificada
- [ ] Node.js v22+ ok
- [ ] Python 3.10+ ok
- [ ] Dependências instaladas

### Comando a Executar
```bash
node conferencia-ofertas.js
```

### Após Execução
```bash
node verificar-coleta.js
```

---

## DIA 3-10 (Padrão)

Use o mesmo processo:

```bash
# Coleta + Escrita + Relatorio
node conferencia-ofertas.js

# Verificacao de integridade
node verificar-coleta.js

# Revisar relatorio_ofertas.json
# Se tudo OK, fazer commit git
```

**Nota:** Script detecta automaticamente qual DIA está preenchendo (baseado em IDENTIFICADO na planilha)

---

## Template de Registro (copiar para cada DIA)

```markdown
## DIA X (DD/MM/YYYY)

| Métrica | Valor |
|---------|-------|
| **Status** | ✅ SUCESSO / ⚠️ AVISO / ❌ ERRO |
| **Timestamp** | HH:MM |
| **Total de Produtos** | XX |
| **Produtos com Anúncios** | XX/48 |
| **Total de Anúncios** | XXXX |
| **Média por Produto** | XX,X |
| **Erros Detectados** | X |
| **Tempo de Execução** | X min |

### Top 3 Produtos
1. **[Nome]** — XXX anúncios
2. **[Nome]** — XXX anúncios
3. **[Nome]** — XXX anúncios

### Problemas (se houver)
- [Descrever]

### Notas
- [Observações importantes]
```

---

## Estatísticas Agregadas

| Item | DIA 1 | DIA 2 | DIA 3-10 |
|------|-------|-------|---------|
| Coletas OK | 1 | ⏳ | ⏳ |
| Coletas com erro | 0 | — | — |
| Taxa de sucesso | 100% | — | — |
| Tempo médio | 6min | — | — |
| Média de anúncios | 1032 | — | — |

---

## Lições Aprendidas

### DIA 1
- ✅ Coleta robusta funciona bem
- ❌ Range com sheet name causa erro 400
- ❌ Desalinhamento de linhas não é óbvio até comparação manual
- ✅ Validação em 2 pontos (coleta + escrita) necessária

### Próximas Execuções
- Usar `conferencia-ofertas.js` para automação completa
- Executar `verificar-coleta.js` SEMPRE após coleta
- Manter este histórico atualizado
- Alertar se algum produto não conseguir ser coletado

---

## Contatos & Escalação

- **Problema com Facebook:** Testar URL manualmente no navegador
- **Problema com Google Sheets:** Rodar `node reauth.js` para renovar token
- **Problema técnico:** Verificar troubleshooting em CONFERENCIA-README.md
- **Dúvida sobre processo:** Ver operacoes/conferencia-ofertas-SOP.md

---

*Última atualização: 25/05/2026*
*Próxima revisão: 26/05/2026 (após DIA 2)*
