import { useState } from "react";
import { TextField } from "../ui/TextField";
import { SelectField } from "../ui/SelectField";
import { Button } from "../ui/Button";
import type { UserRole } from "../../features/admin/types";

interface AdminUserSearchProps {
  searchQuery: string;
  roleFilter: UserRole | "all";
  onSearch: (query: string) => void;
  onRoleFilter: (role: UserRole | "all") => void;
  totalUsers: number;
  filteredUsers: number;
}

export function AdminUserSearch({
  searchQuery,
  roleFilter,
  onSearch,
  onRoleFilter,
  totalUsers,
  filteredUsers
}: AdminUserSearchProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    
    // Immediate search for better UX
    onSearch(value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as UserRole | "all";
    onRoleFilter(value);
  };

  const clearFilters = () => {
    setLocalSearchQuery("");
    onSearch("");
    onRoleFilter("all");
  };

  const hasActiveFilters = searchQuery !== "" || roleFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <TextField
            type="text"
            placeholder="Search by email or name..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
        </form>

        {/* Role Filter */}
        <div className="sm:w-48">
          <SelectField
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="w-full"
          >
            <option value="all">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="artist">Artists</option>
            <option value="admin">Admins</option>
          </SelectField>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="md"
            onClick={clearFilters}
            className="sm:w-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-ink-muted">
        <div>
          {hasActiveFilters ? (
            <span>
              Showing <strong>{filteredUsers}</strong> of <strong>{totalUsers}</strong> users
              {searchQuery && (
                <span> matching "<strong>{searchQuery}</strong>"</span>
              )}
              {roleFilter !== "all" && (
                <span> with role "<strong>{roleFilter}</strong>"</span>
              )}
            </span>
          ) : (
            <span>
              Showing all <strong>{totalUsers}</strong> users
            </span>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-mint-soft/50 text-xs rounded-full">
                Search: {searchQuery}
                <button
                  onClick={() => {
                    setLocalSearchQuery("");
                    onSearch("");
                  }}
                  className="text-ink-muted hover:text-ink"
                >
                  ×
                </button>
              </span>
            )}
            {roleFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-mint-soft/50 text-xs rounded-full">
                Role: {roleFilter}
                <button
                  onClick={() => onRoleFilter("all")}
                  className="text-ink-muted hover:text-ink"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <p className="text-xs uppercase tracking-[0.35em] text-ink-muted self-center">
          Quick Filters:
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRoleFilter("admin")}
          className={roleFilter === "admin" ? "bg-red-50 text-red-600" : ""}
        >
          Admins
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRoleFilter("artist")}
          className={roleFilter === "artist" ? "bg-blue-50 text-blue-600" : ""}
        >
          Artists
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRoleFilter("buyer")}
          className={roleFilter === "buyer" ? "bg-green-50 text-green-600" : ""}
        >
          Buyers
        </Button>
      </div>
    </div>
  );
}