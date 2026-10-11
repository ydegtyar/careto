import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { styles } from './glacier.styles';

export interface DonutItem {
  name: string;
  value: number;
  color: string;
  sharePercent?: number;
  subLabel?: string;
}

export interface DonutCardProps {
  title: string;
  centerText: string;
  centerSubText?: string;
  items: DonutItem[];
  footer?: React.ReactNode;
}

export function DonutCard({ title, centerText, centerSubText, items, footer }: DonutCardProps) {
  const chartData = items.map((item) => ({
    name: item.name,
    value: item.value,
  }));

  return (
    <div style={styles.glassCard}>
      <div style={styles.headerRow}>
        <h4 style={styles.title}>{title}</h4>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={52}
              outerRadius={68}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {items.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            {centerText}
          </span>
          {centerSubText && (
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              {centerSubText}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
              <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{item.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {item.subLabel && <span style={{ color: '#94a3b8' }}>{item.subLabel}</span>}
              {item.sharePercent !== undefined && (
                <span style={{ color: '#7dd3fc', fontWeight: 600 }}>{item.sharePercent}%</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {footer && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '14px', paddingTop: '10px' }}>
          {footer}
        </div>
      )}
    </div>
  );
}
