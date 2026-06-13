import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Habit, UserHabitSetting, CheckInRecord } from '@/types/habit';
import { habitsData as defaultHabits } from '@/data/habits';
import { getStorage, setStorage, removeStorage } from '@/utils/storageUtils';

interface HabitContextType {
  habits: Habit[];
  userHabits: UserHabitSetting[];
  checkInRecords: CheckInRecord[];
  appSettings: any;
  addUserHabit: (habitId: string) => void;
  removeUserHabit: (habitId: string) => void;
  updateUserHabit: (habitId: string, updates: Partial<UserHabitSetting>) => void;
  updateUserHabitsOrder: (habitIds: string[]) => void;
  addTimeSlot: (habitId: string, time: string) => void;
  removeTimeSlot: (habitId: string, index: number) => void;
  updateTimeSlots: (habitId: string, timeSlots: string[]) => void;
  completeHabit: (habitId: string) => void;
  snoozeHabit: (habitId: string) => void;
  skipHabit: (habitId: string, reason?: string) => void;
  updateAppSettings: (settings: any) => void;
  clearAllData: () => void;
  getHabitById: (habitId: string) => Habit | undefined;
  getSettingById: (habitId: string) => UserHabitSetting | undefined;
  getTodayHabits: () => any[];
  getTodayRecords: (date?: string) => CheckInRecord[];
  getRecordsByDate: (date: string) => CheckInRecord[];
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [userHabits, setUserHabits] = useState<UserHabitSetting[]>([]);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [appSettings, setAppSettings] = useState({
    isLunchBreakFree: true,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    isMeetingSkip: true,
    isInMeeting: false,
    isOnLunchBreak: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedHabits = getStorage('userHabits', null);
    const savedRecords = getStorage('checkInRecords', []);
    const savedSettings = getStorage('appSettings', null);
    
    if (savedHabits !== null) {
      setUserHabits(savedHabits);
    } else {
      const initialHabits = defaultHabits.slice(0, 4).map((habit, index) => ({
        habitId: habit.id,
        enabled: true,
        workdays: [1, 2, 3, 4, 5],
        timeSlots: generateTimeSlots(habit.frequency),
        frequency: habit.frequency,
        duration: habit.duration,
        remark: '',
        sortIndex: index,
        completedToday: 0,
        lastCompletedDate: '',
        streakDays: 0,
        group: getGroupByCategory(habit.category)
      }));
      setUserHabits(initialHabits);
      setStorage('userHabits', initialHabits);
    }
    
    if (savedRecords && savedRecords.length > 0) {
      setCheckInRecords(savedRecords);
    }
    
    if (savedSettings) {
      setAppSettings({ ...appSettings, ...savedSettings });
    }
  };

  const generateTimeSlots = (frequency: number): string[] => {
    const slots = [];
    const baseHours = [9, 10.5, 12, 14, 15.5, 17, 18.5, 20];
    for (let i = 0; i < Math.min(frequency, baseHours.length); i++) {
      const hour = baseHours[i];
      const hourStr = Math.floor(hour);
      const minStr = (hour % 1 === 0.5 ? '30' : '00');
      slots.push(`${hourStr.toString().padStart(2, '0')}:${minStr}`);
    }
    return slots;
  };

  const getGroupByCategory = (category: string): string => {
    const groupMap: any = {
      'water': '健康饮品',
      'stretch': '身体放松',
      'eye': '眼睛保护',
      'stand': '轻度运动',
      'walk': '轻度运动'
    };
    return groupMap[category] || '其他';
  };

  const getHabitById = (habitId: string): Habit | undefined => {
    return habits.find(h => h.id === habitId);
  };

  const getSettingById = (habitId: string): UserHabitSetting | undefined => {
    return userHabits.find(s => s.habitId === habitId);
  };

  const addUserHabit = (habitId: string) => {
    if (userHabits.find(s => s.habitId === habitId)) {
      return;
    }
    
    const habit = getHabitById(habitId);
    if (!habit) return;

    const newSetting: UserHabitSetting = {
      habitId,
      enabled: true,
      workdays: [1, 2, 3, 4, 5],
      timeSlots: generateTimeSlots(habit.frequency),
      frequency: habit.frequency,
      duration: habit.duration,
      remark: '',
      sortIndex: userHabits.length,
      completedToday: 0,
      lastCompletedDate: '',
      streakDays: 0,
      group: getGroupByCategory(habit.category)
    };

    const updatedHabits = [...userHabits, newSetting];
    setUserHabits(updatedHabits);
    setStorage('userHabits', updatedHabits);
  };

  const removeUserHabit = (habitId: string) => {
    const updatedHabits = userHabits
      .filter(s => s.habitId !== habitId)
      .map((s, index) => ({ ...s, sortIndex: index }));
    setUserHabits(updatedHabits);
    setStorage('userHabits', updatedHabits);
    
    const updatedRecords = checkInRecords.filter(r => r.habitId !== habitId);
    setCheckInRecords(updatedRecords);
    setStorage('checkInRecords', updatedRecords);
  };

  const updateUserHabit = (habitId: string, updates: Partial<UserHabitSetting>) => {
    const updatedHabits = userHabits.map(s => 
      s.habitId === habitId ? { ...s, ...updates } : s
    );
    setUserHabits(updatedHabits);
    setStorage('userHabits', updatedHabits);
  };

  const updateUserHabitsOrder = (habitIds: string[]) => {
    const updatedHabits = habitIds.map((habitId, index) => {
      const setting = userHabits.find(s => s.habitId === habitId);
      return setting ? { ...setting, sortIndex: index } : null;
    }).filter(Boolean);
    setUserHabits(updatedHabits as UserHabitSetting[]);
    setStorage('userHabits', updatedHabits);
  };

  const addTimeSlot = (habitId: string, time: string) => {
    const setting = getSettingById(habitId);
    if (!setting) return;
    
    const newTimeSlots = [...setting.timeSlots, time].sort();
    updateUserHabit(habitId, { timeSlots: newTimeSlots });
  };

  const removeTimeSlot = (habitId: string, index: number) => {
    const setting = getSettingById(habitId);
    if (!setting) return;
    
    const newTimeSlots = setting.timeSlots.filter((_, i) => i !== index);
    updateUserHabit(habitId, { timeSlots: newTimeSlots });
  };

  const updateTimeSlots = (habitId: string, timeSlots: string[]) => {
    updateUserHabit(habitId, { timeSlots });
  };

  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  };

