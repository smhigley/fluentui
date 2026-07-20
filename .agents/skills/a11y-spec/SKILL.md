---
name: a11y-spec
description: Generate a Fluent v9 component accessibility spec (`<Component>AccessibilitySpec.mdx`) from the component's source. Reads types, hook, render, and styles to produce a spec that follows the repo's established section structure.
argument-hint: <ComponentName>
allowed-tools: Read Write Bash Grep Glob
---

# Generate a Component Accessibility Spec

Generate `<Component>AccessibilitySpec.mdx` for the component **$ARGUMENTS**, matching the section structure and voice of the existing specs in this repo.

The output is a single MDX file placed under the component's `stories/src/<Component>/` directory. It documents accessibility-relevant behavior: labelling, keyboard, semantics, forced colors, motion, and known issues. **Describe behavior in accessibility and functionality terms, not in terms of the source code.** The spec is for consumers reasoning about the component's accessible behavior — they should not need to know about internal hook names, utility functions, or specific file paths to follow it.

## Reference specs

These already exist and are the source of truth for structure, voice, and depth. **Read at least two before writing** so the new spec reads as a sibling, not a different document:

- Button — [packages/react-components/react-button/stories/src/Button/ButtonAccessibilitySpec.mdx](../../../packages/react-components/react-button/stories/src/Button/ButtonAccessibilitySpec.mdx) — native `<button>` wrapper, anchor (`as="a"`) variant, disabled vs disabledFocusable
- Input — [packages/react-components/react-input/stories/src/Input/InputAccessibilitySpec.mdx](../../../packages/react-components/react-input/stories/src/Input/InputAccessibilitySpec.mdx) — wrapper-around-native-input pattern, Field integration, validation, slots
- Textarea — [packages/react-components/react-textarea/stories/src/Textarea/TextareaAccessibilitySpec.mdx](../../../packages/react-components/react-textarea/stories/src/Textarea/TextareaAccessibilitySpec.mdx) — like Input, plus resize-handle accessibility limitation and live-region/typing-echo guidance
- Dropdown — [packages/react-components/react-combobox/stories/src/Dropdown/DropdownAccessibilitySpec.mdx](../../../packages/react-components/react-combobox/stories/src/Dropdown/DropdownAccessibilitySpec.mdx) — composite popup control with rich ARIA wiring
- Checkbox — [packages/react-components/react-checkbox/stories/src/Checkbox/CheckboxAccessibilitySpec.mdx](../../../packages/react-components/react-checkbox/stories/src/Checkbox/CheckboxAccessibilitySpec.mdx) — hidden-native-input with custom indicator, tri-state
- RadioGroup — [packages/react-components/react-radio/stories/src/RadioGroup/RadioGroupAccessibilitySpec.mdx](../../../packages/react-components/react-radio/stories/src/RadioGroup/RadioGroupAccessibilitySpec.mdx) — composite (Radio + RadioGroup covered together)
- Card — [packages/react-components/react-card/stories/src/Card/CardAccessibilitySpec.mdx](../../../packages/react-components/react-card/stories/src/Card/CardAccessibilitySpec.mdx) — container that can be focusable / clickable / selectable while housing other interactive children (links, buttons, form fields). Reference for any control with the same shape.
- MenuButton / SplitButton — short specs that defer to ButtonAccessibilitySpec — example of how to compose without duplicating

Match the closest exemplar to the component being spec'd:

- Renders a native button → ButtonAccessibilitySpec
- Wraps a native form field → InputAccessibilitySpec
- Has tri-state or hidden-native-input + custom indicator → CheckboxAccessibilitySpec
- Composite popup or selection widget → DropdownAccessibilitySpec
- Composite group of items with shared ARIA → RadioGroupAccessibilitySpec
- Container that can be focusable / clickable / selectable while housing interactive children → CardAccessibilitySpec
- Extends an existing spec'd component → MenuButton / SplitButton (defer + cover only what's new)

## Phase 1: Locate the component

```bash
# Find the package
yarn nx show project react-$ARGUMENTS 2>/dev/null || find packages/react-components -maxdepth 2 -type d -iname "react-*$ARGUMENTS*"
```

