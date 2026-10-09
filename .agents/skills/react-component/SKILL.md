---
name: react-component
description: Guidelines and patterns for writing React components, preferring arrow functions, named exports, and 'Props' for type names.
---

# React Component Conventions

When creating or refactoring React components in TypeScript/JavaScript, follow these conventions:

## Core Rules

1. **Arrow Component Functions**: Declare functional components using arrow functions (`const Component = (...) => { ... }`).
2. **Named Exports**: Use named exports (`export const Component = ...`) rather than default exports.
3. **Props Type Naming**: Name component prop types/interfaces simply `Props` (or `Props` scoped locally to the component file), avoiding verbose suffixes like `ComponentProps`.

## Example Pattern

```tsx
import React from 'react';

type Props = {
  title: string;
  subtitle?: string;
  onClick?: () => void;
};

export const Header = ({ title, subtitle, onClick }: Props) => {
  return (
    <header onClick={onClick}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
};
```

## Guidelines

- **Prop Types**: Keep the interface/type name as `Props` when defined in the component file.
- **Exports**: Prefer exporting component functions directly at declaration time: `export const MyComponent = ...`.
- **Children Prop**: Explicitly define `children?: React.ReactNode` in `Props` when the component accepts children.
