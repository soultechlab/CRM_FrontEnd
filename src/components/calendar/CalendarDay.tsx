import React from 'react';

interface CalendarDayProps {
  date: Date;
}

export default function CalendarDay({ date }: CalendarDayProps) {
  return (
    <div className="bg-white p-2 h-32 border-t border-l hover:bg-gray-50 cursor-pointer">
      <span className="text-sm">{date.getDate()}</span>
    </div>
  );
}