import { useState } from 'react';
import type { SearchFilters } from '../types';
import { Button } from '../../../components/ui/Button';
import { SelectField } from '../../../components/ui/SelectField';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onReset?: () => void;
}

export function FilterPanel({ filters, onFiltersChange, onReset }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const defaultFilters: SearchFilters = {
      priceRange: [0, 1000000],
      artworkType: 'all',
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    onReset?.();
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button onClick={handleReset} variant="ghost" size="sm">
          Reset
        </Button>
      </div>

      {/* Artwork Type Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Artwork Type</label>
        <SelectField
          value={localFilters.artworkType}
          onChange={(e) =>
            setLocalFilters({
              ...localFilters,
              artworkType: e.target.value as 'all' | 'physical' | 'digital',
            })
          }
        >
          <option value="all">All Types</option>
          <option value="physical">Physical</option>
          <option value="digital">Digital</option>
        </SelectField>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Price Range</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.priceRange[0] / 100}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                priceRange: [Number(e.target.value) * 100, localFilters.priceRange[1]],
              })
            }
            className="w-full px-3 py-2 border rounded-md min-h-11 text-base"
            inputMode="numeric"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.priceRange[1] / 100}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                priceRange: [localFilters.priceRange[0], Number(e.target.value) * 100],
              })
            }
            className="w-full px-3 py-2 border rounded-md min-h-11 text-base"
            inputMode="numeric"
          />
        </div>
        <p className="text-xs text-gray-500">
          ${(localFilters.priceRange[0] / 100).toFixed(2)} - $
          {(localFilters.priceRange[1] / 100).toFixed(2)}
        </p>
      </div>

      <Button onClick={handleApply} className="w-full min-h-11" variant="primary">
        Apply Filters
      </Button>
    </div>
  );
}