Standard paths inside the package:

- `packages/react-components/react-<pkg>/library/src/components/<Component>/`
  - `<Component>.types.ts` — props, slots, variants
  - `use<Component>.ts` or `.tsx` — state shape, Field integration, ARIA wiring
  - `render<Component>.tsx` — DOM structure (slot order, what's wrapped in what)
  - `use<Component>Styles.styles.ts` — focus, forced-colors, motion, disabled visuals
- `packages/react-components/react-<pkg>/stories/src/<Component>/` — where the spec is written

If the component is a composite (e.g. `RadioGroup` + `Radio`), read the parent and at least one child. One combined spec is usually right; split only if each is independently usable.

## Phase 2: Extract what to write about

Read the four core files to **learn** the component's behavior. Translate what you learn into accessibility and functionality descriptions; do not quote source code, name internal hooks, or cite file paths in the spec itself.

| Where to read                                   | Behavior to extract for the spec                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `.types.ts` — props                             | The public-facing props and what each one does, for the Implementing subsections and the variant list in the contrast section. |
| `.types.ts` — slots                             | The rendered DOM structure, for the Semantics table, Content restrictions, and render order.                                   |
| `use<Component>.ts`                             | Default prop values, ARIA wiring, `Field` integration behavior, generated ids, ref handling.                                   |
| `render<Component>.tsx`                         | DOM order for Semantics; tab order between slots for Keyboard.                                                                 |
| `.styles.ts` — focus rules                      | Focus indicator behavior described in Semantics or its own subsection.                                                         |
| `.styles.ts` — `@media (forced-colors: active)` | Windows contrast themes (what is explicit Fluent behavior vs inherited from the native element).                               |
| `.styles.ts` — motion rules                     | Motion and animation, including whether `prefers-reduced-motion` shortens or removes the motion.                               |
| `.styles.ts` — state styles                     | Disabled, invalid, hover, active visual states for Disabled and Validation.                                                    |

If a section's source is **silent** (no explicit rules, no relevant props), say so plainly: "There is no animation on `<Component>`," "Relies entirely on the native element's forced-colors behavior." Do not invent content.

## Phase 3: Audit for accessibility issues in the component code

While reading the source, watch for accessibility pitfalls in the **component's own implementation** — not just behavior to describe. The spec's primary job is to describe how the component works for consumers, but if the implementation itself has accessibility problems, surface them in two places:

1. In the spec's **Known issues / pitfalls** section, framed as something consumers should be aware of (and possibly work around).
2. In your final report to the user, under a heading like "Accessibility issues found in component code," so they can decide whether to file follow-up work to fix them.

Be specific in your findings: name the component / slot, describe the problem in accessibility terms, and propose the fix.

### Pitfalls to watch for

1. **`aria-roledescription` overrides.** Look for any default use of `aria-roledescription` (e.g. `aria-roledescription="carousel"`, `aria-roledescription="slide"`). This attribute is only intended for cases like flowcharts and games, which are entirely separate from standard UI concepts. It should never be used in a standard UI component to replace or augment the native role announcement. There are no exceptions to this rule outside of those cases. Some problems include:

   - The role is the most important piece of information for AT users to understand what a control is and how to interact with it. Overriding it with a custom role string is harmful to screen reader users.
   - It usually replaces a clear native role with localized text that the component cannot localize cleanly.
   - Role announcements are integrated with built-in screen reader UX like instructions and hints, and vary across different operating systems and screen reader combinations. Custom role descriptions are not, and they break that consistency.

2. **`aria-label` carrying role / component type / instructions instead of a name.** Watch for default `aria-label` values (or recommended consumer-supplied values in the spec) that:

   - **Restate the role.** "Search button" on a `<button>`, "main navigation" on a `<nav>` or `role="navigation"`. The screen reader already announces "button" / "navigation"; repeating the role in the name is noise, or potentially confusing if the chosen word doesn't match the conventional localized term in that specific screen reader.
   - **Include the component type.** "Filter dropdown" where the type is already exposed as combobox or menu button. Or "carousel" -- the component type and interaction are already conveyed by the role, the UX idea of it being a "carousel" is not a meaningful addition for screen reader users.
   - **Contain usage instructions.** "Click to expand," "Press Enter to confirm," "Use arrow keys to move between items." Modality-specific instructions should never be baked in at a control level. If anything, they belong in a separate help page or dialog. Users of a specific AT, especially screen reader users, are often using their AT in ways you do not expect (e.g. using virtual cursor navigation where keyboard commands are not sent through to the page, or using touch navigation without a keyboard). Instructions that only make sense for one modality are never appropriate to expose in ARIA labels or descriptions. If you find a hard-coded `aria-label` like this in the source, flag it. If the spec is about to recommend consumers write labels like this, fix the recommendation before the spec ships.

3. **Other patterns to flag if you see them.** Not exhaustive, but high-frequency offenders:
   - Hard-coded English strings in any ARIA attribute that should be localizable (`aria-label`, `aria-description`, `aria-roledescription`, `aria-valuetext`, `aria-placeholder`). If the component supplies a default, the consumer must be able to override it.
   - Decorative wrappers, icons, chevrons, or dividers in the rendered DOM without `aria-hidden="true"` that end up in the AT tree as empty groups or unnamed images.
   - `role="presentation"` or `role="none"` applied to an interactive element (or its required descendant), which strips the semantics needed for the pattern to work.
   - `aria-live` attached to an element that the component already updates and announces via `useAnnounce` — double announcements result.
   - `aria-live` on an element that contains too much content, or frequently updating content.
   - Click handlers on `<div>` / `<span>` slots without a corresponding `role="button"`, `tabIndex={0}`, and keyboard activation (or, better, an inner real `<button>`).

When a finding is a real accessibility bug in the component (not just a pattern consumers can work around), keep it short in the spec's Known issues section and put the detailed description and proposed fix in your final report.

## Phase 4: Write the spec

### File location and name

```
packages/react-components/react-<pkg>/stories/src/<Component>/<Component>AccessibilitySpec.mdx
```

Exactly that casing. The trailing `Spec` is load-bearing — earlier `*Accessibility.mdx` files were renamed for this convention.

### Required frontmatter and title

```mdx
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Concepts/Developer/Accessibility/Components/<Component>" />

# <Component> Accessibility Spec
```

### Section order

These are the canonical sections. Include them in this order. A section that is genuinely not applicable to the component (e.g. Motion when the component has no animation) may be omitted entirely — you do not need to keep the heading with a placeholder line. Only include a section when there is something component-specific to say.

1. **Intro (no heading)** — 1–2 short paragraphs. What the component is. What underlying element/role it produces. Crisply distinguish what comes from the browser/native element if used vs what Fluent layers on top.

2. **## Usage**

   - **### When to choose `<Component>`** — what scenarios it's for.
     - **#### `<Component>` vs. `<Alternative>`** — one subsection per close alternative. Identify alternatives by looking at sibling components in the same package and conceptually adjacent components (Button↔Link, Checkbox↔Switch↔Radio, Input↔Textarea↔SpinButton↔Combobox, etc.). Be concrete about what tips the decision.
     - **#### Usage restrictions** — If this is an interactive control, consider common misuses: "Do not use `<Button>` inside a Menu," "Do not use `<Component>` as a wrapper for arbitrary content," "Do not wrap `<Card>` in a link because that destroys all inner semantic structure," etc.
   - **### Implementing `<Component>`** — pick from the subsections below based on what applies. For any prop that gates a substantial behavior change (e.g. `focusMode`, `interactive`, `selectable`, `appearance`), the subsection should **open with when this mode is intended to be used** before enumerating the options. Mechanical enumeration is necessary but secondary; the intent framing is what prevents misuse.
     - **#### Label** (or split into "Programmatic label" + "Visual label" for form fields) — always include for any focusable control. Cite WCAG 3.3.2 for form fields. Show the `Field` path first for supported components, then `Label htmlFor` for form controls, then `aria-labelledby` / `aria-label`.
     - **#### Disabled** — include for any interactive control. Explain `disabled` (native) vs `disabledFocusable` (aria-disabled, focusable). If only one is supported, say so and why. Mention `readonly` for editable fields. Note that disabled focusable content nested in slots is **not** auto-disabled by the parent.
     - **#### Form field accessibility** — **only applicable if the component renders or wraps a native or ARIA form field** (`<input>`, `<textarea>`, `<select>`, `<button role="combobox">`, `<div contenteditable role="textbox">`) or otherwise behaves as a form control that can participate in `Field` integration. Skip this entire grouping for non-form-field components (containers, links, navigation, disclosures, etc.). When it does apply, include the relevant subsections below:
       - **##### Placeholder** — only for text-entry fields. Frame as "not a label substitute."
       - **##### Field integration** — only if `useFieldControlProps_unstable` is called. List which of `id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `required`, `size` are wired (read the call site — `supportsLabelFor`, `supportsRequired`, `supportsSize` opt-ins matter). Note explicitly which are **not** auto-wired (commonly `aria-invalid`).
       - **##### Validation** — only if the styles read `aria-invalid` or `Field` integration sets it. Mention the `useAnnounce` utility for non-error/warning validation states.
     - **#### Content restrictions** — only for components with `children` or slots that accept arbitrary content. List allowed and disallowed content types. Forbid nested interactives in slots that aren't designed for them. For components like Menu or Listbox that have strict semantic requirements, specifically call out that other interactive controls like Button, Switch, etc. are not allowed as children. Do **not** over-restrict beyond what the code or pattern actually requires: if a use is unusual but valid (e.g. a heading element inside a card description slot), frame as "consider whether…" rather than "do not…". Only forbid combinations that genuinely break the pattern (nested interactives in a `<button>`, `treeitem` inside `treeitem`, etc.).
     - **#### Color contrast and appearance variants** — only if the component has appearance variants or state-driven visuals that communicate information. Distinguish two cases explicitly:
       - _Information-bearing visuals_ (focus indicator, selected state, validation outline, indicator backgrounds that key off ARIA state) must meet 3:1 against the rest state and against the surroundings. Verify per variant.
       - _Decorative borders, shadows, or background fills_ on static containers do **not** require 3:1 boundary contrast if the content inside is the actual visual unit — the contrast obligation lives on the state changes, not on the resting boundary.
         Flag deprecated variants and call out any variant where the state contrast is borderline.
     - **#### Target size** — only for pointer targets (buttons, switches, checkboxes). Cite WCAG 2.5.8 and the 24×24 minimum. Note whether defaults meet it.
     - **#### Anchor (`as="a"`)** — only if the component supports `as="a"` (uses `useARIAButtonProps`).
     - **#### Customizing `<Component>`** — include for any component whose slots or behavior can be meaningfully overridden (most v9 components qualify). Cover the customizations that look reasonable but break accessibility, and the safe alternatives. Pull from the actual slot/render structure — never invent restrictions the code doesn't imply. Typical content:
       - **Roles that can and cannot be overridden.** Identify the slots whose role is load-bearing for the component's pattern (the trigger of a disclosure, the option in a listbox, the gridcell in a grid, etc.) and also has similar roles that an author might mistakenly think to use. State plainly that swapping `role` to something similar on the surface silently breaks other internal semantics, the keyboard model, or the pattern AT recognizes. If the visual the consumer wants matches a different component, point them at it.
       - **Semantics follow functionality, not appearance.** Roles must reflect what the component actually does, not what it looks like. If the component visually resembles a known control type but does not implement that control's interaction model and structural requirements, the spec must explicitly name that role as one to avoid. Concretely: if a component visually resembles a grid (rows + columns) but does not implement two-dimensional arrow navigation, row/column header relationships, or cell-level focus, `role="grid"` and `role="gridcell"` must be called out as forbidden. The same applies to any other visually-evocative role (`tab`, `menuitem`, `listitem`, `treeitem`, `option`, etc.) — only use the role if the component's intended meaning and interaction match that of the role (e.g. the primary purpose is selection for a listbox and not navigation) and actually implements that pattern's full contract.
       - **Keyboard handling that must not be layered on.** If adding arrow-key navigation, type-ahead, or a roving tab stop across instances would conflict with the ARIA pattern the component implements, say so. Usually if an author wants a different keyboard pattern than the component implements, the right answer is usually either that they're mistaken about the correct keyboard model or should switch to a different component instead of retrofitting the current one.
       - **Click handlers without a real activation path for AT.** A click handler on a container does **not** provide an activation path for voice control, mobile/touch screen readers, or Windows virtual-cursor users — those users do not generate the synthetic click that a keyboard `Enter` press would. Components that expose a root-level click handler must include an inner `<button>` or `<a>` that performs the same action, and the spec must call this out explicitly. Selectable components that already render a real `<input type="checkbox">` (or equivalent) satisfy this on their own; click-driven components without such an inner control do not.
       - **Forbidden nesting of internal selection controls.** When a component renders an internal selection control (`<input type="checkbox">`, `<input type="radio">`, a switch input, or the ARIA equivalent) as part of its own surface, it is incompatible with parents that already have their own selection semantics (`Listbox`, `Combobox`, `Menu`, `Tree`, `RadioGroup`, `CheckboxGroup`). Spec these incompatibilities explicitly — they're invariably surprising. Inside those parents, any visual checkbox / radio / switch must be a presentational icon (no role, no input), not a real selection control.
       - **Adding extra interactive controls inside the component.** This is the most common request and the most error-prone. If interactive controls cannot live inside a particular slot (e.g. nested inside a `<button>`, inside a `treeitem`, inside an `option` role), spell out which slot is off-limits and why (HTML parsing rules, presentational children, AT not exposing them). Then **enumerate the safe patterns this component supports**, with the trade-offs of each — pick whichever apply based on the actual slot/render structure. There is no fixed count: some components only have one safe path, others (e.g. Card with three distinct keyboard-activation patterns) have several. Examples of patterns to draw from:
         - **Wrap the component and place additional controls as siblings.** Group the component and the extra controls inside a wrapping `<div>` so the controls live outside the restricted slot but render visually adjacent to it. Each control then takes its own tab stop.
         - **Recompose the relevant component and slots.** If the component's render places a restricted child (e.g. the `button` slot) inside a less restrictive root slot, additional siblings of the restricted child — rendered inside the root but outside the restricted slot — are valid and remain independently focusable.
         - **Use a dedicated "action" or "floatingAction"-style slot** already provided by the component. If the component has carved out a safe positioned slot for an extra control, point to it instead of suggesting a custom wrap.
         - **Component-specific keyboard / activation variants.** If the component supports multiple safe ways to bind activation (e.g. different `focusMode` values that allow `Enter`/`Space` handlers on the root vs. relying on inner buttons), enumerate each with the trade-off (keyboard speed, screen reader / voice control behavior, conflicting key consumption).

3. **## Semantics** — a `| Slot | Role | States and properties |` table mirroring the rendered DOM. Note `aria-hidden` on decorative elements. Note where focus actually lives if it's not the visible root.

4. **## Keyboard interaction** — a key→result table for keys the component or its native element handles. If activation/editing keys are entirely browser-native, say so. Note where the single tab stop sits, and where any additional focusable slot content lands in the tab order. State the disabled-tab-order behavior.

5. **## Windows contrast themes (high contrast mode)** — explicit forced-colors rules in the styles. If the component relies on the native element for HCM with only a small Fluent override (typical for form-field wrappers — usually `GrayText` for disabled border), say that. If the component has a custom visual (Checkbox/Radio/Switch indicator), enumerate the explicit rules in `@media (forced-colors: active)`. When the styles use `forced-color-adjust: none`, document both the rationale (typically: prevent text backplates over `Highlight` backgrounds, or preserve a meaningful color when the system palette would otherwise erase it) and the risk (any higher-specificity color or background rule outside the forced-colors media query will override the system palette and reintroduce the problem the override was meant to fix). Treat `forced-color-adjust: none` as a maintenance hazard, not just a feature.

6. **## Motion and animation** — `transitionProperty` / `transitionDuration` rules and whether they have a `prefers-reduced-motion` shortener. If the component has no motion, this section may be omitted entirely rather than kept as a placeholder.

7. **## Known issues** — If there are code comments specifically documenting assistive tech or browser issues, document them here. Also include deprecated props that impact accessibility. Do not make up issues if none exist. Examples of common pitfalls that belong here when they apply to the component:
   - **Container with a root click handler but no AT-reachable activation.** Voice control, mobile/touch screen readers, and Windows virtual-cursor users cannot directly invoke a root click handler — they need a real inner button or link with the same action. If the component supports a root `onClick` but does not render or enforce such an inner control, flag this as a pitfall.
   - **Implicit / auto-detected behavior changes** (e.g. a card promoting itself to "interactive" because a pointer event was attached) that may surprise consumers who attached the handler for an unrelated purpose.
   - **Props or attributes that do not propagate to children** (e.g. `disabled` on a container that does not disable its descendants), where the consumer might reasonably expect they do.

### Voice and style

- **Specific, not generic.** "The bottom border uses `colorNeutralStrokeAccessible` to meet 3:1 indicator contrast." Not "Make sure the border has enough contrast."
- **Source over speculation.** When the documented behavior says it, say it. When it is silent, say so — don't invent behavior.
- **`<kbd>` for keys** (`<kbd>Tab</kbd>`, `<kbd>Shift</kbd> + <kbd>Tab</kbd>`). Match the existing specs' table formatting.
- **No emojis.** No "✅"/"❌" tables. No marketing voice.
- **Cross-link**, don't duplicate. If the component composes another already-spec'd component (MenuButton uses Button), defer the shared content with a single sentence and a Storybook docs link of the form `?path=/docs/concepts-developer-accessibility-components-<name>--docs`. The slug derives from the `<Meta title>` of the linked spec, not the filename.
- **WCAG citations** when the rule is normative: 3.3.2 (labels), 2.5.8 (target size), 1.4.11 (non-text contrast). Use the W3C URL form `https://w3c.github.io/wcag/understanding/<rule>.html`.
- **Field integration phrasing**: list each attribute as a bullet with a dash explanation. Match the existing specs verbatim where the behavior is identical.

### Edge cases

- **Composite components** (RadioGroup + Radio, or Menu + MenuTrigger + MenuItem): one combined spec is usually right. Cover the parent first, then each child slot's specifics.
- **Components that extend another component** (MenuButton extends Button, SplitButton composes Button + MenuButton): write a short spec that defers all shared behavior with a single link and only covers what's new. See MenuButtonAccessibilitySpec for the pattern.
- **Components with no interactive behavior** (Text, Divider, Card): the spec is mostly Semantics, Color contrast, and Known issues. Drop Keyboard, Field integration, Disabled, and — if there is no animation — Motion.
- **Components that have a story file demonstrating the a11y-relevant pattern**: link to it with the Storybook story slug `?path=/story/components-<component>--<story-id>`. Verify the slug by checking the story's `storyName` if it has one, otherwise the export name kebab-cased.

## Phase 5: Verify

Before reporting done:

1. **Read the file back.** Confirm the section order matches the canonical list and headings are consistent with the reference specs.
2. **Check claims against the code.** Each prop-level claim (defaults, ARIA mapping, opt-ins) should match the actual source.
3. **Confirm audit findings are reflected.** Each issue from Phase 3 should either appear in the spec's Known issues / pitfalls section (if consumers need to know) or be listed in your final report (if it's a component-code bug the team should fix), or both.
4. **Run a quick spell-pass.** Specs go in published docs.

Do **not** add the spec to any `index.stories.ts` registration — Storybook discovers `.mdx` files automatically via the project's globs. The `<Meta title>` is the source of truth for the docs path.

## Output

Report:

- Where the file was written
- Which reference spec you modelled it after
- Sections deliberately omitted (with a one-line reason each) so a reviewer can sanity-check
- Any source-code questions you couldn't answer from the code alone (so the user can fill them in)
- **Accessibility issues found in component code** (from Phase 3) — list each finding with the component / slot, the problem in accessibility terms, and the proposed fix. If no issues were found, say so explicitly. Do not make up issues.
