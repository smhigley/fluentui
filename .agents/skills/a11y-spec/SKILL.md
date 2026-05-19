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
- MenuButton / SplitButton — short specs that defer to ButtonAccessibilitySpec — example of how to compose without duplicating

Match the closest exemplar to the component being spec'd:

- Renders a native button → ButtonAccessibilitySpec
- Wraps a native form field → InputAccessibilitySpec
- Has tri-state or hidden-native-input + custom indicator → CheckboxAccessibilitySpec
- Composite popup or selection widget → DropdownAccessibilitySpec
- Composite group of items with shared ARIA → RadioGroupAccessibilitySpec
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

## Phase 3: Write the spec

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

These are the canonical sections. Include them in this order. Drop a section only when there is genuinely nothing component-specific to say (e.g. Motion when the component has no animation — still keep the heading with a one-line "There is no motion on `<Component>`" so omission is visible and intentional).

1. **Intro (no heading)** — 1–2 short paragraphs. What the component is. What underlying element/role it produces. Crisply distinguish what comes from the browser/native element if used vs what Fluent layers on top.

2. **## Usage**

   - **### When to choose `<Component>`** — what scenarios it's for.
     - **#### `<Component>` vs. `<Alternative>`** — one subsection per close alternative. Identify alternatives by looking at sibling components in the same package and conceptually adjacent components (Button↔Link, Checkbox↔Switch↔Radio, Input↔Textarea↔SpinButton↔Combobox, etc.). Be concrete about what tips the decision.
     - **#### Usage restrictions** — If this is an interactive control, consider common misuses: "Do not use `<Button>` inside a Menu," "Do not use `<Component>` as a wrapper for arbitrary content," "Do not wrap `<Card>` in a link because that destroys all inner semantic structure," etc.
   - **### Implementing `<Component>`** — pick from the subsections below based on what applies:
     - **#### Label** (or split into "Programmatic label" + "Visual label" for form fields) — always include for any focusable control. Cite WCAG 3.3.2 for form fields. Show the `Field` path first for supported components, then `Label htmlFor` for form controls, then `aria-labelledby` / `aria-label`.
     - **#### Placeholder** — only for text-entry fields. Frame as "not a label substitute."
     - **#### Field integration** — only if `useFieldControlProps_unstable` is called. List which of `id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `required`, `size` are wired (read the call site — `supportsLabelFor`, `supportsRequired`, `supportsSize` opt-ins matter). Note explicitly which are **not** auto-wired (commonly `aria-invalid`).
     - **#### Disabled** — include for any interactive control. Explain `disabled` (native) vs `disabledFocusable` (aria-disabled, focusable). If only one is supported, say so and why. Mention `readonly` for editable fields. Note that disabled focusable content nested in slots is **not** auto-disabled by the parent.
     - **#### Validation** — only if the styles read `aria-invalid` or `Field` integration sets it. Mention the `useAnnounce` utility for non-error/warning validation states.
     - **#### Content restrictions** — only for components with `children` or slots that accept arbitrary content. List allowed and disallowed content types. Forbid nested interactives in slots that aren't designed for them. For components like Menu or Listbox that have strict semantic requirements, specifically call out that other interactive controls like Button, Switch, etc. are not allowed as children.
     - **#### Color contrast and appearance variants** — only if the component has appearance variants. List each variant's contrast requirement; flag deprecated variants.
     - **#### Target size** — only for pointer targets (buttons, switches, checkboxes). Cite WCAG 2.5.8 and the 24×24 minimum. Note whether defaults meet it.
     - **#### Anchor (`as="a"`)** — only if the component supports `as="a"` (uses `useARIAButtonProps`).
     - **#### Customizing `<Component>`** — include for any component whose slots or behavior can be meaningfully overridden (most v9 components qualify). Cover the customizations that look reasonable but break accessibility, and the safe alternatives. Pull from the actual slot/render structure — never invent restrictions the code doesn't imply. Typical content:
       - **Roles that can and cannot be overridden.** Identify the slots whose role is load-bearing for the component's pattern (the trigger of a disclosure, the option in a listbox, the gridcell in a grid, etc.) and also has similar roles that an author might mistakenly think to use. State plainly that swapping `role` to something similar on the surface silently breaks other internal semantics, the keyboard model, or the pattern AT recognizes. If the visual the consumer wants matches a different component, point them at it.
       - **Keyboard handling that must not be layered on.** If adding arrow-key navigation, type-ahead, or a roving tab stop across instances would conflict with the ARIA pattern the component implements, say so. Usually if an author wants a different keyboard pattern than the component implements, the right answer is usually either that they're mistaken about the correct keyboard model or should switch to a different component instead of retrofitting the current one.
       - **Adding extra interactive controls inside the component.** This is the most common request and the most error-prone. If interactive controls cannot live inside a particular slot (e.g. nested inside a `<button>`, inside a `treeitem`, inside an `option` role), spell out which slot is off-limits and why (HTML parsing rules, presentational children, AT not exposing them). Then offer the two safe patterns — pick whichever apply based on the render structure:
         1. **Wrap the component and place additional controls as siblings.** Group the component and the extra controls inside a wrapping `<div>` so the controls live outside the restricted slot but render visually adjacent to it. Each control then takes its own tab stop.
         2. **Recompose the relevant component and slots.** If the component's render places the restricted child (e.g. the `button` slot) inside a less restrictive root slot, point to the render file and explain that additional siblings of the restricted child — rendered inside the root but outside the restricted slot — are valid and remain independently focusable. Reference `renderX.tsx` with `file_path` so the reader can verify the slot order.

