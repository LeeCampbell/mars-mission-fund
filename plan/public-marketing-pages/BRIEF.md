# Public Marketing Pages

**Milestone**: Public Marketing Pages
**Status**: Planning
**Date**: 2026-03-08

---

## 1. Objective

Deliver the first working frontend for Mars Mission Fund: a set of static public marketing pages (Homepage, About, Contact) served by a fully scaffolded React + Vite + Tailwind v4 application.
This milestone establishes the project's frontend foundation — design tokens, shared layout shell, and core UI primitives — that all subsequent application features will build upon.

---

## 2. Scope

### In scope

- Project scaffolding: Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router v7.
- Design token CSS: full Tier 1 identity tokens and Tier 2 semantic token mappings from L2-001.
- Self-hosted web fonts: Bebas Neue, DM Sans, Space Mono (WOFF2, per L3-005 Section 9.1).
- Core design system primitives needed for marketing pages: Button, Card, StatCard, SectionLabel.
- Shared layout shell: Header (logo + navigation), Footer, page Layout wrapper.
- Three static pages: Homepage, About, Contact.
- Client-side routing between pages.
- Mobile-first responsive design at all four breakpoints (640/768/1024/1280px).
- Accessibility: WCAG 2.1 AA, focus states, `prefers-reduced-motion`, skip-to-content link.
- Verification: `npm run dev` serves all pages locally.

### Out of scope

- Backend API, server, or database.
- Authentication, account, or any protected routes.
- Contact form submission (page is static with dummy contact info).
- CI/CD pipeline, Docker, deployment.
- Linting/formatting tooling setup (separate milestone).
- Testing setup and test files (separate milestone).
- SEO static pre-rendering (local dev only for now).

---

## 3. Content Direction

All copy follows L2-001 Section 4 voice-in-product patterns: bold, human, mission-metaphor-rich, no corporate buzzwords, no financial guarantees.

### 3.1 Homepage

- **Hero section**: Large display heading with the tagline "Crowdfunding the Next Giant Leap" (from L1-001).
  Subtext communicating the platform's purpose.
  Single primary CTA: "Explore Missions" (placeholder, links to `#` for now).
- **Stats section**: 3-4 stat cards showing placeholder platform metrics (projects funded, capital raised, backers, countries).
  Uses `--type-stat-value` and `--gradient-surface-stat`.
- **How It Works section**: 3-step explanation (Discover, Back, Track) with section label, icons or simple illustrations, and short copy.
- **Featured Missions section**: 2-3 placeholder campaign cards demonstrating the Card component with progress bars, badges, and funding status.
- **Final CTA section**: Closing statement with secondary call to action.

### 3.2 About Page

- **Mission statement section**: The vision from L1-001 Section 1.1 adapted for public consumption.
- **The Problem / The Solution**: Adapted from L1-001 Section 1.2 — why Mars funding is bottlenecked and how MMF bridges the gap.
- **Principles section**: The five strategic principles from L1-001 Section 1.4, presented as a visually distinct grid or list.
- **Who We Serve section**: The four personas from L1-001 Section 1.3, presented as cards.

### 3.3 Contact Page

- **Contact information**: Dummy email (hello@marsmissionfund.com), dummy address (Melbourne, Australia), dummy social links.
- **Office hours**: Placeholder hours.
- **Simple layout**: Clean, minimal, consistent with the brand.
  No form — just static contact details.

---

## 4. Technical Decisions

### 4.1 Tailwind CSS v4 + Design Tokens

Tailwind v4 uses CSS-first configuration with `@theme` directives.
Design tokens from L2-001 are defined as CSS custom properties in a dedicated `tokens.css` file.
Tailwind's `@theme` block maps these tokens to Tailwind utilities where useful, but components primarily consume semantic tokens via `var()` references.
This satisfies the L2-001 rule: components only reference Tier 2 semantic tokens.

### 4.2 Font Loading

Fonts are self-hosted as WOFF2 files per L3-005 Section 9.1.
Downloaded from Google Fonts and placed in `src/assets/fonts/`.
`@font-face` declarations in the tokens CSS file.
`font-display: swap` for DM Sans and Space Mono; `font-display: optional` for Bebas Neue.

### 4.3 Routing

React Router v7 with three routes: `/` (Home), `/about`, `/contact`.
All routes wrapped in a shared `Layout` component providing Header and Footer.

### 4.4 Component Architecture

Per L3-005 Section 1.2:

- **Design system primitives** (`src/components/ui/`): Button, Card, StatCard, SectionLabel.
- **Composite components** (`src/components/`): Header, Footer, Layout, HeroSection, StatsSection, etc.
- **Page components** (`src/pages/`): HomePage, AboutPage, ContactPage.

### 4.5 Logo

The SVG logo from `assets/logo.svg` is used as an inline SVG React component in the Header.
32px height in navigation per L2-001 Section 6.1.

---

## 5. Issue Sequence

1. `01-scaffolding.tasks.md` — Issue: "Scaffold frontend project" (no dependencies)
2. `02-shared-ui.tasks.md` — Issue: "Create design system primitives and layout shell" (depends on #1)
3. `03-marketing-pages.tasks.md` — Issue: "Build Homepage, About, and Contact pages" (depends on #2)
4. `04-close.tasks.md` — Issue: "Close milestone" (depends on all above)

---

## 6. Governing Specs

| Spec | Relevance |
| ---- | --------- |
| L1-001 Product Vision & Mission | Content source for About page; tagline; personas; principles |
| L2-001 Brand Application Standard | Token architecture, component specs, voice patterns, accessibility |
| L3-005 Frontend Standards | React architecture, component tiers, responsive breakpoints, font loading, motion |
| L3-008 Tech Stack | React 19, Vite, Tailwind v4, React Router v7, TypeScript |
| L3-007 Markdown Standard | Governs all `.md` files produced during close-out |
