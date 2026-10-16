import { describe, expect, it } from 'vitest';
import { MemberRow } from './MemberRow';
import { styles } from './MemberRow.styles';

describe('MemberRow component and styles', () => {
  it('is exported as a function component', () => {
    expect(MemberRow).toBeDefined();
    expect(typeof MemberRow).toBe('function');
  });

  it('defines light-theme-compatible tokens in styles', () => {
    expect(styles.container).toBeDefined();
    expect(styles.container.backgroundColor).toContain('var(--mui-palette-background-paper');
    expect(styles.container.border).toContain('var(--mui-palette-primary-main');
    expect(styles.memberName.color).toBe('text.primary');
    expect(styles.memberEmail.color).toBe('text.secondary');
    expect(styles.deleteButton.color).toBe('error.main');
  });
});
