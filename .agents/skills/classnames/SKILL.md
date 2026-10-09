---
name: classnames
description: Utility skill that provides a concise wrapper around the `classnames` npm library for constructing CSS class name strings.
---

# Overview
This skill provides guidance and usage patterns for the **classnames** package for constructing CSS class name strings directly.

```ts
import classNames from 'classnames';

const btnClass = classNames('btn', { active: isActive }, extraClass);
```

# Features
- Accepts strings, objects, arrays, and conditional expressions.
- Falsy values are ignored automatically.
- Fully typed with TypeScript.

# Installation
Ensure the `classnames` package is installed:
```sh
npm install classnames
```

# Usage
```tsx
import classNames from 'classnames';

function Button({ isActive, extra }: { isActive: boolean; extra?: string }) {
  return <button className={classNames('btn', { active: isActive }, extra)} />;
}
```

# Implementation Details
Import `classNames` directly from `'classnames'`.

