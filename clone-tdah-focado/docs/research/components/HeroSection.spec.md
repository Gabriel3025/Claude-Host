# Hero Section Specification

## Overview
- **Target file:** `src/components/HeroSection.tsx`
- **Interaction model:** static content
- **Background:** gradient to-b from-[#fffbf5] via-[#fff8ee] to-[#fff4e3]

## DOM Structure
```
<section class="py-10">
  <article class="max-w-3xl mx-auto px-5">
    <div class="meta">
      <span>Atualizado em 2026</span>
      <span>Leitura de 7 minutos</span>
    </div>
    <h1>TDAH e desempenho escolar: como ajudar seu filho a aprender melhor</h1>
    <p class="intro-text">Quando uma criança com TDAH...</p>
  </article>
</section>
```

## Computed Styles

### Main container
- display: block
- padding: 40px 20px
- backgroundColor: rgba(0, 0, 0, 0) [transparent, inherits from main]
- maxWidth: 768px
- margin: 0 auto
- width: 100%

### Meta information (date, reading time)
- fontSize: 12px
- color: rgb(124, 45, 18) [brown]
- marginBottom: 16px
- fontWeight: 400

### H1
- fontSize: 32px [might be 28px on mobile]
- fontWeight: 700
- color: rgb(124, 45, 18) [brown, primary color]
- lineHeight: 1.3
- marginBottom: 24px
- fontFamily: Poppins

### Intro paragraph
- fontSize: 16px
- lineHeight: 1.6
- color: rgb(124, 45, 18)
- marginBottom: 20px

## States & Behaviors
None — static section

## Text Content
- Meta: "Atualizado em 2026 · Leitura de 7 minutos"
- H1: "TDAH e desempenho escolar: como ajudar seu filho a aprender melhor"
- Intro: [2-3 paragraphs explaining TDAH and the purpose of the guide]

## Responsive Behavior
- **Desktop (1440px):** H1 = 32px, padding = 40px
- **Tablet (768px):** H1 = 28px, padding = 30px
- **Mobile (390px):** H1 = 24px, padding = 20px

## Assets
None
