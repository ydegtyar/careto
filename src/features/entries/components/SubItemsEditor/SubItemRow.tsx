import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import type { EditableSubItem } from './SubItemsEditor';

interface Props {
  item: EditableSubItem;
  onUpdate: (id: string, field: 'name' | 'cost', value: string) => void;
  onRemove: (id: string) => void;
}

export function SubItemRow({ item, onUpdate, onRemove }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <TextField
        placeholder="Item / Service Name (e.g. Oil Filter)"
        value={item.name}
        onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        placeholder="Cost"
        type="number"
        value={item.cost}
        onChange={(e) => onUpdate(item.id, 'cost', e.target.value)}
        size="small"
        sx={{ width: 110 }}
      />
      <IconButton
        size="small"
        onClick={() => onRemove(item.id)}
        aria-label="remove sub-item"
        sx={{ color: 'error.main' }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
}
