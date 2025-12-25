import { create } from 'zustand';
import { Meal } from '@/types/meal';
import * as db from '@/services/database';

type MealStore = {
  meals: Meal[];
  markedDates: Set<string>;
  selectedDate: string;
  isLoading: boolean;

  setSelectedDate: (date: string) => void;
  loadMeals: () => Promise<void>;
  loadMealsByDate: (date: string) => Promise<Meal[]>;
  addMeal: (meal: Meal) => Promise<void>;
  updateMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  refreshMarkedDates: () => Promise<void>;
};

export const useMealStore = create<MealStore>((set, get) => ({
  meals: [],
  markedDates: new Set<string>(),
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  loadMeals: async () => {
    set({ isLoading: true });
    try {
      const meals = await db.getAllMeals();
      const markedDates = await db.getMarkedDates();
      set({ meals, markedDates });
    } catch (error) {
      console.error('Failed to load meals:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadMealsByDate: async (date: string) => {
    try {
      return await db.getMealsByDate(date);
    } catch (error) {
      console.error('Failed to load meals by date:', error);
      return [];
    }
  },

  addMeal: async (meal: Meal) => {
    try {
      await db.insertMeal(meal);
      const meals = await db.getAllMeals();
      const markedDates = await db.getMarkedDates();
      set({ meals, markedDates });
    } catch (error) {
      console.error('Failed to add meal:', error);
      throw error;
    }
  },

  updateMeal: async (meal: Meal) => {
    try {
      await db.updateMeal(meal);
      const meals = await db.getAllMeals();
      const markedDates = await db.getMarkedDates();
      set({ meals, markedDates });
    } catch (error) {
      console.error('Failed to update meal:', error);
      throw error;
    }
  },

  deleteMeal: async (id: string) => {
    try {
      await db.deleteMeal(id);
      const meals = await db.getAllMeals();
      const markedDates = await db.getMarkedDates();
      set({ meals, markedDates });
    } catch (error) {
      console.error('Failed to delete meal:', error);
      throw error;
    }
  },

  refreshMarkedDates: async () => {
    try {
      const markedDates = await db.getMarkedDates();
      set({ markedDates });
    } catch (error) {
      console.error('Failed to refresh marked dates:', error);
    }
  },
}));
