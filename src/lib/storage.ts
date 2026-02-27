import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserProfile, WeightEntry } from '@/types';

const ENTRIES_KEY = 'vl_entries';
const PROFILE_KEY = 'vl_profile';

export async function loadEntries(): Promise<WeightEntry[]> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as WeightEntry[];
}

export async function saveEntries(entries: WeightEntry[]): Promise<void> {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as UserProfile;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
