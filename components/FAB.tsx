import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FABProps = {
  onPress: () => void;
};

export function FAB({ onPress }: FABProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute bottom-20 right-4 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}>
      <Ionicons name="add" size={28} color="#ffffff" />
    </TouchableOpacity>
  );
}
