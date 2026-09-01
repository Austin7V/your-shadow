# Your Shadow Design System v1.0

Status: approved  
Applies to: Web MVP and future mobile clients  
Implementation scope: tickets 2.10–2.18  
Last updated: 2026-09-01

## Purpose

Your Shadow is a calm personal AI wellness companion. The design system combines three complementary modes without making them look like separate products:

- **Shadow Flow** is the default foundation for navigation, forms, daily actions, and account management.
- **Aurora Companion** represents the AI companion and its emotional or processing states.
- **Vital Performance** gives workouts, progress, and analytics energy and precision without turning the product into a gym tracker or medical dashboard.

The system is mobile-first and complete on desktop. Web and future mobile clients share semantic tokens, component roles, information hierarchy, state names, and safety boundaries even when platform implementations differ.

## Product principles

1. **Calm first.** Reduce visual noise, keep one clear primary action, and reveal detail progressively.
2. **Personal, not childish.** Use warm, direct language and a restrained companion presence.
3. **Health-aware.** Separate ordinary guidance, warnings, and safety stops. Never imply diagnosis or treatment.
4. **Progressive detail.** Present the current task first, supporting facts second, and history or analytics on demand.
5. **One product across platforms.** Preserve tokens, component semantics, and interaction priority from phone to desktop.
6. **Motion explains state.** Motion communicates entry, progress, processing, and completion; it is not ambient decoration.
7. **Privacy by design.** Show sensitive health details only where the user intentionally manages them.

## Visual direction

The interface uses quiet neutral surfaces, teal primary actions, green progress, violet analytics, and coral warmth. Light mode uses subtle neutral elevation. Dark mode uses deep blue-green tonal separation and borders, with shadows kept secondary.

The primary visual mark is an abstract luminous **Shadow orb**. It must not be replaced by a heart, medical cross, bodybuilder image, mascot face, or literal human shadow. The orb can use semantic gradients and restrained light, but the surrounding application must not use excessive blur, glow, neon, or glassmorphism.

Product imagery is optional. When a feature eventually needs exercise or meal media, it must support the task and come from that feature's reviewed content contract rather than random stock imagery.

## Semantic color tokens

Feature components must use semantic tokens. Literal theme colors belong only in the global token definition or purpose-built brand asset implementation.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `background` | `#F7FAF8` | `#08131B` | Application canvas |
| `surface` | `#FFFFFF` | `#0F2028` | Default cards and controls |
| `surface-muted` | `#EEF7F3` | `#172B34` | Quiet groups and secondary regions |
| `surface-raised` | `#FFFFFF` | `#1B3039` | Elevated overlays and emphasized cards |
| `foreground` | `#14201F` | `#F3FAF8` | Primary text and icons |
| `muted-foreground` | `#667673` | `#9BAEAC` | Secondary text and inactive icons |
| `primary` | `#0F9F91` | `#37D6C4` | Primary actions and active navigation |
| `primary-hover` | `#0B8378` | `#68E6D8` | Primary hover emphasis |
| `primary-foreground` | `#FFFFFF` | `#071412` | Content on primary fills |
| `progress` | `#63B94E` | `#B7ED61` | Completion, readiness, and progress |
| `analytics` | `#7668D8` | `#A78BFA` | Trends and historical comparison |
| `accent-warm` | `#F28A72` | `#FF9A7F` | Warm companion emphasis and celebrations |
| `success` | `#278A5B` | `#58D68D` | Confirmed successful outcomes |
| `warning` | `#B76A16` | `#F3B85B` | Recoverable caution |
| `error` | `#C84E55` | `#FF7A83` | Invalid input and failed operations |
| `safety` | `#3978B8` | `#6DB7FF` | Medical boundaries and safety information |
| `border` | `#DDE8E3` | `#29404A` | Dividers and component boundaries |
| `ring` | `#087F74` | `#7CEBDD` | Keyboard focus indicator |

State colors are not interchangeable:

- `progress` communicates ordinary completion and performance.
- `success` confirms that an operation completed.
- `warning` describes caution that permits a next action.
- `error` describes invalid or failed application state.
- `safety` marks health boundaries or an instruction to stop and seek appropriate help.
- `analytics` is reserved for comparison and trends, not generic decoration.

Opacity variants must derive from semantic tokens. Text contrast must be tested on the actual composited background.

## Typography

The product typeface is **Manrope** with a system sans-serif fallback. Supported weights are intentionally limited:

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| Page title | Fluid `32–48px` | `600–700` | Tight but readable line height |
| Section heading | `20–28px` | `600–700` | Preserve hierarchy without oversized cards |
| Body | Minimum `16px` | `400` | Default reading text |
| Control and label | `14–16px` | `500` | Controls remain at least 44px high |
| Secondary text | `14px` | `400–500` | Never use for essential consent or safety copy |
| Mobile navigation | Minimum `12px` | `500–600` | Always paired with an accessible name |
| Dashboard number | Contextual | `600–700` | Use tabular numerals |

