import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ColorPickerProps {
  label: string;
  colorKey: keyof Theme['colors'];
}

export default function ColorPicker({ label, colorKey }: ColorPickerProps) {
  const { theme, updateTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTheme({
      colors: {
        ...theme.colors,
        [colorKey]: e.target.value
      }
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={theme.colors[colorKey]}
          onChange={handleChange}
          className="h-8 w-8 rounded cursor-pointer"
        />
        <input
          type="text"
          value={theme.colors[colorKey]}
          onChange={handleChange}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}