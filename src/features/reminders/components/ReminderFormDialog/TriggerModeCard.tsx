import type React from 'react';
import type { ReminderModeType } from '@/data/client/types';
import {
  getTriggerModeCardStyle,
  getTriggerModeTitleStyle,
  styles,
} from './TriggerModeCard.styles';

export interface TriggerModeItem {
  id: ReminderModeType;
  title: string;
  desc: string;
  icon?: string;
  recommended?: boolean;
}

export interface Props {
  item: TriggerModeItem;
  isSelected: boolean;
  onSelect: (mode: ReminderModeType) => void;
}

export const TriggerModeCard: React.FC<Props> = ({ item, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      style={getTriggerModeCardStyle(isSelected)}
    >
      <div style={styles.header}>
        <span style={getTriggerModeTitleStyle(isSelected)}>{item.title}</span>
        {item.recommended && <span style={styles.recommendedBadge}>Rec</span>}
      </div>
      <span style={styles.description}>{item.desc}</span>
    </button>
  );
};

export default TriggerModeCard;
