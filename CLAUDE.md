# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **Fluent UI** monorepo containing three distinct UI frameworks:

1. **React v9** (`@fluentui/react-components`) - Modern, actively developed, used by Microsoft 365
2. **React v8** (`@fluentui/react`) - Legacy Fluent library, no longer actively maintained
3. **Web Components** (`@fluentui/web-components`) - Framework-agnostic, used by Edge browser

The v9 architecture is the recommended approach for new development. The monorepo supports gradual migration from v8 to v9.

## Common Development Commands

### Building and Running

```bash
# Build a specific package (always use nx, not direct tooling)
yarn nx build @fluentui/react-button

# Build all affected packages since last commit
yarn nx affected --target=build

# Start Storybook (interactive component development)
yarn start

# Clean build artifacts
yarn clean

# Reset workspace (clean everything including node_modules)
yarn reset-workspace
```

### Testing

```bash
# Run unit tests for a package
yarn nx test @fluentui/react-button

# Run tests for all affected packages
yarn nx affected --target=test

# Run tests in watch mode (add --watch to package.json test script)
yarn nx test @fluentui/react-button --watch

# Run visual regression tests (requires build-storybook first)
yarn nx test-vr @fluentui/react-button

# Run SSR tests
yarn nx test-ssr @fluentui/react-button

# Run integration tests (tests against React 17 & 18)
yarn nx test-rit @fluentui/react-button
```

### Code Quality

```bash
# Lint a package
yarn nx lint @fluentui/react-button

# Type-check a package
yarn nx type-check @fluentui/react-button

# Format code
yarn format

# Check formatting without writing
yarn nx format --configuration=check
```

### Versioning and Releases

```bash
# Create a change file (required before merging PRs with code changes)
yarn change

# Check if change files are needed
yarn check:change
```

### Generators

```bash
# Create a new v9 component package
yarn create-package

# Create a new component within an existing package
yarn create-component
```

### NX Commands

```bash
# Run task for multiple packages
yarn nx run-many --target=build --projects=@fluentui/react-button,@fluentui/react-menu

# Show project dependency graph
yarn nx graph

# Run tasks in parallel (respects nx.json parallel setting)
yarn nx run-many --target=test --all --parallel=3
```

## Architecture

### Monorepo Structure

```
/packages/
  /react-components/          # v9 components (80+ packages)
    /react-button/
      /library/               # Component source code
        /src/
          /components/Button/
            Button.tsx        # Main component
            useButton.ts      # State hook
            useButtonStyles.styles.ts  # Griffel styles
            renderButton.tsx  # Render function
            Button.types.ts   # TypeScript definitions
            Button.test.tsx   # Unit tests
        package.json
        project.json          # NX configuration
      /stories/               # Storybook stories
    /react-menu/
    ... (80+ more components)
  /react/                     # v8 monolithic package
  /web-components/            # Web Components
  /tokens/                    # Design tokens
  /charts/                    # Chart components

/docs/
  /react-v9/contributing/     # Docs covering contributing to v9
  /react-v9/contributing/rfcs/  # Documentation of past architecture decisions for v9
  /react-wiki-archive/        # Legacy docs for v8, formerly in the github wiki


/apps/
  /public-docsite-v9/         # Documentation site (react.fluentui.dev)
  /vr-tests-react-components/ # Visual regression tests
  /ssr-tests-v9/              # SSR tests
  /perf-test-react-components/ # Performance tests

/scripts/                     # Build and utility scripts
/tools/workspace-plugin/      # Custom NX generators and executors
```

### React v9 Component Architecture Pattern

All v9 components follow a **3-part architecture** separating concerns:

#### 1. State Hook (`useComponent.ts`)

- Handles all component logic and state
- Processes props and applies defaults
- Defines component **slots** (composable sub-parts)
- Uses utilities from `@fluentui/react-utilities`:
  - `slot.always()` - Required slot
  - `slot.optional()` - Optional slot
- Returns state object with resolved slots

#### 2. Styling Hook (`useComponentStyles.styles.ts`)

