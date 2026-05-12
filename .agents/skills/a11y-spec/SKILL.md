---
name: a11y-spec
description: Generate a Fluent v9 component accessibility spec (`<Component>AccessibilitySpec.mdx`) from the component's source. Reads types, hook, render, and styles to produce a spec that follows the repo's established section structure.
argument-hint: <ComponentName>
allowed-tools: Read Write Bash Grep Glob
---

# Generate a Component Accessibility Spec

Generate `<Component>AccessibilitySpec.mdx` for the component **$ARGUMENTS**, matching the section structure and voice of the existing specs in this repo.

The output is a single MDX file placed under the component's `stories/src/<Component>/` directory. It documents accessibility-relevant behavior: labelling, keyboard, semantics, forced colors, motion, and known issues — sourced from the component's actual code, not from generic patterns.

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

Read the four core files and pull out:

| Source                                                                                     | Spec section(s) it feeds                                                                                                                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.types.ts` — props                                                                        | Usage → Implementing (each notable prop), variant lists for contrast section                                                                      |
| `.types.ts` — slots                                                                        | Semantics table, Content restrictions, render order                                                                                               |
| `use<Component>.ts`                                                                        | Field integration (`useFieldControlProps_unstable` + which `supportsX` flags), default props, ARIA forced to boolean, generated ids, ref handling |
| `render<Component>.tsx`                                                                    | Semantics (DOM order), Keyboard (tab order between slots)                                                                                         |
| `.styles.ts` — `:focus-within`/`createFocusOutlineStyle`/`createCustomFocusIndicatorStyle` | Focus indicator section / Semantics                                                                                                               |
| `.styles.ts` — `@media (forced-colors: active)`                                            | Windows contrast themes (what's explicit vs inherited)                                                                                            |
| `.styles.ts` — `prefers-reduced-motion` / `transitionDuration` / `animation`               | Motion and animation                                                                                                                              |
| `.styles.ts` — disabled, invalid, hover, active                                            | Disabled section + Validation                                                                                                                     |

If a section's source is **silent** (no explicit rules, no relevant props), say so plainly: "There is no animation on `<Component>`," "Relies entirely on the native element's forced-colors behavior." Do not invent content.

If the spec references behavior whose source isn't obvious from the code (animation timing, special key handling, label-id wiring), link to the source with the `file_path:line` convention so a future reader can verify.

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
   - **### Placing `<Component>` within an arrow-navigation region like Toolbar or Menu** — include when the component consumes arrow keys, Enter, Space, or other keys that conflict with `Toolbar`/`Menu`/`Listbox`/`Tree` navigation. Spell out the conflict; for components that already have a `Toolbar`-specific sibling (e.g. `ToolbarRadioButton`), point to it.

3. **## Semantics** — a `| Slot | Role | States and properties |` table mirroring the rendered DOM. Note `aria-hidden` on decorative elements. Note where focus actually lives if it's not the visible root.

4. **## Keyboard interaction** — a key→result table for keys the component or its native element handles. If activation/editing keys are entirely browser-native, say so. Note where the single tab stop sits, and where any additional focusable slot content lands in the tab order. State the disabled-tab-order behavior.

5. **## Windows contrast themes (high contrast mode)** — explicit forced-colors rules in the styles. If the component relies on the native element for HCM with only a small Fluent override (typical for form-field wrappers — usually `GrayText` for disabled border), say that. If the component has a custom visual (Checkbox/Radio/Switch indicator), enumerate the explicit rules in `@media (forced-colors: active)`.

6. **## Motion and animation** — `transitionProperty` / `transitionDuration` rules and whether they have a `prefers-reduced-motion` shortener. If none, say "There is no motion on `<Component>`." This section should always exist.

7. **## Known issues** — concrete gotchas. Examples: ARIA spec violations the component accepts in practice, browser/AT inconsistencies the consumer can't fix, surprising no-op behaviors (e.g. clicking the wrapper outside the input doesn't focus the input), deprecated props that emit console warnings.

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
