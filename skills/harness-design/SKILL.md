---
name: harness-design
description: Layered visual design — guides UI projects through 5 tile-based design layers (wireframes, navigation, style, key pages, motion) before implementation. Each layer is independently confirmed and iterated.
---

# harness-design

You are guiding a user through visual design before development begins. The project has gone through `/harness-init`, so features are defined. Now we make sure the visual direction is clear before any UI code is written.

The core idea: instead of generating a full polished page upfront (slow, expensive, hard to iterate on), break visual design into 5 lightweight layers. Each layer is a focused tile-based artifact the user can review in seconds. Iterate per-layer until confirmed.

You do NOT write production UI code. That's `harness-run`'s job. You produce **design artifacts** — static HTML files and diagrams — that serve as visual specifications.

---

## Phase 0: Pre-flight Checks

Before starting, verify:

1. `docs/features.yaml` and `docs/roadmap.yaml` exist. If not, tell the user: "Run `/harness-init` first to define features." Stop.
2. Read `AGENTS.md` and `docs/features.yaml` to understand the project type. Determine UI surface:
   - **Web / Desktop / Mobile** → proceed with full flow
   - **CLI / Library** → tell the user: "This project doesn't have a visual UI surface. Skip `/harness-design` and run `/harness-run` directly."
3. Check if `design/` directory already exists. If yes, ask: "Found existing design artifacts. Resume from the last incomplete layer, or restart from L1?"

---

## Phase 1: Design Context (Run Once)

Skip this phase if `AGENTS.md` already contains a `## Design Context` section.

Otherwise, gather design context. You can either:
- Invoke the `impeccable:teach-impeccable` skill if available, OR
- Run the equivalent yourself: ask UX-focused questions and synthesize results

Either way, produce these deliverables in `AGENTS.md` under a `## Design Context` section:

```markdown
## Design Context

### Users
[Who they are, their context, the job to be done]

### Brand Personality
[Voice, tone, 3-word personality, emotional goals]

### Aesthetic Direction
[Visual tone, references, anti-references, theme: light/dark/both]

### Design Principles
[3-5 principles derived from the conversation]
```

Append to `AGENTS.md`. Do NOT overwrite existing sections. Commit with message: `feat: design context captured`.

---

## Phase 2: Five Layers (Tile-Based)

Run layers L1 → L5 in order. After each layer:
1. Tell the user the artifact path
2. Ask them to open it in a browser (or read the markdown)
3. Wait for explicit confirmation before next layer
4. Handle iteration requests according to the iteration rules below

Update `PROGRESS.md` `## Current` section before starting each layer:

```markdown
## Current
- Phase: design
- Layer: L{N} ({layer_name})
- Status: pending user review
```

### L1: Information Architecture (Wireframes)

**Goal:** Show the structural skeleton of every page — what blocks exist, what content goes where, what's the reading order. No styling.

**Action:**
1. List the pages implied by `docs/features.yaml`. For each feature, identify which page(s) it lives on. Show the user this page list and confirm before generating.
2. For each page, generate a wireframe tile. Tile = grayscale boxes labeled with content type (header, hero, feature list, CTA, footer, etc.). Use plain HTML with CSS borders and gray fills.
3. Compose all tiles into a single `design/wireframes.html` — one section per page, page name as section heading.

**Constraints:**
- No colors except grayscale. No real images. No real icons.
- Use simple `<div>` boxes with dashed borders and inline labels
- Mobile and desktop side-by-side if responsive matters

**Confirmation prompt:**
> "Wireframes are at `design/wireframes.html`. Open it in your browser. Does the page structure and content layout match what you have in mind?"

### L2: Navigation Flow

**Goal:** Show how users move between pages — what triggers each transition.

**Action:**
1. Based on the wireframes from L1 and the features in `docs/features.yaml`, identify all entry points and transitions.
2. Generate a mermaid flowchart in `design/flow.md`. Each page is a node. Each user action (click, submit, etc.) is a labeled edge.
3. Include initial entry (e.g., landing page), key user journeys, and exit points.

**Format example:**
````markdown
# Navigation Flow

```mermaid
flowchart TD
  Landing -->|click "Get Started"| SignUp
  SignUp -->|submit form| Dashboard
  Dashboard -->|click feature card| FeatureDetail
  FeatureDetail -->|back| Dashboard
```
````

**Confirmation prompt:**
> "Navigation flow is at `design/flow.md`. The transitions and entry points — does this match how you imagine users moving through the product?"

### L3: Visual Style (Style Tiles)

**Goal:** Define the visual language without committing to full pages. Color, type, primitive components.

**Action:**
1. Invoke `frontend-design` skill (or follow its principles directly) to generate `design/styleguide.html`.
2. The page contains tile sections:
   - **Color palette** — primary, secondary, neutrals, semantic (success/warn/error). Show swatches with hex/oklch values
   - **Typography scale** — display, h1-h4, body, small. With actual font samples
   - **Buttons** — primary, secondary, tertiary, destructive. All states: rest, hover, active, disabled, loading
   - **Form controls** — input, textarea, select, checkbox, radio, toggle. All states
   - **Cards** — at least 2 variants
   - **Borders, shadows, radii** — show the scale
   - **Spacing scale** — visual ruler

**Constraints:**
- Use `frontend-design` skill's aesthetic guidelines (avoid generic AI look — see its DOs and DON'Ts)
- Pull from the `Design Context` in `AGENTS.md`
- Single self-contained HTML file (inline CSS) — no build step needed

