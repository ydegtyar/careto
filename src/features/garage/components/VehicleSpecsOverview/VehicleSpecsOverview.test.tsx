import { describe, expect, it } from 'vitest';
import { CopyableStatCard } from './CopyableStatCard';
import { statStyles } from './CopyableStatCard.styles';
import { CopyButton } from './CopyButton';
import { VehicleSpecsOverview } from './VehicleSpecsOverview';
import { styles } from './VehicleSpecsOverview.styles';

describe('VehicleSpecsOverview and copy components', () => {
  it('exports components as functions', () => {
    expect(VehicleSpecsOverview).toBeDefined();
    expect(typeof VehicleSpecsOverview).toBe('function');
    expect(CopyButton).toBeDefined();
    expect(typeof CopyButton).toBe('function');
    expect(CopyableStatCard).toBeDefined();
    expect(typeof CopyableStatCard).toBe('function');
  });

  it('defines innerCard, grid, and stat typography in VehicleSpecsOverview styles', () => {
    expect(styles.innerCard).toBeDefined();
    expect(styles.grid).toBeDefined();
    expect(styles.header.borderBottom).toContain('var(--mui-palette-primary-main');
    expect(styles.innerCard.backgroundColor).toContain('var(--mui-palette-background-paper');
  });

  it('defines label and value tokens in CopyableStatCard styles', () => {
    expect(statStyles.label.textTransform).toBe('uppercase');
    expect(statStyles.value.fontWeight).toBe(700);
    expect(statStyles.monospaceValue.fontFamily).toBe('monospace');
  });
});