- Uses **Griffel** for zero-runtime CSS-in-JS
- Key APIs:
  - `makeStyles()` - Create variant/state styles
  - `makeResetStyles()` - Create base styles
  - `mergeClasses()` - Combine classes (order matters!)
  - `shorthands` - CSS shorthand properties
- Token-based styling using `@fluentui/react-theme` tokens
- Mutates state object to add className properties

#### 3. Render Function (`renderComponent.tsx`)

- Must use custom JSX pragma: `/** @jsxImportSource @fluentui/react-jsx-runtime */`
- Renders slots conditionally
- Pattern: `<state.root>{state.icon && <state.icon />}</state.root>`
- Uses `assertSlots()` for type safety

#### Main Component

Orchestrates all three parts:

```typescript
export const Button: ForwardRefComponent<ButtonProps> = React.forwardRef((props, ref) => {
  const state = useButton_unstable(props, ref);
  useButtonStyles_unstable(state);
  return renderButton_unstable(state);
});
```

### Styling with Griffel

**Griffel** is the zero-runtime CSS-in-JS solution used by v9 components:

- Compiles to atomic CSS at build time
- Generates unique class names
- Automatically deduplicates styles
- Performance optimized

**Token System:**

- Design tokens from `@fluentui/tokens` provide semantic values
- Examples: `tokens.colorBrandBackground`, `tokens.fontSizeBase300`
- Enables theming by swapping token values via `FluentProvider`

**Important:** `mergeClasses()` order matters - later classes override earlier ones.

### Build System

- **NX** orchestrates all builds with intelligent caching and task graphs
- **SWC** compiles TypeScript (fast alternative to Babel)
- **Rollup** bundles for production
- **API Extractor** generates rolled-up `.d.ts` files
- **Jest** for unit tests (with `@testing-library/react`)
- **Storybook** for component documentation and development

### Package Outputs

Each v9 component package produces:

- `lib/` - ES modules
- `lib-commonjs/` - CommonJS modules
- `dist/*.d.ts` - Rolled-up TypeScript definitions

Packages use modern conditional exports for proper module resolution.

## Development Workflow

### Working on Components

1. **Always read existing code first** - Understand patterns before making changes
2. **Start Storybook** for interactive development: `yarn start`
3. **Run tests** after changes: `yarn nx test <package-name>`
4. **Verify accessibility** after changes: read a11y-specific docs, and test with the keyboard and assistive tech when applicable.
5. **Create change file** before PR: `yarn change`
6. **Type-check** to catch TypeScript issues: `yarn nx type-check <package-name>`

### Key Shared Packages (v9)

- `@fluentui/react-utilities` - Core utilities, slot helpers, hooks
- `@fluentui/react-theme` - Theme system and tokens
- `@fluentui/react-tabster` - Focus management (keyboard navigation)
- `@fluentui/react-jsx-runtime` - Custom JSX runtime for slots
- `@fluentui/react-positioning` - Positioning utilities (floating-ui wrapper)
- `@fluentui/react-shared-contexts` - Shared React contexts
- `@griffel/react` - Styling solution

### Testing Strategy

1. **Unit Tests** - Jest + React Testing Library

   - Test component behavior, not implementation
   - Use `@testing-library/react` queries
   - Avoid snapshots for v9 components
   - Include tests for keyboard behavior, `document.ariaNotify` calls if `announce()` is used, and dynamically applied ARIA attributes

2. **Conformance Tests** - `@fluentui/react-conformance-griffel`

   - Automatically validates components follow v9 patterns
   - Checks Griffel usage, API surface, exports

3. **Visual Regression** - Storywright + Playwright

   - Located in `/apps/vr-tests-react-components/`
   - Captures component screenshots across states

4. **Bundle Size** - Monosize

   - Tracks bundle size per component
   - Prevents bloat

5. **SSR Tests** - Validates server-side rendering

6. **Manual Accessibility tests** - Manual testing for new components or major changes
   - Copy this checklist into a new issue and go through each step: https://github.com/microsoft/fluentui/blob/master/docs/react-v9/contributing/accessibility-review-checklist.md

### Theming

Theming is token-based in v9:

