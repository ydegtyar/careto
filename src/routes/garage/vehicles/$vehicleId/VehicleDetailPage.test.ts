import { describe, expect, it } from 'vitest';
import { styles } from './VehicleDetailPage.styles';

describe('VehicleDetailPage styles', () => {
  it('defines container and layout styles', () => {
    expect(styles.container).toBeDefined();
    expect(styles.container.maxWidth).toBe(720);
    expect(styles.loadingContainer.height).toBe('60vh');
  });

  it('uses light-theme compatible color tokens for back button and edit button', () => {
    expect(styles.backButton.border).toContain('var(--mui-palette-primary-main');
    expect(styles.backButton.backgroundColor).toContain('var(--mui-palette-background-paper');
    expect(styles.editButton.backgroundColor).toContain('var(--mui-palette-background-paper');
    expect(styles.editButton.border).toContain('var(--mui-palette-primary-main');
  });
});
