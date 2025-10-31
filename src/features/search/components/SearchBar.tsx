import { useState, useEffect, type ChangeEvent } from 'react';
import { TextField } from '../../../components/ui/TextField';
import { Button } from '../../../components/ui/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  initialValue?: string;
}

export function SearchBar({ 
  onSearch, 
  placeholder = 'Search artworks, artists, or styles...', 
  debounceMs = 300,
  initialValue = '',
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="relative w-full  max-w-md">
      <div className="flex  gap-2">
        <div className="flex-1 ">
          <TextField
            type="search"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            className="w-full  h-fit p-0 border-0"
          />
        </div>
        {value && (
          <Button
            onClick={handleClear}
            variant="secondary"
            size="sm"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
