import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function EmptyState() {
  return (
    <View className="flex-1 items-center pt-20">
      {/* 원형 아이콘 배경 */}
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-gray-200">
        <Ionicons name="add" size={32} color="#9ca3af" />
      </View>

      {/* 텍스트 */}
      <Text className="text-base text-gray-400">기록이 없어요.</Text>
      <Text className="mt-1 text-base text-gray-400">+ 버튼으로 추가해보세요.</Text>
    </View>
  );
}