Body copy uses comfortable line lengths and approximately 1.5 line height. Uppercase tracking is limited to short eyebrows or metadata. Headings use sentence case.

## Spacing, shape, and elevation

The base spacing unit is `4px`. Preferred values are `8`, `12`, `16`, `20`, `24`, `32`, `40`, and `48px`. Feature code should prefer the named scale.

| Role | Radius |
| --- | --- |
| Compact chips and small grouped controls | `12px` |
| Buttons, inputs, and selects | `14px` |
| Cards and form sections | `20px` |
| Feature panels and prominent companion regions | `28px` |

All pointer and keyboard targets must be at least `44 × 44px`. Light theme elevation uses soft neutral shadows with no colored glow. Dark theme relies primarily on borders and tonal separation. Raised overlays must remain distinguishable without transparency effects.

## Theme contract

The available preferences are `light`, `dark`, and `system`.

- The preference persists across browser sessions.
- `system` resolves through `prefers-color-scheme` and responds to changes while selected.
- An explicit `light` or `dark` preference never changes automatically.
- The resolved theme is applied before first paint so the page does not flash the wrong theme.
- Browser `color-scheme` and theme color match the resolved theme.
- Theme controls have a visible label, keyboard operation, selected state, and screen-reader name.
- Light and dark preserve identical structure, content priority, and semantics.
- Theme transitions use motion tokens and do not animate layout.

An evening dark-theme suggestion is a possible future enhancement, not part of v1.0.

## Responsive architecture

### Phone: below 768px

- One primary content column, fully usable from 360px.
- A compact top bar provides current context and a Profile avatar.
- Fixed bottom navigation contains exactly: Today, Meals, Ask Shadow, Workout, History.
- Ask Shadow occupies the center and uses the compact orb.
- Until Ask Shadow exists, it is disabled or marked `Coming soon` and does not link to a fabricated route.
- Content reserves space for bottom navigation and mobile browser insets.

### Tablet: 768–1199px

- A compact navigation rail remains fixed on the left.
- Content uses two or three columns when useful.
- Ask Shadow remains a distinct prominent action.
- Navigation does not move into a desktop header.

### Web: 1200px and above

- A persistent sidebar contains Today, Meals, Workout, Ask Shadow, History, and Profile in that order.
- Ask Shadow remains disabled or marked `Coming soon` until its route exists.
- A top utility area contains notifications, theme control, and the user avatar.
- Notifications must not imply a working center before that feature exists.
- The workspace is capped at `1440px` while feature content may use narrower readable widths.

Existing destinations are `/dashboard`, `/meals`, `/workout`, `/history`, and `/account`. No design-system component may invent routes or make an unavailable feature look operational.

## Component architecture

Shared components own visual and interaction consistency; feature components own domain data and copy. Existing primitives must be evolved rather than duplicated.

### Core controls

- Button: primary, secondary, quiet, and destructive roles; disabled and loading behavior; press feedback.
- Icon button: accessible name, tooltip where useful, and minimum target.
- Input and password input: label, description, validation, read-only, disabled, autocomplete, and optional reveal action.
- Select and textarea: matching label, description, invalid, read-only where applicable, and disabled contracts.
- Checkbox: never preselects consent; the full label is interactive.
- Scale: keyboard-operable and suitable for the future check-in flow.
- Theme segmented control or menu: used only for the three actual preferences.

### Containers and data display

- Form section groups related fields with an explicit heading and optional description.
- Card provides standard, muted, raised, interactive, and destructive semantic roles.
- Feature page shell owns responsive title, description, actions, and content width.
- Progress and chart foundations use `progress` and `analytics`, tabular numerals, text equivalents, and reduced-motion completion.
- Responsive data lists prefer stacked rows on phone and use tables only when horizontal relationships require them.

### Feedback states

Every data-owning feature supports the relevant states:

- loading and skeleton;
- empty with an optional valid action;
- error with safe retry when possible;
- success confirmation;
- warning;
- safety boundary or stop;
- destructive confirmation.

Skeletons must not expose plausible sensitive values. Error copy must not leak stack traces, provider details, identifiers, or decrypted health data. Empty days and incomplete wellness activity are neutral, not failures.

## Shadow companion

The Shadow orb is reusable in compact navigation and large workspace sizes. It always exposes a textual status to assistive technology; color or animation alone never communicates state.

| State | Visual distinction | Accessible status | Motion behavior |
| --- | --- | --- | --- |
| `idle` | Balanced teal/aurora core | “Shadow is ready” | Slow restrained breathing |
| `listening` | Expanded cool ring | “Shadow is listening” | Gentle input pulse |
| `thinking` | Violet-shifted emphasis | “Shadow is thinking” | Slow processing orbit |
| `responding` | Warm directional highlight | “Shadow is responding” | Measured outward wave |
| `success` | Green completion accent | “Shadow completed the action” | One short completion pulse |
| `attention` | Warm amber/coral emphasis | “Shadow needs your attention” | One restrained alert pulse |
| `offline` | Desaturated stable core | “Shadow is offline” | No ambient animation |

