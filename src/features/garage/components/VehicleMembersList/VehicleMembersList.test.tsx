import { describe, expect, it } from 'vitest';
import { VehicleMembersList } from './VehicleMembersList';
import { styles } from './VehicleMembersList.styles';

describe('VehicleMembersList component and styles', () => {
  it('is exported as a function component', () => {
    expect(VehicleMembersList).toBeDefined();
    expect(typeof VehicleMembersList).toBe('function');
  });

  it('defines light-theme-compatible tokens in styles', () => {
    expect(styles.skeletonContainer).toBeDefined();
    expect(styles.skeletonContainer.backgroundColor).toContain(
      'var(--mui-palette-background-paper',
    );
    expect(styles.skeletonContainer.border).toContain('var(--mui-palette-primary-main');
    expect(styles.headerTitle.fontWeight).toBe(700);
  });
});
