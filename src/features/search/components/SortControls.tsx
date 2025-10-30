import { SelectField } from '../../../components/ui/SelectField';

interface SortControlsProps {
  value: string;
  onChange: (sortBy: string) => void;
}

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium whitespace-nowrap">
        Sort by:
      </label>
      <SelectField
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[150px]"
      >
        <option value="date_desc">Newest First</option>
        <option value="date_asc">Oldest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="title_asc">Title: A-Z</option>
      </SelectField>
    </div>
  );
}
