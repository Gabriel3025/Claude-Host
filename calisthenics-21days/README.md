# 🥋 Desafio 21 Dias - Calistenia Asiática

Um aplicativo web interativo para acompanhar um desafio de 21 dias de calistenia asiática com progressão gradual.

## 📋 Características

- ✅ **21 dias progressivos** - Começa com 10 minutos no dia 1 e aumenta para 15 minutos
- 🎬 **GIFs de exercícios** - Cada exercício tem um GIF de demonstração
- ⏱️ **Timer integrado** - Controle de tempo para cada exercício
- 📊 **Progresso visual** - Barra de progresso e estatísticas
- 💾 **Sem login** - Salva progresso no localStorage
- 📱 **Responsivo** - Funciona perfeitamente em celular e desktop
- 🎯 **Progressão automática** - Vai aumentando a dificuldade conforme avança

## 🚀 Como Começar

### Desenvolvimento Local

1. **Clone ou abra o projeto:**
   ```bash
   cd calisthenics-21days
   npm install
   npm run dev
   ```

2. **Abra no navegador:**
   - `http://localhost:3000`

### Deploy no Vercel

#### Opção 1: Conectar GitHub (Recomendado)

1. Faça push do projeto para GitHub
2. Vá para [Vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Conecte seu repositório GitHub
5. Clique em "Deploy"

#### Opção 2: Deploy Direto

1. Instale Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. No diretório do projeto, execute:
   ```bash
   vercel
   ```

3. Siga as instruções na tela

## 📱 Como Usar

1. **Página Inicial**: Veja todos os 21 dias e seu progresso
2. **Clique em um dia**: Comece o treino daquele dia
3. **Timer**: Inicie o cronômetro para cada exercício
4. **Próximo**: Quando o timer acabar, clique em "Próximo" para ir ao próximo exercício
5. **Completo**: Quando terminar todos os exercícios do dia, clique em "Próximo" para salvar o progresso

## 📊 Estrutura de Dias

- **Dia 1**: 10 minutos (3 exercícios)
- **Dias 2-21**: 15 minutos (4-5 exercícios)
- **Dia 14**: Dia de descanso relativo com alongamento
- **Dia 21**: Celebração final com 100 flexões + 100 agachamentos

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilos
- **localStorage** - Persistência de dados

## 📁 Estrutura do Projeto

```
calisthenics-21days/
├── app/
│   ├── page.tsx                 # Dashboard principal
│   ├── day/[dayId]/page.tsx    # Página de cada dia
│   └── layout.tsx               # Layout geral
├── components/
│   ├── DayCard.tsx              # Card de cada dia
│   ├── ExerciseCard.tsx         # Card de exercício com timer
│   └── ProgressBar.tsx          # Barra de progresso
├── lib/
│   ├── exercises.ts             # Dados dos 21 dias
│   └── useProgress.ts           # Hook para gerenciar progresso
└── public/
    └── ... (assets)
```

## ⚙️ Configurações

Os dados dos exercícios estão em `lib/exercises.ts`. Para modificar:

1. Abra `lib/exercises.ts`
2. Edite o array `EXERCISES_DATA`
3. Adicione novos exercícios ou modifique os existentes

## 🎯 Roadmap

- [ ] Notificações diárias de lembrete
- [ ] Leaderboard com pontuações
- [ ] Compartilhar progresso em redes sociais
- [ ] Variações de exercícios alternativos
- [ ] Suporte a múltiplas línguas

---

**Boa sorte em seu desafio! Você consegue! 💪**
