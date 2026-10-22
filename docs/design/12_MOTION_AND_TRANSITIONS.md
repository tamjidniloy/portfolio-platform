# Phase 02.12 — Motion and Transition Specification

**Status:** PROPOSED DESIGN SPEC, not working animations or measured performance.
**Approved foundation:** Dark-first visual tokens ADR-DS-001. Light palette future-only; exact font/name open.

## Core rule
State changes must be understandable when **all motion is removed**. Reduce vestibular/attention burden and keep layout shift low.

| Motion token | Duration | Easing | Examples | Reduced motion |
|---|---:|---|---|---|
| --motion-fast | 120ms | cubic-bezier(.2,.8,.2,1) | button hover, focus accent | instant/no movement |
| --motion-normal | 180ms | cubic-bezier(.2,.8,.2,1) | drawer/disclosure | instant |
| --motion-slow | 240ms | cubic-bezier(.2,.8,.2,1) | dialog overlay fade | instant/no transform |
| --motion-none | 0ms | linear | sensitive states, direct navigation | unchanged |

## Allowed / discouraged
- Allowed: low-amplitude opacity or subtle transform for menus/dialogs if keyboard/focus unaffected; hover color/focus change; skeleton without mandatory shimmer.
- Avoid: full-page slide transitions, parallax, scroll hijacking, flashing/pulsing CTAs, looping loaders without fallback, animated academic credibility badges, long easing delays.
- Reduced motion: use `@media (prefers-reduced-motion: reduce)` and disable nonessential animation/transitions, not user feedback. No forced loading interval solely to display a transition.
- For real React, use CSS semantic variables and optionally Motion only for value-adding effects; don't add Motion merely because it's available.
- Avoid animating width/height or expensive large blur where possible; maintain reduced layout shift. Test on real devices later.

## Candidate CSS (reference, not installed)
```css
:root {
  --motion-fast: 120ms;
  --motion-normal: 180ms;
  --motion-slow: 240ms;
  --motion-ease: cubic-bezier(.2,.8,.2,1);
}
.ui-interactive {
  transition: background-color var(--motion-fast) var(--motion-ease),
              border-color var(--motion-fast) var(--motion-ease),
              color var(--motion-fast) var(--motion-ease);
}
@media (prefers-reduced-motion: reduce) {
  .ui-interactive { transition: none; animation: none; }
}
```

## Standards and notes
- WCAG 2.2 AA applies to the complete experience; 2.3.3 Animation from Interactions is an AAA criterion, but reduced motion is a desirable accessibility design policy.
- WCAG 4.1.3 Status Messages is AA; show visible status text and implement programmatic announcements later.
- See W3C WCAG 2.2, WAI-ARIA APG dialog pattern and MDN prefers-reduced-motion.

Official sources:
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
