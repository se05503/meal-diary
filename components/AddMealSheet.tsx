import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import { Meal, MealType, MEAL_TYPES } from '@/types/meal';
import { useMealStore } from '@/stores/mealStore';
import { generateId, saveImage, deleteImage } from '@/services/database';
import { formatDate, formatTime } from '@/utils/date';

type AddMealSheetProps = {
  visible: boolean;
  onClose: () => void;
  editMeal?: Meal | null;
  initialDate?: string;
};

export function AddMealSheet({ visible, onClose, editMeal, initialDate }: AddMealSheetProps) {
  const { addMeal, updateMeal } = useMealStore();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [mealType, setMealType] = useState<MealType>('아침');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [originalPhotoUri, setOriginalPhotoUri] = useState<string | undefined>();
  const [note, setNote] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editMeal) {
        const [year, month, day] = editMeal.date.split('-').map(Number);
        const [hours, minutes] = editMeal.time.split(':').map(Number);
        setDate(new Date(year, month - 1, day));
        setTime(new Date(2000, 0, 1, hours, minutes));
        setMealType(editMeal.mealType);
        setPhotoUri(editMeal.photoUri);
        setOriginalPhotoUri(editMeal.photoUri);
        setNote(editMeal.note || '');
      } else {
        const now = new Date();
        if (initialDate) {
          const [year, month, day] = initialDate.split('-').map(Number);
          setDate(new Date(year, month - 1, day));
        } else {
          setDate(now);
        }
        setTime(now);
        setMealType('아침');
        setPhotoUri(undefined);
        setOriginalPhotoUri(undefined);
        setNote('');
      }
    }
  }, [visible, editMeal, initialDate]);

  const handleSelectPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(undefined);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let savedPhotoUri = photoUri;

      // 새 이미지가 선택된 경우 (기존 이미지와 다른 경우)
      if (photoUri && photoUri !== originalPhotoUri) {
        // 새 이미지를 앱 내부 저장소에 저장
        savedPhotoUri = await saveImage(photoUri);

        // 기존 이미지가 있었다면 삭제
        if (originalPhotoUri) {
          await deleteImage(originalPhotoUri);
        }
      } else if (!photoUri && originalPhotoUri) {
        // 이미지가 제거된 경우 기존 이미지 삭제
        await deleteImage(originalPhotoUri);
        savedPhotoUri = undefined;
      }

      const mealData: Meal = {
        id: editMeal?.id || generateId(),
        date: formatDate(date),
        time: formatTime(time),
        mealType,
        photoUri: savedPhotoUri,
        note: note.trim() || undefined,
        createdAt: editMeal?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      if (editMeal) {
        await updateMeal(mealData);
      } else {
        await addMeal(mealData);
      }

      onClose();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('오류', '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayTime = (d: Date) => {
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${period} ${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[90%] rounded-t-3xl bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4">
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-gray-900">
                {editMeal ? '식단 수정' : '식단 추가'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
              {/* 날짜 */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">날짜</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <Text className="text-base text-gray-900">{formatDate(date)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* 시간 */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">시간</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <Text className="text-base text-gray-900">{formatDisplayTime(time)}</Text>
                  <Ionicons name="time-outline" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* 식사 구분 */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">식사 구분</Text>
                <View className="flex-row gap-2">
                  {MEAL_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setMealType(type)}
                      className={`flex-1 items-center rounded-full py-2.5 ${
                        mealType === type ? 'bg-gray-900' : 'bg-gray-100'
                      }`}>
                      <Text
                        className={`text-sm font-medium ${
                          mealType === type ? 'text-white' : 'text-gray-600'
                        }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 이미지 */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">이미지 (1장)</Text>
                {photoUri ? (
                  <View className="relative">
                    <Image
                      source={{ uri: photoUri }}
                      className="h-48 w-full rounded-xl"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={handleRemovePhoto}
                      className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/50">
                      <Ionicons name="close" size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleSelectPhoto}
                    className="h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
                    <Ionicons name="image-outline" size={40} color="#d1d5db" />
                    <Text className="mt-2 text-sm text-gray-400">사진 선택 (1장)</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 메모 */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-medium text-gray-700">메모 (선택)</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="간단한 메모를 남겨보세요"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  className="min-h-[100px] rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900"
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="flex-row gap-3 border-t border-gray-100 px-4 py-4">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 items-center rounded-xl bg-gray-100 py-4">
                <Text className="text-base font-medium text-gray-700">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSubmitting}
                className="flex-1 items-center rounded-xl bg-gray-900 py-4">
                <Text className="text-base font-medium text-white">
                  {isSubmitting ? '저장 중...' : '저장'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setTime(selectedTime);
            }
          }}
        />
      )}
    </Modal>
  );
}
