import { useState } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

import { Calendar } from '@/components/Calendar';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { formatDate, formatDateKorean } from '@/utils/date';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // TODO: 실제 데이터에서 기록이 있는 날짜들을 가져옴
  const markedDates = new Set<string>();

  const handleAddMeal = () => {
    // TODO: 식단 추가 시트 열기
    console.log('Add meal for', selectedDate);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: '식단 기록',
          headerShown: true,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      />

      {/* 캘린더 */}
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        markedDates={markedDates}
      />

      {/* 선택된 날짜 표시 */}
      <View className="flex-1 px-4 pt-4">
        <Text className="mb-2 text-base font-semibold text-gray-700">
          {formatDateKorean(selectedDate)}
        </Text>

        {/* TODO: 해당 날짜의 식단 리스트 */}
        <EmptyState />
      </View>

      {/* FAB */}
      <FAB onPress={handleAddMeal} />

      {/* TODO: AdMob 배너 위치 */}
      <View className="h-14 items-center justify-center bg-gray-200">
        <Text className="text-xs text-gray-500">AdMob 배너 영역</Text>
      </View>
    </View>
  );
}
