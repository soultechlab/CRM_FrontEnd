import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { useCalendar } from '../../hooks/useCalendar';

export default function CalendarView() {
  const { currentDate, navigateMonth } = useCalendar();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={() => navigateMonth(-1)}
          onNextMonth={() => navigateMonth(1)}
        />
        <CalendarGrid currentDate={currentDate} />
      </div>
    </div>
  );
}