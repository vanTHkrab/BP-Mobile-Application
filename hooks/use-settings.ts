/**
 * useSettings Hook
 * Custom hook สำหรับจัดการ User Profile และ App Settings
 */

import {
    getAppSettings,
    getUserProfile,
    updateAppSettings,
    updateBPThreshold,
    updateUserProfile,
} from '@/database';
import {
    AppSettings,
    AppSettingsInput,
    BPThreshold,
    UserProfile,
    UserProfileInput,
} from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseSettingsReturn {
  // User Profile
  profile: UserProfile | null;
  isProfileLoading: boolean;
  profileError: string | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (input: UserProfileInput) => Promise<boolean>;

  // App Settings
  settings: AppSettings | null;
  isSettingsLoading: boolean;
  settingsError: string | null;
  fetchSettings: () => Promise<void>;
  saveSettings: (input: AppSettingsInput) => Promise<boolean>;
  saveBPThreshold: (threshold: BPThreshold) => Promise<boolean>;
  toggleNotifications: (enabled: boolean) => Promise<boolean>;
  toggleAbnormalAlert: (enabled: boolean) => Promise<boolean>;
  setDarkMode: (mode: 'system' | 'light' | 'dark') => Promise<boolean>;

  // Common
  refresh: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // ==========================================
  // User Profile
  // ==========================================

  const fetchProfile = useCallback(async () => {
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const result = await getUserProfile();
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setProfileError(result.error ?? 'Failed to fetch profile');
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const saveProfile = useCallback(
    async (input: UserProfileInput): Promise<boolean> => {
      try {
        const result = await updateUserProfile(input);
        if (result.success) {
          await fetchProfile();
          return true;
        }
        setProfileError(result.error ?? 'Failed to save profile');
        return false;
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchProfile]
  );

  // ==========================================
  // App Settings
  // ==========================================

  const fetchSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    setSettingsError(null);
    try {
      const result = await getAppSettings();
      if (result.success && result.data) {
        setSettings(result.data);
      } else {
        setSettingsError(result.error ?? 'Failed to fetch settings');
      }
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  const saveSettings = useCallback(
    async (input: AppSettingsInput): Promise<boolean> => {
      try {
        const result = await updateAppSettings(input);
        if (result.success) {
          await fetchSettings();
          return true;
        }
        setSettingsError(result.error ?? 'Failed to save settings');
        return false;
      } catch (err) {
        setSettingsError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchSettings]
  );

  const saveBPThreshold = useCallback(
    async (threshold: BPThreshold): Promise<boolean> => {
      try {
        const result = await updateBPThreshold(threshold);
        if (result.success) {
          await fetchSettings();
          return true;
        }
        return false;
      } catch (err) {
        setSettingsError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchSettings]
  );

  const toggleNotifications = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      return saveSettings({ notifications_enabled: enabled });
    },
    [saveSettings]
  );

  const toggleAbnormalAlert = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      return saveSettings({ abnormal_alert_enabled: enabled });
    },
    [saveSettings]
  );

  const setDarkMode = useCallback(
    async (mode: 'system' | 'light' | 'dark'): Promise<boolean> => {
      return saveSettings({ dark_mode: mode });
    },
    [saveSettings]
  );

  // Refresh all
  const refresh = useCallback(async () => {
    await Promise.all([fetchProfile(), fetchSettings()]);
  }, [fetchProfile, fetchSettings]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, []);

  return {
    // Profile
    profile,
    isProfileLoading,
    profileError,
    fetchProfile,
    saveProfile,

    // Settings
    settings,
    isSettingsLoading,
    settingsError,
    fetchSettings,
    saveSettings,
    saveBPThreshold,
    toggleNotifications,
    toggleAbnormalAlert,
    setDarkMode,

    // Common
    refresh,
  };
}
