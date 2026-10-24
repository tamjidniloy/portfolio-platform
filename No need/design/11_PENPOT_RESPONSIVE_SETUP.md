# Phase 02.11 — Penpot Responsive Board Instructions

**Status:** Manual setup instructions only. No Penpot connector is installed/available for direct edits.

Create pages:
- `18 — Responsive Layouts`
- `19 — Accessibility & Error States`

Recommended native artboards:
- PUB-01 Home 320/390/768/1024/1440/1920
- PUB-04 Project Detail 320/390/768/1440
- PUB-06 Research Detail 320/390/1440
- PUB-12 Article 320/390/1440
- PUB-13 Contact 320/390/1440
- ADM-05 Dashboard 320/390/768/1440
- ADM-08 Editor 320/390/768/1440
- ADM-22 Media 320/390/1440
- ADM-01 Login/OTP 320/390/1440
- Shared mobile drawer and form error/confirm states.

1. Import companion pack's editable SVGs as visual **references only**. Don't mistake SVG import for native layout constraints, complete prototype or WCAG pass.
2. Build native responsive boards using Penpot Flex/Grid with proper fit/fill, gap, wrapping, min/max size and content-first ordering.
3. Reuse component masters from 02.10 **only if actually built**. Otherwise mark component dependencies missing.
4. Prototype drawer open/close, field error and correction, OTP paste state, Save Draft/Preview/Publish/Blocked/Retry, media chooser alternative, no-results table, and confirm/cancel.
5. Document reading order, visible focus, touch targets, text spacing and error labels. Test 320px design references.
6. Review real browser zoom and assistive-technology behavior later in the running application; static design cannot prove it.
7. Record actual Penpot file URL and owner QA notes once created. Public brand and exact font remain open; light mode future-only.

Penpot documentation: https://help.penpot.app/user-guide/designing/flexible-layouts/
