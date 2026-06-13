const STORAGE_PREFIX = 'mini_habit_';

export const setStorage = (key: string, value: any): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const data = JSON.stringify(value);
      wx.setStorageSync(STORAGE_PREFIX + key, data);
      resolve(true);
    } catch (error) {
      console.error('[Storage] Set storage failed:', error);
      resolve(false);
    }
  });
};

export const getStorage = <T = any>(key: string, defaultValue?: T): T | null => {
  try {
    const data = wx.getStorageSync(STORAGE_PREFIX + key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return defaultValue || null;
  } catch (error) {
    console.error('[Storage] Get storage failed:', error);
    return defaultValue || null;
  }
};

export const removeStorage = (key: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      wx.removeStorageSync(STORAGE_PREFIX + key);
      resolve(true);
    } catch (error) {
      console.error('[Storage] Remove storage failed:', error);
      resolve(false);
    }
  });
};

export const clearAllStorage = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      wx.clearStorageSync();
      resolve(true);
    } catch (error) {
      console.error('[Storage] Clear storage failed:', error);
      resolve(false);
    }
  });
};

export const getUserHabitSettings = () => {
  return getStorage('userHabitSettings', []);
};

export const saveUserHabitSettings = (settings: any[]) => {
  return setStorage('userHabitSettings', settings);
};

export const getCheckInRecords = () => {
  return getStorage('checkInRecords', []);
};

export const saveCheckInRecords = (records: any[]) => {
  return setStorage('checkInRecords', records);
};

export const getAppSettings = () => {
  return getStorage('appSettings', {
    isLunchBreakFree: true,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    isMeetingSkip: true
  });
};

export const saveAppSettings = (settings: any) => {
  return setStorage('appSettings', settings);
};
