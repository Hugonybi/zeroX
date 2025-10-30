import type { Artwork } from '../../../types/artwork';
import { Button } from '../../../components/ui/Button';

interface QuantitySelectorProps {
  artwork: Artwork;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
}

export function QuantitySelector({
  artwork,
  quantity,
  onQuantityChange,
  disabled = false,
}: QuantitySelectorProps) {
  const maxQuantity = artwork.availableQuantity || 1;
  const isUnique = artwork.isUnique ?? true;

  // If artwork is unique, don't show quantity selector
  if (isUnique || maxQuantity === 1) {
    return (
      <div className="text-sm text-gray-600">
        {isUnique ? 'Unique Piece' : 'Only 1 available'}
      </div>
    );
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Quantity</label>
      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-md">
          <Button
            onClick={handleDecrease}
            disabled={disabled || quantity <= 1}
            variant="ghost"
            size="sm"
            className="px-3 py-2"
          >
            -
          </Button>
          <input
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-16 text-center border-x py-2 focus:outline-none"
          />
          <Button
            onClick={handleIncrease}
            disabled={disabled || quantity >= maxQuantity}
            variant="ghost"
            size="sm"
            className="px-3 py-2"
          >
            +
          </Button>
        </div>
        <span className="text-sm text-gray-500">
          {maxQuantity} available
        </span>
      </div>
    </div>
  );
}
