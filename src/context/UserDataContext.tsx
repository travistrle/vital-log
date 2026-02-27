import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { calculateBMI } from '@/lib/bmi';
import { loadEntries, loadProfile, saveEntries, saveProfile } from '@/lib/storage';
import { UserProfile, WeightEntry } from '@/types';

interface UserDataContextType {
  entries: WeightEntry[];
  profile: UserProfile | null;
  loading: boolean;
  addEntry: (weightKg: number, date?: Date) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadEntries(), loadProfile()])
      .then(([loadedEntries, loadedProfile]) => {
        setEntries(loadedEntries);
        setProfile(loadedProfile);
      })
      .finally(() => setLoading(false));
  }, []);

  const addEntry = useCallback(
    async (weightKg: number, date?: Date) => {
      if (!profile) return;
      const bmi = calculateBMI(weightKg, profile.heightMeters);
      const entry: WeightEntry = {
        id: Date.now().toString(),
        date: (date ?? new Date()).toISOString(),
        weightKg,
        bmi,
      };
      const updated = [entry, ...entries];
      setEntries(updated);
      await saveEntries(updated);
    },
    [entries, profile],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      await saveEntries(updated);
    },
    [entries],
  );

  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await saveProfile(newProfile);
  }, []);

  return (
    <UserDataContext.Provider value={{ entries, profile, loading, addEntry, deleteEntry, updateProfile }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData(): UserDataContextType {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
}
