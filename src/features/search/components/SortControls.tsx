import type { ChangeEvent } from 'react';
import { SelectField } from '../../../components/ui/SelectField';
import { SORT_OPTION_LABELS, SORT_OPTIONS, isSortOption, type SortOption } from '../types';

interface SortControlsProps {
  value: SortOption;
  onChange: (sortBy: SortOption) => void;
}

export function SortControls({ value, onChange }: SortControlsProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value: selectedValue } = event.target;

    if (isSortOption(selectedValue)) {
      onChange(selectedValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium whitespace-nowrap">
        Sort by:
      </label>
      <SelectField
        id="sort"
        value={value}
        onChange={handleChange}
        className="min-w-[150px]"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_OPTION_LABELS[option]}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
