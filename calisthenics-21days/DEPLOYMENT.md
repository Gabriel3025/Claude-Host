# 🚀 Guia de Deployment - Vercel

## Opção 1: Deploy com GitHub (Recomendado)

### Passo 1: Criar Repositório no GitHub
```bash
git init
git add .
git commit -m "Initial commit: 21 days calisthenics app"
git branch -M main
git remote add origin https://github.com/seu-usuario/calisthenics-21days.git
git push -u origin main
```

### Passo 2: Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Selecione **"Import Git Repository"**
4. Cole a URL do seu repositório GitHub
5. Clique em **"Import"**
6. Vercel detalhará automaticamente:
   - Framework: **Next.js**
   - Root Directory: **./calisthenics-21days**
7. Clique em **"Deploy"**

**Pronto! Seu app estará online em minutos!**

---

## Opção 2: Deploy com Vercel CLI

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Deploy
```bash
cd calisthenics-21days
vercel
```

Siga as instruções:
- Escolha a opção de **"Set up and deploy"**
- Escolha seu **projeto** (ou crie um novo)
- Clique em **"Deploy"**

---

## Variáveis de Ambiente

Este projeto **não precisa de variáveis de ambiente**. Ele usa apenas localStorage no navegador.

Se no futuro você adicionar:
- Banco de dados
- API de notificações
- Analytics

Você pode adicionar as variáveis no painel do Vercel:
1. Projeto → Settings → Environment Variables
2. Adicione suas variáveis
3. Redeploy

---

## Após o Deployment

### Seu URL
Após o deployment, você terá uma URL como:
```
https://seu-projeto.vercel.app
```

### Domínio Customizado (Opcional)
1. Vá para Project Settings → Domains
2. Adicione seu domínio customizado
3. Atualize os registros DNS conforme instruído

### Analytics
Acompanhe em: Project → Analytics
- Visitor count
- Page views
- Latency
- Web Vitals

---

## Troubleshooting

### "Build failed"
1. Verifique se todos os imports estão corretos
2. Certifique-se de que não há erros TypeScript:
   ```bash
   npm run build
   ```

### "GIFs não carregam"
1. Verifique as URLs em `lib/exercises.ts`
2. Certifique-se de que os links públicos estão acessíveis

### "Progresso não salva"
1. Limpe cache do navegador (F12 → Storage → Local Storage)
2. Verifique se o navegador suporta localStorage

---

## Updates Futuros

Para fazer updates:

```bash
# Faça suas mudanças no código
git add .
git commit -m "Descrição da mudança"
git push origin main

# Vercel faz redeploy automaticamente!
```

---

**Deploy feito! Compartilhe seu desafio! 🥋💪**
