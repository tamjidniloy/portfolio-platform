# Phase 02.13 — Penpot High-Fidelity Board & Prototype Handoff

**Status:** INSTRUCTIONS ONLY; no Penpot file/board/connection has been created by this assistant.
**Companion:** `DEVFOLIO_Phase02_13_HiFi_Prototype_Pack.zip`, including `docs/13_PENPOT_CONNECTIONS.csv` (25 proposed triggers), desktop/mobile SVGs, browser mockup and screenshots.

## Native Penpot setup
1. Open existing `DEVFOLIO OS — Public + Admin UI`. Back up tokens and main components before making changes.
2. Create pages `22 — High-Fidelity Public` and `23 — High-Fidelity Admin`.
3. Import an `assets/*_Desktop_1440.svg` and matching `*_Mobile_390.svg` as editable visual references. SVG import **does not** create native responsive Flex/Grid boards or clickable prototype connections.
4. Create separate **native Penpot boards** for each representative screen ID, applying existing approved `Global` + `Mode/Dark` tokens. Leave `Mode/Light` inactive.
5. Rebuild major layout groups in native Flex/Grid and replace repetitive objects with approved Phase 02.10 component instances only if those native masters exist in Penpot.
6. Use Penpot Prototype mode to connect Work/Research/About/Contact cards to the corresponding boards and admin project/edit/private preview flows. Use **Open overlay** for Publish Confirmation and mobile drawers; Close overlay to cancel.
7. Create additional distinct state boards for contact invalid/accepted, editor saved/invalid, media upload rejected, and menu open. Those state boards are listed in the CSV but are NOT provided as standalone native Penpot boards.
8. Add separate prototype flow starting points for Recruiter/Engineer, Research collaborator, Contact, Owner login and Owner publishing. Check in View mode.
9. Annotate keyboard focus behavior, Escape/Cancel/focus return, mobile 320px reflow, 200% text resizing, status announcements, and reduced motion.
10. Record actual Penpot file and prototype URLs in the project document **after** creating and testing them. Do not invent links.

## Known caveats
The offline browser demonstration is a separate client-only prototype and can be used as an interaction reference. It is NOT an import format that produces an interactive Penpot prototype. Its internal hash routes are simulation paths, whereas Phase 02.4's canonical routes are the authoritative design navigation proposal. Build final app routes only after SRS reconciliation.
Some details (for example publication state, contact, OTP verification) are illustrated but not operational or secure until real backend and browser QA.

Penpot documentation: https://help.penpot.app/user-guide/prototyping-testing/prototyping/ ; https://help.penpot.app/user-guide/designing/flexible-layouts/ ; https://help.penpot.app/user-guide/design-systems/variants/
