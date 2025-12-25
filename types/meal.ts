export type MealType = '아침' | '점심' | '저녁' | '간식';

export type Meal = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  mealType: MealType;
  photoUri?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
};

export const MEAL_TYPES: MealType[] = ['아침', '점심', '저녁', '간식'];

export const MEAL_TYPE_COLORS: Record<MealType, string> = {
  아침: '#3b82f6',
  점심: '#22c55e',
  저녁: '#a855f7',
  간식: '#f97316',
};
