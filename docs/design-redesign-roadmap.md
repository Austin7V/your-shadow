# Your Shadow Design Redesign Roadmap

- Status: implementation plan for Design System v1.0
- Branch: `2.10-2.18-implement-design-system-v1`
- Scope: tickets 2.10–2.18 before Epic 4

## Objective

Replace the initial Epic 2 visual foundation with the approved Your Shadow Design System v1.0 while preserving the authentication, onboarding, profile, encrypted health-data, ownership, and account-deletion behavior completed in Epic 3.

The work is split into reviewable manual commits. The implementation agent does not commit, stage, push, create pull requests, or update GitHub Issues.

## Audit baseline

Stable application contracts:

- public Welcome, Login, Registration, not-found, and global-error routes;
- guarded Today, Meals, Workout, History, and Profile routes;
- two-step guarded onboarding with session-backed draft preservation;
- SWR-backed current-user, profile, health-constraint, and weight data;
- safe post-login return paths;
- cookie-based access and refresh sessions;
- server-derived ownership for private data;
- encrypted profile, health-constraint, and weight storage;
- password and exact-text account-deletion confirmation.

The redesign does not change API paths, request contracts, entities, migrations, encryption, ownership queries, or route-protection decisions unless a separately demonstrated defect makes a change unavoidable.

Known UI gaps:

- Inter and the legacy palette do not match v1.0.
- No persistent Light/Dark/System theme or first-paint bootstrap exists.
- Phone and tablet share one bottom navigation instead of separate architectures.
- Ask Shadow has no honest unavailable navigation state.
- Desktop uses a header rather than a sidebar and utility area.
- The Sign out control is not connected to the existing logout endpoint.
- Shared controls and feedback states do not cover all required variants.
- Guard, profile, onboarding, and page-level states repeat presentation patterns.
- Motion and reduced-motion foundations are absent.

## Delivery sequence

### 2.10 — Define Your Shadow Design System v1.0

Deliver `design-system-v1.md`, this roadmap, and a legacy-token-document pointer. Verify the approved specification, Epic 4–7 consumers, and `git diff --check`.

Suggested commit: `docs: define design system v1`

### 2.11 — Implement themes and semantic design tokens

Deliver:

- Manrope with system sans-serif fallback;
- approved light and dark semantic tokens;
- spacing, shape, elevation, typography, and motion foundations;
- typed Light, Dark, and System preference with persistence;
- live System preference updates;
- pre-hydration bootstrap that prevents wrong-theme flash;
- accessible theme control;
- resolved browser `color-scheme` and theme color.

Do not redesign feature pages in this block. Use a small local provider rather than adding a theme dependency.

Verify web typecheck, lint, build, first paint, persistence, System changes, keyboard use, and `git diff --check`.

Suggested commits:

- `feat: implement persistent theme system`
- `style: apply design system tokens`

### 2.12 — Redesign responsive application shell and navigation

Deliver phone top bar and bottom navigation, tablet rail, desktop sidebar and utility area, Profile avatar access, theme control, honest disabled Ask Shadow, working logout through the existing endpoint, complete interaction states, and a workspace capped at 1440px.

`ProtectedRoute` and `ProfileRequired` remain the gates. Logout continues to revoke refresh state, clear cookies and session cache, and leave private routes. No Ask Shadow route is created.

Verify web typecheck, lint, build, protected redirect and logout behavior, the responsive shell, and `git diff --check`.

Suggested commits:

- `feat: build responsive application shell`
- `feat: redesign application navigation`

### 2.13 — Build motion system and Shadow companion

Deliver reusable motion utilities, reduced-motion overrides, progress/chart drawing foundations, and compact and large Shadow orb variants for `idle`, `listening`, `thinking`, `responding`, `success`, `attention`, and `offline`. Every state has accessible text and a showcase in the existing development surface.

Do not add an AI request, chat route, microphone, voice, connectivity behavior, or uncontrolled decorative animation.

Verify web typecheck, lint, build, assistive status text, reduced motion, and `git diff --check`.

Suggested commits:

- `feat: add accessible motion system`
- `feat: build shadow companion states`

### 2.14 — Refresh reusable UI components and feedback states

Evolve the existing library; do not create a parallel one. Deliver Button, IconButton, Input, PasswordInput, Select, Textarea, Checkbox, Scale, the required theme selector, FormSection, Card, FeaturePageShell, loading, skeleton, empty, error, success, warning, safety, and destructive-confirmation states. Cover disabled, loading, invalid, and read-only behavior where applicable. Update the existing showcase routes.

Verify web typecheck, lint, build, both-theme state matrices, keyboard behavior, labels, target sizes, and `git diff --check`.

