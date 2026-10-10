---
name: format-amount
description: Guidelines and instructions for formatting currency amounts using the formatAmount utility function with direct import in Careto.
---

# Overview
This skill provides guidance for formatting currency minor units into human-readable strings using the shared `formatAmount` utility function.

# Implementation
Import `formatAmount` directly from `@/shared/lib/currencies`:

```ts
import { formatAmount } from '@/shared/lib/currencies';
```

# Function Signature & Usage

```ts
export interface FormattableAmount {
  amount_minor?: number | null;
  currency?: string | null;
}

export function formatAmount(entry: FormattableAmount): string;
```

### Example

```tsx
import Typography from '@mui/material/Typography';
import { formatAmount } from '@/shared/lib/currencies';

function ExpenseItem({ entry }: { entry: { amount_minor?: number; currency?: string } }) {
  return (
    <Typography variant="body2">
      {formatAmount(entry)}
    </Typography>
  );
}
```

# Guidelines
1. **Direct Import**: Always import `formatAmount` directly from `@/shared/lib/currencies` rather than passing it down via component props.
2. **Null Safety**: The function handles `undefined` or `null` `amount_minor` and `currency` safely, returning an empty string `''` when invalid.
3. **Minor Units**: `amount_minor` expects integer minor units (e.g., cents, where `1000` = `10.00`).
