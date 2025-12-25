export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export type DayInfo = {
  day: number;
  isCurrentMonth: boolean;
  year: number;
  month: number;
};

export const getMonthDays = (year: number, month: number): DayInfo[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days: DayInfo[] = [];

  // 이전 달의 날짜들
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      year: prevYear,
      month: prevMonth,
    });
  }

  // 현재 달의 날짜들
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      year,
      month,
    });
  }

  // 필요한 주 수 계산 (5주 또는 6주)
  const totalDaysNeeded = days.length <= 35 ? 35 : 42;
  const remainingDays = totalDaysNeeded - days.length;

  // 다음 달의 날짜들
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      year: nextYear,
      month: nextMonth,
    });
  }

  return days;
};

export const getMonthName = (month: number): string => {
  const months = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];
  return months[month];
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const isToday = (dateString: string): boolean => {
  return dateString === formatDate(new Date());
};

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export const formatDateKorean = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = WEEKDAY_NAMES[date.getDay()];
  return `${year}년 ${month}월 ${day}일(${weekday})`;
};
