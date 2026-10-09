import type React from 'react';

export function LegendItemRow({
  cat,
  styles,
}: {
  cat: { name: string; color: string; value: number; percentage: number };
  styles: Record<string, React.CSSProperties>;
}) {
  return (
    <div style={styles.legendItem}>
      <span style={{ color: cat.color, fontSize: '0.78rem', fontWeight: 600 }}>● {cat.name}</span>
      <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>
        ${cat.value.toFixed(2)}{' '}
        <span style={{ color: '#a0b4c4', fontWeight: 400 }}>({cat.percentage}%)</span>
      </span>
    </div>
  );
}
