import React from 'react';

interface DishCountInputProps {
  value: number;
  onChange: (value: number) => void;
}

export const DishCountInput: React.FC<DishCountInputProps> = ({ value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(event.target.value, 10);
    if (!isNaN(count)) {
      onChange(count);
    } else {
      onChange(1); // Default to 1 if input is invalid
    }
  };

  return (
    <div>
      <label htmlFor="dishCount" className="block text-sm font-medium text-textSecondary mb-1">
        Number of Servings
      </label>
      <input
        type="number"
        id="dishCount"
        name="dishCount"
        value={value}
        onChange={handleChange}
        min="1"
        className="w-full p-3 border border-borderLight rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
        placeholder="e.g., 2"
      />
    </div>
  );
};