**Confirmation prompt:**
> "Visual style is at `design/styleguide.html`. Open it. Does the color, type, and component aesthetic feel right for the product?"

### L4: Key Pages (Static Mockups)

**Goal:** Apply L3 style to L1 structure for the 1-2 most critical pages. Real visual, no interactivity.

**Action:**
1. Identify the 1-2 most critical pages based on `docs/features.yaml` (typically: landing/home + the core feature page). Confirm selection with user.
2. For each, generate `design/preview-{page-name}.html`. Each is a complete static page — real visual, real content (use realistic placeholder text, not "Lorem ipsum"), but NO JavaScript interactivity, NO animations.

**Constraints:**
- Use ONLY tokens defined in `design/styleguide.html`
- Use real-looking content matching the project domain
- Must look production-quality at a glance — this is the visual benchmark for `harness-run`

**Confirmation prompt:**
> "Key pages are at `design/preview-{page-name}.html`. These are the visual benchmark `harness-run` will follow when implementing. Look right?"

### L5: Motion (Motion Tiles)

**Goal:** Define animation language without animating full pages.

**Action:**
1. Generate `design/motion.html` — a single page of small interactive demo cards.
2. Each card demonstrates one animation type. Card has a label, a trigger area, and runs the animation on hover or click.
3. Include at minimum:
   - Button hover/active/loading transitions
   - Card entrance (fade + rise)
   - Page transition (slide / crossfade)
   - Skeleton / loading state
   - Input focus state
   - Toast / notification appearance and dismissal
   - Scroll-triggered reveal

**Constraints:**
- Use the timing and easing from `frontend-design` skill's motion reference
- Each demo is independent and re-runnable
- Respect `prefers-reduced-motion`

**Confirmation prompt:**
> "Motion tiles are at `design/motion.html`. Hover or click each card to see the animation. Does the motion language feel right?"

---

## Phase 3: Handoff to harness-run

After L5 confirmation:

1. Append a `## Design Artifacts` section to `AGENTS.md`:

```markdown
## Design Artifacts

When implementing UI features, you MUST read these files as visual specification:

- `design/styleguide.html` — color, typography, components (the source of truth for tokens)
- `design/preview-{page}.html` — static mockup of each key page (the visual benchmark)
- `design/motion.html` — animation language and timing
- `design/wireframes.html` — page structure reference
- `design/flow.md` — navigation transitions

Implemented UI must visually match `preview-*.html` files within reasonable production fidelity.
```

2. Update `PROGRESS.md` `## Current`:
```markdown
## Current
- Phase: design (complete)
- Status: ready for harness-run
```

3. Commit all design artifacts: `feat: design artifacts complete`
4. Tell user: "Visual design is complete. Run `/harness-run` to start development."

---

## Iteration Rules

After every layer, the user might want to iterate. Three categories:

### Type 1: Same-layer Tweak
User wants to adjust something within the current layer (e.g., "change primary color to indigo", "add a sidebar to the dashboard wireframe").

Action: Modify the artifact file directly, ask user to re-review. No layer change.

### Type 2: Backtrack to Earlier Layer
User's feedback reveals an earlier-layer issue (e.g., in L4 they realize a page is missing — that's an L1 issue).

Action: Detect the actual layer affected, then ask:
> "This change affects L{N} ({layer_name}). Going back to L{N} will require regenerating layers L{N+1} onward. Proceed?"

If confirmed:
- Regenerate the affected earlier layer (e.g., update `wireframes.html`)
- Discard / regenerate all later layer artifacts
- Resume confirmation flow from layer N

### Type 3: Init Revision (Affects Features)
User's feedback reveals that `docs/features.yaml` or `docs/roadmap.yaml` is wrong (e.g., "we don't actually need the analytics feature", "the search feature should also support filtering").

Action: Recognize this and ask:
> "This change affects feature definitions, not just visual design. Want to enter lightweight requirements revision before continuing?"

If confirmed, run **lightweight init revision**:
- DO NOT re-ask Phase 1 questions (project name, type, tech stack — already locked)
- Only run harness-init's Phase 2 flow for the affected features:
  - Behavior, acceptance criteria, verification, depends_on, edge cases
  - For new features: full Phase 2 questioning
  - For removed features: confirm removal, update `docs/features.yaml`
  - For modified features: ask only about the modified aspects
- If staging changes are needed, update `docs/roadmap.yaml`
- Commit revisions: `feat: revise features per design feedback`

After revision: return to design flow. Resume from the **current layer** (not L1):
- The earlier layers may still be valid (e.g., visual style L3 is unaffected by removing a feature, only the L1 wireframe and L4 preview need updating)
- Audit each prior layer artifact and update only what changed; regenerate later layers as needed

---

## Behavioral Notes

- **Be patient with iteration.** Users will not love every layer on first try. That's expected — that's why we layer.
- **Default to suggesting Type 2 backtrack** when feedback could be addressed in either current or earlier layer. It's cheaper to fix the structural issue than to bandaid.
- **Type 3 revisions are uncommon but important.** Don't quietly modify `features.yaml` without flagging it as a Type 3 — feature changes deserve explicit user attention.
- **Don't generate L4 previews for every page.** Pick 1-2 critical pages. The styleguide + wireframes are the spec for the rest; harness-run can fill them in.
- **L4 must use only L3 tokens.** This is the critical handshake — if L4 uses ad-hoc values, harness-run won't have a clean spec to follow.
- **Reference `frontend-design` skill aggressively** in L3, L4, L5 — its DO/DON'T lists are exactly what we want enforced.
