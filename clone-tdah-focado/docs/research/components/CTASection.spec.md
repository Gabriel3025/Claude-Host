# CTA Section Specification (Orange Card)

## Overview
- **Target file:** `src/components/CTASection.tsx`
- **Interaction model:** static card with CTA button/link
- **Prominence:** Highlight section with vibrant background

## DOM Structure
```
<section class="bg-gradient-to-r from-[#FF8C00] to-[#FFB366] rounded-lg p-8 text-white">
  <h3>Aprenda as estratégias e aplique em casa a partir de hoje</h3>
  <p>Quer um material prático com tudo isso aplicado?</p>
  <p>Preparamos um planner pronto para imprimir...</p>
  <button/link class="bg-white text-[#FF8C00] font-bold">
    Quero acessar o material →
  </button>
</section>
```

## Computed Styles

### Container
- display: flex
- flexDirection: column
- gap: 16px
- backgroundColor: linear-gradient(to right, #FF8C00 0%, #FFB366 100%)
- borderRadius: 16px
- padding: 32px
- maxWidth: 600px
- margin: 40px auto 0
- textAlign: left

### H3
- fontSize: 20px
- fontWeight: 600
- color: rgb(255, 255, 255) [white]
- lineHeight: 1.4
- marginBottom: 8px

### Paragraphs
- fontSize: 16px
- color: rgba(255, 255, 255, 0.95)
- lineHeight: 1.6
- marginBottom: 8px

### CTA Link
- display: inline-flex
- alignItems: center
- backgroundColor: rgb(255, 255, 255)
- color: rgb(255, 140, 0) [orange]
- padding: 12px 20px
- borderRadius: 6px
- fontWeight: 600
- marginTop: 16px
- cursor: pointer
- transition: all 0.2s ease
- Hover: opacity 0.9, scale 1.02

## States & Behaviors

### Hover state
- Trigger: hover on link
- Effect: opacity increases, slight scale up
- Transition: transition: all 0.2s ease

## Text Content
- H3: "Aprenda as estratégias e aplique em casa a partir de hoje"
- P1: "Quer um material prático com tudo isso aplicado?"
- P2: "Preparamos um planner pronto para imprimir, com rotina, sistema de recompensas e checklist escolar adaptado ao cérebro com TDAH."
- Link: "Quero acessar o material →"

## Responsive Behavior
- **Desktop (1440px):** padding = 32px, maxWidth = 600px
- **Tablet (768px):** padding = 24px, maxWidth = 100%
- **Mobile (390px):** padding = 20px, maxWidth = 100%

## Assets
None (gradient background via CSS)
