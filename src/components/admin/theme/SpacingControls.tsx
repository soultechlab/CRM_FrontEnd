import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SpacingControls() {
  const { theme, updateTheme } = useTheme();

  const handleSpacingChange = (key: keyof Theme['spacing'], value: string) => {
    updateTheme({
      spacing: {
        ...theme.spacing,
        [key]: value
      }
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Espaçamento</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(theme.spacing).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleSpacingChange(key as keyof Theme['spacing'], e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}