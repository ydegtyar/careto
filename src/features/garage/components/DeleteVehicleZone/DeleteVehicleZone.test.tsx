import { describe, expect, it, vi } from 'vitest';

vi.mock('@/data/client', () => ({
  data: {
    deleteVehicle: vi.fn(),
  },
}));

import { DeleteVehicleZone } from './DeleteVehicleZone';
import { styles } from './DeleteVehicleZone.styles';

describe('DeleteVehicleZone component and styles', () => {
  it('is exported as a function component', () => {
    expect(DeleteVehicleZone).toBeDefined();
    expect(typeof DeleteVehicleZone).toBe('function');
  });

  it('defines error styling tokens and borders', () => {
    expect(styles.card).toBeDefined();
    expect(styles.card.border).toContain('var(--mui-palette-error-main');
    expect(styles.headerTitle.color).toBe('error.main');
    expect(styles.dialogTitle.color).toBe('error.main');
  });
});
