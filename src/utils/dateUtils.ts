import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatTime = (time: string): string => {
  return time;
};

export const getWeekDay = (date: string | Date): number => {
  return dayjs(date).day();
};

export const getWeekDayName = (date: string | Date): string => {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekDays[getWeekDay(date)];
};

export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isWorkday = (date: string | Date): boolean => {
  const day = getWeekDay(date);
  return day >= 1 && day <= 5;
};

export const getDaysInMonth = (year: number, month: number): number => {
  return dayjs(`${year}-${month}-01`).daysInMonth();
};

export const getMonthDays = (year: number, month: number): string[] => {
  const daysInMonth = getDaysInMonth(year, month);
  const days: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(dayjs(`${year}-${month}-${i.toString().padStart(2, '0')}`).format('YYYY-MM-DD'));
  }
  return days;
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return dayjs(`${year}-${month}-01`).day();
};

export const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;
  
  const sortedDates = [...completedDates].sort((a, b) => 
    dayjs(b).valueOf() - dayjs(a).valueOf()
  );
  
  let streak = 0;
  let currentDate = dayjs();
  
  for (const date of sortedDates) {
    if (dayjs(date).isSame(currentDate, 'day')) {
      streak++;
      currentDate = currentDate.subtract(1, 'day');
    } else if (dayjs(date).isBefore(currentDate, 'day')) {
      break;
    }
  }
  
  return streak;
};

export const getTimeSlotLabel = (time: string): string => {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return '上午';
  if (hour < 14) return '中午';
  if (hour < 18) return '下午';
  return '晚上';
};
