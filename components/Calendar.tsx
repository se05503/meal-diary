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

    // 다른 달 날짜를 누르면 해당 월로 이동
    if (!dayInfo.isCurrentMonth) {
      setCurrentYear(dayInfo.year);
      setCurrentMonth(dayInfo.month);
    }
  };

  const renderDay = (dayInfo: DayInfo, index: number) => {
    const dateString = formatDate(new Date(dayInfo.year, dayInfo.month, dayInfo.day));
    const isSelected = selectedDate === dateString;
    const isTodayDate = isToday(dateString);
    const hasRecord = markedDates?.has(dateString);

    return (
      <View key={`day-${index}`} className="flex-1 items-center justify-center">
        <TouchableOpacity
          className={`h-11 w-11 items-center justify-center rounded-lg ${
            isSelected ? 'bg-gray-800' : ''
          }`}
          onPress={() => handleDayPress(dayInfo)}>
        <Text
          className={`text-base ${
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
            <View className="absolute bottom-1.5 h-1 w-1 rounded-full bg-blue-500" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // 주 단위로 날짜 분할
  const weeks: DayInfo[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View className="bg-white px-4 py-4">
      {/* 헤더: 년월 (좌측) + 네비게이션 (우측) */}
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">
          {currentYear}년 {getMonthName(currentMonth)}
        </Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={goToPrevMonth} className="p-1">
            <Ionicons name="chevron-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth} className="p-1">
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 요일 헤더 */}
      <View className="mb-3 flex-row">
        {WEEKDAYS.map((day, index) => (
          <View key={day} className="mx-1 flex-1 items-center">
            <Text
              className={`text-sm font-medium ${
                index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      {weeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} className="mb-1 flex-row">
          {week.map((dayInfo, dayIndex) => renderDay(dayInfo, weekIndex * 7 + dayIndex))}
        </View>
      ))}
    </View>
  );
}
