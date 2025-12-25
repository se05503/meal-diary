import { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Calendar } from '@/components/Calendar';
import { MealList } from '@/components/MealList';
import { FAB } from '@/components/FAB';
import { AddMealSheet } from '@/components/AddMealSheet';
import { useMealStore } from '@/stores/mealStore';
import { formatDate, formatDateKorean } from '@/utils/date';
import { Meal } from '@/types/meal';

export default function Home() {
  const router = useRouter();
  const { markedDates, loadMeals, selectedDate, setSelectedDate } = useMealStore();

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);

  useEffect(() => {
    loadMeals();
  }, []);

  const handleAddMeal = () => {
    setEditMeal(null);
    setShowAddSheet(true);
  };

  const handleMealPress = (meal: Meal) => {
    router.push({ pathname: '/meal/[id]', params: { id: meal.id } });
  };

  const handleMealEdit = (meal: Meal) => {
    setEditMeal(meal);
    setShowAddSheet(true);
  };

  const handleCloseSheet = () => {
    setShowAddSheet(false);
    setEditMeal(null);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* 타이틀 */}
        <View className="border-b border-gray-200 bg-white px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900">오늘 뭐 먹었나요?</Text>
        </View>

        {/* 캘린더 */}
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          markedDates={markedDates}
        />

        {/* 선택된 날짜의 식단 리스트 */}
        <View className="flex-1 bg-gray-100 px-4 pt-4">
          <MealList
            date={selectedDate}
            onMealPress={handleMealPress}
            onMealEdit={handleMealEdit}
          />
        </View>

        {/* FAB */}
        <FAB onPress={handleAddMeal} />

        {/* AdMob 배너 영역 */}
        <View className="h-14 items-center justify-center bg-gray-100">
          <Text className="text-sm text-gray-400">Ad Banner</Text>
        </View>

        {/* 식단 추가/수정 시트 */}
        <AddMealSheet
          visible={showAddSheet}
          onClose={handleCloseSheet}
          editMeal={editMeal}
          initialDate={selectedDate}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
