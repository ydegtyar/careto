import { describe, expect, it } from 'vitest';
import { VehicleInviteSection } from './VehicleInviteSection';
import { styles } from './VehicleInviteSection.styles';

describe('VehicleInviteSection component and styles', () => {
  it('is exported as a function component', () => {
    expect(VehicleInviteSection).toBeDefined();
    expect(typeof VehicleInviteSection).toBe('function');
  });

  it('defines style tokens properly', () => {
    expect(styles.card).toBeDefined();
    expect(styles.headerTitle.fontWeight).toBe(700);
    expect(styles.submitButton.background).toContain('linear-gradient');
    expect(styles.inviteLinkContainer.borderRadius).toBe(8);
  });
});
