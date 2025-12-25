import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getMonthDays, getMonthName, formatDate, isToday, DayInfo } from '@/utils/date';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type CalendarProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  markedDates?: Set<string>;
};

export function Calendar({ selectedDate, onSelectDate, markedDates }: CalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const days = getMonthDays(currentYear, currentMonth);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayPress = (dayInfo: DayInfo) => {
    const dateString = formatDate(new Date(dayInfo.year, dayInfo.month, dayInfo.day));
    onSelectDate(dateString);
  };

  const renderDay = (dayInfo: DayInfo, index: number) => {
    const dateString = formatDate(new Date(dayInfo.year, dayInfo.month, dayInfo.day));
    const isSelected = selectedDate === dateString;
    const isTodayDate = isToday(dateString);
    const hasRecord = markedDates?.has(dateString);

    return (
      <TouchableOpacity
        key={`day-${index}`}
        className={`h-10 flex-1 items-center justify-center rounded-full ${
          isSelected ? 'bg-blue-500' : ''
        }`}
        onPress={() => handleDayPress(dayInfo)}>
        <Text
          className={`text-sm ${
            isSelected
              ? 'font-bold text-white'
              : !dayInfo.isCurrentMonth
                ? 'text-gray-300'
                : isTodayDate
                  ? 'font-bold text-blue-500'
                  : 'text-gray-800'
          }`}>
          {dayInfo.day}
        </Text>
        {hasRecord && !isSelected && dayInfo.isCurrentMonth && (
          <View className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500" />
        )}
      </TouchableOpacity>
    );
  };

  // 주 단위로 날짜 분할
  const weeks: DayInfo[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View className="bg-white px-4 pb-2">
      {/* 헤더: 년월 + 네비게이션 */}
      <View className="mb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={goToPrevMonth} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">
          {currentYear}년 {getMonthName(currentMonth)}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} className="p-2">
          <Ionicons name="chevron-forward" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View className="mb-2 flex-row">
        {WEEKDAYS.map((day, index) => (
          <View key={day} className="flex-1 items-center">
            <Text
              className={`text-xs font-medium ${
                index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-500'
              }`}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      {weeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} className="flex-row">
          {week.map((dayInfo, dayIndex) => renderDay(dayInfo, weekIndex * 7 + dayIndex))}
        </View>
      ))}
    </View>
  );
}
