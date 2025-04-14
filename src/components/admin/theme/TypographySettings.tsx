import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function TypographySettings() {
  const { theme, updateTheme } = useTheme();

  const handleFontFamilyChange = (value: string) => {
    updateTheme({
      typography: {
        ...theme.typography,
        fontFamily: value
      }
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Tipografia</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Família da Fonte
          </label>
          <select
            value={theme.typography.fontFamily}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="Inter, system-ui, sans-serif">Inter</option>
            <option value="Roboto, system-ui, sans-serif">Roboto</option>
            <option value="Open Sans, system-ui, sans-serif">Open Sans</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(theme.typography.fontSize).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => updateTheme({
                  typography: {
                    ...theme.typography,
                    fontSize: {
                      ...theme.typography.fontSize,
                      [key]: e.target.value
                    }
                  }
                })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}