# Page Topology - TDAH Focado

## Page Structure (Top to Bottom)

### 1. Header (Sticky)
- **Component:** `Header.tsx`
- **Position:** Fixed/Sticky at top (z-index: 10)
- **Height:** 53px
- **Contains:** Logo + navigation (if any)
- **Spec:** `docs/research/components/Header.spec.md`

### 2. Main Content Container
- **Classes:** `main min-h-screen bg-gradient-to-b from-[#fffbf5] via-[#fff8ee] to-[#fff4e3]`
- **Height:** ~4070px
- **Contains:** article + footer

### 3. Article Section (max-w-3xl, centered)
- **Position:** Static flow
- **Padding:** px-5 py-10
- **Max Width:** 768px

#### 3.1 Hero Section
- **Component:** `HeroSection.tsx`
- **Content:** Meta info + H1 + intro paragraphs
- **Spec:** `docs/research/components/HeroSection.spec.md`

#### 3.2 Section: "Sinais de dificuldade escolar por idade"
- **Type:** 3-column card grid
- **Component:** `SignsCardsSection.tsx`
- **Cards:** Age-based breakdown (e.g., 4-6 anos, 7-9 anos, 10+ anos)
- **Content per card:** heading + bullet list

#### 3.3 Section: "Sinais de atenção que merecem cuidado"
- **Type:** List section
- **Component:** `AttentionSignsSection.tsx`
- **Content:** Bullet list (5-6 items)

#### 3.4 Section: "6 estratégias para apoiar em casa"
- **Type:** Numbered list with icons
- **Component:** `StrategiesSection.tsx`
- **Content:** 6 strategy items, each with:
  - Number icon (1-6)
  - Strategy title
  - Description paragraph

#### 3.5 CTA Section (Orange Card)
- **Component:** `CTASection.tsx`
- **Position:** After strategies
- **Content:** Call-to-action for planner material
- **Spec:** `docs/research/components/CTASection.spec.md`

#### 3.6 Section: "Quando é hora de procurar um profissional"
- **Type:** Warning/alert section with list
- **Component:** `ProfessionalSection.tsx`
- **Content:** Intro text + checklist items

#### 3.7 Disclaimer
- **Type:** Legal/informational text
- **Component:** Footer disclaimer (in Footer.tsx)

### 4. Footer
- **Component:** `Footer.tsx`
- **Position:** Bottom
- **Classes:** `border-t border-orange-100 bg-white/60 mt-10`
- **Content:** Copyright + links

## Design Tokens

### Colors
- Primary Brown: rgb(124, 45, 18) — text, headings
- Background Light: rgb(255, 251, 245) — #fffbf5
- Background Lighter: rgb(255, 248, 238) — #fff8ee
- Background Lightest: rgb(255, 244, 227) — #fff4e3
- Orange Accent: rgb(255, 140, 0) — #FF8C00
- Orange Light: rgb(255, 179, 102) — #FFB366
- Border Orange: rgb(254, 215, 170) — #fed7aa (orange-100)
- White overlay: oklab(0.999994 0.0000455677 0.0000200868 / 0.8)
- Dark Brown: rgb(63, 44, 31)

### Typography
- Font Family: Poppins (Google Fonts)
- H1: 32px, weight 700
- H2: 24px, weight 600
- H3: 20px, weight 600
- Body: 16px, weight 400
- Line height body: 1.6

### Spacing
- Max content width: 768px (max-w-3xl)
- Page horizontal padding: 20px (px-5)
- Section vertical padding: 40px (py-10)
- Card padding: varies by section

## Responsive Breakpoints
- **Desktop:** 1440px+
- **Tablet:** 768px - 1023px
- **Mobile:** 390px - 767px

## Layout Pattern
- Centered container (max-w-3xl)
- Single column flow
- No sidebar
- Hero → content sections → CTA → footer
- Gradient background spans full page height

## Interaction Model
- **Overall:** Scroll-based (no JS interactivity required)
- **Header:** Sticky on scroll
- **CTA Link:** Hover effects, links to external payment page

## Implementation Plan
1. ✅ Create base Next.js project
2. Create global styles (colors, typography, gradients)
3. Create shared components (IconBullet, NumberedItem, etc.)
4. Create section components in parallel (Header, Hero, Signs, Attention, Strategies, CTA, Professional, Footer)
5. Assemble into `app/page.tsx`
6. Test responsive at 390px, 768px, 1440px
