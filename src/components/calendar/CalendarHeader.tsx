import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarHeader({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <button 
        className="p-2 hover:bg-gray-100 rounded-full"
        onClick={onPrevMonth}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h2 className="text-lg font-semibold">
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <button 
        className="p-2 hover:bg-gray-100 rounded-full"
        onClick={onNextMonth}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}