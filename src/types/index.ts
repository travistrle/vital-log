export interface WeightEntry {
  id: string;
  date: string; // ISO 8601
  weightKg: number;
  bmi: number;
}

export interface UserProfile {
  heightMeters: number;
  unitSystem: 'metric' | 'imperial';
  age?: number;
  gender?: 'male' | 'female';
}
