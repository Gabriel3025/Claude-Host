# Header Specification

## Overview
- **Target file:** `src/components/Header.tsx`
- **Interaction model:** sticky header with scroll behavior
- **Positioning:** Fixed at top with z-index 10

## DOM Structure
```
<header class="border-b border-orange-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
  <div class="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
    <svg class="logo" /> (or text logo)
    <nav>
      (links if needed)
    </nav>
  </div>
</header>
```

## Computed Styles

### Container (header)
- display: block
- position: sticky
- top: 0
- z-index: 10
- backgroundColor: oklab(0.999994 0.0000455677 0.0000200868 / 0.8) [white with 80% opacity]
- backdropFilter: blur(4px)
- borderBottom: 1px solid #FED7AA [orange-100]
- padding: 0
- height: 53px
- width: 100%

### Inner container (div)
- display: flex
- alignItems: center
- justifyContent: space-between
- maxWidth: 768px
- margin: 0 auto
- padding: 12px 20px
- width: 100%

### Logo
- fontSize: 16px
- fontWeight: 600
- color: rgb(124, 45, 18) [brown]

## States & Behaviors

### Scroll State
- **Trigger:** scroll > 0
- **Effect:** remains sticky, subtle shadow appears
- **Implementation:** CSS sticky positioning (native, no JS required)

## Text Content
- Logo text: "TDAH Focado" (or logo SVG)

## Responsive Behavior
- **Desktop (1440px):** full width header
- **Tablet (768px):** maintains same layout, container narrows
- **Mobile (390px):** logo smaller, nav collapses if needed

## Assets
- Logo (SVG or text)
- No images required
