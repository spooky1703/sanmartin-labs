# Design System - Guía de Implementación

Documentación técnica del sistema de diseño minimalista implementado en SPOOKYDEV Portfolio.

---

## 1. Paleta de Colores

```css
:root {
    --white: #ffffff;
    --neutral-50: #fafafa;   /* Fondos alternos */
    --neutral-100: #f5f5f5;  /* Cards hover, inputs */
    --neutral-200: #e5e5e5;  /* Bordes principales */
    --neutral-300: #d4d4d4;  /* Bordes hover */
    --neutral-400: #a3a3a3;  /* Iconos inactivos */
    --neutral-500: #737373;  /* Texto secundario */
    --neutral-600: #525252;  /* Texto body */
    --neutral-700: #404040;  /* Texto énfasis */
    --neutral-900: #171717;  /* Texto principal, CTAs */
}
```

**Uso:**
- `--white` → Fondo principal
- `--neutral-50` → Secciones alternas (`.bg-neutral`)
- `--neutral-200` → Bordes de cards y componentes
- `--neutral-500` → Labels, texto muted
- `--neutral-900` → Títulos, botones primarios

---

## 2. Tipografía

### Font Family
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

**CDN:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

### Jerarquía de Tamaños
| Elemento | Tamaño | Peso | Tracking |
|----------|--------|------|----------|
| h1 (Hero) | `clamp(3rem, 8vw, 5rem)` | 300 | `-0.025em` |
| h2 (Sección) | `clamp(2.5rem, 5vw, 3.5rem)` | 300 | `-0.025em` |
| h3 (Card) | `1.5rem - 2rem` | 300-400 | normal |
| Body | `1rem` | 300 | normal |
| Label | `0.75rem` | 500 | `0.15em` uppercase |
| Small | `0.875rem` | 300-400 | normal |

---

## 3. Espaciado

### Secciones
```css
section {
    padding: 8rem 0;  /* Desktop */
}

@media (max-width: 968px) {
    section { padding: 4rem 0; }
}
```

### Container
```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

@media (max-width: 640px) {
    .container { padding: 0 1rem; }
}
```

### Gaps Estándar
- Cards grid: `1.5rem`
- Section header → content: `4rem`
- Card padding: `2.5rem` (desktop) / `1.5rem` (mobile)

---

## 4. Componentes

### Card Base
```css
.card {
    background: var(--white);
    border: 1px solid var(--neutral-200);
    border-radius: 1rem;
    padding: 2.5rem;
    transition: all 0.4s;
}

.card:hover {
    border-color: var(--neutral-300);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}
```

### Botones
```css
/* Primary */
.btn-primary {
    background: var(--neutral-900);
    color: var(--white);
    padding: 1rem 2rem;
    border-radius: 9999px;  /* Pill */
    font-size: 0.875rem;
}

.btn-primary:hover {
    background: var(--neutral-700);
    transform: translateY(-2px);
}

/* Secondary */
.btn-secondary {
    background: transparent;
    border: 1px solid var(--neutral-300);
    color: var(--neutral-900);
}

.btn-secondary:hover {
    border-color: var(--neutral-900);
}
```

### Badge (Status)
```css
.badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    border: 1px solid var(--neutral-300);
    border-radius: 9999px;
    font-size: 0.875rem;
    color: var(--neutral-600);
}

.badge-dot {
    width: 8px;
    height: 8px;
    background: var(--neutral-900);
    border-radius: 50%;
    animation: pulse 2s infinite;
}
```

### Section Label
```css
.section-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--neutral-500);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 1rem;
}
```

### Progress Bar
```css
.progress-bar {
    height: 6px;
    background: var(--neutral-100);
    border-radius: 9999px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--neutral-900);
    border-radius: 9999px;
    transition: width 1s ease-out;
}
```

---

## 5. Layouts

### Grid de 2 Columnas
```css
.skills-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}

@media (max-width: 968px) {
    .skills-grid { grid-template-columns: 1fr; }
}
```

### Grid de 3 Columnas
```css
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

@media (max-width: 968px) {
    .stats-grid { grid-template-columns: 1fr; }
}
```

