import React from 'react';
import CalendarDay from './CalendarDay';
import { getDaysInMonth } from '../../utils/dateUtils';

interface CalendarGridProps {
  currentDate: Date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ currentDate }: CalendarGridProps) {
  const days = getDaysInMonth(currentDate);

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {WEEKDAYS.map((day) => (
        <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
          {day}
        </div>
      ))}
      {days.map((date, index) => (
        <CalendarDay key={index} date={date} />
      ))}
    </div>
  );
}