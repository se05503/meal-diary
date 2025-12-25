import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function EmptyState() {
  return (
    <View className="flex-1 items-center pt-16">
      <Ionicons name="restaurant-outline" size={64} color="#d1d5db" />
      <Text className="mt-4 text-base text-gray-400">기록된 식단이 없습니다</Text>
      <Text className="mt-1 text-sm text-gray-300">+ 버튼을 눌러 식단을 추가해보세요</Text>
    </View>
  );
}
