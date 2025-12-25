import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Meal } from '@/types/meal';
import { MealCard } from './MealCard';
import { EmptyState } from './EmptyState';
import { useMealStore } from '@/stores/mealStore';

type MealListProps = {
  date: string;
  onMealPress: (meal: Meal) => void;
  onMealEdit: (meal: Meal) => void;
};

type SwipeableMealCardProps = {
  meal: Meal;
  onPress: () => void;
  onMorePress: () => void;
  onDelete: () => void;
};

function SwipeableMealCard({ meal, onPress, onMorePress, onDelete }: SwipeableMealCardProps) {
  const translateX = useSharedValue(0);
  const DELETE_THRESHOLD = -80;

  const confirmDelete = () => {
    Alert.alert(
      '식단 삭제',
      '이 식단 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel', onPress: () => { translateX.value = withSpring(0); } },
        { text: '삭제', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -100);
      }
    })
    .onEnd(() => {
      if (translateX.value < DELETE_THRESHOLD) {
        runOnJS(confirmDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View>
      {/* 삭제 배경 */}
      <View className="absolute bottom-3 right-0 top-0 w-24 items-center justify-center rounded-r-2xl bg-red-500">
        <Ionicons name="trash-outline" size={24} color="#ffffff" />
      </View>

      {/* 스와이프 가능한 카드 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          <MealCard
            meal={meal}
            onPress={onPress}
            onMorePress={onMorePress}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export function MealList({ date, onMealPress, onMealEdit }: MealListProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const { loadMealsByDate, deleteMeal } = useMealStore();

  const loadMeals = useCallback(async () => {
    const result = await loadMealsByDate(date);
    setMeals(result);
  }, [date, loadMealsByDate]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useMealStore.subscribe(() => {
      loadMeals();
    });
    return unsubscribe;
  }, [loadMeals]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMeal(id);
    } catch (error) {
      Alert.alert('오류', '삭제에 실패했습니다.');
    }
  };

  const handleMorePress = (meal: Meal) => {
    Alert.alert(
      meal.mealType,
      undefined,
      [
        { text: '수정', onPress: () => onMealEdit(meal) },
        { text: '삭제', style: 'destructive', onPress: () => handleDelete(meal.id) },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  if (meals.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SwipeableMealCard
          meal={item}
          onPress={() => onMealPress(item)}
          onMorePress={() => handleMorePress(item)}
          onDelete={() => handleDelete(item.id)}
        />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 80 }}
    />
  );
}