  const completeHabit = (habitId: string) => {
    const today = getTodayDate();
    const now = new Date().toISOString();
    
    const record: CheckInRecord = {
      date: today,
      habitId,
      status: 'completed',
      completedAt: now
    };

    const updatedRecords = [...checkInRecords, record];
    setCheckInRecords(updatedRecords);
    setStorage('checkInRecords', updatedRecords);

    const setting = getSettingById(habitId);
    if (setting) {
      const lastDate = setting.lastCompletedDate;
      let newStreak = setting.streakDays;
      
      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      updateUserHabit(habitId, {
        completedToday: setting.completedToday + 1,
        lastCompletedDate: today,
        streakDays: newStreak
      });
    }
  };

  const snoozeHabit = (habitId: string) => {
    const today = getTodayDate();
    
    const record: CheckInRecord = {
      date: today,
      habitId,
      status: 'snoozed'
    };

    const updatedRecords = [...checkInRecords, record];
    setCheckInRecords(updatedRecords);
    setStorage('checkInRecords', updatedRecords);
  };

  const skipHabit = (habitId: string, reason?: string) => {
    const today = getTodayDate();
    
    const record: CheckInRecord = {
      date: today,
      habitId,
      status: reason === 'meeting' ? 'skipped' : 'unsuitable',
      skipReason: reason || '手动跳过'
    };

    const updatedRecords = [...checkInRecords, record];
    setCheckInRecords(updatedRecords);
    setStorage('checkInRecords', updatedRecords);

    const setting = getSettingById(habitId);
    if (setting) {
      updateUserHabit(habitId, {
        completedToday: setting.completedToday + 1
      });
    }
  };

  const updateAppSettings = (settings: any) => {
    const updatedSettings = { ...appSettings, ...settings };
    setAppSettings(updatedSettings);
    setStorage('appSettings', updatedSettings);
  };

  const clearAllData = () => {
    setUserHabits([]);
    setCheckInRecords([]);
    setAppSettings({
      isLunchBreakFree: true,
      lunchBreakStart: '12:00',
      lunchBreakEnd: '13:00',
      isMeetingSkip: true,
      isInMeeting: false,
      isOnLunchBreak: false
    });
    removeStorage('userHabits');
    removeStorage('checkInRecords');
    removeStorage('appSettings');
    wx.removeStorageSync('encouragements');
    wx.removeStorageSync('receivedEncouragements');
    wx.removeStorageSync('sentEncouragements');
  };

  const getTodayHabits = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayStr = getTodayDate();

    return userHabits
      .filter(s => s.enabled && s.workdays.includes(dayOfWeek))
      .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
      .map(s => {
        const habit = getHabitById(s.habitId);
        if (!habit) return null;

        const todayRecords = checkInRecords.filter(
          r => r.date === todayStr && r.habitId === s.habitId && r.status === 'completed'
        );
        const completedCount = todayRecords.length;
        const duration = s.duration || habit.duration;

        const nextSlot = s.timeSlots.find((_, idx) => idx >= completedCount);

        return {
          habit,
          setting: {
            ...s,
            completedToday: completedCount,
            duration
          },
          nextReminder: nextSlot
        };
      })
      .filter(Boolean);
  };

  const getTodayRecords = (date?: string) => {
    const targetDate = date || getTodayDate();
    return checkInRecords.filter(r => r.date === targetDate);
  };

  const getRecordsByDate = (date: string) => {
    return checkInRecords.filter(r => r.date === date);
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        userHabits,
        checkInRecords,
        appSettings,
        addUserHabit,
        removeUserHabit,
        updateUserHabit,
        updateUserHabitsOrder,
        addTimeSlot,
        removeTimeSlot,
        updateTimeSlots,
        completeHabit,
        snoozeHabit,
        skipHabit,
        updateAppSettings,
        clearAllData,
        getHabitById,
        getSettingById,
        getTodayHabits,
        getTodayRecords,
        getRecordsByDate
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within HabitProvider');
  }
  return context;
};
