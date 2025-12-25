import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Meal, MEAL_TYPE_COLORS } from '@/types/meal';
import { getMealById } from '@/services/database';
import { useMealStore } from '@/stores/mealStore';
import { formatDateKorean } from '@/utils/date';
import { AddMealSheet } from '@/components/AddMealSheet';

export default function MealDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { deleteMeal } = useMealStore();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [showEditSheet, setShowEditSheet] = useState(false);

  useEffect(() => {
    loadMeal();
  }, [id]);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useMealStore.subscribe(() => {
      loadMeal();
    });
    return unsubscribe;
  }, [id]);

  const loadMeal = async () => {
    if (id) {
      const result = await getMealById(id);
      setMeal(result);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '식단 삭제',
      '이 식단 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeal(id!);
              router.back();
            } catch (error) {
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  if (!meal) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-400">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  const badgeColor = MEAL_TYPE_COLORS[meal.mealType];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 커스텀 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">식단 상세</Text>
        <View className="flex-row gap-1">
          <TouchableOpacity onPress={() => setShowEditSheet(true)} className="p-1">
            <Ionicons name="pencil-outline" size={22} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="p-1">
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 이미지 */}
        <View className="aspect-square w-full bg-gray-100">
          {meal.photoUri ? (
            <Image
              source={{ uri: meal.photoUri }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Ionicons name="restaurant-outline" size={80} color="#d1d5db" />
              <Text className="mt-2 text-gray-300">이미지 없음</Text>
            </View>
          )}
        </View>

        {/* 정보 */}
        <View className="px-4 py-6">
          {/* 식사 구분 배지 */}
          <View
            className="mb-3 self-start rounded-full px-3 py-1"
            style={{ backgroundColor: badgeColor }}>
            <Text className="text-sm font-medium text-white">{meal.mealType}</Text>
          </View>

          {/* 날짜 및 시간 */}
          <Text className="mb-1 text-sm font-medium text-gray-500">날짜 및 시간</Text>
          <Text className="mb-4 text-base text-gray-900">{meal.date} {meal.time}</Text>

          {/* 메모 */}
          {meal.note && (
            <View className="mt-4 rounded-xl bg-gray-50 p-4">
              <Text className="mb-2 text-sm font-medium text-gray-500">메모</Text>
              <Text className="text-base leading-6 text-gray-800">{meal.note}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 수정 시트 */}
      <AddMealSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        editMeal={meal}
      />
    </SafeAreaView>
  );
}