Reduced motion removes decorative breathing, orbiting, pulsing, and waves while retaining the final visual state and accessible text. The component does not imply live AI, microphone access, or connectivity when those capabilities are unavailable.

## Motion system

| Token | Duration | Intended use |
| --- | --- | --- |
| `instant` | `80ms` | Press and micro-feedback |
| `control` | `180ms` | Hover, focus, toggle, and compact control changes |
| `enter` | `240ms` | Card and page-region entry without layout shift |
| `data` | `600ms` | Progress-ring and chart drawing |
| `companion` | `3200ms` | Calm orb breathing loop only |

Required motion includes soft card entry, button press, hover and focus transitions, progress or chart drawing, resolved-theme transition, a brief completion response, and orb breathing. Motion animates opacity and transforms rather than layout dimensions.

Under `prefers-reduced-motion: reduce`:

- decorative motion and continuous loops stop;
- progress and charts render their final state immediately;
- scrolling is not forced to animate;
- necessary state changes remain visible without movement.

## Accessibility contract

- Meet WCAG 2.2 AA contrast for text, controls, boundaries, and focus.
- Preserve semantic headings and landmarks across layouts.
- Every control and icon-only action has a programmatic name.
- Active navigation uses visual styling and `aria-current`.
- Disabled unavailable actions expose why they are unavailable.
- Focus is visible in both themes and never clipped.
- Form errors are associated with fields and announced appropriately.
- Status updates are polite unless immediate safety requires an alert.
- States never rely on color alone.
- Zoom, text resizing, long names, and translation must not cause horizontal page overflow.
- Touch targets are at least 44px and mobile navigation labels at least 12px.

## Safety and privacy contract

Medical warnings remain visually and semantically separate from ordinary recommendations. Safety components use non-diagnostic wording, tell the user when to stop, and direct urgent concerns to appropriate professional or emergency help without pretending to triage them.

The redesign must preserve all existing boundaries:

- authentication and refresh remain cookie-based;
- tokens remain inaccessible to client JavaScript;
- safe return paths remain allowlisted;
- private routes and profile-completion redirects remain intact;
- profile, constraint, and weight requests remain owner-derived on the server;
- stored profile, health, and weight values remain encrypted by the API;
- account deletion requires password and exact confirmation, removes owned data, clears the session, and redirects away from private routes;
- consent remains explicit and unchecked by default;
- validation or request errors preserve entered values.

The shell, analytics previews, notifications, skeletons, and companion must never reveal health constraints, weight, birth date, or private notes outside the intentional feature context.

## Future feature contract

Design-system work may prepare presentation contracts, but it must not implement future business behavior.

| Epic | Design-system consumers | Contract established in v1.0 |
| --- | --- | --- |
| Epic 4: AI Core, Safety & Daily Plan | Today cards, plan status, AI processing, fallback, safety | Responsive status cards; distinct states; Shadow states without live AI |
| Epic 5: Nutrition Logging | Meal form, draft review, estimates, totals, delete | Form and card primitives; approximate-data language; confirmation patterns |
| Epic 6: Home Workout | Overview, player, large actions, progress, pain stop | Focused panels; progress; minimum targets; safety-stop presentation |
| Epic 7: Check-in, Summary, History & Memory | Scales, facts, charts, seven-day cards | Keyboard scale; facts separated from support; analytics; neutral empty days |

Future native clients implement the same semantic roles with platform-native controls. This work does not add Expo, React Native, PWA, or offline behavior.

## Explicit exclusions

- Live AI chat or a fabricated Ask Shadow page.
- Voice recognition, microphone permission, or voice control.
- Daily Plan generation or Today business data.
- Meal parsing, nutrition CRUD, or photo recognition.
- Workout catalog, planning, player behavior, or exercise media.
- Check-in persistence, summaries, memory, or real analytics.
- Notifications, reminders, device integrations, wearables, or PWA behavior.
- New backend fields, endpoints, entities, or migrations.
- A large UI framework.
- Decorative glass, neon, continuous page animation, or unreviewed stock imagery.

## Governance and implementation

- This document is the product and interaction source of truth for v1.0.
- Global CSS owns theme values and motion primitives; feature code consumes semantic names.
- Shared UI components own focus, disabled, loading, invalid, and responsive behavior.
- Design changes are verified in both themes and at phone, tablet, and desktop widths.
- Component changes are checked against current consumers and future contracts.
- Deprecated placeholder styling is removed only after every current consumer migrates.

Implementation and verification are staged in [design-redesign-roadmap.md](./design-redesign-roadmap.md).
