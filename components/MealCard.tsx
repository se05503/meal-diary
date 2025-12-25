import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Meal, MEAL_TYPE_COLORS } from '@/types/meal';

type MealCardProps = {
  meal: Meal;
  onPress: () => void;
  onMorePress: () => void;
};

export function MealCard({ meal, onPress, onMorePress }: MealCardProps) {
  const badgeColor = MEAL_TYPE_COLORS[meal.mealType];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 flex-row rounded-2xl bg-white p-3 shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}>
      {/* 썸네일 */}
      <View className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
        {meal.photoUri ? (
          <Image
            source={{ uri: meal.photoUri }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="restaurant-outline" size={32} color="#d1d5db" />
          </View>
        )}
      </View>

      {/* 내용 */}
      <View className="ml-3 flex-1 justify-center">
        {/* 식사 구분 배지 */}
        <View
          className="mb-1 self-start rounded-full px-2.5 py-0.5"
          style={{ backgroundColor: badgeColor }}>
          <Text className="text-xs font-medium text-white">{meal.mealType}</Text>
        </View>

        {/* 시간 */}
        <Text className="mb-1 text-sm text-gray-500">{meal.time}</Text>

        {/* 메모 */}
        {meal.note ? (
          <Text className="text-sm text-blue-500" numberOfLines={1}>
            {meal.note}
          </Text>
        ) : null}
      </View>

      {/* 더보기 버튼 */}
      <TouchableOpacity
        onPress={onMorePress}
        className="justify-center px-1">
        <Ionicons name="ellipsis-vertical" size={20} color="#9ca3af" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
