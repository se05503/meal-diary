import * as SQLite from 'expo-sqlite';
import { File, Directory, Paths } from 'expo-file-system';
import { Meal } from '@/types/meal';

const DATABASE_NAME = 'meal-diary.db';

let db: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const initDatabase = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      mealType TEXT NOT NULL,
      photoUri TEXT,
      note TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
  `);
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await initDatabase(database);
    db = database;
    return database;
  })();

  return dbInitPromise;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Image utilities
const IMAGES_DIR_NAME = 'images';

export const ensureImagesDir = (): Directory => {
  const imagesDir = new Directory(Paths.document, IMAGES_DIR_NAME);

  if (!imagesDir.exists) {
    imagesDir.create();
  }

  return imagesDir;
};

export const saveImage = async (sourceUri: string): Promise<string> => {
  const imagesDir = ensureImagesDir();
  const filename = `${generateId()}.jpg`;
  const destFile = new File(imagesDir, filename);

  // 소스 파일에서 base64로 읽고 저장
  const sourceFile = new File(sourceUri);
  const base64 = await sourceFile.base64();
  destFile.write(base64, { encoding: 'base64' });

  return destFile.uri;
};

export const deleteImage = (uri: string): void => {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('Failed to delete image:', error);
  }
};

// Meal CRUD operations
export const getAllMeals = async (): Promise<Meal[]> => {
  const database = await getDatabase();
  const result = await database.getAllAsync<Meal>('SELECT * FROM meals ORDER BY date DESC, time DESC');
  return result;
};

export const getMealsByDate = async (date: string): Promise<Meal[]> => {
  const database = await getDatabase();
  const result = await database.getAllAsync<Meal>(
    'SELECT * FROM meals WHERE date = ? ORDER BY time ASC',
    [date]
  );
  return result;
};

export const getMealById = async (id: string): Promise<Meal | null> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<Meal>('SELECT * FROM meals WHERE id = ?', [id]);
  return result || null;
};

export const insertMeal = async (meal: Meal): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO meals (id, date, time, mealType, photoUri, note, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [meal.id, meal.date, meal.time, meal.mealType, meal.photoUri || null, meal.note || null, meal.createdAt, meal.updatedAt]
  );
};

export const updateMeal = async (meal: Meal): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE meals SET date = ?, time = ?, mealType = ?, photoUri = ?, note = ?, updatedAt = ?
     WHERE id = ?`,
    [meal.date, meal.time, meal.mealType, meal.photoUri || null, meal.note || null, meal.updatedAt, meal.id]
  );
};

export const deleteMeal = async (id: string): Promise<void> => {
  const database = await getDatabase();

  // Get meal to delete associated photo
  const meal = await getMealById(id);
  if (meal?.photoUri) {
    await deleteImage(meal.photoUri);
  }

  await database.runAsync('DELETE FROM meals WHERE id = ?', [id]);
};

export const getMarkedDates = async (): Promise<Set<string>> => {
  const database = await getDatabase();
  const result = await database.getAllAsync<{ date: string }>('SELECT DISTINCT date FROM meals');
  return new Set(result.map((r) => r.date));
};
