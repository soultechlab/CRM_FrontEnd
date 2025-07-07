import { useState } from 'react';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateMonth = (delta: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
  };

  return {
    currentDate,
    navigateMonth
  };
}