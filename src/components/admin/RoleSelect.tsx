import { SelectField } from "../ui/SelectField";
import type { UserRole } from "../../features/admin/types";

interface RoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'Can purchase artworks and view certificates'
  },
  {
    value: 'artist',
    label: 'Artist',
    description: 'Can create and sell artworks'
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full platform access and management'
  }
];

export function RoleSelect({ value, onChange, disabled = false }: RoleSelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value as UserRole;
    if (newRole !== value) {
      onChange(newRole);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 font-medium';
      case 'artist':
        return 'text-blue-600 font-medium';
      case 'buyer':
        return 'text-green-600 font-medium';
      default:
        return 'text-ink';
    }
  };

  return (
    <SelectField
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`text-xs ${getRoleColor(value)} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {roleOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  );
}