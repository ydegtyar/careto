import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import type { EditableSubItem } from './SubItemsEditor';

interface Props {
  item: EditableSubItem;
  options: string[];
  onUpdate: (id: string, field: 'name' | 'cost', value: string) => void;
  onRemove: (id: string) => void;
}

const filter = createFilterOptions<string>();

export function SubItemRow({ item, options, onUpdate, onRemove }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Autocomplete
        freeSolo
        options={options}
        value={item.name}
        onChange={(_event, newValue) => {
          onUpdate(item.id, 'name', newValue || '');
        }}
        onInputChange={(_event, newInputValue) => {
          onUpdate(item.id, 'name', newInputValue);
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          const { inputValue } = params;
          const isExisting = options.some(
            (option) => inputValue.toLowerCase() === option.toLowerCase(),
          );
          if (inputValue !== '' && !isExisting) {
            filtered.push(`Add "${inputValue}"`);
          }
          return filtered;
        }}
        renderOption={(props, option) => {
          const isAddOption = option.startsWith('Add "') && option.endsWith('"');
          return (
            <li {...props} key={props.id || option}>
              {isAddOption ? (
                <span style={{ fontStyle: 'italic', fontWeight: 600 }}>{option}</span>
              ) : (
                option
              )}
            </li>
          );
        }}
        fullWidth
        size="small"
        renderInput={(params) => (
          <TextField {...params} placeholder="Item / Service Name (e.g. Oil Filter)" />
        )}
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
