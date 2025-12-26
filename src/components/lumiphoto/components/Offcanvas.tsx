import React from 'react';
import { X } from 'lucide-react';

interface OffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Offcanvas({ isOpen, onClose, children, title, size = 'lg' }: OffcanvasProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-2xl lg:max-w-4xl',
    xl: 'w-full max-w-3xl lg:max-w-5xl xl:max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 flex">
        <div className={`relative ${sizeClasses[size]} transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className="flex h-full flex-col bg-white shadow-xl overflow-hidden">
            {title && (
              <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
                <button
                  onClick={onClose}
                  className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100 flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto bg-white">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}