Suggested commits:

- `style: refresh shared form controls`
- `style: redesign feedback states`

### 2.15 — Redesign welcome and authentication experience

Redesign Welcome, the authentication layout, Login, and Registration with a restrained orb presence. Preserve request shapes, secure cookies, safe `returnTo`, validation, loading, errors, and session refresh.

Verify web checks, relevant authentication tests, phone-to-desktop layouts, and `git diff --check`.

Suggested commits:

- `style: redesign welcome experience`
- `style: redesign authentication pages`

### 2.16 — Redesign onboarding flow

Deliver a responsive frame and progress, redesigned personal information, goals, weight, health constraints, safety copy, and consent. Preserve current fields, ranges, normalization, unchecked confirmations, encrypted API persistence, server ownership, redirects, error-time draft values, and cleanup only after success.

Verify web checks, profile/auth API tests, onboarding validation and persistence, consent, guards, redirects, and `git diff --check`.

Suggested commits:

- `style: redesign onboarding foundation`
- `style: redesign onboarding health step`

### 2.17 — Redesign profile and account management

Deliver profile view/edit, goals and privacy presentation, health-constraint CRUD states, weight entry and responsive history, complete feedback, and an isolated Danger zone. Preserve API shapes, SWR keys, owner-derived encrypted data, separate weight history, password plus exact `DELETE` confirmation, deletion of owned records, and logout after deletion.

Verify web checks, profile/ownership/account-deletion tests, sensitive-data exposure, responsive data display, and `git diff --check`.

Suggested commits:

- `style: redesign profile experience`
- `style: redesign health and weight sections`
- `style: redesign account deletion flow`

### 2.18 — Complete responsive, accessibility, and visual QA

Verify Welcome, Auth, Onboarding, all application placeholders, Profile, not-found, global error, and both component showcases at 360px, 390px, phone landscape, 768px, 1024px, 1280px, and 1440px or wider.

The QA matrix covers horizontal overflow, keyboard order, focus, labels, screen-reader names, contrast, target sizes, reduced motion, theme persistence and System response, first paint, hydration, loading and error states, route protection, deletion, health privacy, incidental sensitive-data exposure, and console errors.

Remove obsolete styling only after every current consumer has migrated. Finish with the complete repository CI-equivalent commands, branch-diff secret review, `git diff --check`, and clean status after the final manual commit.

Suggested commit: `fix: complete design system quality audit`

## Route policy

| Destination | Current route | v1.0 behavior |
| --- | --- | --- |
| Today | `/dashboard` | Protected placeholder until Epic 4 |
| Meals | `/meals` | Protected placeholder until Epic 5 |
| Workout | `/workout` | Protected placeholder until Epic 6 |
| Ask Shadow | None | Disabled or Coming soon; never a fake link |
| History | `/history` | Protected placeholder until Epic 7 |
| Profile | `/account` | Working protected account management |

Future route names and nested feature pages are owned by their Epics and are not invented during this redesign.

## Consumer mapping

| Shared foundation | Current consumers | Confirmed future consumers |
| --- | --- | --- |
| Shell and navigation | All protected pages | Today, Meals, Workout, Summary, History |
| Feature shell and cards | Placeholders and Profile | Plan/status, totals/list, workout overview, summary/history |
| Button and IconButton | Auth, onboarding, profile, feedback | Generation, meal confirmation, workout actions, check-in completion |
| Form controls | Auth, onboarding, profile | Meal entry/draft and optional check-in note |
| Scale | Showcase | Epic 7 check-in |
| Feedback states | Showcases and request failures | All data routes, AI fallback, safety, and pain stop |
| Progress and analytics | Onboarding and showcase | Daily plan, workout player, nutrition totals, history |
| Shadow orb | Welcome, auth, unavailable shell action | Epic 4 generation and future Ask Shadow |

## Dependency policy

React, Next.js, Tailwind CSS, SWR, and Lucide are sufficient for v1.0. Theme resolution, motion, the orb, and progress or chart foundations use local React and CSS. A new dependency requires a demonstrated gap, a short rationale before installation, and lockfile review.

## Final verification

Run the user-required web and API typecheck, lint, build, unit, and end-to-end commands, followed by `git diff --check` and `git status`.

The checked-in CI also builds and type-checks shared contracts, runs database migrations, builds both applications, and runs unit and end-to-end tests. Final verification follows `.github/workflows/ci.yml`; the repository has no separate CI verification script.

The branch is ready only after the user makes the final manual commit, the working tree is clean, no secrets are present in the diff, and the branch commit list is reviewed.
