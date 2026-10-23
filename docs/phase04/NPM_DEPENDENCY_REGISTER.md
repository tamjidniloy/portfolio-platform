# Phase 04 npm package register — do not install alternatives indiscriminately

JavaScript + npm is the only project package manager. All packages used in code must be declared and `package-lock.json` committed. `npm ci` verifies the locked graph. An installed package is not itself an implemented feature.

## Already installed on main (pinned)
`react`, `react-dom`, `react-router`, `@react-router/dev`, `@react-router/node`, `@react-router/express`, `vite`, `express`, `pg`, `isbot`, `@eslint/js`, `eslint`, `eslint-plugin-react`, `globals`, `prettier`, `cross-env`.

## Expected additions, only when implemented and reviewed
| Module | Shortlist | Stage |
|---|---|---|
| Styling and design tokens | `tailwindcss`, `@tailwindcss/vite`, `clsx`, `tailwind-merge`, `class-variance-authority` | Public/components |
| Accessible UI primitives | shadcn/ui CLI for chosen Radix primitives, `lucide-react`, `sonner` | UI state |
| Admin forms | `react-hook-form`, `zod`, `@hookform/resolvers` | CMS |
| Data tables | `@tanstack/react-table` | CMS |
| Editor | `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, reviewed extensions | CMS |
| Date helpers | `date-fns` | Content dates |
| Migration mechanism | `node-pg-migrate` OR approved ORM (not both blindly) | **After DB approval** |
| Owner MFA | `@simplewebauthn/server`, `@simplewebauthn/browser` or alternate chosen package | **After MFA choice** |
| Passwords if chosen | `argon2` | **After MFA choice** |
| Email if chosen | `nodemailer` or provider-specific SDK | Provider review |
| Uploads/storage | `react-dropzone`, `file-type`, `sharp`, compatible storage SDK | Provider review |
| HTTP defense & observability | `helmet`, `express-rate-limit`, `pino`, `pino-http` | Before private/public mutations |
| Rich content sanitization | `sanitize-html` or approved alternative | CMS |
| Functional/E2E tests | `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@playwright/test`, `@axe-core/playwright`, `supertest` | Relevant milestone |
| Import boundary linting | `eslint-plugin-boundaries`, `eslint-plugin-jsx-a11y` | CI hardening |

**Decision principle:** install the most appropriate *maintained* library at the milestone that needs it. Avoid duplicate router frameworks, duplicated CSS frameworks, duplicated ORMs, and dormant authentication/provider dependencies. Use WebStorm/npm and create lockfile-backed feature commits. npm does not install PostgreSQL server or Postman; they are independent Windows applications.