3. **## Semantics** — a `| Slot | Role | States and properties |` table mirroring the rendered DOM. Note `aria-hidden` on decorative elements. Note where focus actually lives if it's not the visible root.

4. **## Keyboard interaction** — a key→result table for keys the component or its native element handles. If activation/editing keys are entirely browser-native, say so. Note where the single tab stop sits, and where any additional focusable slot content lands in the tab order. State the disabled-tab-order behavior.

5. **## Windows contrast themes (high contrast mode)** — explicit forced-colors rules in the styles. If the component relies on the native element for HCM with only a small Fluent override (typical for form-field wrappers — usually `GrayText` for disabled border), say that. If the component has a custom visual (Checkbox/Radio/Switch indicator), enumerate the explicit rules in `@media (forced-colors: active)`.

6. **## Motion and animation** — `transitionProperty` / `transitionDuration` rules and whether they have a `prefers-reduced-motion` shortener. If none, say "There is no motion on `<Component>`." This section should always exist.

7. **## Known issues** — If there are code comments specifically documenting assistive tech or browser issues, document them here. Also include deprecated props that impact accessibility. Do not make up issues if none exist.

### Voice and style

- **Specific, not generic.** "The bottom border uses `colorNeutralStrokeAccessible` to meet 3:1 indicator contrast." Not "Make sure the border has enough contrast."
- **Source over speculation.** When the code says it, say it. When the code is silent, say the code is silent — don't invent behavior.
- **`file_path:line` references** for non-obvious claims, especially style rules that drive ARIA-coupled visuals (red border keying off rendered `aria-invalid`, `MIN_TARGET_SIZE` constants).
- **`<kbd>` for keys** (`<kbd>Tab</kbd>`, `<kbd>Shift</kbd> + <kbd>Tab</kbd>`). Match the existing specs' table formatting.
- **No emojis.** No "✅"/"❌" tables. No marketing voice.
- **Cross-link**, don't duplicate. If the component composes another already-spec'd component (MenuButton uses Button), defer the shared content with a single sentence and a Storybook docs link of the form `?path=/docs/concepts-developer-accessibility-components-<name>--docs`. The slug derives from the `<Meta title>` of the linked spec, not the filename.
- **WCAG citations** when the rule is normative: 3.3.2 (labels), 2.5.8 (target size), 1.4.11 (non-text contrast). Use the W3C URL form `https://w3c.github.io/wcag/understanding/<rule>.html`.
- **Field integration phrasing**: list each attribute as a bullet with a dash explanation. Match the existing specs verbatim where the behavior is identical.

### Edge cases

- **Composite components** (RadioGroup + Radio, or Menu + MenuTrigger + MenuItem): one combined spec is usually right. Cover the parent first, then each child slot's specifics.
- **Components that extend another component** (MenuButton extends Button, SplitButton composes Button + MenuButton): write a short spec that defers all shared behavior with a single link and only covers what's new. See MenuButtonAccessibilitySpec for the pattern.
- **Components with no interactive behavior** (Text, Divider, Card): the spec is mostly Semantics, Color contrast, and Known issues. Drop Keyboard, Field integration, Disabled. Still keep the Motion heading.
- **Components that have a story file demonstrating the a11y-relevant pattern**: link to it with the Storybook story slug `?path=/story/components-<component>--<story-id>`. Verify the slug by checking the story's `storyName` if it has one, otherwise the export name kebab-cased.

## Phase 4: Verify

Before reporting done:

1. **Read the file back.** Confirm the section order matches the canonical list and headings are consistent with the reference specs.
2. **Check claims against the code.** Each prop-level claim (defaults, ARIA mapping, opt-ins) should match the actual source.
3. **Check `file_path:line` references** are valid. The harness lets the user click them; broken refs are noise.
4. **Run a quick spell-pass.** Specs go in published docs.

Do **not** add the spec to any `index.stories.ts` registration — Storybook discovers `.mdx` files automatically via the project's globs. The `<Meta title>` is the source of truth for the docs path.

## Output

Report:

- Where the file was written
- Which reference spec you modelled it after
- Sections deliberately omitted (with a one-line reason each) so a reviewer can sanity-check
- Any source-code questions you couldn't answer from the code alone (so the user can fill them in)