```typescript
import { FluentProvider, webLightTheme, teamsDarkTheme } from '@fluentui/react-components';

// Wrap app with theme provider
<FluentProvider theme={webLightTheme}>
  <App />
</FluentProvider>

// Nest providers for theme overrides
<FluentProvider theme={customTheme}>
  <SomeComponent />
</FluentProvider>
```

Tokens are accessible in styles via `tokens.*` from `@fluentui/react-theme`.

### Composition via Slots

Components expose **slots** that can be fully customized:

```typescript
// Replace icon slot
<Button icon={<CustomIcon />} />

// Customize slot with props
<Menu trigger={<Button appearance="primary">Open</Button>} />
```

Slots enable flexible composition without prop drilling.

## Important Notes

### NX-First Approach

- **Always use NX commands** (`yarn nx <target> <project>`) instead of running tools directly
- NX handles dependency graphs, caching, and parallelization
- Refer to AGENTS.md for NX MCP server tools available

### Code Organization

- v9 components are split into focused packages (one component per package)
- Each component has `/library/` (source) and `/stories/` (Storybook) directories
- Follow existing patterns - consistency is critical in this monorepo

### Beachball Versioning

- All code changes require a **change file** via `yarn change`
- Change files are processed during release to generate changelogs
- Package versions follow semantic versioning
- v9 packages disallow major version changes (maintaining 9.x)

### Migration

- v8 and v9 can coexist in the same application
- Migration utilities in `/packages/react-components/react-migration-v8-v9/`
- Codemods available in `/packages/codemods/`

### Node Version

- Required: Node.js ^22.0.0 || ^24.0.0 (see package.json engines)

### Performance Considerations

- Griffel generates atomic CSS (minimal runtime overhead)
- Tree-shakeable exports enable optimal bundle sizes
- Components designed for maximum performance

## Additional Resources

- **v9 Docs**: https://react.fluentui.dev/
- **v8 Docs**: https://developer.microsoft.com/fluentui
- **Web Components**: https://aka.ms/fluentui-web-components
- **Fluent UI Insights** (video series): https://docs.microsoft.com/shows/fluent-ui-insights
- **Accessibility patterns**: https://storybooks.fluentui.dev/react/?path=/docs/concepts-developer-accessibility-components-overview--docs, https://storybooks.fluentui.dev/react/?path=/docs/concepts-developer-accessibility-debugging-notifications--docs, https://storybooks.fluentui.dev/react/?path=/docs/concepts-developer-accessibility-component-labelling--docs, https://storybooks.fluentui.dev/react/?path=/docs/concepts-developer-accessibility-truncation--docs, https://github.com/microsoft/fluentui/blob/master/docs/react-v9/contributing/accessibility-review-checklist.md, https://github.com/microsoft/fluentui/blob/master/docs/react-v9/contributing/accessibility-troubleshooting.md

## Common Patterns to Follow

### When Creating New Components

1. Follow the 3-part architecture (state hook, styling hook, render function)
2. Use Griffel for all styling
3. Use tokens from `@fluentui/react-theme` (never hardcode colors/spacing)
4. Support slots for composition
5. Add conformance tests
6. Create a new issue for manual accessibility tests, and copy over the content in https://github.com/microsoft/fluentui/blob/master/docs/react-v9/contributing/accessibility-review-checklist.md
7. Export all public types
8. Write Storybook stories demonstrating all variants/states
9. Follow controlled/uncontrolled patterns for interactive components

### When Modifying Components

1. Read existing code to understand patterns
2. Maintain consistency with sibling components
3. Preserve backward compatibility (no breaking changes in 9.x)
4. Update tests and stories
5. Add accessibility tests for the changes, if they add interactive controls, click events, hover events, keyboard events, change color, high contrast, or focus styles, change roles, ARIA attributes, element tagNames, or ids
6. Run conformance tests to validate patterns
7. Create change file documenting the change

### Code Style

- Use TypeScript strict mode
- Prefer named exports over default exports
- Use functional components with hooks (no class components in v9)
- Follow existing naming conventions (`use*` for hooks, `render*` for render functions)
- Add JSDoc comments for public APIs
