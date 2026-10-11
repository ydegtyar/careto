import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useMemo } from 'react';
import type { VehiclePowertrain } from '@/data/client/types';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { getPredefinedSubItems } from '../../data/predefinedSubItems';
import { SubItemRow } from './SubItemRow';

export interface EditableSubItem {
  id: string;
  name: string;
  cost: string;
  partNumber?: string;
}

interface Props {
  subItems: EditableSubItem[];
  onChange: (items: EditableSubItem[]) => void;
  onAutoSum: (totalCost: number) => void;
  powertrain?: VehiclePowertrain | string;
  totalAmount?: string;
}

export const SubItemsEditor: React.FC<Props> = ({
  subItems,
  onChange,
  onAutoSum,
  powertrain,
  totalAmount,
}) => {
  const predefinedOptions = useMemo(() => {
    return getPredefinedSubItems(powertrain).map((item) => item.name);
  }, [powertrain]);

  const handleAddItem = () => {
    const newItem: EditableSubItem = {
      id: crypto.randomUUID(),
      name: '',
      cost: '',
    };
    onChange([...subItems, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof EditableSubItem, value: string) => {
    const updated = subItems.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    onChange(updated);
  };

  const handleRemoveItem = (id: string) => {
    onChange(subItems.filter((item) => item.id !== id));
  };

  const calculatedTotal = subItems.reduce((acc, item) => {
    const val = parseFloat(item.cost);
    return acc + (Number.isNaN(val) ? 0 : val);
  }, 0);

  const parsedTotal = totalAmount ? parseFloat(totalAmount) : NaN;
  const hasValidTotal = !Number.isNaN(parsedTotal) && parsedTotal > 0;

  // Calculate remainder for the last item if total is entered
  const lastItemRemainder = useMemo(() => {
    if (!hasValidTotal || subItems.length === 0) return null;
    const allExceptLastSum = subItems.slice(0, -1).reduce((acc, item) => {
      const val = parseFloat(item.cost);
      return acc + (Number.isNaN(val) ? 0 : val);
    }, 0);
    const diff = parsedTotal - allExceptLastSum;
    return diff > 0 ? Number(diff.toFixed(2)) : 0;
  }, [hasValidTotal, parsedTotal, subItems]);

  const handleCalculateLastItem = () => {
    if (lastItemRemainder === null || subItems.length === 0) return;
    const lastIndex = subItems.length - 1;
    const updated = subItems.map((item, index) =>
      index === lastIndex ? { ...item, cost: lastItemRemainder.toFixed(2) } : item,
    );
    onChange(updated);
  };

  const lastItem = subItems.length > 0 ? subItems[subItems.length - 1] : undefined;
  const lastItemCostNum = lastItem ? parseFloat(lastItem.cost) : NaN;
  const canCalculateLastItem =
    hasValidTotal &&
    Boolean(lastItem) &&
    lastItemRemainder !== null &&
    (Number.isNaN(lastItemCostNum) || Math.abs(lastItemCostNum - lastItemRemainder) > 0.009);

  return (
    <GlassCard style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'text.secondary',
            fontWeight: 700,
          }}
        >
          Itemized Service Breakdown
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {canCalculateLastItem && (
            <Button
              size="small"
              onClick={handleCalculateLastItem}
              sx={{
                fontSize: '0.75rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 1.5,
                py: 0.25,
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: 'primary.main',
                fontWeight: 600,
              }}
            >
              Fill Last Item ({lastItemRemainder.toFixed(2)})
            </Button>
          )}
          {calculatedTotal > 0 && (
            <Button
              size="small"
              onClick={() => onAutoSum(calculatedTotal)}
              sx={{
                fontSize: '0.75rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 1.5,
                py: 0.25,
                backgroundColor: 'rgba(125, 211, 252, 0.15)',
                color: 'primary.main',
                fontWeight: 600,
              }}
            >
              Apply Sum ({calculatedTotal.toFixed(2)})
            </Button>
          )}
        </div>
      </div>

      {subItems.length === 0 ? (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          No itemized costs added yet. Break down oil change, filters, labor, etc.
        </Typography>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {subItems.map((item) => (
            <SubItemRow
              key={item.id}
              item={item}
              options={predefinedOptions}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAddItem}
        sx={{
          borderRadius: 2.5,
          mt: 0.5,
          textTransform: 'none',
          borderColor: 'rgba(125, 211, 252, 0.25)',
          color: 'primary.main',
          fontWeight: 600,
          alignSelf: 'flex-start',
        }}
      >
        Add Sub-service Item
      </Button>
    </GlassCard>
  );
};