### Timeline
```css
.timeline-item {
    position: relative;
    padding-left: 2.5rem;
    padding-bottom: 3rem;
    border-left: 1px solid var(--neutral-300);
}

.timeline-dot {
    position: absolute;
    left: -6px;
    top: 0;
    width: 12px;
    height: 12px;
    background: var(--neutral-900);
    border-radius: 50%;
}
```

---

## 6. Hero con Fondo Geométrico

### HTML Structure
```html
<section class="hero">
    <div class="hero-bg">
        <div class="geo-circle geo-1"></div>
        <div class="geo-circle geo-2"></div>
        <div class="geo-line geo-3"></div>
        <div class="geo-line geo-4"></div>
        <div class="geo-dot geo-5"></div>
        <div class="geo-dot geo-6"></div>
        <div class="geo-ring geo-7"></div>
    </div>
    <div class="hero-content">...</div>
</section>
```

### CSS Shapes
```css
.hero {
    position: relative;
    overflow: hidden;
}

.hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

/* Círculos grandes */
.geo-circle {
    position: absolute;
    border-radius: 50%;
    border: 1px solid var(--neutral-200);
}

.geo-1 {
    width: 600px;
    height: 600px;
    top: -200px;
    right: -100px;
    animation: float 20s ease-in-out infinite;
}

.geo-2 {
    width: 400px;
    height: 400px;
    bottom: -100px;
    left: -100px;
    animation: float 15s ease-in-out infinite reverse;
}

/* Líneas verticales */
.geo-line {
    position: absolute;
    width: 1px;
    background: linear-gradient(to bottom, var(--neutral-200), transparent);
}

/* Puntos */
.geo-dot {
    width: 8px;
    height: 8px;
    background: var(--neutral-300);
    border-radius: 50%;
    animation: pulse 3s ease-in-out infinite;
}

/* Anillo central */
.geo-ring {
    width: 300px;
    height: 300px;
    border: 1px solid var(--neutral-200);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: rotate 30s linear infinite;
}
```

---

## 7. Animaciones

### Title Pulse (Hero)
```css
.hero h1 {
    animation: titlePulse 0.8s ease-out;
}

@keyframes titlePulse {
    0% { transform: scale(0.9); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
}
```

### Float (Shapes)
```css
@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(5deg); }
}
```

### Fade In
```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
```

### Pulse (Badge dot)
```css
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

### Bounce (Scroll indicator)
```css
@keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
}
```

---

## 8. Carousel

### Structure
```html
<div id="carousel">
    <div class="carousel-slide active">
        <img src="...">
        <div class="carousel-caption">
            <h3>Título</h3>
            <p>Descripción</p>
        </div>
    </div>
    <button class="carousel-btn carousel-prev">←</button>
    <button class="carousel-btn carousel-next">→</button>
    <div class="carousel-indicators">
        <span class="indicator active"></span>
        <span class="indicator"></span>
    </div>
</div>
```

### Key Styles
```css
#carousel {
    height: 500px;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid var(--neutral-200);
}

.carousel-slide img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.carousel-caption {
    position: absolute;
    bottom: 0;
    background: linear-gradient(to top, rgba(255,255,255,0.95), transparent);
    padding: 3rem 2rem 2rem;
}

.indicator.active {
    background: var(--neutral-900);
    width: 24px;
    border-radius: 4px;
}
```

---

## 9. Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 968px) {
    section { padding: 4rem 0; }
    .nav-links { display: none; }
    /* Grids → 1 column */
}

/* Mobile */
@media (max-width: 640px) {
    .container { padding: 0 1rem; }
    .card { padding: 1.5rem; }
}
```

---

## 10. Dependencias Externas

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

<!-- Font Awesome Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```

---

## Resumen de Principios

1. **Minimalismo** - Menos es más, bordes sutiles, sin sombras agresivas
2. **Tipografía Light** - Peso 300 para títulos, crea elegancia
3. **Espaciado Generoso** - `8rem` entre secciones
4. **Animaciones Sutiles** - Transiciones de 0.3-0.5s, efectos suaves
5. **Consistencia** - Mismo patrón visual en todas las páginas
6. **Neutral Palette** - Sin colores vibrantes, escala de grises
